from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from .models import Category, MEXICO_STATE_CHOICES, Publication, PublicationImage


User = get_user_model()


class RegisterSerializer(serializers.Serializer):
	username = serializers.CharField(max_length=150)
	email = serializers.EmailField()
	password = serializers.CharField(write_only=True, min_length=8)
	password_confirm = serializers.CharField(write_only=True, min_length=8)
	first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
	last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)

	def validate_username(self, value):
		if User.objects.filter(username__iexact=value).exists():
			raise serializers.ValidationError('Ese usuario ya existe.')
		return value

	def validate_email(self, value):
		if User.objects.filter(email__iexact=value).exists():
			raise serializers.ValidationError('Ese correo ya esta registrado.')
		return value

	def validate(self, attrs):
		if attrs['password'] != attrs['password_confirm']:
			raise serializers.ValidationError({'password_confirm': 'Las contraseñas no coinciden.'})
		return attrs

	def create(self, validated_data):
		validated_data.pop('password_confirm')
		password = validated_data.pop('password')
		user = User.objects.create_user(password=password, **validated_data)
		return user


class LoginSerializer(serializers.Serializer):
	username = serializers.CharField(max_length=150)
	password = serializers.CharField(write_only=True)

	def validate(self, attrs):
		user = authenticate(username=attrs['username'], password=attrs['password'])
		if not user:
			raise serializers.ValidationError({'non_field_errors': ['Credenciales invalidas.']})

		attrs['user'] = user
		return attrs


class CategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = Category
		fields = ('id', 'name')


class PublicationImageSerializer(serializers.ModelSerializer):
	class Meta:
		model = PublicationImage
		fields = ('id', 'file')


class PublicationListSerializer(serializers.ModelSerializer):
	category = CategorySerializer(read_only=True)
	images = PublicationImageSerializer(many=True, read_only=True)

	class Meta:
		model = Publication
		fields = ('id', 'title', 'description', 'price', 'location', 'category', 'images', 'created_at')


class PublicationCreateSerializer(serializers.ModelSerializer):
	images = serializers.ListField(child=serializers.FileField(), required=False, write_only=True)

	class Meta:
		model = Publication
		fields = ('id', 'category', 'title', 'description', 'price', 'location', 'images')

	def validate_location(self, value):
		valid_locations = {choice for choice, _ in MEXICO_STATE_CHOICES}
		if value and value not in valid_locations:
			raise serializers.ValidationError('Selecciona un estado valido.')
		return value

	def validate_images(self, value):
		if len(value) > 10:
			raise serializers.ValidationError('Solo puedes subir hasta 10 imagenes.')
		return value

	def create(self, validated_data):
		images = validated_data.pop('images', [])
		request = self.context['request']
		publication = Publication.objects.create(seller=request.user, **validated_data)

		for uploaded_file in images:
			PublicationImage.objects.create(publication=publication, file=uploaded_file)

		return publication