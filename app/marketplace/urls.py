from django.urls import path

from .views import CategoryListAPIView, LoginAPIView, LogoutAPIView, MeAPIView, PublicationCreateAPIView, RegisterAPIView, apiRoot


urlpatterns = [
	path('', apiRoot.as_view(), name='api-root'),
	path('register/', RegisterAPIView.as_view(), name='api-register'),
	path('login/', LoginAPIView.as_view(), name='api-login'),
	path('logout/', LogoutAPIView.as_view(), name='api-logout'),
	path('me/', MeAPIView.as_view(), name='api-me'),
	path('categories/', CategoryListAPIView.as_view(), name='api-categories'),
	path('publications/', PublicationCreateAPIView.as_view(), name='api-publications-create'),
]