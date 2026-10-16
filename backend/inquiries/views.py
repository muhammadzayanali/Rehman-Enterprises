from django.db.models import Case, IntegerField, When
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from catalog.permissions import IsStaffUser
from .models import Inquiry
from .serializers import InquiryCreateSerializer, InquirySerializer


class InquiryPagination(PageNumberPagination):
    page_size = 10


class PublicInquiryViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Inquiry.objects.all()
    serializer_class = InquiryCreateSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()
        return Response(
            {
                "id": inquiry.id,
                "detail": "Thank you. We will contact you shortly.",
            },
            status=status.HTTP_201_CREATED,
        )


class AdminInquiryViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Inquiry.objects.select_related("product", "product__category").prefetch_related(
        "product__images"
    )
    serializer_class = InquirySerializer
    permission_classes = [IsStaffUser]
    pagination_class = InquiryPagination
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "email", "phone", "message", "product__name"]
    ordering_fields = ["created_at", "status"]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        queryset = super().get_queryset().annotate(
            status_rank=Case(
                When(status=Inquiry.STATUS_NEW, then=0),
                When(status=Inquiry.STATUS_CONTACTED, then=1),
                default=2,
                output_field=IntegerField(),
            )
        )
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())
        return queryset.order_by("status_rank", "-created_at")

    @action(detail=False, methods=["get"])
    def summary(self, request):
        queryset = Inquiry.objects.all()
        return Response(
            {
                "total": queryset.count(),
                "new": queryset.filter(status=Inquiry.STATUS_NEW).count(),
                "contacted": queryset.filter(status=Inquiry.STATUS_CONTACTED).count(),
                "closed": queryset.filter(status=Inquiry.STATUS_CLOSED).count(),
            }
        )
