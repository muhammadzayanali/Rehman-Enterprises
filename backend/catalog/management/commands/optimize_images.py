from django.core.management.base import BaseCommand

from catalog.images import DETAIL_WIDTH, LIST_WIDTH, ensure_webp_thumb
from catalog.models import Category, ProductImage


class Command(BaseCommand):
    help = "Create compressed WebP thumbnails for faster product and category loading."

    def handle(self, *args, **options):
        created = 0
        for category in Category.objects.exclude(image=""):
            if category.image:
                ensure_webp_thumb(category.image, LIST_WIDTH)
                ensure_webp_thumb(category.image, DETAIL_WIDTH)
                created += 1
        for image in ProductImage.objects.all():
            if image.image:
                ensure_webp_thumb(image.image, LIST_WIDTH)
                ensure_webp_thumb(image.image, DETAIL_WIDTH)
                created += 1
        self.stdout.write(self.style.SUCCESS(f"Optimized {created} catalog images."))
