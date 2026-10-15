import os
import uuid
from pathlib import Path

import cloudinary
import cloudinary.uploader
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


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

    def _save(self, name, content):
        configure_cloudinary()
        if hasattr(content, "seek"):
            content.seek(0)
        public_id = f"rehman-enterprises/{Path(name).stem[:80]}-{uuid.uuid4().hex[:8]}"
        result = cloudinary.uploader.upload(
            content,
            public_id=public_id,
            resource_type="image",
            overwrite=False,
        )
        return result["public_id"]

    def url(self, name):
        if not name:
            return ""
        if str(name).startswith("http"):
            return str(name)
        configure_cloudinary()
        return cloudinary.CloudinaryImage(name).build_url(secure=True)

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
