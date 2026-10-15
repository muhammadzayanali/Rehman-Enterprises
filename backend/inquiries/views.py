from rest_framework import mixins, status, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from catalog.permissions import IsStaffUser
from .models import Inquiry
from .serializers import InquiryCreateSerializer, InquirySerializer


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
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "email", "message", "product__name"]
    ordering_fields = ["created_at", "status"]
    http_method_names = ["get", "patch", "head", "options"]
