from django.urls import path

from .views import (
	CategoryListAPIView,
	LoginAPIView,
	LogoutAPIView,
	MeAPIView,
	PublicationCreateAPIView,
	PublicationDetailAPIView,
	PublicationListAPIView,
	PublicationAdminListAPIView,
	RegisterAPIView,
	apiRoot,
)
from .views import PublicationQuestionsAPIView, QuestionAnswerCreateAPIView


urlpatterns = [
	path('', apiRoot.as_view(), name='api-root'),
	path('register/', RegisterAPIView.as_view(), name='api-register'),
	path('login/', LoginAPIView.as_view(), name='api-login'),
	path('logout/', LogoutAPIView.as_view(), name='api-logout'),
	path('me/', MeAPIView.as_view(), name='api-me'),
	path('categories/', CategoryListAPIView.as_view(), name='api-categories'),
	path('publications/all/', PublicationListAPIView.as_view(), name='api-publications-list'),
	path('publications/', PublicationCreateAPIView.as_view(), name='api-publications-create'),
	path('publications/<int:publication_id>/', PublicationDetailAPIView.as_view(), name='api-publication-detail'),
	path('publications/<int:publication_id>/questions/', PublicationQuestionsAPIView.as_view(), name='api-publication-questions'),
	path('questions/<int:question_id>/answers/', QuestionAnswerCreateAPIView.as_view(), name='api-question-answers'),
	path('admin/publications/', PublicationAdminListAPIView.as_view(), name='api-admin-publications'),
]