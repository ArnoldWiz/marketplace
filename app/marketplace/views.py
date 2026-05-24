from django.contrib.auth import login, logout
from django.urls import reverse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import timedelta

from .models import Category, Publication
from .serializers import (
    CategorySerializer,
    LoginSerializer,
    PublicationCreateSerializer,
    PublicationDetailSerializer,
    PublicationListSerializer,
    RegisterSerializer,
)
from .models import Question, Answer
from .serializers import QuestionCreateSerializer, AnswerCreateSerializer
from rest_framework.permissions import IsAdminUser
from .serializers import PublicationListSerializer
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage


class PublicationAdminListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # allow staff to see all; non-staff see only public (not paused, not deleted)
        is_staff = request.user.is_staff
        base_qs = Publication.objects.select_related('category', 'seller').prefetch_related('images')
        if is_staff:
            queryset = base_qs.all()
        else:
            # show public publications plus the requesting user's own publications (even if paused), exclude deleted
            queryset = base_qs.filter(deleted_at__isnull=True).filter(
                Q(is_paused=False) | Q(seller_id=request.user.id)
            )

        # filtering
        q = request.query_params.get('q')
        category_id = request.query_params.get('category')
        seller_id = request.query_params.get('seller')
        location = request.query_params.get('location')
        is_paused = request.query_params.get('is_paused')
        date_range = request.query_params.get('range')
        ordering = request.query_params.get('ordering')
        page = int(request.query_params.get('page') or 1)
        page_size = int(request.query_params.get('page_size') or 20)

        # cap page_size to 20
        if page_size > 20:
            page_size = 20

        if q:
            # global search across multiple fields
            queryset = queryset.filter(
                Q(title__icontains=q) |
                Q(description__icontains=q) |
                Q(seller__username__icontains=q) |
                Q(category__name__icontains=q) |
                Q(location__icontains=q)
            )
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if seller_id:
            queryset = queryset.filter(seller_id=seller_id)
        if location:
            queryset = queryset.filter(location__iexact=location)
        if is_paused in ('1', 'true', 'True'):
            queryset = queryset.filter(is_paused=True)
        elif is_paused in ('0', 'false', 'False'):
            queryset = queryset.filter(is_paused=False)

        # simple date presets
        from django.utils import timezone
        from datetime import timedelta
        now = timezone.now()
        if date_range == '24h':
            queryset = queryset.filter(created_at__gte=now - timedelta(hours=24))
        elif date_range == '7d':
            queryset = queryset.filter(created_at__gte=now - timedelta(days=7))
        elif date_range == '30d':
            queryset = queryset.filter(created_at__gte=now - timedelta(days=30))
        elif date_range == '1y':
            queryset = queryset.filter(created_at__gte=now - timedelta(days=365))
        elif date_range and date_range.isdigit():
            # treat as year
            year = int(date_range)
            queryset = queryset.filter(created_at__year=year)

        # ordering
        ordering_field_map = {
            'id': 'id',
            'title': 'title',
            'price': 'price',
            'location': 'location',
            'clicks': 'clicks',
            'created_at': 'created_at',
            'is_paused': 'is_paused',
            'seller': 'seller__username',
            'category': 'category__name',
        }
        if ordering:
            # support '-' prefix
            desc = ordering.startswith('-')
            key = ordering[1:] if desc else ordering
            mapped = ordering_field_map.get(key)
            if mapped:
                if desc:
                    queryset = queryset.order_by('-' + mapped)
                else:
                    queryset = queryset.order_by(mapped)

        # pagination
        paginator = Paginator(queryset, page_size)
        try:
            page_obj = paginator.page(page)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

        serializer = PublicationListSerializer(page_obj.object_list, many=True, context={'request': request})
        return Response({
            'results': serializer.data,
            'count': paginator.count,
            'page': page_obj.number,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
        }, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class apiRoot(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        def endpoint(name, path_name, method, description, auth_required=False, url_override=None):
            return {
                'name': name,
                'url': url_override or request.build_absolute_uri(reverse(path_name)),
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
                    endpoint('Publicaciones publicas', 'api-publications-list', 'GET', 'Lista publicaciones filtradas por categoria y orden.'),
                    endpoint(
                        'Detalle de publicacion',
                        'api-publication-detail',
                        'GET',
                        'Devuelve una publicacion y suma un click.',
                        False,
                        request.build_absolute_uri('/api/publications/<id>/'),
                    ),
                    endpoint('Mis publicaciones', 'api-publications-create', 'GET/POST', 'Lista las publicaciones del usuario autenticado o crea una nueva con imagenes.', True),
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


class PublicationListAPIView(APIView):
    permission_classes = [AllowAny]

    def get_queryset(self, request):
        queryset = Publication.objects.select_related('category', 'seller').prefetch_related('images').filter(deleted_at__isnull=True, is_paused=False)
        month_ago = timezone.now() - timedelta(days=30)
        category_id = request.query_params.get('category')
        ordering_filter = request.query_params.get('filter', 'new')

        queryset = queryset.filter(created_at__gte=month_ago)

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        if ordering_filter == 'popular':
            queryset = queryset.order_by('-clicks', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = PublicationListSerializer(queryset, many=True, context={'request': request})
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
                'is_staff': user.is_staff,
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
        # staff users are not allowed to create publications
        if request.user.is_staff:
            return Response({'detail': 'Staff users cannot create publications.'}, status=status.HTTP_403_FORBIDDEN)

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


class PublicationDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, publication_id):
        return Publication.objects.select_related('category', 'seller').prefetch_related('images').get(
            pk=publication_id,
            deleted_at__isnull=True,
        )

    def get(self, request, publication_id):
        publication = self.get_object(publication_id)
        # if publication is paused, still return details but include flag; frontend will handle UI
        serializer = PublicationDetailSerializer(publication, context={'request': request})
        data = serializer.data
        data['is_paused'] = publication.is_paused
        if publication.is_paused:
            return Response(data, status=status.HTTP_200_OK)
        # register click for active publications
        publication.register_click()
        publication.refresh_from_db()
        serializer = PublicationDetailSerializer(publication, context={'request': request})
        data = serializer.data
        data['is_paused'] = publication.is_paused
        return Response(data, status=status.HTTP_200_OK)

    def patch(self, request, publication_id):
        # allow owner to edit or toggle pause
        if not request.user or not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        publication = Publication.objects.get(pk=publication_id, deleted_at__isnull=True)
        if publication.seller_id != request.user.id:
            return Response({'detail': 'Solo el dueño puede editar esta publicacion.'}, status=status.HTTP_403_FORBIDDEN)

        # allowed fields
        allowed = {'title', 'description', 'price', 'location', 'category', 'is_paused'}
        data = {k: v for k, v in request.data.items() if k in allowed}

        # update fields
        for k, v in data.items():
            if k == 'category':
                try:
                    from .models import Category
                    publication.category = Category.objects.get(pk=int(v))
                except Exception:
                    continue
            elif k == 'price':
                try:
                    publication.price = v
                except Exception:
                    pass
            elif k == 'is_paused':
                # accept booleans or string representations
                if isinstance(v, str):
                    publication.is_paused = v.lower() in ('1', 'true', 'yes')
                else:
                    publication.is_paused = bool(v)
            else:
                setattr(publication, k, v)

        publication.save()
        serializer = PublicationDetailSerializer(publication, context={'request': request})
        data = serializer.data
        data['is_paused'] = publication.is_paused
        return Response(data, status=status.HTTP_200_OK)


class PublicationQuestionsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, publication_id):
        publication = Publication.objects.prefetch_related('questions__answers', 'questions__author', 'questions__answers__author').get(
            pk=publication_id,
            deleted_at__isnull=True,
        )

        # Build questions payload similar to serializer
        questions = []
        for q in publication.questions.all():
            q_data = {
                'id': q.id,
                'body': q.body,
                'author': {'id': q.author.id, 'username': q.author.username},
                'created_at': q.created_at,
                'answers': [],
            }
            for a in q.answers.all():
                q_data['answers'].append({'id': a.id, 'body': a.body, 'author': {'id': a.author.id, 'username': a.author.username}, 'created_at': a.created_at})
            questions.append(q_data)

        return Response(questions, status=status.HTTP_200_OK)

    def post(self, request, publication_id):
        if not request.user or not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        publication = Publication.objects.select_related('seller').get(pk=publication_id, deleted_at__isnull=True)

        # owners cannot post questions on their own publication
        if publication.seller_id == request.user.id:
            return Response({'detail': 'No puedes preguntar en tu propia publicacion.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = QuestionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        q = Question.objects.create(publication=publication, author=request.user, body=serializer.validated_data['body'])

        return Response({'id': q.id, 'body': q.body, 'author': {'id': q.author.id, 'username': q.author.username}, 'created_at': q.created_at}, status=status.HTTP_201_CREATED)


class QuestionAnswerCreateAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, question_id):
        if not request.user or not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        question = Question.objects.select_related('publication__seller').get(pk=question_id)
        publication = question.publication

        # only publication owner can answer
        if publication.seller_id != request.user.id:
            return Response({'detail': 'Solo el dueño de la publicacion puede responder.'}, status=status.HTTP_403_FORBIDDEN)

        # enforce single answer per question
        if hasattr(question, 'answer') and question.answer is not None:
            return Response({'detail': 'Esta pregunta ya tiene una respuesta.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = AnswerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        a = Answer.objects.create(question=question, author=request.user, body=serializer.validated_data['body'])

        return Response({'id': a.id, 'body': a.body, 'author': {'id': a.author.id, 'username': a.author.username}, 'created_at': a.created_at}, status=status.HTTP_201_CREATED)
