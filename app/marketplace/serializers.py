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


class PublicationUserSummarySerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('id', 'username', 'email', 'is_seller')


class PublicationListSerializer(serializers.ModelSerializer):
	category = CategorySerializer(read_only=True)
	images = serializers.SerializerMethodField()
	price_display = serializers.SerializerMethodField()
	is_paused = serializers.BooleanField(read_only=True)

	class Meta:
		model = Publication
		fields = ('id', 'title', 'description', 'price', 'price_display', 'location', 'category', 'images', 'clicks', 'created_at', 'is_paused')

	def get_images(self, obj):
		request = self.context.get('request')
		image_urls = []

		for image in obj.images.all():
			if request is not None:
				image_urls.append(request.build_absolute_uri(image.file.url))
			else:
				image_urls.append(image.file.url)

		return image_urls

	def get_price_display(self, obj):
		return f"${obj.price:,.2f} MXN"


class PublicationDetailSerializer(serializers.ModelSerializer):
	category = CategorySerializer(read_only=True)
	seller = PublicationUserSummarySerializer(read_only=True)
	images = serializers.SerializerMethodField()
	price_display = serializers.SerializerMethodField()
	questions = serializers.SerializerMethodField()
	created_at = serializers.DateTimeField()
	updated_at = serializers.DateTimeField()

	class Meta:
		model = Publication
		fields = (
			'id',
			'title',
			'description',
			'price',
			'price_display',
			'location',
			'category',
			'seller',
			'images',
			'clicks',
			'created_at',
			'updated_at',
			'questions',
			'is_paused',
		)

	def get_images(self, obj):
		request = self.context.get('request')
		return [request.build_absolute_uri(image.file.url) if request is not None else image.file.url for image in obj.images.all()]

	def get_price_display(self, obj):
		return f"${obj.price:,.2f} MXN"

	def get_questions(self, obj):
		request = self.context.get('request')
		questions = []
		qs = obj.questions.select_related('author').select_related('answer__author').all()
		for q in qs:
			q_data = {
				'id': q.id,
				'body': q.body,
				'author': {
					'id': q.author.id,
					'username': q.author.username,
				},
				'created_at': q.created_at,
				'answers': [],
			}
			if hasattr(q, 'answer') and q.answer is not None:
				a = q.answer
				q_data['answers'].append({
					'id': a.id,
					'body': a.body,
					'author': {
						'id': a.author.id,
						'username': a.author.username,
					},
					'created_at': a.created_at,
				})
			questions.append(q_data)
		return questions


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


class QuestionCreateSerializer(serializers.Serializer):
    body = serializers.CharField()


class AnswerCreateSerializer(serializers.Serializer):
    body = serializers.CharField()