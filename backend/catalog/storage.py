import io
import logging
import os
import uuid
import urllib.request
from pathlib import Path

import cloudinary
import cloudinary.uploader
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible

from .straighten import straighten_image_bytes

logger = logging.getLogger(__name__)


def cloudinary_enabled():
    return bool(
        os.getenv("CLOUDINARY_CLOUD_NAME")
        and os.getenv("CLOUDINARY_API_KEY")
        and os.getenv("CLOUDINARY_API_SECRET")
    )


def configure_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )


@deconstructible
class CloudinaryMediaStorage(Storage):
    """Store ImageField uploads on Cloudinary so Render's disk cannot wipe them."""

    def __init__(self, **kwargs):
        configure_cloudinary()

    def _read_all(self, content) -> bytes:
        if hasattr(content, "open"):
            try:
                content.open("rb")
            except Exception:
                pass
        if hasattr(content, "seek"):
            try:
                content.seek(0)
            except Exception:
                pass
        data = content.read()
        if isinstance(data, str):
            data = data.encode()
        return data or b""

    def _save(self, name, content):
        configure_cloudinary()
        raw = self._read_all(content)
        filename = Path(str(name)).name or "rug.jpg"
        try:
            fixed, _content_type = straighten_image_bytes(raw, filename)
        except Exception:
            logger.exception("Could not straighten %s before upload", filename)
            fixed = raw
        if not fixed:
            fixed = raw
        # Upload the straightened bytes. A Django upload's filename can be a
        # temp path; Cloudinary would otherwise store that original file.
        public_id = f"rehman-enterprises/{Path(filename).stem[:80]}-{uuid.uuid4().hex[:8]}"
        result = cloudinary.uploader.upload(
            io.BytesIO(fixed),
            public_id=public_id,
            resource_type="image",
            overwrite=False,
            filename="rug.jpg",
        )
        return result["public_id"]

    def url(self, name):
        if not name:
            return ""
        if str(name).startswith("http"):
            return str(name)
        configure_cloudinary()
        return cloudinary.CloudinaryImage(name).build_url(secure=True)

    def _open(self, name, mode="rb"):
        url = self.url(name)
        if not url:
            raise FileNotFoundError(name)
        with urllib.request.urlopen(url, timeout=60) as response:
            return ContentFile(response.read(), name=Path(str(name)).name)

    def exists(self, name):
        return False

    def delete(self, name):
        if not name or str(name).startswith("http"):
            return
        configure_cloudinary()
        cloudinary.uploader.destroy(name)

    def size(self, name):
        return 0

    def path(self, name):
        raise NotImplementedError("Cloudinary storage has no local filesystem path.")
