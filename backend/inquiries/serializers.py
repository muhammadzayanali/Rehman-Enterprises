import re

from rest_framework import serializers

from catalog.models import Product
from catalog.serializers import ProductListSerializer
from .models import Inquiry


def normalize_phone(value):
    digits = re.sub(r"\D", "", value or "")
    if len(digits) < 10:
        raise serializers.ValidationError("Enter a valid WhatsApp number.")
    return value.strip()


class InquiryCreateSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        source="product",
        queryset=Product.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Inquiry
        fields = ("name", "email", "phone", "message", "product_id")

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Please enter your name.")
        return value

    def validate_phone(self, value):
        return normalize_phone(value)

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 8:
            raise serializers.ValidationError("Please enter a slightly longer message.")
        return value


class InquirySerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = Inquiry
        fields = (
            "id",
            "name",
            "email",
            "phone",
            "message",
            "product",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "name",
            "email",
            "message",
            "product",
            "created_at",
            "updated_at",
        )

    def validate_phone(self, value):
        if not value:
            return ""
        return normalize_phone(value)

    def validate_status(self, value):
        allowed = {Inquiry.STATUS_NEW, Inquiry.STATUS_CONTACTED, Inquiry.STATUS_CLOSED}
        if value not in allowed:
            raise serializers.ValidationError("Invalid status.")
        return value
