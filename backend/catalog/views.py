from django.db.models import Count, Q, Sum
from django.db.models.functions import Coalesce
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CartItem, Category, Product, ProductImage, WishlistItem
from .permissions import IsStaffUser
from .search import CatalogTextSearchFilter
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductImageSerializer,
    ProductListSerializer,
    CartItemSerializer,
    SavedItemSerializer,
)


def active_product_count():
    return Count("products", filter=Q(products__is_active=True))


def category_stock_total():
    return Coalesce(Sum("products__stock", filter=Q(products__is_active=True)), 0)


class PublicCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = "slug"
    filter_backends = [CatalogTextSearchFilter, OrderingFilter]
    ordering_fields = ["sort_order", "name"]

    def get_queryset(self):
        return (
            Category.objects.filter(is_active=True)
            .annotate(product_count=active_product_count(), stock_count=category_stock_total())
            .prefetch_related("products__images")
            .order_by("sort_order", "name")
        )


class PublicProductViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend, CatalogTextSearchFilter, OrderingFilter]
    filterset_fields = []
    ordering_fields = ["name", "created_at", "price"]

    def get_queryset(self):
        queryset = (
            Product.objects.filter(is_active=True, category__is_active=True)
            .select_related("category")
            .prefetch_related("images")
        )
        category = self.request.query_params.get("category")
        featured = self.request.query_params.get("featured")
        if category:
            if str(category).isdigit():
                queryset = queryset.filter(
                    Q(category__slug=category) | Q(category__id=category)
                )
            else:
                queryset = queryset.filter(category__slug=category)
        if featured in {"true", "1", "yes"}:
            queryset = queryset.filter(is_featured=True)
        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def list(self, request, *args, **kwargs):
        limit = request.query_params.get("limit")
        queryset = self.filter_queryset(self.get_queryset())
        if limit:
            try:
                queryset = queryset[: max(1, min(int(limit), 24))]
            except ValueError:
                pass
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return super().list(request, *args, **kwargs)


class AdminCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [CatalogTextSearchFilter, OrderingFilter]
    ordering_fields = ["sort_order", "name", "created_at"]

    def get_queryset(self):
        return Category.objects.annotate(
            product_count=Count("products"),
            stock_count=Coalesce(Sum("products__stock"), 0),
        ).order_by("sort_order", "name")

    def perform_destroy(self, instance):
        instance.products.all().delete()
        instance.delete()


class AdminProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, CatalogTextSearchFilter, OrderingFilter]
    ordering_fields = ["name", "created_at", "price"]

    def get_queryset(self):
        queryset = Product.objects.select_related("category").prefetch_related("images")
        category = self.request.query_params.get("category")
        status_filter = self.request.query_params.get("status")
        featured = self.request.query_params.get("featured")
        if category:
            if str(category).isdigit():
                queryset = queryset.filter(Q(category_id=category) | Q(category__slug=category))
            else:
                queryset = queryset.filter(category__slug=category)
        if status_filter == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filter == "inactive":
            queryset = queryset.filter(is_active=False)
        if featured in {"true", "1", "yes"}:
            queryset = queryset.filter(is_featured=True)
        elif featured in {"false", "0", "no"}:
            queryset = queryset.filter(is_featured=False)
        return queryset

    def get_serializer_class(self):
        if self.action in {"retrieve", "create", "update", "partial_update"}:
            return ProductDetailSerializer
        return ProductListSerializer

    def _save_uploaded_images(self, product, request):
        files = request.FILES.getlist("images")
        if not files:
            return
        start = product.images.count()
        for index, uploaded in enumerate(files):
            ProductImage.objects.create(
                product=product,
                image=uploaded,
                alt_text=product.name,
                sort_order=start + index,
            )

    def perform_create(self, serializer):
        product = serializer.save()
        self._save_uploaded_images(product, self.request)

    def perform_update(self, serializer):
        product = serializer.save()
        self._save_uploaded_images(product, self.request)

    @action(detail=True, methods=["post"], url_path="images")
    def upload_images(self, request, pk=None):
        product = self.get_object()
        files = request.FILES.getlist("images")
        if not files:
            return Response(
                {"detail": "Upload at least one image."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        self._save_uploaded_images(product, request)
        serializer = ProductDetailSerializer(product, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="images/reorder")
    def reorder_images(self, request, pk=None):
        product = self.get_object()
        order = request.data.get("order") or []
        if not isinstance(order, list):
            return Response(
                {"detail": "order must be a list of image ids."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        for index, image_id in enumerate(order):
            ProductImage.objects.filter(product=product, id=image_id).update(
                sort_order=index
            )
        serializer = ProductDetailSerializer(product, context={"request": request})
        return Response(serializer.data)


class AdminProductImageViewSet(viewsets.GenericViewSet):
    permission_classes = [IsStaffUser]
    serializer_class = ProductImageSerializer
    queryset = ProductImage.objects.select_related("product")

    def destroy(self, request, pk=None):
        image = self.get_object()
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def _saved_queryset(model, user):
    return (
        model.objects.filter(user=user)
        .select_related("product", "product__category")
        .prefetch_related("product__images")
    )


def _serialize_saved(items, request):
    products = [item.product for item in items]
    return ProductListSerializer(products, many=True, context={"request": request}).data


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = _saved_queryset(WishlistItem, request.user)
        return Response(_serialize_saved(items, request))

    def post(self, request):
        serializer = SavedItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data["product_id"]
        item, created = WishlistItem.objects.get_or_create(
            user=request.user,
            product_id=product_id,
        )
        if not created:
            item.delete()
            return Response({"saved": False})
        return Response({"saved": True}, status=status.HTTP_201_CREATED)


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = _saved_queryset(CartItem, request.user)
        return Response(_serialize_saved(items, request))

    def post(self, request):
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        CartItem.objects.get_or_create(
            user=request.user,
            product_id=serializer.validated_data["product_id"],
        )
        items = _saved_queryset(CartItem, request.user)
        return Response(_serialize_saved(items, request), status=status.HTTP_201_CREATED)

    def delete(self, request):
        product_id = request.data.get("product_id") or request.query_params.get("product_id")
        if not product_id:
            return Response(
                {"product_id": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        CartItem.objects.filter(user=request.user, product_id=product_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
