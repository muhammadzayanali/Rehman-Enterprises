from django.contrib import admin

from .models import Inquiry


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "product", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("name", "email", "message")
    readonly_fields = ("name", "email", "message", "product", "created_at", "updated_at")
