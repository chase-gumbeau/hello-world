"""Trades your PlayStation Network NPSSO for the refresh token the Tidbyt PlayStation
app (tidbyt/psn/playstation.star) signs in with, and prints it.

    python3 scripts/psn_token.py

Get the NPSSO by signing in at playstation.com, then opening
https://ca.account.sony.com/api/v1/ssocookie in the same browser and copying the
"npsso" value. The script asks for it without echoing it, and keeps neither it nor the
token anywhere. Pixlet apps can't make this trade themselves: PSN answers it with a
redirect to the PlayStation app's own URL scheme, which Pixlet's HTTP client chokes on.
"""
import datetime
import getpass
import json
import sys
import urllib.error
import urllib.parse
import urllib.request

AUTH = "https://ca.account.sony.com/api/authz/v3/oauth"
CLIENT_ID = "09515159-7237-4370-9b40-3806e67c0891"
# The PlayStation app's client, as in playstation.star.
BASIC = "Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A="
REDIRECT = "com.scee.psxandroid.scecompcall://redirect"
SCOPE = "psn:mobile.v2.core psn:clientapp"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


npsso = getpass.getpass("NPSSO: ").strip()
if len(npsso) != 64:
    sys.exit("That isn't an NPSSO: it should be 64 characters.")

query = urllib.parse.urlencode({
    "access_type": "offline",
    "client_id": CLIENT_ID,
    "redirect_uri": REDIRECT,
    "response_type": "code",
    "scope": SCOPE,
})
request = urllib.request.Request(f"{AUTH}/authorize?{query}", headers={"Cookie": f"npsso={npsso}"})
try:
    urllib.request.build_opener(NoRedirect).open(request)
    sys.exit("PSN didn't redirect. Is the NPSSO current?")
except urllib.error.HTTPError as err:
    location = err.headers.get("Location", "")
code = urllib.parse.parse_qs(urllib.parse.urlparse(location).query).get("code", [None])[0]
if not code:
    sys.exit("PSN didn't send a code. Sign in at playstation.com again and fetch a new NPSSO.")

body = urllib.parse.urlencode({
    "code": code,
    "redirect_uri": REDIRECT,
    "grant_type": "authorization_code",
    "token_format": "jwt",
}).encode()
request = urllib.request.Request(f"{AUTH}/token", data=body, headers={
    "Authorization": BASIC,
    "Content-Type": "application/x-www-form-urlencoded",
})
tokens = json.load(urllib.request.urlopen(request))
expires = datetime.date.today() + datetime.timedelta(seconds=tokens["refresh_token_expires_in"])
print(tokens["refresh_token"])
print(f"Set it as the app's PSN refresh token in Tronbyt. It lasts until about {expires}.", file=sys.stderr)
