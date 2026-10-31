"""
Applet: Upcoming Games
Summary: PS5 and Switch 2 games out soon
Description: A ticker of PS5 and Switch 2 games releasing in the next 30 days, grouped
by release date, with how many days away each date is and which of the two each game
is out on. Long titles wrap to two lines. Release dates come live from RAWG (rawg.io)
with an API key, and otherwise from the snapshot bundled below.
Author: Chase Chenevert
"""

load("encoding/json.star", "json")
load("http.star", "http")
load("render.star", "render")
load("schema.star", "schema")
load("time.star", "time")

WINDOW_DAYS = 30

# How long each LED step of the scroll shows, in ms: 25 LEDs a second.
FRAME_MS = 40

DATE = "#fb0"
DAYS = "#a60"
TITLE = "#fff"
PLATFORM = "#778"

GAME_GAP = 8  # between games on the same date
DATE_GAP = 14  # between dates

# Titles wider than this, in LEDs, wrap to two lines.
WRAP_WIDTH = 48
LINE_HEIGHT = 8  # tb-8's

MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

# Release dates as of the snapshot's capture, from tidbyt/games/games.json (run
# scripts/sync_tidbyt_games.py after changing it). Shown when there's no RAWG key or
# RAWG can't be reached.
# BEGIN SNAPSHOT
SNAPSHOT = [
    {"date": "2026-11-05", "title": "Zelda: Ocarina of Time", "platforms": ["Switch 2"]},
    {"date": "2026-11-05", "title": "Edge of Memories", "platforms": ["PS5", "Xbox", "PC"]},
    {"date": "2026-11-05", "title": "Guardians of the Galaxy", "platforms": ["Switch 2"]},
    {"date": "2026-11-06", "title": "Stellar Blade", "platforms": ["Switch 2"]},
    {"date": "2026-11-12", "title": "Metaphor: ReFantazio", "platforms": ["Switch 2"]},
    {"date": "2026-11-12", "title": "Pikmin 4", "platforms": ["Switch 2"]},
    {"date": "2026-11-12", "title": "Sonic Pico Park", "platforms": ["PC", "PS5", "Xbox", "Switch 2", "Switch"]},
    {"date": "2026-11-19", "title": "GTA VI", "platforms": ["PS5", "Xbox"]},
]
# END SNAPSHOT

# The platforms the ticker follows, by RAWG's names and the snapshot's, with the short
# name listed under each title, in the order they're listed. Games on none of them are
# left out; add a line here to follow another.
PLATFORMS = [
    ("PlayStation 5", "PS5"),
    ("PS5", "PS5"),
    ("Nintendo Switch 2", "SW2"),
    ("Switch 2", "SW2"),
]

def short_platforms(names):
    """The followed platforms a game is out on, short and in a steady order, without repeats."""
    out = []
    for long, short in PLATFORMS:
        if long in names and short not in out:
            out.append(short)
    return " ".join(out)

def fetch_rawg(key, start, end):
    """RAWG's most followed games releasing from `start` to `end`, most followed first, or None."""
    resp = http.get(
        "https://api.rawg.io/api/games",
        params = {
            "key": key,
            "dates": "%s,%s" % (start, end),
            "ordering": "-added",
            "exclude_additions": "true",
            # Plenty, so enough are left once other platforms' games are dropped.
            "page_size": "40",
        },
        ttl_seconds = 6 * 3600,
    )
    if resp.status_code != 200:
        print("RAWG answered %d" % resp.status_code)
        return None
    games = []
    for game in json.decode(resp.body()).get("results", []):
        if not game.get("released"):
            continue
        games.append({
            "date": game["released"],
            "title": game["name"],
            "platforms": [p["platform"]["name"] for p in (game.get("platforms") or [])],
        })
    return games

def date_of(text, tz):
    return time.parse_time(text + "T00:00:00", format = "2006-01-02T15:04:05", location = tz)

def days_label(days):
    if days <= 0:
        return "TODAY"
    return "%dD" % days

def tiny(text, color):
    return render.Text(text, font = "tom-thumb", color = color)

def width_of(text, font):
    return render.Text(text, font = font).size()[0]

def title_lines(title):
    """The title as one line, or, when it's wider than WRAP_WIDTH, two lines split at
    the space that keeps the wider of them narrowest."""
    if width_of(title, "tb-8") <= WRAP_WIDTH or " " not in title:
        return [title]
    words = title.split(" ")
    best = None
    for i in range(1, len(words)):
        lines = [" ".join(words[:i]), " ".join(words[i:])]
        width = max([width_of(line, "tb-8") for line in lines])
        if best == None or width < best[0]:
            best = (width, lines)
    return best[1]

def game_column(game):
    """A game's title (on one line or two) over its platforms, and how wide it is."""
    platforms = short_platforms(game["platforms"])
    lines = title_lines(game["title"])
    children = [render.Text(line, font = "tb-8", color = TITLE) for line in lines]
    if len(lines) == 1:
        # Keeps the platforms level with those under two-line titles.
        children.append(render.Box(width = 1, height = LINE_HEIGHT))
    children.append(render.Box(width = 1, height = 1))
    children.append(tiny(platforms, PLATFORM))
    width = max([width_of(line, "tb-8") for line in lines] + [width_of(platforms, "tom-thumb")])
    return render.Column(children = children), width

def date_group(when, days, games):
    """One release date (and how far off it is) over the games out that day, and how wide it is."""
    date = "%s %d" % (MONTHS[when.month - 1], when.day)
    columns = []
    games_width = 0
    for game in games:
        if columns:
            columns.append(render.Box(width = GAME_GAP, height = 1))
            games_width += GAME_GAP
        column, width = game_column(game)
        columns.append(column)
        games_width += width
    group = render.Column(
        children = [
            render.Row(children = [
                tiny(date, DATE),
                render.Box(width = 4, height = 1),
                tiny(days_label(days), DAYS),
            ]),
            render.Box(width = 1, height = 1),
            render.Row(children = columns),
        ],
    )
    date_width = width_of(date, "tom-thumb") + 4 + width_of(days_label(days), "tom-thumb")
    return group, max(date_width, games_width)

def ticker(games, today, tz):
    """Games grouped by date, soonest first: each date's group, where it starts along
    the strip, and how wide it is."""
    by_date = {}
    for game in sorted(games, key = lambda g: (g["date"], g["title"])):
        by_date.setdefault(game["date"], []).append(game)
    groups = []
    x = 0
    for date in sorted(by_date.keys()):
        when = date_of(date, tz)
        days = int((when - today).hours / 24 + 0.5)
        group, width = date_group(when, days, by_date[date])
        groups.append((group, x, width))
        x += width + DATE_GAP
    return groups

def scroll(groups):
    """The strip scrolling left one LED a frame, from its start until it has gone and
    come back in from the right, like a marquee. Pixlet's own Marquee lays its child
    out in 640 LEDs and cuts the rest, so each frame places only the groups in view."""
    last = groups[-1]
    period = last[1] + last[2] + 64
    frames = []
    for f in range(period):
        visible = []
        for group, x, width in groups:
            # Where the group sits on screen this frame, wrapping round the loop.
            at = x - f
            if at + width <= 0:
                at += period
            if at < 64 and at + width > 0:
                visible.append(render.Padding(pad = (at, 0, 0, 0), child = group))
        frames.append(render.Stack(children = visible) if visible else render.Box(width = 64, height = 32))
    return render.Animation(children = frames)

def main(config):
    tz = config.get("$tz", "America/Chicago")
    today = time.now().in_location(tz)
    if config.get("today"):
        today = date_of(config.get("today"), tz)
    today = date_of(today.format("2006-01-02"), tz)
    end = today + time.parse_duration("%dh" % (WINDOW_DAYS * 24))
    start_s = today.format("2006-01-02")
    end_s = end.format("2006-01-02")

    games = None
    if config.get("rawg_key"):
        games = fetch_rawg(config.get("rawg_key"), start_s, end_s)
    if games == None:
        games = SNAPSHOT
    games = [
        g
        for g in games
        if g["date"] >= start_s and g["date"] <= end_s and short_platforms(g["platforms"])
    ]
    games = games[:int(config.get("count", "12"))]

    # The ticker has the whole screen: two-line titles leave no room for a header.
    if not games:
        body = render.Box(child = tiny("NOTHING DATED", PLATFORM))
    else:
        body = scroll(ticker(games, today, tz))

    return render.Root(
        delay = FRAME_MS,
        show_full_animation = True,
        child = body,
    )

def get_schema():
    return schema.Schema(
        version = "1",
        fields = [
            schema.Text(
                id = "rawg_key",
                name = "RAWG API key",
                desc = "Free key from rawg.io/apidocs for live release dates. Without one, the bundled snapshot shows.",
                icon = "key",
            ),
            schema.Dropdown(
                id = "count",
                name = "Games to show",
                desc = "At most how many of RAWG's most followed upcoming games to show.",
                icon = "gamepad",
                default = "12",
                options = [
                    schema.Option(display = n, value = n)
                    for n in ["6", "8", "12", "16", "20"]
                ],
            ),
        ],
    )
