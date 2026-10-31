"""Copies the release dates in tidbyt/games/games.json into the Pixlet app's bundled
snapshot (between BEGIN SNAPSHOT and END SNAPSHOT in tidbyt/games/upcoming_games.star),
using each game's short title where it has one.

    python3 scripts/sync_tidbyt_games.py
"""
import json
import re
from pathlib import Path

GAMES = Path("tidbyt/games/games.json")
APP = Path("tidbyt/games/upcoming_games.star")

games = json.loads(GAMES.read_text())["games"]
lines = ["SNAPSHOT = ["]
for game in games:
    entry = {"date": game["date"], "title": game.get("short", game["title"]), "platforms": game["platforms"]}
    lines.append("    %s," % json.dumps(entry, ensure_ascii=False))
lines.append("]")

app = APP.read_text()
app, n = re.subn(
    r"(# BEGIN SNAPSHOT\n).*?(# END SNAPSHOT)",
    lambda m: m.group(1) + "\n".join(lines) + "\n" + m.group(2),
    app,
    flags=re.S,
)
if n != 1:
    raise SystemExit(f"{APP}: no BEGIN/END SNAPSHOT markers")
APP.write_text(app)
print(f"{APP}: {len(games)} games")
