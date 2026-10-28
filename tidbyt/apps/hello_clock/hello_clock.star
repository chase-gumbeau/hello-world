"""
Applet: Hello Clock
Summary: Greeting and local time
Description: Starter app for this workspace. Shows a time-of-day greeting and a clock with a blinking colon.
Author: Chase Chenevert
"""

load("encoding/json.star", "json")
load("render.star", "render")
load("schema.star", "schema")
load("time.star", "time")

DEFAULT_NAME = "Chase"
DEFAULT_LOCATION = """
{
    "lat": "41.8781",
    "lng": "-87.6298",
    "description": "Chicago, IL, USA",
    "locality": "Chicago",
    "timezone": "America/Chicago"
}
"""

def main(config):
    name = config.str("name", DEFAULT_NAME)
    location = json.decode(config.get("location", DEFAULT_LOCATION))
    now = time.now().in_location(location["timezone"])

    return render.Root(
        delay = 500,
        child = render.Column(
            expanded = True,
            main_align = "space_evenly",
            cross_align = "center",
            children = [
                render.Text(greeting(now.hour) + ",", font = "tom-thumb", color = "#8ab4f8"),
                render.Marquee(
                    width = 64,
                    align = "center",
                    child = render.Text(name, color = "#ffffff"),
                ),
                render.Animation(
                    children = [
                        render.Text(now.format("3:04 PM"), font = "6x13", color = "#fbbc04"),
                        render.Text(now.format("3 04 PM"), font = "6x13", color = "#fbbc04"),
                    ],
                ),
            ],
        ),
    )

def greeting(hour):
    if hour < 12:
        return "Good morning"
    elif hour < 17:
        return "Good afternoon"
    return "Good evening"

def get_schema():
    return schema.Schema(
        version = "1",
        fields = [
            schema.Text(
                id = "name",
                name = "Name",
                desc = "Who to greet.",
                icon = "user",
                default = DEFAULT_NAME,
            ),
            schema.Location(
                id = "location",
                name = "Location",
                desc = "Location used for the local time.",
                icon = "locationDot",
            ),
        ],
    )
