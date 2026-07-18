#!/usr/bin/env python3
"""Download Mexico City Figma assets and build local-manifest.json (mirrors Costa Rica pipeline)."""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "scrolls-mexico-city"
ASSET_DIR.mkdir(parents=True, exist_ok=True)

ASSETS = {
    "imgImage73": "https://www.figma.com/api/mcp/asset/2587f56a-4c22-4dcc-950d-61fe3adbcea5",
    "imgImage2": "https://www.figma.com/api/mcp/asset/2ef3c7ac-16c1-43fd-b016-01515f5761d8",
    "imgImage1": "https://www.figma.com/api/mcp/asset/361c4df4-5c42-4fa6-bc16-43c99983a063",
    "imgSubtract": "https://www.figma.com/api/mcp/asset/c8f981fc-3e7f-4559-8691-6d8234195bed",
    "imgSubtract1": "https://www.figma.com/api/mcp/asset/4ebe7059-f20c-429a-8166-f0933a984679",
    "imgSubtract2": "https://www.figma.com/api/mcp/asset/dcffaaf7-61bb-40fd-b690-3c28a95841de",
    "imgImage52": "https://www.figma.com/api/mcp/asset/0791f5e9-389a-4607-9e91-b8bf9fbea4fd",
    "imgSubtract3": "https://www.figma.com/api/mcp/asset/4be3f9c2-d38f-4784-9e74-2de6ef0f62c5",
    "imgImage79": "https://www.figma.com/api/mcp/asset/4daa89e6-d9d3-4c0b-89c7-8a37c18e5d3e",
    "imgImage78": "https://www.figma.com/api/mcp/asset/16b7b1f0-978d-447a-8e0e-540358e4065b",
    "imgImage53": "https://www.figma.com/api/mcp/asset/d75428d4-0782-4d5a-a9c3-24e43aadfe7a",
    "imgImage47": "https://www.figma.com/api/mcp/asset/7551a977-2686-4628-b0e1-06d7cd2fd9f3",
    "imgSubtract4": "https://www.figma.com/api/mcp/asset/f4fc4550-6b4f-4d1d-b74b-6c6997c1d9e9",
    "imgImage33": "https://www.figma.com/api/mcp/asset/f4ffcd37-f05b-4e93-87b8-3f55842f0e8f",
    "imgImage7": "https://www.figma.com/api/mcp/asset/ce24e6c1-270e-4a68-91f5-afab8d0fd7a8",
    "imgImage60": "https://www.figma.com/api/mcp/asset/4fb0d502-8648-4175-891c-1c77693a250d",
    "imgSubtract5": "https://www.figma.com/api/mcp/asset/74075b8a-b87e-4905-884b-b519a97666e5",
    "imgSubtract6": "https://www.figma.com/api/mcp/asset/bab02530-3951-49c6-9e6b-67deb6a4fb21",
    "imgImage34": "https://www.figma.com/api/mcp/asset/0c52af7a-7de7-465a-846b-0bf687de8d7e",
    "imgImage61": "https://www.figma.com/api/mcp/asset/f706a283-7736-49f0-892f-2d6f1ce6fcfb",
    "imgImage38": "https://www.figma.com/api/mcp/asset/9b9a674e-e612-4a79-8ccf-62ccb6d49d3c",
    "imgImage63": "https://www.figma.com/api/mcp/asset/d8e8fcd5-38a0-4b5a-aa32-be2e61e85dc7",
    "imgImage4": "https://www.figma.com/api/mcp/asset/109d90dc-5ca6-4bfa-9f62-cdc30336c1fa",
    "imgSubtract7": "https://www.figma.com/api/mcp/asset/a31b1980-092f-41da-9b97-ec64dc897a07",
    "imgImage44": "https://www.figma.com/api/mcp/asset/eddde0de-f3d0-4c42-9db9-30c8d2850872",
    "imgImage25": "https://www.figma.com/api/mcp/asset/ed838c21-cd24-456f-84b0-b9503a2f2e7d",
    "imgImage30": "https://www.figma.com/api/mcp/asset/ec28208b-5dd8-43e0-b2ce-55a4546edef9",
    "imgImage31": "https://www.figma.com/api/mcp/asset/43fcc191-5953-462d-a4db-6cc86758b8ed",
    "imgImage45": "https://www.figma.com/api/mcp/asset/b0f16903-b133-4c31-809b-d8c19ca2c0cf",
    "imgImage29": "https://www.figma.com/api/mcp/asset/297d8e12-7595-40c2-a460-4611b8e4513b",
    "imgImage28": "https://www.figma.com/api/mcp/asset/743f6a2d-b888-4719-82a2-5c6089fc1ef8",
    "imgImage6": "https://www.figma.com/api/mcp/asset/a5ee8b20-9718-49ee-b91d-a7ca0ea42ece",
    "imgImage26": "https://www.figma.com/api/mcp/asset/01619d7d-6257-4b22-9271-09ff16762dd5",
    "imgSubtract8": "https://www.figma.com/api/mcp/asset/83b4b404-555b-48ae-a8cf-ffc0e7b627cd",
    "imgImage24": "https://www.figma.com/api/mcp/asset/5a193483-6c7f-4bce-a90f-1e42f2ce8a33",
    "imgImage18": "https://www.figma.com/api/mcp/asset/78a308e5-c59e-4a9d-9ba4-1777d4da186e",
    "imgImage71": "https://www.figma.com/api/mcp/asset/4c766f36-4186-4de1-841d-1a6b1415b6a5",
    "imgImage16": "https://www.figma.com/api/mcp/asset/6c0fc10c-2d50-4a02-8611-fcc785ffaa0a",
    "imgImage13": "https://www.figma.com/api/mcp/asset/30907560-ef5e-48b9-9822-4033b667f46c",
    "imgImage66": "https://www.figma.com/api/mcp/asset/5d4bad4d-8db0-4cb4-8aff-7069c6ea3bdf",
    "imgImage15": "https://www.figma.com/api/mcp/asset/cdcbe309-c674-4088-972a-0dd0d81af543",
    "imgImage14": "https://www.figma.com/api/mcp/asset/80f60d96-75fc-4305-aa11-c268927f44e7",
    "imgImage74": "https://www.figma.com/api/mcp/asset/007dbc8a-f888-444d-aa8e-5363718662ac",
    "imgImage65": "https://www.figma.com/api/mcp/asset/7369d8f1-62ac-4aa3-b5bb-df460c91e089",
    "imgImage21": "https://www.figma.com/api/mcp/asset/daf8c197-bd2d-4f5a-b733-b4736eb40a79",
    "imgImage76": "https://www.figma.com/api/mcp/asset/c3f1845a-2ab9-4a86-9402-5a67ca4563f8",
    "imgImage5": "https://www.figma.com/api/mcp/asset/5c22c89a-9a72-4ff4-ae8e-99618f2b2354",
    "imgUnion": "https://www.figma.com/api/mcp/asset/1dab8668-c7cf-4485-99ed-2fcddd3b67de",
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
        # SVG files are XML text — `file` often reports "XML 1.0 document text" or "ASCII text"
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
