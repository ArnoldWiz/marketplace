from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class MarketplaceUser(AbstractUser):
	is_seller = models.BooleanField(default=False)


class Category(models.Model):
	name = models.CharField(max_length=100, unique=True)
	is_system = models.BooleanField(default=False, editable=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['name']

	def __str__(self):
		return self.name


class PublicationQuerySet(models.QuerySet):
	def active(self):
		return self.filter(deleted_at__isnull=True)

	def available(self):
		return self.active().filter(is_paused=False)


class Publication(models.Model):
	seller = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.PROTECT,
		related_name='publications',
	)
	category = models.ForeignKey(
		Category,
		on_delete=models.PROTECT,
		related_name='publications',
	)
	title = models.CharField(max_length=150)
	summary = models.CharField(max_length=255, blank=True)
	description = models.TextField()
	price = models.DecimalField(max_digits=12, decimal_places=2)
	location = models.CharField(max_length=120, blank=True)
	condition = models.CharField(max_length=80, blank=True)
	clicks = models.PositiveIntegerField(default=0)
	is_paused = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	objects = PublicationQuerySet.as_manager()

	class Meta:
		ordering = ['-created_at']
		indexes = [
			models.Index(fields=['deleted_at', 'is_paused']),
			models.Index(fields=['category', 'is_paused']),
		]

	def __str__(self):
		return self.title

	@property
	def is_deleted(self):
		return self.deleted_at is not None

	def save(self, *args, **kwargs):
		is_new = self._state.adding
		seller_id = self.seller_id

		if is_new and seller_id:
			type(self.seller).objects.filter(pk=seller_id, is_seller=False).update(is_seller=True)

		super().save(*args, **kwargs)

	def pause(self):
		if not self.is_paused:
			self.is_paused = True
			self.save(update_fields=['is_paused', 'updated_at'])

	def resume(self):
		if self.is_paused:
			self.is_paused = False
			self.save(update_fields=['is_paused', 'updated_at'])

	def soft_delete(self):
		if self.deleted_at is None:
			self.deleted_at = timezone.now()
			self.save(update_fields=['deleted_at', 'updated_at'])

	def register_click(self):
		self.clicks += 1
		self.save(update_fields=['clicks', 'updated_at'])
