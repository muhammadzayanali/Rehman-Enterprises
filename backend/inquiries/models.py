from django.db import models

from catalog.models import Product


class Inquiry(models.Model):
    STATUS_NEW = "NEW"
    STATUS_CONTACTED = "CONTACTED"
    STATUS_CLOSED = "CLOSED"
    STATUS_CHOICES = [
        (STATUS_NEW, "New"),
        (STATUS_CONTACTED, "Contacted"),
        (STATUS_CLOSED, "Closed"),
    ]

    name = models.CharField(max_length=160)
    email = models.EmailField()
    message = models.TextField()
    product = models.ForeignKey(
        Product,
        related_name="inquiries",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_NEW,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.email}"
