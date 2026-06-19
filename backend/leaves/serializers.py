from rest_framework import serializers
from datetime import date
from .models import LeaveType, LeaveBalance, LeaveRequest


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'name', 'days_per_year']


class LeaveBalanceSerializer(serializers.ModelSerializer):
    """Read-only serializer showing leave balance per type."""

    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    remaining_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveBalance
        fields = ['id', 'leave_type', 'leave_type_name', 'total_days', 'used_days', 'remaining_days']
        read_only_fields = fields


class LeaveRequestSerializer(serializers.ModelSerializer):
    """Read serializer for leave requests."""

    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    employee_name = serializers.SerializerMethodField()
    leave_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name',
            'leave_type', 'leave_type_name',
            'start_date', 'end_date', 'leave_days',
            'reason', 'status', 'rejection_reason',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class LeaveApplySerializer(serializers.Serializer):
    """Write serializer for applying leave — includes all business rule validations."""

    leave_type = serializers.PrimaryKeyRelatedField(queryset=LeaveType.objects.all())
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    reason = serializers.CharField(required=False, default='', allow_blank=True)

    def validate_start_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Cannot apply leave for past dates.")
        return value

    def validate(self, data):
        start = data['start_date']
        end = data['end_date']

        # End date must be on or after start date
        if end < start:
            raise serializers.ValidationError({
                'end_date': "End date must be on or after start date."
            })

        leave_days = (end - start).days + 1

        # Check for overlapping leave requests
        user = self.context['request'].user
        overlapping = LeaveRequest.objects.filter(
            employee=user,
            status__in=[LeaveRequest.Status.PENDING, LeaveRequest.Status.APPROVED],
            start_date__lte=end,
            end_date__gte=start,
        )
        if overlapping.exists():
            raise serializers.ValidationError(
                "You already have a leave request that overlaps with these dates."
            )

        # Check leave balance
        try:
            balance = LeaveBalance.objects.get(
                user=user,
                leave_type=data['leave_type'],
            )
        except LeaveBalance.DoesNotExist:
            raise serializers.ValidationError("Leave balance not found for this leave type.")

        if balance.remaining_days < leave_days:
            raise serializers.ValidationError(
                f"Insufficient leave balance. You have {balance.remaining_days} days remaining "
                f"but requested {leave_days} days."
            )

        data['leave_days'] = leave_days
        return data

    def create(self, validated_data):
        validated_data.pop('leave_days', None)
        user = self.context['request'].user
        return LeaveRequest.objects.create(
            employee=user,
            leave_type=validated_data['leave_type'],
            start_date=validated_data['start_date'],
            end_date=validated_data['end_date'],
            reason=validated_data.get('reason', ''),
            status=LeaveRequest.Status.PENDING,
        )


class RejectLeaveSerializer(serializers.Serializer):
    """Serializer for rejecting a leave request with a reason."""

    rejection_reason = serializers.CharField(required=True, min_length=1)


class EmployeeBalanceSerializer(serializers.Serializer):
    """Serializer for manager view of employee balances."""

    employee_id = serializers.IntegerField(source='user.id')
    employee_name = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username')
    leave_type_name = serializers.CharField(source='leave_type.name')
    total_days = serializers.IntegerField()
    used_days = serializers.IntegerField()
    remaining_days = serializers.IntegerField()

    def get_employee_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
