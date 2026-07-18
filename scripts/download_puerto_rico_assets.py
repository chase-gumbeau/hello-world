#!/usr/bin/env python3
"""Download Puerto Rico Figma assets and build local-manifest.json (mirrors Mexico City pipeline)."""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "scrolls-puerto-rico"
ASSET_DIR.mkdir(parents=True, exist_ok=True)

ASSETS = {
    "imgImage32": "https://www.figma.com/api/mcp/asset/7508f99e-bbca-429c-b36f-2d28527c55fd",
    "imgImage65": "https://www.figma.com/api/mcp/asset/e80f4e12-5514-41d1-b5bc-ea274c4c7c3a",
    "imgImage2": "https://www.figma.com/api/mcp/asset/7c8a9a95-bdcf-4bcc-bf6a-caf08ab2daf2",
    "imgImage11": "https://www.figma.com/api/mcp/asset/7a3dd66c-d0ea-4b8f-befe-6f8f29cc0102",
    "imgImage104": "https://www.figma.com/api/mcp/asset/8177b5dd-60c6-4e4b-937d-bad0baa4dad5",
    "imgImage7": "https://www.figma.com/api/mcp/asset/83260db9-9bad-4992-b0e1-aaf43787ffdd",
    "imgImage63": "https://www.figma.com/api/mcp/asset/9f3f002d-7659-4af1-8995-f3d254f457fd",
    "imgImage39": "https://www.figma.com/api/mcp/asset/e2ba1114-db5a-454b-9bbb-b013911ce033",
    "imgImage71": "https://www.figma.com/api/mcp/asset/a24148ce-b036-45f1-b246-52b2f7e5e0cf",
    "imgImage43": "https://www.figma.com/api/mcp/asset/270ea4eb-2bdc-4ba4-9b13-0ed2543b6197",
    "imgImage46": "https://www.figma.com/api/mcp/asset/0b3fecdb-5ead-429d-9eb6-c1f9666605e4",
    "imgImage66": "https://www.figma.com/api/mcp/asset/a2769a7a-478f-4e1f-92fa-bed47eb2d5f0",
    "imgImage96": "https://www.figma.com/api/mcp/asset/a5162a38-98a3-4101-8e6e-b441b7d0fbc4",
    "imgImage29": "https://www.figma.com/api/mcp/asset/17ea8c06-042d-48bc-b442-e6b454ff2659",
    "imgImage57": "https://www.figma.com/api/mcp/asset/7988aeb2-e3f8-40c6-bbc9-38e48c2608c4",
    "imgImage98": "https://www.figma.com/api/mcp/asset/ec37a09e-b573-4067-804c-143da2709cf7",
    "imgImage49": "https://www.figma.com/api/mcp/asset/20e7ab8b-6c29-4bf8-a6ed-420d19751afc",
    "imgImage27": "https://www.figma.com/api/mcp/asset/be711d5c-faed-4410-978c-7d006396f494",
    "imgImage35": "https://www.figma.com/api/mcp/asset/b859145c-a8e3-44d4-b2b0-3e1b9bc1fe23",
    "imgImage74": "https://www.figma.com/api/mcp/asset/1d362433-4718-47b8-b527-9a58219c229f",
    "imgImage33": "https://www.figma.com/api/mcp/asset/8d5fedc3-4d00-4b69-a3fa-019f23e20e38",
    "imgImage4": "https://www.figma.com/api/mcp/asset/b3c50a2e-4bf9-459b-8651-5cf9b90b5b01",
    "imgImage95": "https://www.figma.com/api/mcp/asset/94744fe8-8c7c-4c4d-8c4c-0d884d12379e",
    "imgImage22": "https://www.figma.com/api/mcp/asset/e4306c19-a54b-4263-95fa-6fbacd9d85f8",
    "imgImage93": "https://www.figma.com/api/mcp/asset/53c106e8-ae7b-42a3-a0eb-54668b71eaca",
    "imgImage54": "https://www.figma.com/api/mcp/asset/324004a9-d061-484c-b45f-e0391bfe1d55",
    "imgImage94": "https://www.figma.com/api/mcp/asset/c96f62cc-af2f-4fc7-a32a-e24bc9d8295a",
    "imgImage18": "https://www.figma.com/api/mcp/asset/ab95e32d-9bd3-4a7b-8a5c-baee52d589b8",
    "imgImage105": "https://www.figma.com/api/mcp/asset/c9dd8fb6-13c1-4a7d-b0ce-943e4fcde0e5",
    "imgImage16": "https://www.figma.com/api/mcp/asset/cac79a9c-ec7a-4010-817a-8b86db2a632d",
    "imgImage62": "https://www.figma.com/api/mcp/asset/d0e5a565-e899-4913-afcf-4a039994fda8",
    "imgImage56": "https://www.figma.com/api/mcp/asset/0259304f-c6ca-483b-8e66-80559292e162",
    "imgImage34": "https://www.figma.com/api/mcp/asset/ecbda7c6-dc73-48ef-b69b-9534e9031c99",
    "imgImage70": "https://www.figma.com/api/mcp/asset/9f20dfc7-eef0-47f3-9133-6f0ac9e7f235",
    "imgEllipse5": "https://www.figma.com/api/mcp/asset/f53468ac-718e-4634-b87b-6b2cb52fd912",
    "imgImage17": "https://www.figma.com/api/mcp/asset/72ad522d-6aa6-4aeb-ba89-633b808b7462",
}

EXT_MAP = {
    "PNG image data": "png",
    "JPEG image data": "jpg",
    "SVG Scalable Vector Graphics image": "svg",
    "WebP image": "webp",
}

manifest = {}
for name, url in ASSETS.items():
    tmp_path = ASSET_DIR / f"_tmp_{name}"
    subprocess.run(["curl", "-s", "-o", str(tmp_path), url], check=True)
    file_out = subprocess.run(["file", "-b", str(tmp_path)], capture_output=True, text=True).stdout
    ext = None
    for key, val in EXT_MAP.items():
        if key in file_out:
            ext = val
            break
    if ext is None:
        head = tmp_path.read_bytes()[:200].decode("utf-8", errors="ignore")
        if "<svg" in head or "<?xml" in head:
            ext = "svg"
        else:
            raise SystemExit(f"Unknown file type for {name}: {file_out}")
    final_name = f"{name}.{ext}"
    tmp_path.rename(ASSET_DIR / final_name)
    manifest[name] = final_name
    print(name, "->", final_name)

(ASSET_DIR / "local-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print("Wrote local-manifest.json with", len(manifest), "entries")
