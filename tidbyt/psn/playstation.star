"""
Applet: PlayStation
Summary: Last played game and latest trophy
Description: Two screens from your PlayStation Network profile, in turn: the game you
played last (its art, title, total play time and how long ago), then the latest trophy
you earned (a cup in its grade's color, its name, the game and how long ago). Signs in
with a PSN refresh token made from your NPSSO by scripts/psn_token.py.
Author: Chase Chenevert
"""

load("encoding/json.star", "json")
load("http.star", "http")
load("render.star", "render")
load("schema.star", "schema")
load("time.star", "time")

# How long each frame shows, in ms: long names scroll 20 LEDs a second.
FRAME_MS = 50

# Each screen shows at least this many frames (6 seconds), longer if a name takes
# longer to scroll by.
SCREEN_FRAMES = 120

# Frames a long name waits before it scrolls.
SCROLL_DELAY = 20

ART_BG = "#013"
GLYPH = "#36c"
HEAD = "#4af"
TITLE = "#fff"
SUB = "#889"
AGO = "#a60"

GRADES = {
    "bronze": "#c73",
    "silver": "#aab",
    "gold": "#fc3",
    "platinum": "#9cf",
}

# Text sits right of the 32x32 art, in a column TEXT_WIDTH wide, with its lines at
# these heights.
TEXT_X = 33
TEXT_WIDTH = 31
HEAD_Y = 1
TITLE_Y = 8
LINE3_Y = 17
LINE4_Y = 25

# 16x16 pixel glyphs, centered in the art square, as (x, y, width, height, color)
# rectangles drawn in order. None is the glyph's color.
CUP = [
    (2, 1, 12, 1, None),
    (3, 2, 10, 6, None),
    (0, 2, 3, 1, None),
    (0, 3, 1, 3, None),
    (0, 5, 3, 1, None),
    (13, 2, 3, 1, None),
    (15, 3, 1, 3, None),
    (13, 5, 3, 1, None),
    (4, 8, 8, 1, None),
    (5, 9, 6, 1, None),
    (7, 10, 2, 2, None),
    (5, 12, 6, 1, None),
    (4, 13, 8, 2, None),
]
GAMEPAD = [
    (2, 5, 12, 6, None),
    (1, 7, 2, 5, None),
    (13, 7, 2, 5, None),
    (4, 7, 1, 3, ART_BG),
    (3, 8, 3, 1, ART_BG),
    (11, 7, 1, 1, ART_BG),
    (10, 8, 1, 1, ART_BG),
    (12, 8, 1, 1, ART_BG),
    (11, 9, 1, 1, ART_BG),
]

# The PlayStation app's own OAuth client, which is how PSN lets an NPSSO sign in.
AUTH_URL = "https://ca.account.sony.com/api/authz/v3/oauth/token"
AUTH_BASIC = "Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A="
SCOPE = "psn:mobile.v2.core psn:clientapp"
API = "https://m.np.playstation.com/api"

def access_token(refresh_token):
    """A PSN access token for the refresh token, or None. PSN's last a hour, so the
    answer is cached for 50 minutes."""
    resp = http.post(
        AUTH_URL,
        headers = {"Authorization": AUTH_BASIC},
        form_body = {
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
            "token_format": "jwt",
            "scope": SCOPE,
        },
        ttl_seconds = 3000,
    )
    if resp.status_code != 200:
        print("PSN sign-in answered %d" % resp.status_code)
        return None
    return json.decode(resp.body()).get("access_token")

def get(token, path, params = {}, ttl = 900):
    resp = http.get(
        API + path,
        params = params,
        headers = {"Authorization": "Bearer " + token, "Accept-Language": "en-US"},
        ttl_seconds = ttl,
    )
    if resp.status_code != 200:
        print("PSN %s answered %d" % (path, resp.status_code))
        return None
    return json.decode(resp.body())

def minutes_of(duration):
    """Minutes in an ISO 8601 duration like PT12H34M56S."""
    minutes = 0
    number = ""
    for ch in duration.elems():
        if ch.isdigit():
            number += ch
        elif ch in "HMS" and number:
            minutes += {"H": int(number) * 60, "M": int(number), "S": 0}[ch]
            number = ""
        else:
            number = ""
    return minutes

def fetch_played(token):
    """The game played last, as {title, playedAt, playMinutes, art}, or None."""
    body = get(token, "/gamelist/v2/users/me/titles", {
        "categories": "ps4_game,ps5_native_game",
        "limit": "1",
        "offset": "0",
    })
    if not body or not body.get("titles"):
        return None
    game = body["titles"][0]
    return {
        "title": game.get("localizedName") or game["name"],
        "playedAt": game["lastPlayedDateTime"],
        "playMinutes": minutes_of(game.get("playDuration", "")),
        "art": game.get("localizedImageUrl") or game.get("imageUrl"),
    }

def fetch_trophy(token):
    """The trophy earned last, as {name, grade, game, earnedAt}, or None. Looks in the
    game whose trophies changed most recently."""
    body = get(token, "/trophy/v1/users/me/trophyTitles", {"limit": "1"})
    if not body or not body.get("trophyTitles"):
        return None
    game = body["trophyTitles"][0]
    path = "/npCommunicationIds/%s/trophyGroups/all/trophies" % game["npCommunicationId"]
    service = {"npServiceName": game["npServiceName"]}
    earned = get(token, "/trophy/v1/users/me" + path, service)
    if not earned:
        return None
    latest = None
    for trophy in earned.get("trophies", []):
        if trophy.get("earned") and (latest == None or trophy["earnedDateTime"] > latest["earnedDateTime"]):
            latest = trophy
    if latest == None:
        return None

    # Trophy names don't change, so they're cached for a day.
    names = get(token, "/trophy/v1" + path, service, ttl = 86400) or {}
    name = "TROPHY"
    for trophy in names.get("trophies", []):
        if trophy["trophyId"] == latest["trophyId"]:
            name = trophy["trophyName"]
    return {
        "name": name,
        "grade": latest["trophyType"],
        "game": game["trophyTitleName"],
        "earnedAt": latest["earnedDateTime"],
    }

def fetch_art(url):
    """The image at `url`, or None. PSN's own image server can shrink it first."""
    if not url:
        return None
    if url.startswith("https://image.api.playstation.com/"):
        url += "&w=64" if "?" in url else "?w=64"
    resp = http.get(url, ttl_seconds = 86400)
    if resp.status_code != 200:
        return None
    return resp.body()

def tiny(text, color):
    return render.Text(text, font = "tom-thumb", color = color)

def scroller(text, font, color):
    return render.Marquee(
        width = TEXT_WIDTH,
        delay = SCROLL_DELAY,
        child = render.Text(text, font = font, color = color),
    )

def at(x, y, child):
    return render.Padding(pad = (x, y, 0, 0), child = child)

def glyph(rects, color):
    children = [render.Box(width = 32, height = 32, color = ART_BG)]
    for x, y, w, h, c in rects:
        children.append(at(8 + x, 8 + y, render.Box(width = w, height = h, color = c or color)))
    return render.Stack(children = children)

def ago(when, now):
    minutes = int((now - time.parse_time(when)).minutes)
    if minutes < 60:
        return "%dM AGO" % max(minutes, 0)
    if minutes < 24 * 60:
        return "%dH AGO" % (minutes // 60)
    return "%dD AGO" % (minutes // (24 * 60))

def play_time(minutes):
    hours = minutes // 60
    if hours >= 10:
        return "%dH" % hours
    if hours:
        return "%dH %dM" % (hours, minutes % 60)
    return "%dM" % minutes

def screen(art, lines):
    """The art on the left and the lines of text right of it, held SCREEN_FRAMES."""
    hold = render.Animation(children = [render.Box(width = 1, height = 1)] * SCREEN_FRAMES)
    children = [art, hold]
    for i, y in enumerate([HEAD_Y, TITLE_Y, LINE3_Y, LINE4_Y]):
        children.append(at(TEXT_X, y, lines[i]))
    return render.Stack(children = children)

def played_screen(played, now, art):
    if art:
        art = render.Image(src = art, width = 32, height = 32)
    else:
        art = glyph(GAMEPAD, GLYPH)
    return screen(art, [
        tiny("PLAYED", HEAD),
        scroller(played["title"], "tb-8", TITLE),
        tiny(play_time(played["playMinutes"]), SUB),
        tiny(ago(played["playedAt"], now), AGO),
    ])

def trophy_screen(trophy, now):
    color = GRADES.get(trophy["grade"], GRADES["bronze"])
    return screen(glyph(CUP, color), [
        tiny(trophy["grade"].upper(), color),
        scroller(trophy["name"], "tb-8", TITLE),
        scroller(trophy["game"], "tom-thumb", SUB),
        tiny(ago(trophy["earnedAt"], now), AGO),
    ])

def message(text):
    return render.Root(child = render.Box(child = render.Column(
        cross_align = "center",
        children = [tiny("PLAYSTATION", HEAD), render.Box(width = 1, height = 2), tiny(text, SUB)],
    )))

def main(config):
    now = time.now()
    art = None
    if config.get("sample"):
        # A fixed profile (tidbyt/psn/sample.json) for previews and checks.
        data = json.decode(config.get("sample"))
        now = time.parse_time(data["now"])
        played = data.get("played")
        trophy = data.get("trophy")
    elif config.get("refresh_token"):
        token = access_token(config.get("refresh_token"))
        if not token:
            return message("SIGN IN AGAIN")
        played = fetch_played(token)
        trophy = fetch_trophy(token)
        if played:
            art = fetch_art(played["art"])
    else:
        return message("ADD A TOKEN")

    screens = []
    if played:
        screens.append(played_screen(played, now, art))
    if trophy:
        screens.append(trophy_screen(trophy, now))
    if not screens:
        return message("NOTHING YET")

    return render.Root(
        delay = FRAME_MS,
        show_full_animation = True,
        child = render.Sequence(children = screens),
    )

def get_schema():
    return schema.Schema(
        version = "1",
        fields = [
            schema.Text(
                id = "refresh_token",
                name = "PSN refresh token",
                desc = "Made from your NPSSO by scripts/psn_token.py. Lasts about two months.",
                icon = "key",
            ),
        ],
    )
