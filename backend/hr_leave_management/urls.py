"""
URL configuration for hr_leave_management project.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/leaves/", include("leaves.urls")),
]
