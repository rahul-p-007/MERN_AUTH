# Full-Stack Authentication Project Documentation

## Project Overview

A complete authentication system with user registration, login, password management, and protected routes.

## System Architecture

### Frontend (React)

#### 1. Authentication Components

- **Login Component**

  - Manages user login state
  - Uses Context API for auth management
  - Handles form validation
  - Redirects to protected routes

- **Register Component**

  - New user registration
  - Phone number validation (+91 format)
  - Email validation
  - Choice of verification method (email/phone)

- **OTP Verification**
  - 5-digit OTP system
  - Supports both email and phone verification
  - Auto-focus input fields
  - Expiration handling

#### 2. Password Management

- **Forgot Password**

  - Email-based reset system
  - Reset link generation
  - Success/error notifications

- **Reset Password**
  - Token-based verification
  - Password confirmation
  - Automatic login after reset

#### 3. Protected Routes

- **Home Page**
  - Authentication check
  - Multiple sections (Hero, Instructor, Technologies)
  - Logout functionality
  - Responsive design

### Backend (Node.js)

#### 1. User Management

- **User Model (MongoDB)**
  ```javascript
  {
    name: String,
    email: String,
    password: String (hashed),
    phone: String,
    accountVerified: Boolean,
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date
  }
  ```

#### 2. API Endpoints

- **Authentication**

  ```
  POST /api/v1/register
  POST /api/v1/login
  POST /api/v1/otp-verification
  GET  /api/v1/logout
  ```

- **Password Management**
  ```
  POST /api/v1/password/forgot
  PUT  /api/v1/password/reset/:token
  ```

## Security Features

1. **Password Security**

   - Bcrypt hashing
   - Minimum length validation
   - Password confirmation

2. **Token Management**

   - JWT for authentication
   - Secure cookie storage
   - Token expiration

3. **OTP System**
   - Time-based expiration
   - Secure generation
   - Limited attempts

## Data Flow Diagrams

### Authentication Flow

```
User Input
    ↓
Frontend Validation
    ↓
API Request
    ↓
Backend Validation
    ↓
Database Operation
    ↓
Response Generation
    ↓
Frontend State Update
    ↓
UI Update
```

### Password Reset Flow

```
Reset Request
    ↓
Email Generation
    ↓
Token Creation
    ↓
User Verification
    ↓
Password Update
    ↓
Auth State Update
```

## State Management

### Context API Structure

```javascript
Context = {
  isAuthenticated: boolean,
  setIsAuthenticated: function,
  user: object,
  setUser: function
}
```

## Error Handling

1. **Frontend**

   - Toast notifications
   - Form validation
   - API error handling

2. **Backend**
   - Custom error middleware
   - Async error catching
   - Validation errors

## Technologies Used

1. **Frontend**

   - React
   - React Router DOM
   - Axios
   - React Toastify
   - CSS Modules

2. **Backend**
   - Node.js
   - Express
   - MongoDB
   - JWT
   - Bcrypt
   - Nodemailer

## Best Practices

1. **Code Organization**

   - Component-based architecture
   - Separation of concerns
   - Reusable components
   - Clean code principles

2. **Security**

   - Input validation
   - Secure password handling
   - Protected routes
   - HTTP-only cookies

3. **Performance**
   - Optimized API calls
   - Proper error handling
   - Efficient state management
   - Responsive design

## Future Enhancements

1. OAuth integration
2. Two-factor authentication
3. Session management
4. Role-based access control
5. Activity logging

## Deployment Considerations

1. Environment variables
2. CORS configuration
3. Security headers
4. SSL/TLS setup
5. Database optimization

This documentation provides a comprehensive overview of the project structure, implementation details, and best practices. It can be saved as `PROJECT_DOCUMENTATION.md` in the root directory of your project.

# Project Wireframe & Structure

## Frontend Architecture

```
┌─────────────────────────────────────────────────┐
│                   App.jsx                       │
│  ┌─────────────┐  ┌─────────────┐             │
│  │   Router    │  │   Context   │             │
│  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────────────────────────────────────┐
│              Pages Directory                    │
│  ┌─────────────┐  ┌─────────────┐             │
│  │   Home      │  │   Auth      │             │
│  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐             │
│  │  Forgot     │  │   Reset     │             │
│  │  Password   │  │  Password   │             │
│  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────────────────────────────────────┐
│            Components Directory                  │
│  ┌─────────────┐  ┌─────────────┐             │
│  │   Login     │  │  Register   │             │
│  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐             │
│  │   Hero      │  │ Instructor  │             │
│  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────┘

## Backend Architecture
```

┌─────────────────────────────────────────────────┐
│ Server.js │
│ ┌─────────────┐ ┌─────────────┐ │
│ │ Express │ │ MongoDB │ │
│ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
│ │
▼ ▼
┌─────────────────────────────────────────────────┐
│ Routes Directory │
│ ┌─────────────┐ ┌─────────────┐ │
│ │ User │ │ Auth │ │
│ │ Routes │ │ Routes │ │
│ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
│ │
▼ ▼
┌─────────────────────────────────────────────────┐
│ Controllers Directory │
│ ┌─────────────┐ ┌─────────────┐ │
│ │ User │ │ Auth │ │
│ │ Controller │ │ Controller │ │
│ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │  Database   │
│  (React)    │     │  (Node.js)  │     │ (MongoDB)   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                    │
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Request   │     │   Process   │     │   Store     │
│   (Axios)   │     │   (Express) │     │   Data      │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                    │
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Response  │     │   Validate  │     │   Retrieve  │
│   (JSON)    │     │   (JWT)     │     │   Data      │
└─────────────┘     └─────────────┘     └─────────────┘

## Authentication Flow
```

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ User │ │ Server │ │ Database │
│ Input │ │ Validation │ │ Check │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
│ │ │
│ │ │
▼ ▼ ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Form │ │ Token │ │ User │
│ Validation │ │ Generation │ │ Update │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
│ │ │
│ │ │
▼ ▼ ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Redirect │ │ Cookie │ │ Session │
│ to Home │ │ Set │ │ Update │
└─────────────┘ └─────────────┘ └─────────────┘

## Component Hierarchy

```
App
├── Router
│   ├── Home
│   │   ├── Hero
│   │   ├── Instructor
│   │   └── Technologies
│   ├── Auth
│   │   ├── Login
│   │   └── Register
│   ├── ForgotPassword
│   └── ResetPassword
└── Context
    ├── isAuthenticated
    ├── setIsAuthenticated
    ├── user
    └── setUser
```

## API Endpoints Structure

```
/api/v1
├── /register
├── /login
├── /logout
├── /otp-verification
└── /password
    ├── /forgot
    └── /reset/:token
```

## Database Schema

```
User Collection
├── name: String
├── email: String
├── password: String (hashed)
├── phone: String
├── accountVerified: Boolean
├── verificationCode: Number
├── verificationCodeExpire: Date
├── resetPasswordToken: String
└── resetPasswordExpire: Date
```
