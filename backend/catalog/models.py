from django.db import models
from django.utils.text import slugify


def unique_slug(model, seed, instance=None, max_length=180):
    base = slugify(seed) or "item"
    base = base[:max(1, max_length - 8)]
    slug = base[:max_length]
    counter = 2
    queryset = model.objects.all()
    if instance is not None and instance.pk:
        queryset = queryset.exclude(pk=instance.pk)
    while queryset.filter(slug=slug).exists():
        suffix = f"-{counter}"
        slug = f"{base[: max_length - len(suffix)]}{suffix}"
        counter += 1
    return slug


class Category(models.Model):
    GROUP_AREA = "Area Rugs"
    GROUP_RUNNERS = "Runners & Shapes"
    GROUP_CURATED = "Curated Lines"
    GROUP_CHOICES = [
        (GROUP_AREA, GROUP_AREA),
        (GROUP_RUNNERS, GROUP_RUNNERS),
        (GROUP_CURATED, GROUP_CURATED),
    ]

    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    group = models.CharField(max_length=40, choices=GROUP_CHOICES, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(Category, self.name, self, 180)
        super().save(*args, **kwargs)


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        related_name="products",
        on_delete=models.PROTECT,
    )
    name = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    show_price = models.BooleanField(default=False)
    material = models.CharField(max_length=160, blank=True)
    dimensions = models.CharField(max_length=120, blank=True)
    shape = models.CharField(max_length=80, blank=True)
    sku = models.CharField(max_length=80, blank=True)
    stock = models.PositiveIntegerField(default=1)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name", "id"]

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock > 0

    def save(self, *args, **kwargs):
        if not self.slug:
            seed = f"{self.name}-{self.sku}" if self.sku else self.name
            self.slug = unique_slug(Product, seed, self, 200)
        super().save(*args, **kwargs)


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        related_name="images",
        on_delete=models.CASCADE,
    )
    image = models.ImageField(upload_to="products/")
    alt_text = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.product.name} image {self.sort_order}"


class WishlistItem(models.Model):
    user = models.ForeignKey(
        "accounts.User",
        related_name="wishlist_items",
        on_delete=models.CASCADE,
    )
    product = models.ForeignKey(
        Product,
        related_name="wishlisted_by",
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "product"], name="unique_user_wishlist_product")
        ]

    def __str__(self):
        return f"{self.user.email} ♥ {self.product.name}"


class CartItem(models.Model):
    user = models.ForeignKey(
        "accounts.User",
        related_name="cart_items",
        on_delete=models.CASCADE,
    )
    product = models.ForeignKey(
        Product,
        related_name="in_carts",
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "product"], name="unique_user_cart_product")
        ]

    def __str__(self):
        return f"{self.user.email} bag {self.product.name}"
