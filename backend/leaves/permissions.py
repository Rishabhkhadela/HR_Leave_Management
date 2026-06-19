from rest_framework import permissions


class IsEmployee(permissions.BasePermission):
    """Allow access only to users with EMPLOYEE role."""

    message = "Only employees can access this resource."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'EMPLOYEE'
        )


class IsManager(permissions.BasePermission):
    """Allow access only to users with MANAGER role."""

    message = "Only managers can access this resource."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'MANAGER'
        )
