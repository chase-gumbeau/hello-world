#!/usr/bin/env python3
"""Convert Puerto Rico Frame23 JSX → HTML + utility CSS (mirrors Costa Rica/Guanajuato scrolls pipeline)."""
import re
import json
from pathlib import Path

from scrolls_geometry import DESIGN_H, DESIGN_W, FRAME_LEFT, FRAME_PANEL_W

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = "assets/scrolls-puerto-rico"
PREFIX = "pr"
src = (ROOT / ASSET_DIR / "source.jsx").read_text()
local = json.loads((ROOT / ASSET_DIR / "local-manifest.json").read_text())

m = re.search(r"return \(\n(.*)\n\s*\);\n\}", src, re.S)
if not m:
    raise SystemExit("no return body")
jsx = m.group(1)

for name, file in local.items():
    path = f'"./{ASSET_DIR}/{file}"'
    literal_url = f'url("./{ASSET_DIR}/{file}")'
    # Handle the `${name}` template-literal mask URL form first — it must run
    # before the bare `{name}` substitution below, which would otherwise also
    # match inside `${name}` (leaving a stray leading `$`).
    jsx = jsx.replace(f'`url("${{{name}}}")`', f"`{literal_url}`")
    jsx = jsx.replace(f'url("${{{name}}}")', literal_url)
    jsx = jsx.replace(f"{{{name}}}", path)

jsx = re.sub(
    r'style=\{\{\s*maskImage:\s*`url\("([^"]+)"\)`\s*\}\}',
    r'''style="mask-image: url('\1'); -webkit-mask-image: url('\1')"''',
    jsx,
)

jsx = jsx.replace("className=", "class=")
jsx = re.sub(r'\s*data-node-id="[^"]*"', "", jsx)
jsx = re.sub(r'\s*data-name="[^"]*"', "", jsx)

# JSX text expressions like {`Puerto `} → plain text
jsx = re.sub(r"\{`([^`]*)`\}", r"\1", jsx)

full_classes = set(re.findall(r'class="([^"]*)"', jsx))
print(f"Full class strings: {len(full_classes)}")

unhandled = set()


def tw_to_css(tok):
    static = {
        "absolute": ("position", "absolute"),
        "relative": ("position", "relative"),
        "block": ("display", "block"),
        "flex": ("display", "flex"),
        "contents": ("display", "contents"),
        "hidden": ("display", "none"),
        "w-full": ("width", "100%"),
        "h-full": ("height", "100%"),
        "max-w-none": ("max-width", "none"),
        "shrink-0": ("flex-shrink", "0"),
        "flex-none": ("flex", "none"),
        "flex-col": ("flex-direction", "column"),
        "items-center": ("align-items", "center"),
        "justify-center": ("justify-content", "center"),
        "content-stretch": ("align-content", "stretch"),
        "overflow-clip": ("overflow", "clip"),
        "overflow-hidden": ("overflow", "hidden"),
        "pointer-events-none": ("pointer-events", "none"),
        "whitespace-nowrap": ("white-space", "nowrap"),
        "whitespace-pre-wrap": ("white-space", "pre-wrap"),
        "not-italic": ("font-style", "normal"),
        "text-white": ("color", "#fff"),
        "text-center": ("text-align", "center"),
        "bg-black": ("background", "#000"),
        "bg-white": ("background", "#fff"),
        "left-0": ("left", "0"),
        "top-0": ("top", "0"),
        "right-0": ("right", "0"),
        "left-1/2": ("left", "50%"),
        "top-1/2": ("top", "50%"),
        "object-cover": ("object-fit", "cover"),
        "object-bottom": ("object-position", "bottom"),
        "border-solid": ("border-style", "solid"),
        "border-white": ("border-color", "#fff"),
        "mask-alpha": ("mask-mode", "alpha"),
        "mask-intersect": ("mask-composite", "intersect"),
        "mask-no-clip": ("mask-clip", "no-clip"),
        "mask-no-repeat": ("mask-repeat", "no-repeat"),
        "leading-[normal]": ("line-height", "normal"),
        "leading-[0]": ("line-height", "0"),
        "mix-blend-lighten": ("mix-blend-mode", "lighten"),
        "min-w-full": ("min-width", "100%"),
        "w-[min-content]": ("width", "min-content"),
        "mb-0": ("margin-bottom", "0"),
    }
    if tok in static:
        return [static[tok]]

    m = re.match(r"^(mask-position|mask-size)-\[(.+)\]$", tok)
    if m:
        prop, val = m.group(1), m.group(2).replace("_", " ")
        return [(prop, val)]

    m = re.match(r"^leading-\[(.+)\]$", tok)
    if m:
        return [("line-height", m.group(1).replace("_", " "))]

    m = re.match(r"^rounded-(tl|tr|bl|br)-\[(.+)\]$", tok)
    if m:
        corner_map = {
            "tl": "border-top-left-radius",
            "tr": "border-top-right-radius",
            "bl": "border-bottom-left-radius",
            "br": "border-bottom-right-radius",
        }
        return [(corner_map[m.group(1)], m.group(2).replace("_", " "))]

    m = re.match(r"^(-?[a-z0-9./%]+)-\[(.+)\]$", tok)
    if m:
        prop, val = m.group(1), m.group(2)
        val = val.replace("_", " ").replace("\\,", ",").replace("\\/", "/")
        prop_map = {
            "left": "left",
            "top": "top",
            "right": "right",
            "bottom": "bottom",
            "w": "width",
            "h": "height",
            "gap": "gap",
            "rounded": "border-radius",
            "rounded-tl": "border-top-left-radius",
            "rounded-tr": "border-top-right-radius",
            "rounded-bl": "border-bottom-left-radius",
            "rounded-br": "border-bottom-right-radius",
            "text": "font-size",
            "bg": "background",
            "border": "border-width",
            "tracking": "letter-spacing",
            "inset": "inset",
        }
        if prop in ("from", "to", "via") or prop.startswith("bg-gradient"):
            return tok
        if prop == "size":
            return [("width", val), ("height", val)]
        if prop == "text" and not (val[0].isdigit() or val.startswith("var") or val[0] == "."):
            return [("color", val)]
        if prop == "font":
            return tok  # handled in full_to_css
        if prop in ("rotate", "-rotate"):
            return tok
        css_prop = prop_map.get(prop)
        if css_prop:
            if prop == "border" and val.endswith("px"):
                return [("border-width", val)]
            return [(css_prop, val)]

    m = re.match(r"^bg-\[(.+)\]$", tok)
    if m:
        return [("background", m.group(1).replace("_", " "))]
    m = re.match(r"^text-\[(.+)\]$", tok)
    if m:
        val = m.group(1).replace("_", " ")
        if val[0].isdigit() or val.startswith("var") or val[0] == ".":
            return [("font-size", val)]
        return [("color", val)]
    m = re.match(r"^rounded-\[(.+)\]$", tok)
    if m:
        return [("border-radius", m.group(1).replace("\\/", "/").replace("_", " "))]
    return tok


def transform_bits(tokens):
    transforms = []
    decls = []
    for tok in tokens:
        if tok == "inset-0":
            decls += [("inset", "0")]
            continue
        if tok == "size-full":
            decls += [("width", "100%"), ("height", "100%")]
            continue
        if tok == "-translate-x-1/2":
            transforms.append("translateX(-50%)")
            continue
        if tok == "-translate-y-1/2":
            transforms.append("translateY(-50%)")
            continue
        if tok == "-scale-y-100":
            transforms.append("scaleY(-1)")
            continue
        if tok.startswith("bg-gradient-to-"):
            continue
        if tok.startswith("from-[") or tok.startswith("to-[") or tok.startswith("from-") or tok.startswith("to-"):
            continue
        if tok in ("[word-break:break-word]",) or tok.startswith("[word-break:"):
            decls.append(("word-break", "break-word"))
            continue
        if tok.startswith("[text-box-"):
            continue

        m = re.match(r"^rotate-\[(.+)\]$", tok)
        if m:
            transforms.append(f"rotate({m.group(1)})")
            continue
        m = re.match(r"^-rotate-\[(.+)\]$", tok)
        if m:
            transforms.append(f"rotate(-{m.group(1)})")
            continue
        m = re.match(r"^rotate-(\d+(?:\.\d+)?)$", tok)
        if m:
            transforms.append(f"rotate({m.group(1)}deg)")
            continue
        m = re.match(r"^-rotate-(\d+(?:\.\d+)?)$", tok)
        if m:
            transforms.append(f"rotate(-{m.group(1)}deg)")
            continue

        m = re.match(r"^tracking-\[(.+)\]$", tok)
        if m:
            decls.append(("letter-spacing", m.group(1)))
            continue

        result = tw_to_css(tok)
        if result == tok:
            unhandled.add(tok)
            continue
        if isinstance(result, list):
            decls.extend(result)
        else:
            unhandled.add(tok)
    return decls, transforms


def full_to_css(class_str):
    tokens = class_str.split()
    decls, transforms = transform_bits(tokens)

    grad_dir = None
    for t in tokens:
        if t == "bg-gradient-to-l":
            grad_dir = "left"
        elif t == "bg-gradient-to-r":
            grad_dir = "right"
        elif t == "bg-gradient-to-b":
            grad_dir = "bottom"
        elif t == "bg-gradient-to-t":
            grad_dir = "top"
    if grad_dir:
        fr = "transparent"
        to = "black"
        for t in tokens:
            m = re.match(r"^from-\[(.+)\]$", t)
            if m:
                fr = m.group(1).replace("_", " ")
            m = re.match(r"^to-\[(.+)\]$", t)
            if m:
                to = m.group(1).replace("_", " ")
            if t == "to-black":
                to = "#000"
            if t == "from-black":
                fr = "#000"
        decls.append(("background", f"linear-gradient(to {grad_dir}, {fr}, {to})"))

    if transforms:
        decls.append(("transform", " ".join(transforms)))

    for t in tokens:
        m = re.match(r"^font-\['([^']+)'\]$", t)
        if not m:
            m = re.match(r"^font-\[([^\]]+)\]$", t)
        if m:
            fam = m.group(1).strip("'\"")
            weight = "400"
            if ":" in fam:
                name, style = fam.split(":", 1)
                if "Bold" in style:
                    weight = "700"
                fam = name
            fam = fam.replace("_", " ")
            if "Ballet" in fam:
                decls.append(("font-family", '"Ballet", "Italiana", "Times New Roman", serif'))
            elif "Italiana" in fam:
                decls.append(("font-family", '"Italiana", "Times New Roman", serif'))
            elif "Inter" in fam:
                decls.append(("font-family", '"Inter", "Inter Display", system-ui, sans-serif'))
                decls.append(("font-weight", weight))
            else:
                decls.append(("font-family", f'"{fam}", sans-serif'))
                if weight != "400":
                    decls.append(("font-weight", weight))
    return decls


class_map = {}
css_lines = ["/* Auto-generated utility styles for Puerto Rico Scrolls */"]

for i, class_str in enumerate(sorted(full_classes)):
    decls = full_to_css(class_str)
    short = f"{PREFIX}{i}"
    class_map[class_str] = short
    if decls:
        expanded = []
        for k, v in decls:
            expanded.append((k, v))
            if k == "mask-mode":
                expanded.append(("-webkit-mask-mode", v))
            elif k == "mask-composite":
                expanded.append(("-webkit-mask-composite", "source-in"))
            elif k == "mask-clip":
                expanded.append(("-webkit-mask-clip", v if v != "no-clip" else "unset"))
            elif k == "mask-repeat":
                expanded.append(("-webkit-mask-repeat", v))
            elif k == "mask-position":
                expanded.append(("-webkit-mask-position", v))
            elif k == "mask-size":
                expanded.append(("-webkit-mask-size", v))
        body = ";\n  ".join(f"{k}: {v}" for k, v in expanded)
        css_lines.append(f".{short} {{\n  {body};\n}}")

print(f"Unhandled tokens ({len(unhandled)}):")
for u in sorted(unhandled)[:80]:
    print(" ", u)

for old, new in sorted(class_map.items(), key=lambda x: -len(x[0])):
    jsx = jsx.replace(f'class="{old}"', f'class="{new}"')

html_body = jsx.strip()
html_body = re.sub(r"^\s{4}", "", html_body, flags=re.M)

void = {"img", "br", "hr", "input", "meta", "link", "source", "area", "base", "col", "embed", "wbr"}


def fix_self_closing(html):
    def repl(m):
        tag = m.group(1).lower()
        attrs = m.group(2)
        if tag in void:
            return m.group(0)
        return f"<{tag}{attrs}></{tag}>"

    return re.sub(r"<([A-Za-z][\w:-]*)([^>]*)/>", repl, html)


html_body = fix_self_closing(html_body)


def normalize_calc(text):
    """CSS calc() requires whitespace around +/- operators."""
    return re.sub(r"calc\((\d+(?:\.\d+)?%)([+-])(-?[\d.]+px)\)", r"calc(\1 \2 \3)", text)

strip_cls = None
for old, new in class_map.items():
    if "content-stretch" in old and "flex" in old and "items-center" in old and "size-full" in old:
        strip_cls = new

if not strip_cls:
    raise SystemExit(f"missing strip class: {strip_cls=}")

# The root Frame23 node is the strip itself (no separate wrapping canvas node in
# this export) — synthesize a `.pr100` canvas class matching the shared design
# stage (3842x2160) and wrap the strip in it, mirroring Guanajuato/Mexico City.
canvas_cls = f"{PREFIX}100"
css_lines.append(
    f".{canvas_cls} {{\n  background: #000;\n  overflow: clip;\n  position: relative;\n  border-radius: 80px;\n  width: {DESIGN_W}px;\n  height: {DESIGN_H}px;\n}}"
)

FRAME_COUNT = 20
FRAME_W = FRAME_PANEL_W
# Matches the shared design stage centering used by Summer/Costa Rica/Guanajuato.
STRIP_LEFT = FRAME_LEFT

# Rebuild the strip rule from scratch (rather than patching the auto-generated
# text) to avoid duplicate/conflicting declarations — e.g. the original
# `relative` token would otherwise leave a trailing `position: relative;`
# that overrides the `position: absolute` needed for the scroll strip.
strip_rule = (
    f".{strip_cls} {{\n"
    "  position: absolute;\n"
    "  align-content: stretch;\n"
    "  display: flex;\n"
    "  align-items: center;\n"
    f"  left: {STRIP_LEFT}px;\n"
    "  top: 50%;\n"
    f"  width: {FRAME_COUNT * FRAME_W}px;\n"
    "  transform: translateY(-50%) translateX(var(--scroll-x, 0px));\n"
    "  will-change: transform;\n"
    "}"
)
for i, line in enumerate(css_lines):
    if line.startswith(f".{strip_cls} {{"):
        css_lines[i] = strip_rule
        break
else:
    raise SystemExit(f"could not find strip rule for {strip_cls}")

css_text = "\n".join(css_lines)

html_body = html_body.replace(
    f'<div class="{strip_cls}">',
    f'<div class="{strip_cls} scroll-strip" id="scroll-strip">',
    1,
)

html_body = (
    f'<div class="{canvas_cls} canvas" id="canvas">\n  '
    + html_body
    + """
  <div class="scrim" aria-hidden="true">
    <div class="scrim-hole"></div>
  </div>
  <div class="edge-fade edge-fade--left" aria-hidden="true"></div>
  <div class="edge-fade edge-fade--right" aria-hidden="true"></div>
  <div class="window-frame" aria-hidden="true"></div>
</div>"""
)

css_text = normalize_calc(css_text)

(ROOT / ASSET_DIR / "generated.css").write_text(css_text + "\n")
(ROOT / ASSET_DIR / "generated-body.html").write_text(html_body + "\n")
print("Wrote", ASSET_DIR + "/generated.css and generated-body.html")
print("canvas", canvas_cls, "strip", strip_cls)
