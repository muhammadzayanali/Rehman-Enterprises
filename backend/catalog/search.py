import re

from django.utils.text import slugify
from rest_framework.filters import BaseFilterBackend

from .models import Category, Product

_VOWELS = re.compile(r"[aeiouy]")
_SPLIT = re.compile(r"[\s/_-]+")

# Common rug-name spellings so “Mamluk” finds a collection named mumluk.
_ALIASES = {
    "mamluk": ("mumluk", "mamlouk", "mamluke"),
    "mumluk": ("mamluk", "mamlouk", "mamluke"),
    "mamlouk": ("mamluk", "mumluk"),
    "gabbeh": ("gaba", "gabba"),
    "gaba": ("gabbeh", "gabba"),
    "kilim": ("kelim",),
    "kelim": ("kilim",),
    "khorjin": ("khorgin"),
    "khorgin": ("khorjin"),
}


def _norm(value):
    return slugify(value or "").replace("-", "")


def _fold(value):
    return _VOWELS.sub("", _norm(value))


def _words(value):
    return [part for part in _SPLIT.split((value or "").strip().lower()) if part]


def _variants(word):
    yielded = {word, _norm(word)}
    yielded.update(_ALIASES.get(word, ()))
    yielded.update(_ALIASES.get(_norm(word), ()))
    return {item for item in yielded if item}


def query_matches(query, *fields):
    raw = (query or "").strip()
    if not raw:
        return False
    words = _words(raw)
    if not words:
        return False
    return all(_word_matches(word, fields) for word in words)


def _word_matches(word, fields):
    folded = _fold(word)
    variants = _variants(word)
    for field in fields:
        text = str(field or "")
        if not text:
            continue
        lowered = text.lower()
        normalized = _norm(text)
        folded_text = _fold(text)
        if any(variant in lowered for variant in variants if len(variant) >= 2):
            return True
        if any(variant in normalized for variant in variants if len(variant) >= 2):
            return True
        if len(folded) >= 3 and folded in folded_text:
            return True
    return False


class CatalogTextSearchFilter(BaseFilterBackend):
    """Match names, slugs, and close spellings (Mamluk ↔ mumluk)."""

    def filter_queryset(self, request, queryset, view):
        query = (request.query_params.get("search") or "").strip()
        if not query:
            return queryset

        model = queryset.model
        if model is Category:
            matched = [
                item.pk
                for item in queryset
                if query_matches(query, item.name, item.slug, item.description, item.group)
            ]
            return queryset.filter(pk__in=matched)

        if model is Product:
            matched = []
            for item in queryset.select_related("category"):
                category = item.category
                if query_matches(
                    query,
                    item.name,
                    item.slug,
                    item.sku,
                    item.material,
                    item.shape,
                    item.description,
                    category.name if category else "",
                    category.slug if category else "",
                    category.description if category else "",
                ):
                    matched.append(item.pk)
            return queryset.filter(pk__in=matched)

        return queryset
