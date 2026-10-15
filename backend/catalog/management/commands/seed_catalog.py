import os
import shutil
import urllib.request
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files import File
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from catalog.abshar_products import ABSHAR_DESCRIPTION, ABSHAR_PRODUCTS
from catalog.models import Category, Product, ProductImage

# These records match the collection images in /public/product.
# Each collection is a Category. Clicking it lists Products.
# For the first catalog, each product reuses that category image.

SEED_CATEGORIES = [
    {
        "name": "Abshar",
        "group": Category.GROUP_AREA,
        "file": "Abshar.jpeg",
        "featured": True,
        "material": "Hand-knotted wool",
        "shape": "Rectangular",
        "description": "A richly ornamented tribal line with deep reds, ivory grounds, and medallion work typical of classic Abshar weaving.",
    },
    {
        "name": "Aslan",
        "group": Category.GROUP_AREA,
        "file": "Aslan.jpeg",
        "featured": True,
        "material": "Hand-knotted wool",
        "shape": "Rectangular",
        "description": "Heritage Home Decore's Aslan collection: balanced medallions, navy and ivory fields, and a refined traditional border.",
    },
    {
        "name": "Fine Mughal",
        "group": Category.GROUP_AREA,
        "file": "Fine_Mughal.jpg",
        "featured": True,
        "material": "Wool & silk highlights",
        "shape": "Rectangular",
        "description": "Courtly floral drawing inspired by Mughal gardens — dense vine work, ivory grounds, and jewel-toned palettes.",
    },
    {
        "name": "Gaba",
        "group": Category.GROUP_AREA,
        "file": "Gaba.jpg",
        "featured": False,
        "material": "Hand-knotted wool",
        "shape": "Rectangular",
        "description": "Playful Gaba motifs with animal and village scenes, woven in saturated vegetable-dyed colors.",
    },
    {
        "name": "Haris",
        "group": Category.GROUP_AREA,
        "file": "Haris.webp",
        "featured": True,
        "material": "Hand-knotted wool",
        "shape": "Rectangular",
        "description": "Fine Haris pieces with layered floral lattices and a quietly luxurious antique wash.",
    },
    {
        "name": "Karabagh",
        "group": Category.GROUP_AREA,
        "file": "Karabagh.jpg",
        "featured": False,
        "material": "Hand-knotted wool",
        "shape": "Rectangular",
        "description": "Caucasian Karabagh character — bold geometry, herbal dyes, and a collector's sense of scale.",
    },
    {
        "name": "Khorgin",
        "group": Category.GROUP_AREA,
        "file": "Khorgin.jpg",
        "featured": False,
        "material": "Hand-knotted wool",
        "shape": "Rectangular",
        "description": "Khorgin weaves with compact tribal repeats, suitable for both contemporary and classical interiors.",
    },
    {
        "name": "Super Kazak",
        "group": Category.GROUP_AREA,
        "file": "Super_Kazak.jpg",
        "featured": True,
        "material": "Hand-knotted wool",
        "shape": "Rectangular",
        "description": "High-grade Super Kazak rugs with crisp geometric shields, ivory grounds, and saturated madder reds.",
    },
    {
        "name": "Mughal Collection",
        "group": Category.GROUP_AREA,
        "file": "Mughal Collection.jpg",
        "featured": False,
        "material": "Wool & bamboo silk",
        "shape": "Rectangular",
        "description": "A curated Mughal group for interiors that need botanical drawing without losing handmade character.",
    },
    {
        "name": "Gazani Production",
        "group": Category.GROUP_AREA,
        "file": "Gazani_Production.jpg",
        "featured": False,
        "material": "Hand-knotted wool",
        "shape": "Rectangular",
        "description": "Gazani Production area rugs with a vintage wash and painterly, time-softened color.",
    },
    {
        "name": "Abshar Runner",
        "group": Category.GROUP_RUNNERS,
        "file": "Abshar_Runner.jpg",
        "featured": True,
        "material": "Hand-knotted wool",
        "shape": "Runner",
        "description": "Gallery-length Abshar runners for halls and corridors, keeping the same tribal drawing as the area rugs.",
    },
    {
        "name": "Aslan Runners",
        "group": Category.GROUP_RUNNERS,
        "file": "Aslan_Runners.jpg",
        "featured": False,
        "material": "Hand-knotted wool",
        "shape": "Runner",
        "description": "Narrow Aslan formats for entries, kitchens, and long galleries.",
    },
    {
        "name": "Gazani Production Round",
        "group": Category.GROUP_RUNNERS,
        "file": "Gazani_Production_Round.jpg",
        "featured": False,
        "material": "Hand-knotted wool",
        "shape": "Round",
        "description": "Circular Gazani pieces for dining rooms and seating groups that need a softer footprint.",
    },
    {
        "name": "Gazani Production Runner",
        "group": Category.GROUP_RUNNERS,
        "file": "Gazani_Production_Runner.jpg",
        "featured": False,
        "material": "Hand-knotted wool",
        "shape": "Runner",
        "description": "Gazani runners with an antique wash, made for circulation spaces.",
    },
    {
        "name": "Kilim Runner",
        "group": Category.GROUP_RUNNERS,
        "file": "Kilim_Runner.jpg",
        "featured": False,
        "material": "Flatweave wool",
        "shape": "Runner",
        "description": "Lightweight kilim runners with graphic, flatwoven color blocking.",
    },
    {
        "name": "Khorgin Runner",
        "group": Category.GROUP_RUNNERS,
        "file": "Khorgin_Runner.webp",
        "featured": False,
        "material": "Hand-knotted wool",
        "shape": "Runner",
        "description": "Khorgin runners that carry the collection's tribal rhythm into hallways.",
    },
    {
        "name": "New Arrivals",
        "group": Category.GROUP_CURATED,
        "file": "New_Arrivals.webp",
        "featured": True,
        "material": "Hand-knotted wool",
        "shape": "Rectangular",
        "description": "Recently finished pieces from the Lahore ateliers — available while the current production lot lasts.",
    },
    {
        "name": "Overdyed",
        "group": Category.GROUP_CURATED,
        "file": "Overdyed.jpg",
        "featured": False,
        "material": "Hand-knotted wool",
        "shape": "Rectangular",
        "description": "Overdyed carpets with a contemporary color veil over traditional drawing.",
    },
]


class Command(BaseCommand):
    help = "Seed categories and products from the public/product collection images."

    def handle(self, *args, **options):
        source_dir = settings.BASE_DIR.parent / "frontend" / "public" / "product"
        if not source_dir.exists():
            self.stderr.write(f"Missing source images at {source_dir}")
            return

        media_categories = Path(settings.MEDIA_ROOT) / "categories"
        media_products = Path(settings.MEDIA_ROOT) / "products"
        media_categories.mkdir(parents=True, exist_ok=True)
        media_products.mkdir(parents=True, exist_ok=True)

        created_categories = 0
        created_products = 0

        for index, item in enumerate(SEED_CATEGORIES):
            source = source_dir / item["file"]
            if not source.exists():
                self.stderr.write(f"Skip missing file: {item['file']}")
                continue

            slug = slugify(item["name"])
            category, was_created = Category.objects.update_or_create(
                slug=slug,
                defaults={
                    "name": item["name"],
                    "description": item["description"],
                    "group": item["group"],
                    "is_active": True,
                    "sort_order": index,
                },
            )
            if not category.image:
                with source.open("rb") as handle:
                    category.image.save(
                        source.name.replace(" ", "_"), File(handle), save=True
                    )
            if was_created:
                created_categories += 1

            # Abshar has a real multi-product catalog imported separately.
            if slug == "abshar":
                continue

            product_slug = slug
            product, product_created = Product.objects.update_or_create(
                slug=product_slug,
                defaults={
                    "category": category,
                    "name": item["name"],
                    "description": item["description"],
                    "price": 0,
                    "show_price": False,
                    "material": item["material"],
                    "dimensions": "Custom sizes available",
                    "shape": item["shape"],
                    "is_featured": item["featured"],
                    "is_active": True,
                    "sort_order": 0,
                },
            )
            if product_created:
                created_products += 1

            dest_name = f"{product_slug}{source.suffix.lower()}"
            dest_path = media_products / dest_name
            shutil.copyfile(source, dest_path)
            if not product.images.exists():
                relative = f"products/{dest_name}"
                ProductImage.objects.create(
                    product=product,
                    image=relative,
                    alt_text=item["name"],
                    sort_order=0,
                )

        created_products += self._seed_abshar_products(media_products)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete. Categories created: {created_categories}. "
                f"Products created: {created_products}."
            )
        )
        self._ensure_admin()
        self._ensure_customer()

    def _download(self, url, dest: Path):
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists() and dest.stat().st_size > 2000:
            return dest
        request = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; RehmanEnterprisesSeed/1.0)"},
        )
        with urllib.request.urlopen(request, timeout=90) as response, dest.open("wb") as handle:
            handle.write(response.read())
        return dest

    def _seed_abshar_products(self, media_products: Path):
        category = Category.objects.filter(slug="abshar").first()
        if not category:
            self.stderr.write("Abshar category missing; skip product import.")
            return 0

        source_dir = settings.BASE_DIR.parent / "frontend" / "public" / "product" / "abshar"
        source_dir.mkdir(parents=True, exist_ok=True)
        created = 0

        for index, item in enumerate(ABSHAR_PRODUCTS):
            filename = f"{item['slug']}.jpg"
            local_source = source_dir / filename
            try:
                self._download(item["image"], local_source)
            except Exception as exc:
                self.stderr.write(f"Could not download {item['slug']}: {exc}")
                continue

            dest_path = media_products / filename
            shutil.copyfile(local_source, dest_path)

            product, was_created = Product.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "category": category,
                    "name": "Abshar",
                    "description": ABSHAR_DESCRIPTION,
                    "price": 0,
                    "show_price": True,
                    "material": "Hand-knotted wool",
                    "dimensions": item["dimensions"],
                    "shape": item["shape"],
                    "sku": item["sku"],
                    "is_featured": item["featured"],
                    "is_active": True,
                    "sort_order": index,
                },
            )
            if was_created:
                created += 1

            relative = f"products/{filename}"
            if product.slug == "abshar":
                product.images.all().delete()
            if not product.images.exists():
                ProductImage.objects.create(
                    product=product,
                    image=relative,
                    alt_text=f"Abshar {item['sku']}",
                    sort_order=0,
                )

        self.stdout.write(self.style.SUCCESS(f"Abshar rugs imported: {len(ABSHAR_PRODUCTS)}."))
        return created

    def _ensure_admin(self):
        email = os.getenv("ADMIN_EMAIL", "").strip().lower()
        password = os.getenv("ADMIN_PASSWORD", "")
        if not email or not password:
            return
        User = get_user_model()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"is_staff": True, "is_superuser": True, "is_active": True},
        )
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()
        action = "created" if created else "updated"
        self.stdout.write(self.style.SUCCESS(f"Admin user {action}: {email}"))

    def _ensure_customer(self):
        email = os.getenv("USER_EMAIL", "user@gmail.com").strip().lower()
        password = os.getenv("USER_PASSWORD", "1234567")
        if not email or not password:
            return
        User = get_user_model()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": "User",
                "is_staff": False,
                "is_superuser": False,
                "is_active": True,
            },
        )
        if user.is_staff:
            return
        user.is_active = True
        user.set_password(password)
        user.save()
        action = "created" if created else "updated"
        self.stdout.write(self.style.SUCCESS(f"Customer user {action}: {email}"))
