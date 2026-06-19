from django.core.management.base import BaseCommand
from accounts.models import CustomUser
from leaves.models import LeaveType, LeaveBalance


class Command(BaseCommand):
    help = 'Seeds the database with sample users, leave types, and leave balances'

    def handle(self, *args, **options):
        # ── Create Users ──────────────────────────────────
        self.stdout.write('Seeding users...')

        users_data = [
            {
                'username': 'employee1',
                'password': 'pass1234',
                'email': 'employee1@company.com',
                'first_name': 'Rahul',
                'last_name': 'Sharma',
                'role': CustomUser.Role.EMPLOYEE,
            },
            {
                'username': 'employee2',
                'password': 'pass1234',
                'email': 'employee2@company.com',
                'first_name': 'Priya',
                'last_name': 'Patel',
                'role': CustomUser.Role.EMPLOYEE,
            },
            {
                'username': 'manager1',
                'password': 'pass1234',
                'email': 'manager1@company.com',
                'first_name': 'Amit',
                'last_name': 'Kumar',
                'role': CustomUser.Role.MANAGER,
            },
        ]

        created_users = []
        for user_data in users_data:
            password = user_data.pop('password')
            user, created = CustomUser.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data,
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  Created {user.role}: {user.username} ({user.first_name} {user.last_name})'
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'  User already exists: {user.username}')
                )
            created_users.append(user)

        # Create superuser for admin access
        if not CustomUser.objects.filter(username='admin').exists():
            admin_user = CustomUser.objects.create_superuser(
                username='admin',
                password='admin1234',
                email='admin@company.com',
                first_name='Admin',
                last_name='User',
                role=CustomUser.Role.MANAGER,
            )
            self.stdout.write(self.style.SUCCESS('  Created superuser: admin'))
        else:
            self.stdout.write(self.style.WARNING('  Superuser already exists: admin'))

        # ── Create Leave Types ────────────────────────────
        self.stdout.write('\nSeeding leave types...')

        leave_types_data = [
            {'name': 'Vacation Leave', 'days_per_year': 12},
            {'name': 'Sick Leave', 'days_per_year': 8},
            {'name': 'Casual Leave', 'days_per_year': 6},
        ]

        leave_types = []
        for lt_data in leave_types_data:
            lt, created = LeaveType.objects.get_or_create(
                name=lt_data['name'],
                defaults=lt_data,
            )
            leave_types.append(lt)
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'  Created: {lt.name} ({lt.days_per_year} days/year)')
                )
            else:
                self.stdout.write(self.style.WARNING(f'  Already exists: {lt.name}'))

        # ── Create Leave Balances ─────────────────────────
        self.stdout.write('\nSeeding leave balances for employees...')

        employees = CustomUser.objects.filter(role=CustomUser.Role.EMPLOYEE)
        for employee in employees:
            for lt in leave_types:
                balance, created = LeaveBalance.objects.get_or_create(
                    user=employee,
                    leave_type=lt,
                    defaults={'total_days': lt.days_per_year, 'used_days': 0},
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  {employee.username}: {lt.name} = {lt.days_per_year} days'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'  Balance already exists: {employee.username} - {lt.name}'
                        )
                    )

        # ── Summary ──────────────────────────────────────
        self.stdout.write(self.style.SUCCESS('\nSeed data created successfully!'))
        self.stdout.write('\nTest credentials:')
        self.stdout.write('  employee1 / pass1234  (Employee)')
        self.stdout.write('  employee2 / pass1234  (Employee)')
        self.stdout.write('  manager1  / pass1234  (Manager)')
        self.stdout.write('  admin     / admin1234 (Superuser/Manager)')
        self.stdout.write('\nLeave types:')
        self.stdout.write('  Vacation Leave: 12 days/year')
        self.stdout.write('  Sick Leave:      8 days/year')
        self.stdout.write('  Casual Leave:    6 days/year')
