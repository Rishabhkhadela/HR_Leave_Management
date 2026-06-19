from django.urls import path
from .views import (
    # Employee views
    LeaveBalanceView,
    ApplyLeaveView,
    MyLeavesView,
    CancelLeaveView,
    # Manager views
    AllRequestsView,
    ApproveLeaveView,
    RejectLeaveView,
    EmployeeBalancesView,
)

urlpatterns = [
    # Employee endpoints
    path('balance/', LeaveBalanceView.as_view(), name='leave-balance'),
    path('apply/', ApplyLeaveView.as_view(), name='apply-leave'),
    path('my-requests/', MyLeavesView.as_view(), name='my-leaves'),
    path('cancel/<int:pk>/', CancelLeaveView.as_view(), name='cancel-leave'),

    # Manager endpoints
    path('all-requests/', AllRequestsView.as_view(), name='all-requests'),
    path('approve/<int:pk>/', ApproveLeaveView.as_view(), name='approve-leave'),
    path('reject/<int:pk>/', RejectLeaveView.as_view(), name='reject-leave'),
    path('employee-balances/', EmployeeBalancesView.as_view(), name='employee-balances'),
]
