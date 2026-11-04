from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from catalog.models import Category, ProductImage
from catalog.straighten import straighten_image_bytes


class Command(BaseCommand):
    help = "Re-upload catalog images after straightening tilted rug photos."

    def handle(self, *args, **options):
        fixed = 0

        for category in Category.objects.exclude(image=""):
            if self._fix_field(category, "image", f"category-{category.slug}"):
                fixed += 1

        for item in ProductImage.objects.select_related("product").all():
            if self._fix_field(item, "image", f"product-{item.product_id}-{item.id}"):
                fixed += 1

        self.stdout.write(self.style.SUCCESS(f"Straightened and re-saved {fixed} images."))

    def _fix_field(self, obj, field_name, label):
        field = getattr(obj, field_name)
        if not field:
            return False
        try:
            raw = field.open("rb").read()
            data, _ = straighten_image_bytes(raw, f"{label}.jpg")
            # Saving through the field runs Cloudinary storage (which straightens again safely).
            field.save(f"{label}.jpg", ContentFile(data), save=True)
            self.stdout.write(f"Fixed {label}")
            return True
        except Exception as exc:
            self.stderr.write(f"Skipped {label}: {exc}")
            return False
