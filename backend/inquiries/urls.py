from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminInquiryViewSet, PublicInquiryViewSet

public_router = DefaultRouter()
public_router.register("inquiries", PublicInquiryViewSet, basename="inquiry")

admin_router = DefaultRouter()
admin_router.register("inquiries", AdminInquiryViewSet, basename="admin-inquiry")

urlpatterns = [
    path("", include(public_router.urls)),
    path("admin/", include(admin_router.urls)),
]
