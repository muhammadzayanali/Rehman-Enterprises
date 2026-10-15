from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminCategoryViewSet,
    AdminProductImageViewSet,
    AdminProductViewSet,
    CartView,
    PublicCategoryViewSet,
    PublicProductViewSet,
    WishlistView,
)

public_router = DefaultRouter()
public_router.register("categories", PublicCategoryViewSet, basename="category")
public_router.register("products", PublicProductViewSet, basename="product")

admin_router = DefaultRouter()
admin_router.register("categories", AdminCategoryViewSet, basename="admin-category")
admin_router.register("products", AdminProductViewSet, basename="admin-product")

urlpatterns = [
    path("", include(public_router.urls)),
    path("admin/", include(admin_router.urls)),
    path(
        "admin/product-images/<int:pk>/",
        AdminProductImageViewSet.as_view({"delete": "destroy"}),
        name="admin-product-image-delete",
    ),
    path("wishlist/", WishlistView.as_view(), name="wishlist"),
    path("cart/", CartView.as_view(), name="cart"),
]
