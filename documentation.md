# University Project Documentation

## Table of Contents

1. [Introduction](#1-introduction)
2. [Project Overview](#2-project-overview)
3. [Project Features](#3-project-features)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Folder Structure](#6-folder-structure)
7. [Database Design](#7-database-design)
8. [Authentication & Security](#8-authentication--security)
9. [State Management](#9-state-management)
10. [Form Handling & Validation](#10-form-handling--validation)
11. [API Communication](#11-api-communication)
12. [Agile Software Development Life Cycle](#12-agile-software-development-life-cycle)
13. [Development Process](#13-development-process)
14. [Testing Strategy & Execution](#14-testing-strategy--execution)
15. [Challenges and Solutions](#15-challenges-and-solutions)
16. [Advantages of the Project](#16-advantages-of-the-project)
17. [Limitations](#17-limitations)
18. [Future Improvements](#18-future-improvements)
19. [Conclusion](#19-conclusion)
20. [Viva Preparation (30 Questions & Answers)](#20-viva-preparation-30-questions--answers)

---

# 1. Introduction

### Academic Context & Background
Educational institutions in the modern era face significant challenges in managing operational data efficiently. Manual record-keeping, fragmented spreadsheets, and legacy desktop software lead to data redundancy, security vulnerabilities, latency in record retrieval, and poor cross-departmental coordination. 

The **EduManager (University & School Management System)** was designed and implemented as a senior capstone project to address these inefficiencies. Built upon a high-performance web architecture, EduManager unifies administrative workflows—such as student registration, academic batch allocation, departmental hierarchy maintenance, faculty scheduling, and attendance logging—into a single web application.

### Problem Statement
Traditional administrative practices in educational institutes suffer from:
1. **Data Silos**: Information regarding students, teachers, and attendance is often stored across disparate systems or physical registers.
2. **Security & Privacy Risks**: Plaintext passwords, non-expiring credentials, and lack of role-based access control expose sensitive personal records to unauthorized personnel.
3. **High Operational Friction**: Administrative staff waste valuable hours cross-referencing paper logs or updating manually synchronized spreadsheets.
4. **Lack of Real-time Visibility**: Leadership lacks instant access to key performance indicators, such as 7-day attendance trends, gender distribution metrics, or active registry feeds.

### Project Objectives
- **Centralized Data Hub**: Build a unified database schema using MongoDB and Mongoose to model users, departments, batches, subjects, and attendance.
- **Robust Role-Based Security**: Secure all API routes and UI views using HTTP-only JSON Web Tokens (JWT), bcrypt password hashing, and Next.js Edge Middleware for Role-Based Access Control (RBAC).
- **Responsive UI/UX**: Provide an interface constructed with Next.js 16 App Router, React 19, Tailwind CSS v4, and Lucide React icons.
- **Optimized State Management**: Utilize Redux Toolkit and RTK Query to enable cache management, automatic tag invalidation, and seamless CRUD operations without page reloads.

---

# 2. Project Overview

### System Architecture & Workflow
EduManager follows a modern decoupled full-stack architecture powered by Next.js 16 App Router. The frontend UI layers communicate with serverless API Route Handlers, which interact with a MongoDB database via Mongoose ORM.

```
+-------------------------------------------------------------------------------+
|                                USER BROWSER                                   |
|   +-------------------+   +--------------------+   +-----------------------+  |
|   |  Login / UI Page  |   |  Redux RTK Query   |   |  React Hook Form/Zod  |  |
|   +---------+---------+   +---------+----------+   +-----------+-----------+  |
+-------------|-----------------------|--------------------------|--------------+
              |                       | HTTP Requests            |
              v                       v                          v
+-------------------------------------------------------------------------------+
|                       NEXT.JS 16 SERVER & EDGE RUNTIME                        |
|  +-------------------------------------------------------------------------+  |
|  | Middleware (Cookie Parsing, JWT RBAC Guard, Route Redirection)           |  |
|  +------------------------------------v------------------------------------+  |
|  | Next.js API Route Handlers (/api/auth, /api/students, /api/attendance) |  |
|  +------------------------------------v------------------------------------+  |
|  | Mongoose ORM Layer & Connection Pool Singleton (dbConnect.ts)           |  |
+---------------------------------------|---------------------------------------+
                                        | Mongoose Protocol
                                        v
+-------------------------------------------------------------------------------+
|                               MONGODB DATABASE                                |
|    Collections: Users, Departments, Batches, Teachers, Students, Attendance   |
+-------------------------------------------------------------------------------+
```

### End-to-End Operational Flow
1. **Authentication Stage**:
   - The user visits the login portal (`/login`).
   - Credentials are submitted through a React Hook Form validated with Zod schemas.
   - The API handler `/api/auth/login` checks the user email, compares the password hash with bcrypt, generates an HTTP-only `token` cookie containing claims (`userId`, `role`), and returns user metadata.
2. **Middleware Routing & RBAC Stage**:
   - Next.js Edge Middleware intercepts subsequent requests.
   - If the HTTP cookie is absent, unauthenticated users attempting to access protected routes (`/dashboard/*`) are redirected to `/login`.
   - If authenticated, the middleware parses the token payload and validates user permissions. `super_admin` receives complete bypass permissions across all administrative paths.
3. **Dashboard & State Hydration**:
   - Upon accessing `/dashboard`, RTK Query hooks (`useGetDashboardStatsQuery`, `useGetStudentsQuery`, etc.) fetch data from server routes.
   - Redux Toolkit stores cached data and triggers real-time UI updates upon mutation (add/edit/delete) via tag invalidation.
4. **Data Persistence**:
   - Mongoose schemas ensure data normalization, referential integrity, and cascading validation rules across MongoDB documents.

---

# 3. Project Features

### 1. User Authentication & Authorization
- **Purpose**: Authenticates users and enforces strict permission boundaries based on user roles (`super_admin`, `admin`, `teacher`, `student`, `parent`, `accountant`).
- **Frontend Implementation**: Built using React Hook Form and Zod validation schemas (`lib/validations/auth.ts`). Includes state handling via `authSlice.ts` and toast notifications via `Sonner`.
- **Backend Implementation**: `/api/auth/login`, `/api/auth/me`, and `/api/auth/logout`.
- **Database Interaction**: Queries the `User` collection, matching user credentials via bcrypt (`bcrypt.compare`).

### 2. Analytical Dashboard
- **Purpose**: Provides administrative staff with real-time institutional metrics.
- **Frontend Implementation**: `app/dashboard/page.tsx` integrated with `Recharts` for attendance area charts, stat card grids, and recent registry feeds.
- **Backend Implementation**: `/api/dashboard/stats` aggregates counts for students, teachers, departments, and batches.
- **Database Interaction**: Performs count aggregations across `Student`, `Teacher`, `Department`, `Batch`, `StudentAttendance`, and `TeacherAttendance` models.

### 3. Student Management
- **Purpose**: Manages student enrollments, roll allocations, profiles, and batch assignments.
- **Frontend Implementation**: Interactive modal forms, search filter bars, status badges, and datatables in `app/dashboard/students/page.tsx`.
- **Backend Implementation**: CRUD routes under `/api/students` (GET, POST, PUT, DELETE).
- **Database Interaction**: Interacts with `Student` and `User` models, populating relational references to `Batch`.

### 4. Department Management
- **Purpose**: Models organizational department structure (e.g., Computer Science, Electrical Engineering).
- **Frontend Implementation**: Department management views (`app/dashboard/departments/page.tsx`) with code triggers and modal dialogs.
- **Backend Implementation**: CRUD endpoints under `/api/departments`.
- **Database Interaction**: Mutates the `Department` Mongoose model.

### 5. Academic Batch Management
- **Purpose**: Manages academic batches, class shifts (Day/Evening), and room allocations.
- **Frontend Implementation**: `app/dashboard/batches/page.tsx` utilizing RTK Query mutations (`useAddBatchMutation`, `useUpdateBatchMutation`, `useDeleteBatchMutation`).
- **Backend Implementation**: `/api/batches` handling search queries and body payloads.
- **Database Interaction**: Maintains documents in the `Batch` model.

### 6. Teacher Management
- **Purpose**: Manages faculty records, employee IDs, department assignments, and subject mappings.
- **Frontend Implementation**: Faculty datatables in `app/dashboard/teachers/page.tsx`.
- **Backend Implementation**: `/api/teachers` handling profile creation and User model linkage.
- **Database Interaction**: Updates `Teacher` and `User` collections, referencing `Department` and `Subject` ObjectIDs.

### 7. Subject & Course Management
- **Purpose**: Maps academic curriculum subjects to assigned teachers and batches.
- **Frontend Implementation**: Subject grid views and forms (`app/dashboard/subjects/page.tsx`).
- **Backend Implementation**: `/api/subjects` endpoints.
- **Database Interaction**: Connects `Subject` model to `Batch` and `User` (Teacher).

### 8. Student Attendance Tracking
- **Purpose**: Logs daily attendance (Present, Absent, Late) for enrolled students.
- **Frontend Implementation**: Attendance marking portal in `app/dashboard/attendance/students/page.tsx`.
- **Backend Implementation**: `/api/attendance/students` supporting date filtering and bulk logging.
- **Database Interaction**: Inserts daily records into `StudentAttendance` model.

### 9. Faculty Attendance Tracking
- **Purpose**: Logs daily attendance logs for faculty members.
- **Frontend Implementation**: Attendance grid in `app/dashboard/attendance/teachers/page.tsx`.
- **Backend Implementation**: `/api/attendance/teachers`.
- **Database Interaction**: Persists logs in `TeacherAttendance` model.

---

# 4. Technology Stack

### Technology Comparison Table

| Technology | Version | Purpose | Why Selected |
| :--- | :--- | :--- | :--- |
| **Next.js** | `16.2.10` | Full-stack Framework & App Router | Provides server-side rendering, API route handlers, and Edge Middleware. |
| **React** | `19.2.4` | UI Library | Offers component-based state rendering and concurrent features. |
| **TypeScript** | `^5.0.0` | Type System | Provides compile-time type safety and code autocompletion. |
| **MongoDB** | `N/A` | NoSQL Database | Document model allows dynamic schema growth and rapid JSON mapping. |
| **Mongoose** | `^9.7.4` | Object Data Modeling (ODM) | Enforces schema validation, hooks, and relational populating. |
| **Redux Toolkit** | `^2.12.0` | Global State & RTK Query | Simplifies state management and auto-manages API caching via tag invalidation. |
| **React Redux** | `^9.3.0` | Redux React Bindings | Connects the Redux store seamlessly to React component hooks. |
| **React Hook Form** | `^7.81.0` | Form State Management | Reduces re-renders by using uncontrolled inputs and ref subscriptions. |
| **Zod** | `^4.4.3` | Schema Validation | Provides strict runtime type validation for API bodies and forms. |
| **jsonwebtoken** | `^9.0.3` | Security Tokens | Enables stateless authentication via HTTP-only signed cookies. |
| **bcrypt** | `^6.0.0` | Password Hashing | Slow hashing algorithm (salted bcrypt) prevents rainbow table attacks. |
| **Tailwind CSS** | `^4.0.0` | Styling Engine | Utility-first CSS framework for rapid styling without leaving TSX. |
| **Recharts** | `^3.9.2` | Data Visualization | Renders dynamic SVG charts for real-time dashboard analytics. |
| **Sonner** | `^2.0.7` | Toast Notifications | Modern, lightweight toast notification library for user feedback. |
| **Lucide React** | `^1.24.0` | Iconography | High-quality SVG icon set for navigation and status indicators. |
| **clsx & tailwind-merge**| `^2.1.1` | Class Utilities | Merges Tailwind class strings conditionally without style conflicts. |

### Technology Breakdown

#### Next.js 16 (App Router)
Next.js 16 serves as the core framework for both the frontend user interface and the serverless backend API. Utilizing the App Router paradigm, file-system routing allows for clean separation between client layouts (`app/dashboard/layout.tsx`), API endpoints (`app/api/*`), and public auth views (`app/(auth)/*`). Server-side rendering (SSR) enhances initial load performance, while Edge Middleware executes light authentication checks before request fulfillment.

#### React 19
React 19 provides the declarative component framework for rendering UI state. Its virtual DOM diffing engine ensures smooth interface updates when manipulating datatables, filtering student lists, or submitting attendance registers.

#### TypeScript 5
TypeScript brings strict compile-time type checking across the entire project repository. Interfaces and type aliases defined in models and API services eliminate `undefined` runtime errors, ensure accurate prop passing, and provide intelligent IDE autocompletion.

#### MongoDB & Mongoose
MongoDB was chosen for its document-oriented structure, aligning naturally with JSON API responses. Mongoose ORM builds on top of MongoDB by providing strongly-typed schemas, default values, pre-save middleware hooks (such as automatic bcrypt password hashing in the User model), and population helpers to emulate relational joins across collections.

#### Redux Toolkit & RTK Query
Redux Toolkit manages central application state. RTK Query (`services/api.ts`, `features/erp/erpApi.ts`) abstracts raw `fetch` calls by introducing declarative hooks (`useGetStudentsQuery`, `useAddStudentMutation`). It implements tag-based caching (`providesTags`, `invalidatesTags`), ensuring that creating or deleting a record automatically triggers background re-fetching for dependent datatables.

#### React Hook Form & Zod
React Hook Form simplifies form management by subscribing to input refs directly rather than triggering re-renders on every keystroke. Coupled with Zod schema validation (`@hookform/resolvers/zod`), form inputs (such as login credentials or student creation forms) are validated on the client side before hitting the server.

#### Security Libraries (jsonwebtoken & bcrypt)
`jsonwebtoken` signs user payload claims into encrypted JWT tokens stored in HTTP-only browser cookies, mitigating Cross-Site Scripting (XSS) risks. `bcrypt` salts and hashes passwords before storage, ensuring that credentials cannot be reverse-engineered even if database access is compromised.

---

# 5. System Architecture

### Architectural Overview
EduManager implements a 3-Tier Layered Architecture:
1. **Presentation Layer (Frontend)**: React 19 views styled with Tailwind CSS v4, managed by Redux Toolkit state stores and React Hook Form validation.
2. **Application & Business Logic Layer (Middleware & API Routes)**: Next.js 16 Edge Middleware executing RBAC route protection, alongside serverless Node.js Route Handlers handling controller logic and data transformations.
3. **Data Persistence Layer (Database)**: Mongoose ODM maintaining active connection pools to MongoDB collections.

### High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                PRESENTATION LAYER                                 |
|                                                                                   |
|  +-------------------------+   +------------------------+   +------------------+  |
|  |  Dashboard / UI Views   |   |   Redux RTK Store      |   |  Recharts Charts |  |
|  |  (Next.js App Router)   |   | (Cache & Tag Revalidate) |   |  & Toast Logs    |  |
|  +------------+------------+   +-----------+------------+   +--------+---------+  |
+---------------|----------------------------|-------------------------|------------+
                |                            |                         |
                +--------------------+-------+-------------------------+
                                     | HTTP REST Requests
                                     v
+-----------------------------------------------------------------------------------+
|                             APPLICATION ROUTE LAYER                               |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   | Edge Middleware Guard (Cookie Verification, Role-Based Route Validation)  |   |
|   +------------------------------------+--------------------------------------+   |
|                                        | Next-Hop Route Execution                 |
|   +------------------------------------v--------------------------------------+   |
|   | Serverless API Route Handlers (/api/auth, /api/students, /api/teachers)   |   |
|   +------------------------------------+--------------------------------------+   |
|                                        | Request Validation & Controllers     |
|   +------------------------------------v--------------------------------------+   |
|   | Zod Schemas & JWT Verification Helper (lib/jwt.ts & lib/validations)      |   |
|   +------------------------------------+--------------------------------------+   |
+----------------------------------------|------------------------------------------+
                                         | Mongoose Queries
                                         v
+-----------------------------------------------------------------------------------+
|                              DATA PERSISTENCE LAYER                               |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   | Mongoose Connection Manager (dbConnect Singleton with Memory Server Fallback) |   |
|   +------------------------------------+--------------------------------------+   |
|                                        | Document Protocol                        |
|   +------------------------------------v--------------------------------------+   |
|   | MongoDB Database (Collections: Users, Departments, Batches, Students...)  |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

# 6. Folder Structure

Below is an analysis of the repository layout:

```
vercity-project/
├── app/                        # Next.js 16 App Router Directory
│   ├── (auth)/                 # Authentication Group Routes
│   │   ├── login/              # Login Portal View
│   │   ├── forgot-password/    # Password Recovery Portal
│   │   └── reset-password/     # Password Reset Portal
│   ├── api/                    # Serverless REST API Endpoints
│   │   ├── attendance/         # Student & Teacher Attendance Endpoints
│   │   ├── auth/               # Login, Logout, Me Handlers
│   │   ├── batches/            # Academic Batch CRUD Endpoints
│   │   ├── dashboard/          # Aggregation Metrics Endpoint
│   │   ├── departments/        # Department Management Endpoints
│   │   ├── students/           # Student Management Endpoints
│   │   ├── subjects/           # Academic Subject Endpoints
│   │   └── teachers/           # Faculty Management Endpoints
│   ├── dashboard/              # Protected Administrative Dashboard Pages
│   │   ├── attendance/         # Attendance Register Views
│   │   ├── batches/            # Batch Management View
│   │   ├── departments/        # Department Management View
│   │   ├── students/           # Student Management View
│   │   ├── subjects/           # Subject Management View
│   │   └── teachers/           # Teacher Management View
│   ├── globals.css             # Global Tailwind CSS Styles
│   ├── layout.tsx              # Root Layout Wrapper with Redux Provider
│   ├── page.tsx                # Root Index Route (Redirects to /dashboard or /login)
│   └── unauthorized/           # 403 Forbidden Error View
├── components/                 # Global UI Components
│   ├── Providers.tsx           # Redux Store Provider Wrapper
│   └── ui/                     # Reusable Atomic UI Primitives
├── features/                   # Feature-based Redux RTK Slices & APIs
│   ├── auth/                   # Auth Slices & Auth API Endpoints
│   ├── dashboard/              # Dashboard Metric API Hooks
│   └── erp/                    # Core ERP Module RTK Query Endpoints (erpApi.ts)
├── hooks/                      # Custom React Hooks
├── lib/                        # Core Utilities & Configurations
│   ├── dbConnect.ts            # Mongoose Connection Pool Manager
│   ├── dbSeed.ts               # Manual Database Seed Generator
│   ├── jwt.ts                  # JWT Signing & Verification Utilities
│   └── validations/            # Zod Validation Schemas
├── models/                     # Mongoose Schema Definitions
│   ├── Batch.ts                # Batch & Shift Model
│   ├── Department.ts           # Department Model
│   ├── Parent.ts               # Parent Profile Model
│   ├── Student.ts              # Student Profile Model
│   ├── StudentAttendance.ts    # Student Attendance Log Model
│   ├── Subject.ts              # Subject Model
│   ├── Teacher.ts              # Faculty Profile Model
│   ├── TeacherAttendance.ts    # Teacher Attendance Log Model
│   └── User.ts                 # Base User & Authentication Model
├── scripts/                    # Command-line Scripts
│   └── seed.ts                 # Standalone Manual Seeding Script (`npm run seed`)
├── services/                   # Global Redux Store Setup
│   ├── api.ts                  # Central RTK Query Base API Definition
│   └── store.ts                # Redux Store Configuration
├── middleware.ts               # Next.js Edge Middleware for Security & RBAC
├── next.config.ts              # Next.js Framework Configuration
├── package.json                # Project Dependencies and NPM Scripts
└── tsconfig.json               # TypeScript Compiler Configuration
```

---

# 7. Database Design

The database schema utilizes 9 Mongoose models to represent entities and their relationships.

### 1. User Model (`models/User.ts`)
- **Purpose**: Base authentication entity for all user roles.
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `name`: String (Required)
  - `email`: String (Required, Unique, Indexed)
  - `password`: String (Required, Hashed via bcrypt)
  - `role`: String (Enum: `super_admin`, `admin`, `teacher`, `student`, `parent`, `accountant`; Default: `student`)
  - `status`: String (Enum: `active`, `inactive`; Default: `active`)
  - `timestamps`: CreatedAt, UpdatedAt

### 2. Department Model (`models/Department.ts`)
- **Purpose**: Academic departments.
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `name`: String (Required, Unique)
  - `code`: String (Required, Unique, e.g., 'CS', 'EE')
  - `description`: String

### 3. Batch Model (`models/Batch.ts`)
- **Purpose**: Academic class cohorts/batches.
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `name`: String (Required, e.g., 'Batch 1')
  - `shift`: String (Enum: `Day`, `Evening`)
  - `roomNo`: String

### 4. Teacher Model (`models/Teacher.ts`)
- **Purpose**: Extends faculty profile details.
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `user`: ObjectId (Ref: `User`, Required, Unique)
  - `employeeId`: String (Required, Unique)
  - `phone`: String
  - `department`: ObjectId (Ref: `Department`)
  - `assignedSubjects`: Array of ObjectIds (Ref: `Subject`)
  - `status`: String (Enum: `active`, `inactive`)

### 5. Student Model (`models/Student.ts`)
- **Purpose**: Extends student profile details.
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `user`: ObjectId (Ref: `User`, Required, Unique)
  - `studentId`: String (Required, Unique)
  - `roll`: Number (Required)
  - `phone`: String
  - `gender`: String (Enum: `male`, `female`, `other`)
  - `dateOfBirth`: Date
  - `batch`: ObjectId (Ref: `Batch`, Required)
  - `status`: String (Enum: `active`, `inactive`)

### 6. Subject Model (`models/Subject.ts`)
- **Purpose**: Represents academic subjects/courses.
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `name`: String (Required)
  - `code`: String (Required, Unique)
  - `assignedBatch`: ObjectId (Ref: `Batch`)
  - `assignedTeacher`: ObjectId (Ref: `User`)
  - `status`: String (Enum: `active`, `inactive`)

### 7. StudentAttendance Model (`models/StudentAttendance.ts`)
- **Purpose**: Logs daily student attendance.
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `student`: ObjectId (Ref: `Student`, Required)
  - `batch`: ObjectId (Ref: `Batch`, Required)
  - `date`: Date (Required)
  - `status`: String (Enum: `Present`, `Absent`, `Late`, Required)

### 8. TeacherAttendance Model (`models/TeacherAttendance.ts`)
- **Purpose**: Logs daily faculty attendance.
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `teacher`: ObjectId (Ref: `Teacher`, Required)
  - `date`: Date (Required)
  - `status`: String (Enum: `Present`, `Absent`, `Late`, Required)

### 9. Parent Model (`models/Parent.ts`)
- **Purpose**: Parent profile associated with students.
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `user`: ObjectId (Ref: `User`, Required, Unique)
  - `student`: ObjectId (Ref: `Student`, Required)
  - `phone`: String
  - `occupation`: String

### Entity-Relationship (ER) Overview
- **User (1) ── (1) Student**: One-to-One extending authentication to student profile.
- **User (1) ── (1) Teacher**: One-to-One extending authentication to teacher profile.
- **Department (1) ── (N) Teacher**: One-to-Many assigning teachers to departments.
- **Batch (1) ── (N) Student**: One-to-Many grouping students inside cohorts.
- **Batch (1) ── (N) Subject**: One-to-Many assigning subjects to batches.
- **Student (1) ── (N) StudentAttendance**: One-to-Many tracking student logs.
- **Teacher (1) ── (N) TeacherAttendance**: One-to-Many tracking faculty logs.

---

# 8. Authentication & Security

### Authentication Architecture
EduManager employs JWT-based authentication combined with HTTP-only cookies and bcrypt hashing.

```
[ User Form Submit ] ===> POST /api/auth/login ===> [ Find User in MongoDB ]
                                                              ||
[ Set HTTP-Only Cookie ] <=== [ Sign JWT Token ] <=== [ bcrypt.compare() Match ]
```

### Security Measures

#### 1. Password Hashing (`bcrypt`)
- Before saving a user model to MongoDB, passwords are automatically hashed using `bcrypt.hash` with a salt round factor of 10.
- During authentication, `bcrypt.compare` verifies the submitted plaintext password against the stored hash without ever storing or revealing the password in plaintext.

#### 2. JSON Web Token (JWT) Generation & Storage
- Upon successful validation, a JWT token is signed using `jsonwebtoken` with the user's ID, email, and role.
- The signed token is attached to the HTTP response header as an `HttpOnly`, `SameSite=Lax` cookie (`token`). This prevents malicious client-side JavaScript scripts from reading the token via `document.cookie` (mitigating XSS attacks).

#### 3. Protection via Next.js Middleware (`middleware.ts`)
- Every incoming request to protected dashboard routes (`/dashboard/*`) passes through Edge Middleware.
- The middleware checks for the `token` cookie. If missing, it immediately issues a `307 Temporary Redirect` to `/login?redirect=...`.
- If present, it parses token payload claims and verifies role privileges. Users attempting to access forbidden routes are directed to `/unauthorized`.

---

# 9. State Management

### Redux Toolkit & RTK Query Architecture
Global state management is driven by **Redux Toolkit (RTK)** and **RTK Query** (`services/store.ts`, `services/api.ts`).

```
+-----------------------------------------------------------------------+
|                           REDUX STORE                                 |
|                                                                       |
|  +--------------------------+        +-----------------------------+  |
|  | authSlice                |        | RTK Query Base Api ('api')  |  |
|  | (User Session & Cookie)  |        | Cache Tags: Student, Batch  |  |
|  +--------------------------+        +-----------------------------+  |
+-----------------------------------------------------------------------+
```

### Why RTK Query over Traditional Redux
1. **Zero Boilerplate**: Avoids writing hand-crafted action types, creators, and switch-case reducers for basic API calls.
2. **Automatic Tag Invalidation**: When a mutation is executed (e.g., `useAddStudentMutation`), RTK Query invalidates the `'Student'` tag, prompting all active UI components using `useGetStudentsQuery` to re-fetch fresh data transparently.
3. **Built-in Caching & Deduplication**: Prevents duplicate HTTP requests across simultaneous component renders.

---

# 10. Form Handling & Validation

### React Hook Form & Zod Integration
Form interactions across EduManager use `React Hook Form` tied to `Zod` schemas via `@hookform/resolvers/zod`.

### Validation Workflow
1. **Schema Definition (`lib/validations/auth.ts`)**:
   ```typescript
   export const loginSchema = zod.object({
     email: zod.string().email('Invalid email address'),
     password: zod.string().min(6, 'Password must be at least 6 characters'),
   });
   ```
2. **Form Hook Binding**:
   `useForm({ resolver: zodResolver(loginSchema) })` automatically intercepts submit events. If inputs violate Zod constraints, error states are rendered without initiating network calls.
3. **Server Validation Safeguard**:
   API route handlers execute server-side Zod validation (`schema.safeParse(body)`), returning structured JSON errors (`400 Bad Request`) if client payload tampering occurs.

---

# 11. API Communication

The table below documents major API endpoints:

| Endpoint Route | HTTP Method | Purpose | Request Body / Query | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Authenticate user & set JWT cookie | `{ email, password }` | `{ success: true, user }` |
| `/api/auth/me` | `GET` | Retrieve current authenticated user profile | Header Cookie | `{ user }` |
| `/api/auth/logout` | `POST` | Clear auth cookie | None | `{ success: true }` |
| `/api/dashboard/stats` | `GET` | Retrieve system summary counts | None | `{ students, teachers, depts, batches, attendanceHistory }` |
| `/api/students` | `GET` | Fetch all student profiles | Query: `?batch=...` | `[ Student ]` |
| `/api/students` | `POST` | Register a new student | `{ name, email, roll, batch, ... }` | `{ success: true, student }` |
| `/api/students` | `PUT` | Update student record | Query: `?id=...`, Body: `{ ... }` | `{ success: true, student }` |
| `/api/students` | `DELETE` | Delete a student profile | Query: `?id=...` | `{ success: true }` |
| `/api/teachers` | `GET` | Fetch all teacher profiles | None | `[ Teacher ]` |
| `/api/teachers` | `POST` | Create teacher profile | `{ name, email, employeeId, department, ... }` | `{ success: true, teacher }` |
| `/api/batches` | `GET` | Fetch academic cohorts | None | `[ Batch ]` |
| `/api/batches` | `POST` | Create academic cohort | `{ name, shift, roomNo }` | `{ success: true, batch }` |
| `/api/departments` | `GET` | Fetch academic departments | None | `[ Department ]` |
| `/api/subjects` | `GET` | Fetch subjects | None | `[ Subject ]` |
| `/api/attendance/students`| `GET` / `POST` | Fetch or mark student attendance | `{ student, batch, date, status }` | `{ success: true }` |
| `/api/attendance/teachers`| `GET` / `POST` | Fetch or mark teacher attendance | `{ teacher, date, status }` | `{ success: true }` |

---

# 12. Agile Software Development Life Cycle

### What is Agile?
Agile is an iterative software development methodology that prioritizes continuous delivery, flexible adaptation to changing requirements, cross-functional team collaboration, and early value generation.

### Why Agile was Chosen for this Project
1. **Iterative Refinement**: Allowed incremental releases of core modules (e.g., shipping Authentication first, followed by Student Management, then Attendance Tracking).
2. **Risk Mitigation**: Regular sprint reviews made it possible to identify architectural bottlenecks—such as database connection pooling issues or schema collisions—early in the development cycle.
3. **Alignment with University Project Timelines**: Fits typical university capstone milestones, enabling structured advisor feedback at the end of each sprint.

### Sprint Breakdown

```
  +-----------------+      +-----------------+      +-----------------+      +-----------------+      +-----------------+
  |    SPRINT 1     |      |    SPRINT 2     |      |    SPRINT 3     |      |    SPRINT 4     |      |    SPRINT 5     |
  |  Setup & Schema | ===> | Auth & Security | ===> |   Core Modules  | ===> | Charts & RTK Q. | ===> | Polish & Deploy |
  +-----------------+      +-----------------+      +-----------------+      +-----------------+      +-----------------+
```

#### Sprint 1: Project Initiation & Setup
- Formulated requirements and system specifications.
- Initialized Next.js 16 App Router workspace with TypeScript 5, Tailwind CSS v4, and ESLint.
- Designed database ER diagram and defined base Mongoose models (`User`, `Department`, `Batch`).

#### Sprint 2: Authentication & Security Infrastructure
- Implemented `bcrypt` password hashing pre-save hooks on the User model.
- Created `/api/auth/login` endpoint and JWT cookie generation logic (`lib/jwt.ts`).
- Built Edge Middleware (`middleware.ts`) for RBAC route protection.
- Developed the login UI (`app/(auth)/login/page.tsx`).

#### Sprint 3: Core Academic & ERP Modules
- Implemented CRUD API route handlers for `/api/students`, `/api/teachers`, `/api/departments`, and `/api/batches`.
- Created interactive datatables and modal forms for student and teacher records.
- Implemented population references across Mongoose models.

#### Sprint 4: Attendance, Analytics & State Optimization
- Developed `/api/attendance/students` and `/api/attendance/teachers` endpoints.
- Integrated `Redux Toolkit` and `RTK Query` tag invalidation (`features/erp/erpApi.ts`).
- Constructed analytics dashboard featuring `Recharts` graphs and statistical counters.

#### Sprint 5: Refinement, Verification & Manual Seeder
- Implemented manual database seeder (`scripts/seed.ts`).
- Conducted full-stack testing (build verification, API route testing, authentication guards).
- Compiled production build and finalized university documentation.

### Agile vs. Waterfall Comparison

| Characteristic | Agile Methodology (Used) | Traditional Waterfall Model |
| :--- | :--- | :--- |
| **Development Style** | Iterative & Incremental | Sequential / Linear |
| **Flexibility** | High (Adaptable to requirement changes) | Low (Changes are costly once phase completes) |
| **Risk Management** | Continuous verification during each Sprint | High risk (Testing occurs late in cycle) |
| **Delivery** | Functional modules delivered continuously | Final product delivered at project end |

---

# 13. Development Process

The system was engineered across 10 chronological phases:
1. **Requirements Analysis**: Detailed module scope and user persona definition.
2. **Technology Selection**: Selected Next.js 16, React 19, TypeScript, Mongoose, and Redux Toolkit.
3. **Database Schema Modeling**: Engineered Mongoose schemas for collections in `models/`.
4. **UI Wireframing & Design System**: Established color tokens and global styles in `app/globals.css`.
5. **Authentication Engine**: Built JWT signing, bcrypt hashing, and Edge Middleware guards.
6. **Backend Controller Development**: Implemented serverless API Route Handlers under `app/api/`.
7. **Frontend Component Assembly**: Built interactive dashboard pages under `app/dashboard/`.
8. **State Management Integration**: Configured Redux RTK Query slices in `features/` and `services/`.
9. **Verification & Testing**: Validated form constraints, API error codes, and production builds.
10. **Documentation & Deployment Setup**: Created university documentation and manual seeding scripts.

---

# 14. Testing Strategy & Execution

### 1. Functional Testing
- Verified that form submissions (Student Creation, Batch Addition) successfully update MongoDB collections and trigger RTK Query tag invalidations to refresh data table views instantly.

### 2. Form Validation Testing
- Tested invalid email formats and short passwords on login forms. Verified that Zod schemas intercept bad input and render inline error messages without sending network requests.

### 3. API Route Testing
- Submitted missing request body fields to `/api/students` and `/api/batches`. Verified that API handlers return `400 Bad Request` with descriptive JSON error objects.

### 4. Authentication & RBAC Guard Testing
- Attempted to access protected route `/dashboard` without an active cookie. Verified that Edge Middleware intercepts the request and performs a HTTP 307 redirect to `/login`.

### 5. Production Build Verification
- Executed `npm run build` to confirm zero TypeScript compilation or ESLint errors across the codebase.

---

# 15. Challenges and Solutions

### 1. Database Connection Exhaustion in Development
- **Challenge**: Next.js hot-module replacement (HMR) re-instantiates Node modules, creating duplicate MongoDB connection instances and causing connection pool exhaustion.
- **Solution**: Implemented a global cached connection singleton in `lib/dbConnect.ts` using `global.mongoose`, ensuring a single persistent connection across reloads.

### 2. Automatic Seeding Conflicts on Project Startup
- **Challenge**: The database auto-seeded default data on every server start, overwriting customized records.
- **Solution**: Extracted seeding logic into an isolated standalone script (`scripts/seed.ts`), invokable explicitly via `npm run seed`.

### 3. Name Collisions in Random Mock Seeder
- **Challenge**: Seed script failed with `E11000 duplicate key error` on `user_1` index due to randomized mock name collisions generating duplicate email addresses.
- **Solution**: Updated `lib/dbSeed.ts` to append unique identifier strings (`empId` and `stdId`) to generated email addresses.

---

# 16. Advantages of the Project

1. **High Performance**: Next.js 16 serverless route handlers and React 19 ensure quick page loads.
2. **Stateless Security**: HTTP-only JWT cookies eliminate session storage vulnerabilities while supporting scalable stateless auth.
3. **Type Safety**: End-to-end TypeScript interfaces prevent runtime errors across client components, Redux state, and database models.
4. **Automated State Synchronization**: RTK Query tag invalidations eliminate manual data re-fetching.
5. **Modern Aesthetic**: Styled with Tailwind CSS v4 and Lucide React icons for a responsive, premium user interface.

---

# 17. Limitations

1. **No Native Mobile App**: Currently accessible via mobile web browsers, but lacks native iOS/Android binary builds.
2. **Third-Party Payment Gateway**: Fee management currently models offline status without direct Stripe/SSLCommerz API integration.

---

# 18. Future Improvements

1. **Automated Email & SMS Notifications**: Integrate Nodemailer or Twilio for attendance alerts sent to parents.
2. **Role-Based Fine-Grained Permissions Matrix**: Build a dynamic UI editor for custom permission toggles per sub-role.
3. **AI-Powered Predictive Analytics**: Integrate machine learning models to forecast student performance and identify at-risk dropouts.
4. **Cloud Media Storage**: Connect Amazon S3 or Cloudinary for profile picture uploads.

---

# 19. Conclusion

The **EduManager (University & School Management System)** successfully fulfills all architectural and functional goals set forth for this senior capstone project. By integrating Next.js 16 App Router, React 19, TypeScript, Mongoose/MongoDB, and Redux Toolkit, the project demonstrates a modern, scalable full-stack web application. The implementation of role-based security via Edge Middleware and HTTP-only JWT cookies guarantees data protection, while an Agile software development methodology ensured structured delivery. EduManager serves as a production-ready solution for managing modern academic institutions.

---

# 20. Viva Preparation (30 Questions & Answers)

### Q1: What is the main objective of your project?
**Answer**: To build a secure, high-performance, unified web-based management system (EduManager) that automates administrative academic operations—including user authentication, department structuring, batch allocation, student/faculty profiling, and attendance tracking.

### Q2: Why did you choose Next.js 16 instead of standalone React (Vite/CRA)?
**Answer**: Next.js 16 provides an all-in-one full-stack framework with built-in API Route Handlers, Edge Middleware for security, server-side rendering (SSR), optimized bundle sizes, and file-system-based routing via the App Router, eliminating the need for a separate Express.js server.

### Q3: How does authentication work in this application?
**Answer**: Authentication is handled statelessly. Upon login (`/api/auth/login`), credentials are verified via bcrypt. If valid, a signed JSON Web Token (JWT) is embedded inside an HTTP-Only cookie. Next.js Edge Middleware intercepts subsequent requests to validate token claims and enforce role-based access control.

### Q4: Why are passwords hashed with bcrypt instead of MD5 or SHA256?
**Answer**: MD5 and SHA256 are fast cryptographic hash functions vulnerable to rainbow table lookups and brute-force GPU attacks. `bcrypt` incorporates a configurable salt factor and is intentionally slow, making dictionary and brute-force attacks computationally infeasible.

### Q5: What is the purpose of `dbConnect.ts`?
**Answer**: `dbConnect.ts` implements a Mongoose connection pooling singleton. In serverless environments like Next.js, hot-module reloads can spawn multiple database connections. `dbConnect.ts` caches the active Mongoose instance globally (`global.mongoose`) to prevent connection pool exhaustion.

### Q6: What is the role of Next.js Edge Middleware (`middleware.ts`)?
**Answer**: Edge Middleware executes light security checks at the edge before a request reaches page renderers or API handlers. It parses the HTTP-only JWT cookie, checks if the user is authenticated, and validates role permissions (`super_admin`, `admin`, etc.), redirecting unauthorized users to `/login` or `/unauthorized`.

### Q7: Why did you select MongoDB over a relational database like MySQL or PostgreSQL?
**Answer**: MongoDB’s document-oriented NoSQL architecture pairs naturally with JSON objects used in JavaScript/TypeScript full-stack applications. It provides schema flexibility, rapid prototyping, easy document nesting, and high horizontal read/write scalability.

### Q8: What is Mongoose and why is it used?
**Answer**: Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides strongly-typed schema enforcement, built-in validation rules, pre/post middleware hooks, and document population capabilities.

### Q9: How does Redux Toolkit (RTK) Query streamline state management?
**Answer**: RTK Query handles data fetching and caching automatically. By defining API endpoints with cache tags (e.g., `'Student'`), RTK Query provides auto-generated React hooks (`useGetStudentsQuery`, `useAddStudentMutation`) and automatically re-fetches cached data when invalidating tags upon mutation.

### Q10: What is the difference between Redux Toolkit and traditional Redux?
**Answer**: Redux Toolkit eliminates traditional Redux boilerplate (such as explicit action types, action creators, and immutable spread operations) by using `createSlice` (powered by Immer) and `configureStore` with sensible default middleware like Redux Thunk and serializability checks.

### Q11: Why use React Hook Form instead of standard React controlled inputs (`useState`)?
**Answer**: Standard controlled inputs trigger a re-render of the component tree on every keystroke. React Hook Form utilizes uncontrolled inputs registered via refs, minimizing re-renders and boosting form performance significantly.

### Q12: What is Zod and how is it used alongside React Hook Form?
**Answer**: Zod is a TypeScript-first schema declaration and validation library. Using `@hookform/resolvers/zod`, Zod schemas validate form input fields client-side before submission and validate API request bodies server-side.

### Q13: How does your system handle Role-Based Access Control (RBAC)?
**Answer**: Users have a `role` property in their MongoDB document (`super_admin`, `admin`, `teacher`, `student`, `parent`, `accountant`). This claim is baked into the signed JWT token. `middleware.ts` reads the payload and grants route access accordingly, with `super_admin` having full system access.

### Q14: Explain the Agile SDLC model applied in this project.
**Answer**: The project was developed iteratively across 5 distinct Sprints: Sprint 1 (Setup & Schema), Sprint 2 (Auth & Security), Sprint 3 (Core ERP CRUD), Sprint 4 (Attendance & Charts), and Sprint 5 (Refinement & Manual Seeder). This allowed continuous verification and incremental delivery.

### Q15: Why is Agile preferred over the Waterfall model for this project?
**Answer**: Waterfall requires rigid requirements up front and delays testing until the end. Agile enables incremental feature delivery, continuous integration, flexibility to adapt to changing requirements, and regular review at the end of each sprint.

### Q16: How do you seed data in this project?
**Answer**: Seeding is triggered manually using `npm run seed` (which calls `scripts/seed.ts`). This connects to MongoDB and executes `seedDemoData()` from `lib/dbSeed.ts`, seeding super admins, departments, batches, teachers, subjects, students, and 30-day attendance logs without auto-running on server start.

### Q17: What are HTTP-Only Cookies and why are they safer than LocalStorage for storing JWTs?
**Answer**: Tokens stored in `localStorage` can be read by any client-side JavaScript executing on the page, leaving them vulnerable to Cross-Site Scripting (XSS). `HttpOnly` cookies cannot be accessed via JavaScript APIs, protecting the JWT from script-based theft.

### Q18: What is the purpose of `tailwind-merge` and `clsx`?
**Answer**: `clsx` allows constructing conditional class strings, while `tailwind-merge` merges conflicting Tailwind CSS utility classes (e.g., overriding `px-2` with `px-4`) cleanly without specificity bugs.

### Q19: Explain the relationship between `User`, `Student`, and `Teacher` models.
**Answer**: The `User` model holds baseline credentials (`email`, `password`, `role`). `Student` and `Teacher` models have a 1-to-1 relationship with `User` via a `user` ObjectId reference, storing entity-specific profile data (such as `roll` or `employeeId`).

### Q20: How does Recharts render visualization data?
**Answer**: `Recharts` is a React charting library built on top of SVG elements. It takes JSON array data (such as 7-day attendance counts) and dynamically renders responsive Area, Bar, or Line charts inside React components.

### Q21: What happens if an unauthenticated user tries to navigate directly to `/dashboard/students`?
**Answer**: Next.js Edge Middleware intercepts the request, detects the missing `token` cookie, and issues a 307 redirect sending the user to `/login?redirect=/dashboard/students`.

### Q22: What does Mongoose's `.populate()` method do?
**Answer**: `.populate()` performs a reference lookup across collections (similar to a SQL JOIN), replacing a referenced ObjectId in a document with the actual matching document from the foreign collection.

### Q23: How do you prevent SQL/NoSQL Injection in your application?
**Answer**: Mongoose schemas enforce strict field typing and structure. Additionally, Zod schema validation strips unexpected fields and sanitizes incoming user input before queries execute.

### Q24: What is Server-Side Rendering (SSR) in Next.js 16?
**Answer**: SSR generates the HTML markup for a page on the server for each request before sending it to the client browser, improving SEO, initial load speed, and social media preview rendering.

### Q25: What is the difference between client components and server components in Next.js?
**Answer**: Server Components render exclusively on the server, sending zero JS to the client bundle. Client Components (marked with `'use client'`) hydrate on the browser to handle interactive events (`onClick`, `onChange`, React hooks).

### Q26: How do you handle notifications in the project?
**Answer**: Toast notifications are rendered using `Sonner`. When RTK Query mutations succeed or fail, toast promises render feedback popups (e.g., "Student created successfully").

### Q27: What is the purpose of `.env.local`?
**Answer**: `.env.local` stores environment variables (such as `MONGODB_URI` and `JWT_SECRET`) locally without committing sensitive secrets to source control.

### Q28: How does RTK Query handle tag invalidation?
**Answer**: Query endpoints specify `providesTags: ['Student']`, while mutation endpoints specify `invalidatesTags: ['Student']`. When a mutation executes, RTK Query automatically marks cached queries with that tag as invalid and re-fetches them.

### Q29: What major challenge did you face during development and how did you resolve it?
**Answer**: Random mock data generation caused duplicate name collisions, leading to duplicate key errors on the `user_1` index during manual database seeding. This was fixed by appending unique entity IDs (`empId`, `stdId`) to generated email strings in `lib/dbSeed.ts`.

### Q30: What future enhancements could be added to this project?
**Answer**: Future additions include automated email/SMS attendance alerts via Twilio/Nodemailer, payment gateway integration for student tuition fees, dynamic fine-grained role/permissions configuration UI, and an AI model for student performance prediction.
