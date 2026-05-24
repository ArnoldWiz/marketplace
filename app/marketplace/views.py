from django.contrib.auth import login, logout
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category
from .serializers import CategorySerializer, LoginSerializer, PublicationCreateSerializer, PublicationListSerializer, RegisterSerializer


@method_decorator(ensure_csrf_cookie, name='dispatch')
class apiRoot(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        def endpoint(name, path_name, method, description, auth_required=False):
            return {
                'name': name,
                'url': request.build_absolute_uri(reverse(path_name)),
                'method': method,
                'description': description,
                'auth_required': auth_required,
            }

        return Response(
            {
                'message': 'Bienvenido a la API del marketplace.',
                'endpoints': [
                    endpoint('Registro', 'api-register', 'POST', 'Crea un usuario nuevo con username, email y contrasena.'),
                    endpoint('Inicio de sesion', 'api-login', 'POST', 'Inicia una sesion y crea la cookie de autenticacion.'),
                    endpoint('Cerrar sesion', 'api-logout', 'POST', 'Cierra la sesion activa.', True),
                    endpoint('Mi usuario', 'api-me', 'GET', 'Devuelve los datos del usuario autenticado.', True),
                    endpoint('Categorias', 'api-categories', 'GET', 'Lista las categorias disponibles en la base.'),
                    endpoint('Publicaciones', 'api-publications-create', 'GET/POST', 'Lista publicaciones o crea una nueva con imagenes.', True),
                ],
            },
            status=status.HTTP_200_OK,
        )


class CategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'message': 'Usuario creado correctamente.',
            },
            status=status.HTTP_201_CREATED,
        )


@method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)

        return Response(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_seller': user.is_seller,
            },
            status=status.HTTP_200_OK,
        )


@method_decorator(csrf_exempt, name='dispatch')
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Sesion cerrada.'}, status=status.HTTP_200_OK)


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_seller': user.is_seller,
            },
            status=status.HTTP_200_OK,
        )


class PublicationCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        publications = request.user.publications.select_related('category').prefetch_related('images').all()
        serializer = PublicationListSerializer(publications, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PublicationCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        publication = serializer.save()

        return Response(
            {
                'id': publication.id,
                'title': publication.title,
                'location': publication.location,
                'category': publication.category_id,
                'images': [image.file.url for image in publication.images.all()],
            },
            status=status.HTTP_201_CREATED,
        )
