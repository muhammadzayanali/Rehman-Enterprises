from pathlib import Path

from django.conf import settings
from PIL import Image, ImageOps

LIST_WIDTH = 800
DETAIL_WIDTH = 1200


def media_url(request, relative):
    url = f"{settings.MEDIA_URL}{relative.as_posix().lstrip('/')}"
    if request:
        return request.build_absolute_uri(url)
    return url


def _cloudinary_resized(url, max_width, pad=True):
    marker = "/upload/"
    if marker not in url:
        return url
    prefix, rest = url.split(marker, 1)
    if rest.startswith("w_") or rest.startswith("c_"):
        return url
    # Shop grids share one frame. Detail photos stay at their real shape so
    # a wide rug is not letterboxed and then clipped.
    if pad:
        transform = f"w_{max_width},ar_3:4,c_pad,b_rgb:ffffff,f_auto,q_auto"
    else:
        transform = f"c_limit,w_{max_width},f_auto,q_auto"
    return f"{prefix}/upload/{transform}/{rest}"


def optimized_url(request, file_field, max_width=LIST_WIDTH, pad=True):
    if not file_field:
        return None
    try:
        url = file_field.url
    except Exception:
        return None
    if "res.cloudinary.com" in url:
        return _cloudinary_resized(url, max_width, pad=pad)
    try:
        relative = ensure_webp_thumb(file_field, max_width, pad=pad)
        if relative:
            return media_url(request, relative)
    except (Exception, NotImplementedError):
        pass
    if request and not url.startswith("http"):
        return request.build_absolute_uri(url)
    return url


def ensure_webp_thumb(file_field, max_width=LIST_WIDTH, pad=True):
    source = Path(file_field.path)
    if not source.exists():
        return None

    original_rel = Path(str(file_field.name))
    variant = "pad" if pad else "full"
    dest_rel = Path("cache") / f"w{max_width}" / variant / original_rel.with_suffix(".webp")
    dest = Path(settings.MEDIA_ROOT) / dest_rel
    dest.parent.mkdir(parents=True, exist_ok=True)

    if dest.exists() and dest.stat().st_mtime >= source.stat().st_mtime and dest.stat().st_size > 1000:
        return dest_rel

    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        image = image.convert("RGB")
        if pad:
            target_h = int(max_width * 4 / 3)
            image.thumbnail((max_width, target_h), Image.Resampling.LANCZOS)
            canvas = Image.new("RGB", (max_width, target_h), (255, 255, 255))
            offset = ((max_width - image.width) // 2, (target_h - image.height) // 2)
            canvas.paste(image, offset)
            canvas.save(dest, "WEBP", quality=76, method=4)
        else:
            image.thumbnail((max_width, max_width * 2), Image.Resampling.LANCZOS)
            image.save(dest, "WEBP", quality=82, method=4)

    return dest_rel
