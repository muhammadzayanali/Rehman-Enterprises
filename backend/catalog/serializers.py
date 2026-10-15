from rest_framework import serializers

from .images import DETAIL_WIDTH, LIST_WIDTH, optimized_url
from .models import Category, Product, ProductImage, unique_slug


def absolute_url(request, file_field, max_width=LIST_WIDTH):
    return optimized_url(request, file_field, max_width=max_width)


class CategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    product_count = serializers.IntegerField(read_only=True)
    stock_count = serializers.IntegerField(read_only=True)
    product = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "image",
            "image_url",
            "group",
            "is_active",
            "sort_order",
            "product_count",
            "stock_count",
            "product",
            "created_at",
            "updated_at",
        )
        extra_kwargs = {
            "image": {"write_only": True, "required": False},
            "slug": {"required": False, "allow_blank": True},
        }
        read_only_fields = ("id", "created_at", "updated_at", "product_count", "stock_count", "product")

    def get_image_url(self, obj):
        return absolute_url(self.context.get("request"), obj.image)

    def get_product(self, obj):
        product = next((item for item in obj.products.all() if item.is_active), None)
        if product is None:
            product = obj.products.filter(is_active=True).first()
        if product is None:
            return None
        first_image = product.images.first() if hasattr(product, "images") else None
        image = first_image.image if first_image else obj.image
        return {
            "id": product.id,
            "slug": product.slug,
            "name": product.name,
            "stock": product.stock,
            "in_stock": product.stock > 0,
            "image_url": absolute_url(self.context.get("request"), image, LIST_WIDTH),
            "category": {"id": obj.id, "name": obj.name, "slug": obj.slug},
        }

    def validate_slug(self, value):
        if not value:
            return value
        queryset = Category.objects.filter(slug=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A category with this slug already exists.")
        return value

    def validate(self, attrs):
        if not attrs.get("slug"):
            name = attrs.get("name") or getattr(self.instance, "name", "")
            attrs["slug"] = unique_slug(Category, name, self.instance, 180)
        return attrs

    def create(self, validated_data):
        if not validated_data.get("slug"):
            validated_data["slug"] = unique_slug(
                Category, validated_data.get("name", ""), None, 180
            )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if not validated_data.get("slug"):
            name = validated_data.get("name", instance.name)
            if "name" in validated_data and instance.name != name:
                validated_data["slug"] = unique_slug(Category, name, instance, 180)
        return super().update(instance, validated_data)


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ("id", "image", "image_url", "alt_text", "sort_order", "created_at")
        extra_kwargs = {"image": {"write_only": True, "required": False}}
        read_only_fields = ("id", "created_at")

    def get_image_url(self, obj):
        return absolute_url(self.context.get("request"), obj.image, DETAIL_WIDTH)


class ProductListSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source="category",
        queryset=Category.objects.all(),
        write_only=True,
    )

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "price",
            "show_price",
            "material",
            "dimensions",
            "shape",
            "sku",
            "stock",
            "in_stock",
            "is_featured",
            "is_active",
            "image_url",
            "category",
            "category_id",
            "created_at",
            "updated_at",
        )
        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True},
        }
        read_only_fields = ("id", "created_at", "updated_at", "image_url", "category", "in_stock")

    def get_in_stock(self, obj):
        return (obj.stock or 0) > 0

    def get_image_url(self, obj):
        first = obj.images.first()
        if first:
            return absolute_url(self.context.get("request"), first.image, LIST_WIDTH)
        if obj.category and obj.category.image:
            return absolute_url(self.context.get("request"), obj.category.image, LIST_WIDTH)
        return None


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    related_products = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ("images", "related_products")

    def get_image_url(self, obj):
        first = obj.images.first()
        if first:
            return absolute_url(self.context.get("request"), first.image, DETAIL_WIDTH)
        if obj.category and obj.category.image:
            return absolute_url(self.context.get("request"), obj.category.image, DETAIL_WIDTH)
        return None

    def get_related_products(self, obj):
        related = (
            Product.objects.filter(category=obj.category, is_active=True)
            .exclude(pk=obj.pk)
            .prefetch_related("images")[:8]
        )
        return ProductListSerializer(related, many=True, context=self.context).data

    def validate_slug(self, value):
        if not value:
            return value
        queryset = Product.objects.filter(slug=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A product with this slug already exists.")
        return value

    def validate(self, attrs):
        if not attrs.get("slug"):
            name = attrs.get("name") or getattr(self.instance, "name", "")
            sku = attrs.get("sku")
            if sku is None:
                sku = getattr(self.instance, "sku", "") or ""
            seed = f"{name}-{sku}" if sku else name
            attrs["slug"] = unique_slug(Product, seed, self.instance, 200)
        return attrs

    def create(self, validated_data):
        if not validated_data.get("slug"):
            name = validated_data.get("name", "")
            sku = validated_data.get("sku") or ""
            seed = f"{name}-{sku}" if sku else name
            validated_data["slug"] = unique_slug(Product, seed, None, 200)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if not validated_data.get("slug"):
            name = validated_data.get("name", instance.name)
            sku = validated_data.get("sku", instance.sku)
            if instance.name != name or instance.sku != sku:
                seed = f"{name}-{sku}" if sku else name
                validated_data["slug"] = unique_slug(Product, seed, instance, 200)
        return super().update(instance, validated_data)


class SavedItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(write_only=True)

    def validate_product_id(self, value):
        product = Product.objects.filter(pk=value, is_active=True).first()
        if not product:
            raise serializers.ValidationError("This product is not available.")
        return value


class CartItemSerializer(SavedItemSerializer):
    def validate_product_id(self, value):
        product_id = super().validate_product_id(value)
        product = Product.objects.filter(pk=product_id, is_active=True).first()
        if not product or (product.stock or 0) <= 0:
            raise serializers.ValidationError("This rug is out of stock.")
        return product_id
