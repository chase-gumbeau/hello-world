"""Shared Scrolls stage / frame geometry.

Every trip must start its first content panel flush with the centered
window frame's left edge. Convert scripts and the alignment checker
both import from here so the numbers stay in one place.

See docs/scrolls.md for the full convention and how to add a trip.
"""

# Design artboard (Figma canvas) size in CSS px.
DESIGN_W = 3842
DESIGN_H = 2160

# Visible window chrome (white border + scrim hole). Centered on the stage.
FRAME_OUTER_W = 1078
FRAME_OUTER_H = 1918.889
FRAME_BORDER = 4.889
FRAME_RADIUS = 78.222

# Horizontal panel pitch used by mountScrolls (drag / keyboard steps).
FRAME_PANEL_W = 1080
FRAME_PANEL_H = 1350

# Left edge of the centered frame on the design canvas.
# (DESIGN_W - FRAME_OUTER_W) / 2 → 1382
FRAME_LEFT = (DESIGN_W - FRAME_OUTER_W) // 2

# Figma exports often place the first panel at this offset (frame was
# historically nudged +99px from true center). Convert scripts remap to
# FRAME_LEFT.
FIGMA_STRIP_LEFT = 1478
