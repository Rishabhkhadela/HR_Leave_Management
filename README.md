# 🏢 HR Leave Management System

A full-stack **HR Leave Management Portal** built with **Django REST Framework** (backend) and **React + Vite** (frontend). Employees can apply for leave, track request status, and view balances. Managers can approve/reject requests and monitor team leave data — all through a polished, responsive UI with dark/light theme support.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication (access + refresh tokens)
- Role-based access control — **Employee** and **Manager** roles
- Auto token refresh on expiry via Axios interceptor
- Protected routes with role-specific redirection

### 👤 Employee Portal
- **Dashboard** — Overview with stats cards (remaining days, pending requests, approved leaves, total requests) and leave balance progress bars
- **Leave Balance** — Detailed circular gauge visualization per leave type (Vacation, Sick, Casual)
- **Apply Leave** — Smart form with live day calculator, balance validation, and overlap detection
- **My Requests** — Full request history with status badges and cancel functionality (pending or approved)

### 👔 Manager Portal
- **Dashboard** — Team-wide stats and quick view of pending requests needing action
- **All Requests** — Filterable table by status (All, Pending, Approved, Rejected, Cancelled) with inline approve and reject-with-reason modal
- **Employee Balances** — Per-employee leave balance breakdown with progress bars

### 🎨 UI / UX
- **Dark / Light theme toggle** — persisted in localStorage, respects system preference
- **Premium design** — glassmorphism, smooth animations, gradient accents
- **Fully responsive** — works on desktop, tablet, and mobile
- **Google Fonts** — Inter typeface for clean typography

---

## 🛠️ Tech Stack

| Layer      | Technology                                            |
|------------|-------------------------------------------------------|
| **Backend**    | Python 3.11+, Django 4.2, Django REST Framework 3.14  |
| **Auth**       | djangorestframework-simplejwt (JWT tokens)            |
| **Frontend**   | React 19, Vite 8, React Router DOM 7                  |
| **HTTP Client**| Axios with request/response interceptors              |
| **Database**   | SQLite (development) — swappable to PostgreSQL        |
| **Styling**    | Vanilla CSS with CSS custom properties (design tokens) |

---

## 📁 Project Structure

```
HR_Leave_Management/
├── backend/
│   ├── accounts/                # Custom user model & auth
│   │   ├── models.py            # CustomUser with Role (EMPLOYEE/MANAGER)
│   │   ├── serializers.py       # Login & profile serializers
│   │   ├── views.py             # LoginView, ProfileView
│   │   ├── urls.py              # /api/auth/ routes
│   │   └── management/
│   │       └── commands/
│   │           └── seed_data.py # Database seeding command
│   ├── leaves/                  # Leave management logic
│   │   ├── models.py            # LeaveType, LeaveBalance, LeaveRequest
│   │   ├── serializers.py       # Read/write serializers with validations
│   │   ├── views.py             # Employee & Manager API views
│   │   ├── permissions.py       # IsEmployee, IsManager permission classes
│   │   └── urls.py              # /api/leaves/ routes
│   ├── hr_leave_management/     # Django project config
│   │   ├── settings.py
│   │   └── urls.py
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js         # Axios instance with JWT interceptors
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Auth state management
│   │   │   └── ThemeContext.jsx  # Dark/light theme management
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Sidebar + main content shell
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RejectModal.jsx  # Rejection reason modal
│   │   │   └── StatusBadge.jsx  # Colored status pill
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── employee/
│   │   │   │   ├── EmployeeDashboard.jsx
│   │   │   │   ├── LeaveBalance.jsx
│   │   │   │   ├── ApplyLeave.jsx
│   │   │   │   └── MyRequests.jsx
│   │   │   └── manager/
│   │   │       ├── ManagerDashboard.jsx
│   │   │       ├── AllRequests.jsx
│   │   │       └── EmployeeBalances.jsx
│   │   ├── App.jsx              # Route definitions
│   │   ├── App.css              # Complete design system
│   │   ├── main.jsx             # Entry point
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js           # Dev proxy → Django backend
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **pip** and **npm** (come bundled with Python and Node.js)

### 1. Clone the Repository

```bash
git clone https://github.com/Rishabhkhadela/HR_Leave_Management.git
cd HR_Leave_Management
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed the database with demo data
python manage.py seed_data

# Start the backend server
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173/`.

> **Note:** The Vite dev server proxies all `/api/*` requests to the Django backend automatically.

---

## 🔑 Demo Credentials

| Role              | Username    | Password    |
|-------------------|-------------|-------------|
| **Employee**      | `employee1` | `pass1234`  |
| **Employee**      | `employee2` | `pass1234`  |
| **Manager**       | `manager1`  | `pass1234`  |
| **Admin (Django)** | `admin`    | `admin1234` |

---

## 📡 API Endpoints

### Authentication (`/api/auth/`)

| Method | Endpoint              | Description            | Access   |
|--------|-----------------------|------------------------|----------|
| POST   | `/api/auth/login/`    | Login & get JWT tokens | Public   |
| POST   | `/api/auth/token/refresh/` | Refresh access token | Public |
| GET    | `/api/auth/me/`       | Get current user profile | Authenticated |

### Leaves (`/api/leaves/`)

#### Employee Endpoints

| Method | Endpoint                       | Description                     |
|--------|--------------------------------|---------------------------------|
| GET    | `/api/leaves/balance/`         | View own leave balances         |
| POST   | `/api/leaves/apply/`           | Apply for a new leave           |
| GET    | `/api/leaves/my-requests/`     | View own leave requests         |
| PATCH  | `/api/leaves/cancel/<id>/`     | Cancel a pending/approved leave |

#### Manager Endpoints

| Method | Endpoint                           | Description                          |
|--------|------------------------------------|--------------------------------------|
| GET    | `/api/leaves/all-requests/`        | View all leave requests (filterable) |
| PATCH  | `/api/leaves/approve/<id>/`        | Approve a pending request            |
| PATCH  | `/api/leaves/reject/<id>/`         | Reject a request with reason         |
| GET    | `/api/leaves/employee-balances/`   | View all employee balances           |

---

## 🗃️ Database Models

### CustomUser
Extends Django's `AbstractUser` with a `role` field (`EMPLOYEE` / `MANAGER`).

### LeaveType
Defines available leave categories with annual day allocations.

| Field          | Type    | Description                |
|----------------|---------|----------------------------|
| `name`         | String  | e.g., Vacation Leave       |
| `days_per_year`| Integer | Annual allocation (e.g., 12)|

### LeaveBalance
Tracks per-employee, per-type leave usage for the current year.

| Field        | Type    | Description                     |
|--------------|---------|---------------------------------|
| `user`       | FK      | Employee reference              |
| `leave_type` | FK      | Leave type reference            |
| `total_days` | Integer | Allocated days                  |
| `used_days`  | Integer | Days consumed (approved leaves) |

### LeaveRequest
Individual leave applications submitted by employees.

| Field              | Type     | Description                          |
|--------------------|----------|--------------------------------------|
| `employee`         | FK       | Applicant                            |
| `leave_type`       | FK       | Type of leave                        |
| `start_date`       | Date     | Leave start                          |
| `end_date`         | Date     | Leave end (inclusive)                |
| `reason`           | Text     | Optional reason                      |
| `status`           | Choice   | PENDING / APPROVED / REJECTED / CANCELLED |
| `rejection_reason` | Text     | Filled by manager on rejection       |

---

## ⚙️ Business Rules & Validations

1. **No past dates** — Leave start date must be today or in the future
2. **Date ordering** — End date must be ≥ start date
3. **Overlap detection** — Cannot submit leave that overlaps existing pending/approved requests
4. **Balance check** — Cannot apply for more days than remaining balance
5. **Approve deducts balance** — On approval, `used_days` is incremented on the employee's balance
6. **Cancel restores balance** — Cancelling an approved leave restores the deducted days
7. **Status transitions** — Only pending requests can be approved or rejected
8. **Role enforcement** — Employee endpoints return 403 for managers and vice versa

---

## 🎨 Theme System

The app supports **dark mode** (default) and **light mode**:

- Toggle via the ☀️ / 🌙 button in the sidebar (or login page)
- Preference is saved to `localStorage`
- Falls back to the system color-scheme preference on first visit
- All colors are driven by CSS custom properties for instant switching

---

## 📦 Build for Production

```bash
cd frontend
npm run build
```

The optimized output is generated in `frontend/dist/`.

---

## 🧪 Running Tests

```bash
cd backend
python manage.py test
```

