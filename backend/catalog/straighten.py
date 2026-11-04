"""Straighten tilted rug photos into a flat top-down rectangle."""

from __future__ import annotations

import io
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from django.core.files.base import ContentFile
from PIL import Image, ImageOps


# Studio pad / warp fill — keep pure white so letterbox matches the site cards
WHITE = (255, 255, 255)


def _order_points(pts: np.ndarray) -> np.ndarray:
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect


def _quad_size(rect: np.ndarray) -> tuple[int, int]:
    (tl, tr, br, bl) = rect
    width_a = np.linalg.norm(br - bl)
    width_b = np.linalg.norm(tr - tl)
    height_a = np.linalg.norm(tr - br)
    height_b = np.linalg.norm(tl - bl)
    max_w = max(int(width_a), int(width_b))
    max_h = max(int(height_a), int(height_b))
    return max(max_w, 1), max(max_h, 1)


def _find_rug_quad(bgr: np.ndarray) -> Optional[np.ndarray]:
    h, w = bgr.shape[:2]
    scale = 900 / max(h, w)
    if scale < 1:
        small = cv2.resize(bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    else:
        small = bgr
        scale = 1.0

    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
    # Treat near-white / near-gray studio backdrop as background.
    lower = np.array([0, 0, 185], dtype=np.uint8)
    upper = np.array([180, 45, 255], dtype=np.uint8)
    white = cv2.inRange(hsv, lower, upper)
    mask = cv2.bitwise_not(white)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8), iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8), iterations=1)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None

    contour = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(contour)
    frame_area = small.shape[0] * small.shape[1]
    if area < frame_area * 0.08:
        return None

    peri = cv2.arcLength(contour, True)
    if peri > 0:
        circularity = 4 * np.pi * area / (peri * peri)
        # A round rug should stay round. Do not pull it into a rectangle.
        if circularity > 0.82:
            return None
    approx = cv2.approxPolyDP(contour, 0.02 * peri, True)
    if len(approx) == 4:
        pts = approx.reshape(4, 2).astype("float32")
    else:
        rect = cv2.minAreaRect(contour)
        pts = cv2.boxPoints(rect).astype("float32")

    # Reject nearly-axis-aligned "already straight" photos with tiny tilt.
    ordered = _order_points(pts)
    width, height = _quad_size(ordered)
    if width < 40 or height < 40:
        return None

    # Scale points back to original resolution.
    if scale != 1.0:
        ordered = ordered / scale
    return ordered.astype("float32")


def _needs_warp(rect: np.ndarray, image_w: int, image_h: int) -> bool:
    """Skip warp when the photo is already basically a straight rectangle."""
    (tl, tr, br, bl) = rect
    top = np.linalg.norm(tr - tl)
    bottom = np.linalg.norm(br - bl)
    left = np.linalg.norm(bl - tl)
    right = np.linalg.norm(br - tr)
    if min(top, bottom, left, right) <= 0:
        return False
    width_skew = abs(top - bottom) / max(top, bottom)
    height_skew = abs(left - right) / max(left, right)
    # Also check corner angles vs image edges.
    edge_margin = 0.04
    near_border = (
        tl[0] < image_w * edge_margin
        and tl[1] < image_h * edge_margin
        and tr[0] > image_w * (1 - edge_margin)
        and tr[1] < image_h * edge_margin
    )
    if width_skew < 0.04 and height_skew < 0.04 and near_border:
        return False
    # In-plane rotation: opposite sides match, but the rug is not upright.
    angle = abs(float(np.degrees(np.arctan2(tr[1] - tl[1], tr[0] - tl[0])))) % 180
    if 3 < angle < 177:
        return True
    return width_skew > 0.035 or height_skew > 0.035


def _outset_quad(rect: np.ndarray, amount: float = 0.02) -> np.ndarray:
    """Grow the detected rug slightly so the outer border is not clipped."""
    center = rect.mean(axis=0)
    return (center + (rect - center) * (1 + amount)).astype("float32")


def _line_intersection(a, b, c, d):
    def line(p, q):
        return np.cross(np.append(p, 1.0), np.append(q, 1.0))

    point = np.cross(line(a, b), line(c, d))
    if abs(point[2]) < 1e-6:
        return None
    return point[:2] / point[2]


def _destination_size(quad: np.ndarray, image_w: int, image_h: int) -> tuple[int, int]:
    """Pixel size of the straightened rug, keeping its real rectangle.

    A flat or rotated photo uses the measured edges. A foreshortened
    trapezoid is opened up with a normal product-photo focal length so a
    5x8 rug does not collapse into a square.
    """
    tl, tr, br, bl = quad
    pixel_w, pixel_h = _quad_size(quad)
    vp_w = _line_intersection(tl, tr, bl, br)
    vp_h = _line_intersection(tl, bl, tr, br)
    cx, cy = image_w / 2.0, image_h / 2.0
    # ~40mm-equivalent product shot. Only used when one vanishing point is
    # at infinity (the usual head-on rug photo).
    focal = 1.2 * max(image_w, image_h)
    if vp_w is not None and vp_h is not None:
        dot = float(np.dot(vp_w - np.array([cx, cy]), vp_h - np.array([cx, cy])))
        if dot < -1:
            focal = float(np.sqrt(-dot))

    def axis_dir(vp, start, end):
        if vp is None:
            direction = np.array([end[0] - start[0], end[1] - start[1], 0.0], dtype=float)
            norm = np.linalg.norm(direction)
            return direction / norm if norm else np.array([1.0, 0.0, 0.0])
        direction = np.array([vp[0] - cx, vp[1] - cy, focal], dtype=float)
        return direction / np.linalg.norm(direction)

    normal = np.cross(axis_dir(vp_w, tl, tr), axis_dir(vp_h, tl, bl))
    norm = np.linalg.norm(normal)
    if norm < 1e-8:
        return pixel_w, pixel_h
    normal = normal / norm

    def hit(point):
        ray = np.array([point[0] - cx, point[1] - cy, focal], dtype=float)
        denom = float(np.dot(normal, ray))
        if abs(denom) < 1e-8:
            return None
        return ray / denom

    corners = [hit(point) for point in (tl, tr, br, bl)]
    if any(corner is None for corner in corners):
        return pixel_w, pixel_h
    top_left, top_right, bottom_right, bottom_left = corners
    width = (np.linalg.norm(top_right - top_left) + np.linalg.norm(bottom_right - bottom_left)) / 2
    height = (np.linalg.norm(bottom_left - top_left) + np.linalg.norm(bottom_right - top_right)) / 2
    if width < 1e-8 or height < 1e-8:
        return pixel_w, pixel_h
    ratio = height / width
    if ratio < 0.35 or ratio > 3.2:
        return pixel_w, pixel_h
    long_edge = max(pixel_w, pixel_h)
    if ratio >= 1:
        dest_h = long_edge
        dest_w = max(int(round(dest_h / ratio)), 1)
    else:
        dest_w = long_edge
        dest_h = max(int(round(dest_w * ratio)), 1)
    return dest_w, dest_h


def _add_white_margin(rgb: np.ndarray, margin: float = 0.04) -> np.ndarray:
    """Keep the full border visible without changing the rug's aspect ratio."""
    h, w = rgb.shape[:2]
    top = max(int(round(h * margin)), 1)
    side = max(int(round(w * margin)), 1)
    return cv2.copyMakeBorder(rgb, top, top, side, side, cv2.BORDER_CONSTANT, value=list(WHITE))


def straighten_rug_bgr(bgr: np.ndarray) -> np.ndarray:
    quad = _find_rug_quad(bgr)
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    # Already straight, rectangular, or round: leave the photo unchanged.
    if quad is None:
        return rgb

    h, w = bgr.shape[:2]
    if not _needs_warp(quad, w, h):
        return rgb

    quad = _outset_quad(quad, 0.015)
    dest_w, dest_h = _destination_size(quad, w, h)
    dst = np.array(
        [[0, 0], [dest_w - 1, 0], [dest_w - 1, dest_h - 1], [0, dest_h - 1]],
        dtype="float32",
    )
    matrix = cv2.getPerspectiveTransform(quad, dst)
    warped = cv2.warpPerspective(
        bgr,
        matrix,
        (dest_w, dest_h),
        flags=cv2.INTER_LANCZOS4,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=WHITE[::-1],  # BGR
    )
    rgb = cv2.cvtColor(warped, cv2.COLOR_BGR2RGB)
    return _add_white_margin(rgb)


def straighten_image_bytes(data: bytes, filename: str = "rug.jpg") -> tuple[bytes, str]:
    """Return straightened JPEG bytes. Falls back to EXIF-fixed original on failure."""
    try:
        arr = np.frombuffer(data, dtype=np.uint8)
        bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if bgr is None:
            raise ValueError("Could not decode image")

        # Honour camera orientation first.
        pil = Image.open(io.BytesIO(data))
        pil = ImageOps.exif_transpose(pil)
        if pil.mode != "RGB":
            pil = pil.convert("RGB")
        rgb = np.array(pil)
        bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)

        straightened = straighten_rug_bgr(bgr)
        out = Image.fromarray(straightened)
        # Cap very large uploads for storefront speed.
        out.thumbnail((1600, 2200), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        out.save(buf, format="JPEG", quality=90, optimize=True)
        return buf.getvalue(), "image/jpeg"
    except Exception:
        try:
            pil = Image.open(io.BytesIO(data))
            pil = ImageOps.exif_transpose(pil)
            if pil.mode != "RGB":
                pil = pil.convert("RGB")
            buf = io.BytesIO()
            pil.save(buf, format="JPEG", quality=90, optimize=True)
            return buf.getvalue(), "image/jpeg"
        except Exception:
            return data, "application/octet-stream"


def prepare_upload_file(uploaded_file):
    """Wrap an UploadedFile / file-like into a straightened ContentFile."""
    name = getattr(uploaded_file, "name", "rug.jpg") or "rug.jpg"
    if hasattr(uploaded_file, "open"):
        try:
            uploaded_file.open("rb")
        except Exception:
            pass
    if hasattr(uploaded_file, "seek"):
        try:
            uploaded_file.seek(0)
        except Exception:
            pass
    raw = uploaded_file.read()
    if hasattr(uploaded_file, "seek"):
        try:
            uploaded_file.seek(0)
        except Exception:
            pass
    fixed, content_type = straighten_image_bytes(raw, name)
    stem = Path(str(name)).name.rsplit(".", 1)[0] or "rug"
    content = ContentFile(fixed, name=f"{stem}.jpg")
    content.content_type = content_type
    return content
