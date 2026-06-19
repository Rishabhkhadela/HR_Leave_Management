from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import LeaveBalance, LeaveRequest
from .serializers import (
    LeaveBalanceSerializer,
    LeaveRequestSerializer,
    LeaveApplySerializer,
    RejectLeaveSerializer,
    EmployeeBalanceSerializer,
)
from .permissions import IsEmployee, IsManager


# ──────────────────────────────────────────────
# Employee Views
# ──────────────────────────────────────────────

class LeaveBalanceView(generics.ListAPIView):
    """
    GET /api/leaves/balance/
    Employee: View own leave balances.
    """
    permission_classes = [IsEmployee]
    serializer_class = LeaveBalanceSerializer

    def get_queryset(self):
        return LeaveBalance.objects.filter(user=self.request.user).select_related('leave_type')


class ApplyLeaveView(APIView):
    """
    POST /api/leaves/apply/
    Employee: Apply for a new leave request.
    """
    permission_classes = [IsEmployee]

    def post(self, request):
        serializer = LeaveApplySerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        leave_request = serializer.save()
        return Response(
            LeaveRequestSerializer(leave_request).data,
            status=status.HTTP_201_CREATED,
        )


class MyLeavesView(generics.ListAPIView):
    """
    GET /api/leaves/my-requests/
    Employee: View own leave requests.
    """
    permission_classes = [IsEmployee]
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        return LeaveRequest.objects.filter(
            employee=self.request.user
        ).select_related('leave_type', 'employee')


class CancelLeaveView(APIView):
    """
    PATCH /api/leaves/cancel/<id>/
    Employee: Cancel a pending leave request.
    Also handles cancelling approved leaves (restores balance).
    """
    permission_classes = [IsEmployee]

    def patch(self, request, pk):
        try:
            leave_request = LeaveRequest.objects.get(pk=pk, employee=request.user)
        except LeaveRequest.DoesNotExist:
            return Response(
                {'error': 'Leave request not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if leave_request.status not in [LeaveRequest.Status.PENDING, LeaveRequest.Status.APPROVED]:
            return Response(
                {'error': 'Only pending or approved leave requests can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If cancelling an approved leave, restore the balance
        if leave_request.status == LeaveRequest.Status.APPROVED:
            balance = LeaveBalance.objects.get(
                user=request.user,
                leave_type=leave_request.leave_type,
            )
            balance.used_days -= leave_request.leave_days
            balance.save()

        leave_request.status = LeaveRequest.Status.CANCELLED
        leave_request.save()

        return Response(LeaveRequestSerializer(leave_request).data)


# ──────────────────────────────────────────────
# Manager Views
# ──────────────────────────────────────────────

class AllRequestsView(generics.ListAPIView):
    """
    GET /api/leaves/all-requests/
    Manager: View all leave requests. Supports ?status= filter.
    """
    permission_classes = [IsManager]
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        queryset = LeaveRequest.objects.all().select_related('leave_type', 'employee')
        # Optional status filter
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())
        return queryset


class ApproveLeaveView(APIView):
    """
    PATCH /api/leaves/approve/<id>/
    Manager: Approve a pending leave request. Deducts balance.
    """
    permission_classes = [IsManager]

    def patch(self, request, pk):
        try:
            leave_request = LeaveRequest.objects.get(pk=pk)
        except LeaveRequest.DoesNotExist:
            return Response(
                {'error': 'Leave request not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if leave_request.status != LeaveRequest.Status.PENDING:
            return Response(
                {'error': 'Only pending leave requests can be approved.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Deduct balance
        try:
            balance = LeaveBalance.objects.get(
                user=leave_request.employee,
                leave_type=leave_request.leave_type,
            )
        except LeaveBalance.DoesNotExist:
            return Response(
                {'error': 'Leave balance record not found for this employee.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if balance.remaining_days < leave_request.leave_days:
            return Response(
                {'error': f'Insufficient balance. Employee has {balance.remaining_days} days remaining.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        balance.used_days += leave_request.leave_days
        balance.save()

        leave_request.status = LeaveRequest.Status.APPROVED
        leave_request.save()

        return Response(LeaveRequestSerializer(leave_request).data)


class RejectLeaveView(APIView):
    """
    PATCH /api/leaves/reject/<id>/
    Manager: Reject a pending leave request with a reason.
    """
    permission_classes = [IsManager]

    def patch(self, request, pk):
        try:
            leave_request = LeaveRequest.objects.get(pk=pk)
        except LeaveRequest.DoesNotExist:
            return Response(
                {'error': 'Leave request not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if leave_request.status != LeaveRequest.Status.PENDING:
            return Response(
                {'error': 'Only pending leave requests can be rejected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = RejectLeaveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        leave_request.status = LeaveRequest.Status.REJECTED
        leave_request.rejection_reason = serializer.validated_data['rejection_reason']
        leave_request.save()

        return Response(LeaveRequestSerializer(leave_request).data)


class EmployeeBalancesView(generics.ListAPIView):
    """
    GET /api/leaves/employee-balances/
    Manager: View leave balances of all employees.
    """
    permission_classes = [IsManager]
    serializer_class = EmployeeBalanceSerializer

    def get_queryset(self):
        return LeaveBalance.objects.filter(
            user__role='EMPLOYEE'
        ).select_related('user', 'leave_type').order_by('user__username', 'leave_type__name')
