from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Category, MarketplaceUser, Publication


@admin.register(MarketplaceUser)
class MarketplaceUserAdmin(UserAdmin):
	fieldsets = UserAdmin.fieldsets + (
		('Marketplace', {'fields': ('is_seller',)}),
	)
	add_fieldsets = UserAdmin.add_fieldsets + (
		('Marketplace', {'fields': ('is_seller',)}),
	)
	list_display = ('username', 'email', 'first_name', 'last_name', 'is_seller', 'is_staff')
	list_filter = UserAdmin.list_filter + ('is_seller',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
	list_display = ('name', 'is_system', 'created_at')
	search_fields = ('name',)
	readonly_fields = ('is_system', 'created_at')


@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
	list_display = ('title', 'seller', 'category', 'price', 'clicks', 'is_paused', 'deleted_at')
	list_filter = ('category', 'is_paused', 'deleted_at', 'created_at')
	search_fields = ('title', 'summary', 'description', 'location', 'seller__username')
	readonly_fields = ('clicks', 'created_at', 'updated_at', 'deleted_at')
