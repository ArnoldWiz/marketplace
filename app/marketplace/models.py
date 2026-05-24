from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone


MEXICO_STATE_CHOICES = [
	('Aguascalientes', 'Aguascalientes'),
	('Baja California', 'Baja California'),
	('Baja California Sur', 'Baja California Sur'),
	('Campeche', 'Campeche'),
	('Chiapas', 'Chiapas'),
	('Chihuahua', 'Chihuahua'),
	('Ciudad de Mexico', 'Ciudad de Mexico'),
	('Coahuila', 'Coahuila'),
	('Colima', 'Colima'),
	('Durango', 'Durango'),
	('Guanajuato', 'Guanajuato'),
	('Guerrero', 'Guerrero'),
	('Hidalgo', 'Hidalgo'),
	('Jalisco', 'Jalisco'),
	('Estado de Mexico', 'Estado de Mexico'),
	('Michoacan', 'Michoacan'),
	('Morelos', 'Morelos'),
	('Nayarit', 'Nayarit'),
	('Nuevo Leon', 'Nuevo Leon'),
	('Oaxaca', 'Oaxaca'),
	('Puebla', 'Puebla'),
	('Queretaro', 'Queretaro'),
	('Quintana Roo', 'Quintana Roo'),
	('San Luis Potosi', 'San Luis Potosi'),
	('Sinaloa', 'Sinaloa'),
	('Sonora', 'Sonora'),
	('Tabasco', 'Tabasco'),
	('Tamaulipas', 'Tamaulipas'),
	('Tlaxcala', 'Tlaxcala'),
	('Veracruz', 'Veracruz'),
	('Yucatan', 'Yucatan'),
	('Zacatecas', 'Zacatecas'),
]


class MarketplaceUser(AbstractUser):
	is_seller = models.BooleanField(default=False)

	class Meta:
		db_table = 'users'


class Category(models.Model):
	name = models.CharField(max_length=100, unique=True)
	is_system = models.BooleanField(default=False, editable=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['name']
		db_table = 'categories'

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
	description = models.TextField()
	price = models.DecimalField(max_digits=12, decimal_places=2)
	location = models.CharField(max_length=120, choices=MEXICO_STATE_CHOICES, blank=True)
	clicks = models.PositiveIntegerField(default=0)
	is_paused = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	objects = PublicationQuerySet.as_manager()

	class Meta:
		ordering = ['-created_at']
		db_table = 'publications'
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
			get_user_model().objects.filter(pk=seller_id, is_seller=False).update(is_seller=True)

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


class PublicationImage(models.Model):
	publication = models.ForeignKey(
		Publication,
		on_delete=models.CASCADE,
		related_name='images',
	)
	file = models.FileField(upload_to='publications/')
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f'{self.publication.title} - {self.file.name}'


class Question(models.Model):
	publication = models.ForeignKey(
		Publication,
		on_delete=models.CASCADE,
		related_name='questions',
	)
	author = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='questions',
	)
	body = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-created_at']
		db_table = 'questions'

	def __str__(self):
		return f'Q:{self.publication.title} by {self.author.username}'


class Answer(models.Model):
	question = models.OneToOneField(
		Question,
		on_delete=models.CASCADE,
		related_name='answer',
	)
	author = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='answers',
	)
	body = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['created_at']
		db_table = 'answers'

	def __str__(self):
		return f'A to Q:{self.question_id} by {self.author.username}'
