#!/usr/bin/env python3
"""Convert Mexico City Frame25 JSX → HTML + utility CSS (mirrors Costa Rica/Summer scrolls pipeline)."""
import re
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = "assets/scrolls-mexico-city"
src = (ROOT / ASSET_DIR / "source.jsx").read_text()
local = json.loads((ROOT / ASSET_DIR / "local-manifest.json").read_text())

m = re.search(r"return \(\n(.*)\n\s*\);\n\}", src, re.S)
if not m:
    raise SystemExit("no return body")
jsx = m.group(1)

for name, file in local.items():
    path = f'"./{ASSET_DIR}/{file}"'
    url = f'url("./{ASSET_DIR}/{file}")'
    # Replace the more specific `url("${name}")` form first (leaving any
    # wrapping backticks untouched so the maskImage regex below still
    # matches) — the bare `{name}` pattern is a substring of it and would
    # otherwise mangle it if applied first.
    jsx = jsx.replace(f'url("${{{name}}}")', url)
    jsx = jsx.replace(f"{{{name}}}", path)

jsx = re.sub(
    r'style=\{\{\s*maskImage:\s*`url\("([^"]+)"\)`\s*\}\}',
    lambda m: (
        'style="mask-image: url(\'%s\'); -webkit-mask-image: url(\'%s\')"'
        % (m.group(1), m.group(1))
    ),
    jsx,
)

jsx = jsx.replace("className=", "class=")
jsx = re.sub(r'\s*data-node-id="[^"]*"', "", jsx)
jsx = re.sub(r'\s*data-name="[^"]*"', "", jsx)

# `{`Mexico `}` JSX text-expression string → plain text
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
        "items-center": ("align-items", "center"),
        "justify-center": ("justify-content", "center"),
        "justify-between": ("justify-content", "space-between"),
        "content-stretch": ("align-content", "stretch"),
        "overflow-clip": ("overflow", "clip"),
        "overflow-hidden": ("overflow", "hidden"),
        "pointer-events-none": ("pointer-events", "none"),
        "whitespace-nowrap": ("white-space", "nowrap"),
        "not-italic": ("font-style", "normal"),
        "text-white": ("color", "#fff"),
        "text-center": ("text-align", "center"),
        "bg-black": ("background", "#000"),
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
    }
    if tok in static:
        return [static[tok]]

    m = re.match(r"^(mask-position|mask-size)-\[(.+)\]$", tok)
    if m:
        prop, val = m.group(1), m.group(2).replace("_", " ")
        return [(prop, val)]

    m = re.match(r"^rounded-(tl|tr|bl|br)-\[(.+)\]$", tok)
    if m:
        corner_map = {
            "tl": "border-top-left-radius",
            "tr": "border-top-right-radius",
            "bl": "border-bottom-left-radius",
            "br": "border-bottom-right-radius",
        }
        return [(corner_map[m.group(1)], m.group(2).replace("_", " "))]

    m = re.match(r"^mix-blend-(.+)$", tok)
    if m:
        return [("mix-blend-mode", m.group(1))]

    m = re.match(r"^opacity-(\d+(?:\.\d+)?)$", tok)
    if m:
        return [("opacity", str(float(m.group(1)) / 100))]

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
            "rounded": "border-radius",
            "text": "font-size",
            "bg": "background",
            "border": "border-width",
            "tracking": "letter-spacing",
            "gap": "gap",
            "leading": "line-height",
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
                decls.append(("font-family", '"Ballet", cursive'))
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


def normalize_calc(text: str) -> str:
    """calc(50%+1px) is invalid CSS — operators need surrounding spaces."""
    return re.sub(r"calc\((\d+(?:\.\d+)?%)([+-])(-?[\d.]+px)\)", r"calc(\1 \2 \3)", text)


class_map = {}
css_lines = ["/* Auto-generated utility styles for Mexico City Scrolls */"]

for i, class_str in enumerate(sorted(full_classes)):
    decls = full_to_css(class_str)
    short = f"mx{i}"
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

canvas_cls = None
strip_cls = None
for old, new in class_map.items():
    if "rounded-[80px]" in old and "size-full" in old and "bg-black" in old:
        canvas_cls = new
    if "left-[1478px]" in old and "top-[405px]" in old and "contents" in old:
        strip_cls = new

if not canvas_cls or not strip_cls:
    raise SystemExit(f"missing canvas/strip classes: {canvas_cls=} {strip_cls=}")

css_text = "\n".join(css_lines)
css_text = re.sub(
    rf"(\.{strip_cls} \{{[^}}]*?)left: 1478px;",
    r"\1left: 1382px;",
    css_text,
    count=1,
)
pat = rf"\.{strip_cls} \{{[^}}]+\}}"


def merge_transform(m):
    block = m.group(0)
    if "will-change:" not in block:
        block = block.replace("{", "{\n  will-change: transform;", 1)
    if "translateX(var(--scroll-x" in block:
        return block
    if "transform:" in block:
        return re.sub(
            r"transform:\s*([^;]+);",
            r"transform: \1 translateX(var(--scroll-x, 0px));",
            block,
            count=1,
        )
    return block[:-1] + "  transform: translateX(var(--scroll-x, 0px));\n}"


css_text = re.sub(pat, merge_transform, css_text, count=1)

# Force design canvas size (Figma artboard 3842x2160)
css_text = re.sub(
    rf"(\.{canvas_cls} \{{[^}}]*?)width: 100%;\n  height: 100%;",
    r"\1width: 3842px;\n  height: 2160px;",
    css_text,
    count=1,
)
if f".{canvas_cls} {{" in css_text and "width: 3842px" not in css_text.split(f".{canvas_cls} {{")[1].split("}")[0]:
    css_text = css_text.replace(
        f".{canvas_cls} {{",
        f".{canvas_cls} {{\n  width: 3842px;\n  height: 2160px;",
        1,
    )

html_body = html_body.replace(
    f'<div class="{canvas_cls}">',
    f'<div class="{canvas_cls} canvas" id="canvas">',
    1,
)
html_body = html_body.replace(
    f'<div class="{strip_cls}">',
    f'<div class="{strip_cls} scroll-strip" id="scroll-strip">',
    1,
)

start = html_body.find('id="scroll-strip"')
if start < 0:
    raise SystemExit("scroll-strip missing")
open_idx = html_body.rfind("<div", 0, start)
i = open_idx
depth = 0
end = None
while i < len(html_body):
    if html_body.startswith("<div", i):
        depth += 1
        i = html_body.find(">", i) + 1
        continue
    if html_body.startswith("</div>", i):
        depth -= 1
        i += len("</div>")
        if depth == 0:
            end = i
            break
        continue
    i += 1

if end is None:
    raise SystemExit("could not balance strip")

canvas_open = html_body.find('id="canvas"')
canvas_open = html_body.rfind("<div", 0, canvas_open)
prefix = html_body[canvas_open:end]
html_body = (
    prefix
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
html_body = normalize_calc(html_body)

(ROOT / ASSET_DIR / "generated.css").write_text(css_text + "\n")
(ROOT / ASSET_DIR / "generated-body.html").write_text(html_body + "\n")
print("Wrote", ASSET_DIR + "/generated.css and generated-body.html")
print("canvas", canvas_cls, "strip", strip_cls, "body", len(html_body))
