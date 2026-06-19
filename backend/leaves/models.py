from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from datetime import date


class LeaveType(models.Model):
    """Types of leave available (Vacation, Sick, Casual)."""

    name = models.CharField(max_length=50, unique=True)
    days_per_year = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.name} ({self.days_per_year} days/year)"

    class Meta:
        ordering = ['name']


class LeaveBalance(models.Model):
    """Tracks leave balance per employee per leave type."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leave_balances',
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        related_name='balances',
    )
    total_days = models.PositiveIntegerField(help_text="Total allocated days for the year")
    used_days = models.PositiveIntegerField(default=0, help_text="Days used (approved leaves)")

    @property
    def remaining_days(self):
        return self.total_days - self.used_days

    def __str__(self):
        return f"{self.user.username} - {self.leave_type.name}: {self.remaining_days}/{self.total_days}"

    class Meta:
        unique_together = ['user', 'leave_type']
        ordering = ['user', 'leave_type']


class LeaveRequest(models.Model):
    """A leave request submitted by an employee."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        CANCELLED = 'CANCELLED', 'Cancelled'

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leave_requests',
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        related_name='requests',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    rejection_reason = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def leave_days(self):
        """Calculate the number of leave days (inclusive of start and end)."""
        if self.start_date and self.end_date:
            delta = (self.end_date - self.start_date).days + 1
            return max(delta, 0)
        return 0

    def clean(self):
        """Model-level validation."""
        errors = {}

        if self.start_date and self.end_date:
            # Cannot apply for past dates
            if self.start_date < date.today():
                errors['start_date'] = 'Cannot apply leave for past dates.'

            # End date must be >= start date
            if self.end_date < self.start_date:
                errors['end_date'] = 'End date must be on or after start date.'

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return (
            f"{self.employee.username} - {self.leave_type.name} "
            f"({self.start_date} to {self.end_date}) [{self.status}]"
        )

    class Meta:
        ordering = ['-created_at']
