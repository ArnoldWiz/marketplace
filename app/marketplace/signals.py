from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .models import Category


DEFAULT_CATEGORY_NAME = 'General'


@receiver(post_migrate)
def create_default_category(sender, **kwargs):
    if sender.name != 'marketplace':
        return

    Category.objects.update_or_create(
        name=DEFAULT_CATEGORY_NAME,
        defaults={'is_system': True},
    )