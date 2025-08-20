# ReTrade Platform - Login & Registration Implementation Prompt

## Project Overview

**Product Name**: ReTrade  
**Description**: A Reverse Commerce Platform - an online marketplace for buying and selling used products, enabling sustainable and cost-effective commerce for pre-owned items.

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Database**: PostgreSQL (hosted on Neon Cloud)
- **ORM**: Drizzle ORM
- **UI Framework**: Tailwind CSS (mandatory for all styling)
- **UI Components**: Shadcn/ui (strict requirement - no custom components)
- **Backend Logic**: Next.js Server Actions (no API routes)
- **Authentication**: Custom implementation (no third-party auth services)

## Project Structure

```
app-gen/
├── app/                    # Main React components and Server Actions
├── components/             # Shadcn UI components only
├── lib/                    # Server Actions and utility functions
└── db/
    └── schema.ts          # Database schema definitions
```

## Feature Requirements: Login & Registration

### User Stories

1. **As a new user**, I want to register for an account so that I can access the platform
2. **As an existing user**, I want to log in to my account so that I can use the platform features

### User Flow Specifications

#### Registration Flow
- **Required Fields**:
  - Full Name (string, required)
  - Email Address (string, required, unique)
  - Password (string, required, minimum 8 characters)
- **Optional Fields**:
  - Phone Number (string, optional)
- **Validation Requirements**:
  - Password strength validation (minimum 8 characters)
  - Unique email check
- **Success Behavior**: Redirect to login page with success message

#### Login Flow
- **Required Fields**:
  - Email Address
  - Password
- **Authentication**: Email and password verification
- **Success Behavior**: Redirect to dashboard/home page
- **Error Handling**: Display appropriate error messages for invalid credentials (For all toast messages should use 'soneer' in shadncn)

### Technical Implementation Requirements

#### Database Schema (`db/schema.ts`)

Create a `users` table with the following specifications:

```typescript
// Expected schema structure
users table:
- id: Primary key (UUID or auto-increment)
- name: VARCHAR(255), NOT NULL
- email: VARCHAR(255), UNIQUE, NOT NULL
- password: VARCHAR(255), NOT NULL (hashed)
- phone: VARCHAR(20), NULLABLE
- createdAt: TIMESTAMP, DEFAULT NOW()
- updatedAt: TIMESTAMP, DEFAULT NOW()
```

**Security Requirements**:
- Passwords must be hashed using bcrypt or similar
- Email addresses should be stored in lowercase
- Implement proper indexing on email field

#### Frontend Components (`app/` directory)

**Required Components**:

1. **Registration Page** (`app/register/page.tsx`)
   - Beautiful form using Shadcn Form components with Tailwind styling
   - Fields: name, email, password, and optional phone (all using Shadcn Input components)
   - Real-time validation with Shadcn form validation
   - Attractive loading states using Shadcn Button with loading spinner
   - Error handling with Sonner toast notifications
   - Success/redirect logic with smooth transitions

2. **Login Page** (`app/login/page.tsx`)
   - Elegant form using Shadcn Form components with Tailwind styling
   - Fields: email and password (using Shadcn Input components)
   - Real-time validation feedback
   - Attractive authentication handling with loading states
   - Error management with Sonner toast notifications
   - Success/redirect logic with smooth transitions

3. **Server Actions** (`lib/auth-actions.ts`):
   - `registerUser()` - Handle user registration with validation and password hashing
   - `loginUser()` - Handle user authentication and session management
   - Both actions should use proper error handling and return appropriate responses

**UI/UX Requirements (STRICT)**:
- **Mandatory**: Use ONLY Shadcn UI components - no custom UI components allowed
- **Mandatory**: Use ONLY Tailwind CSS for styling - no custom CSS files
- **Design Requirements**:
  - Modern, clean, and professional appearance
  - Consistent spacing using Tailwind spacing utilities
  - Responsive design using Tailwind responsive breakpoints
  - Attractive color scheme using Tailwind color palette
  - Smooth animations and transitions using Tailwind transition utilities
  - Proper form validation states with visual feedback
  - Loading states with spinners and disabled states
  - Error states with clear visual indicators
- **Required Shadcn Components**:
  - Form, Input, Button, Label components for forms
  - Card component for form containers
  - Sonner for toast notifications
  - Icons from Lucide React for visual elements
- **Navigation**: Attractive links between login and registration pages with hover effects

#### Implementation Steps

1. **Database Setup**:
   - Define user schema in `db/schema.ts`
   - Install necessary dependencies (bcrypt, zod, etc.)
   - Run `npx drizzle-kit push` to apply schema changes

2. **Server Actions Development**:
   - Create `lib/auth-actions.ts` with registration and login server actions
   - Implement proper validation using Zod schemas
   - Add password hashing with bcryptjs
   - Include proper error handling and return appropriate responses
   - Add session management logic

3. **Frontend Development**:
   - Install and configure required Shadcn components (Form, Input, Button, Card, Sonner)
   - Create beautiful registration form using ONLY Shadcn components and Tailwind
   - Create attractive login form using ONLY Shadcn components and Tailwind
   - Implement form validation with real-time feedback
   - Connect forms to Server Actions using form actions
   - Add loading states and error handling with Sonner toasts
   - Ensure responsive design with Tailwind breakpoints

4. **Integration & Testing**:
   - Test user registration flow end-to-end
   - Test user login flow end-to-end
   - Verify database operations and data integrity
   - Test responsive design on different screen sizes
   - Validate all UI components and styling

### Constraints & Exclusions

- **No password reset functionality** (as specified)
- **No email verification process** (as specified)
- **No user activation workflow** (as specified)
- **No OAuth/social login integration**
- **No user profile management** (out of scope for this feature)
- **No "remember me" functionality** (can be added later)

### Success Criteria

- [ ] Users can successfully register with valid information
- [ ] Registration prevents duplicate email addresses
- [ ] Passwords are securely hashed and stored
- [ ] Users can successfully log in with correct credentials
- [ ] Invalid login attempts show appropriate error messages via Sonner toasts
- [ ] Database schema is properly applied to Neon PostgreSQL
- [ ] Frontend forms provide real-time validation feedback
- [ ] **UI is visually attractive using ONLY Shadcn components and Tailwind CSS**
- [ ] **Responsive design works perfectly on mobile and desktop devices**
- [ ] **All forms use Server Actions instead of API routes**
- [ ] **Loading states are implemented with proper visual feedback**
- [ ] **Error states display beautiful toast notifications**

### Dependencies & Prerequisites

**Required Packages**:
- `bcryptjs` for password hashing
- `zod` for schema validation and form validation
- `@hookform/resolvers` for form validation integration
- `react-hook-form` for form handling
- Drizzle ORM setup and configuration
- **Required Shadcn UI components**:
  - `npx shadcn@latest add form`
  - `npx shadcn@latest add input` 
  - `npx shadcn@latest add button`
  - `npx shadcn@latest add card`
  - `npx shadcn@latest add label`
  - `npx shadcn@latest add sonner`
- `lucide-react` for icons

**Environment Variables**:
- Database connection string for Neon PostgreSQL
- Any required API keys or configuration

### File Structure Expected After Implementation

```
/
├── app/
│   ├── login/
│   │   └── page.tsx                 # Login page with Shadcn components
│   ├── register/
│   │   └── page.tsx                 # Registration page with Shadcn components
│   └── globals.css                  # Tailwind CSS imports only
├── lib/
│   └── auth-actions.ts              # Server Actions for auth logic
├── components/
│   └── ui/                          # Shadcn UI components only
│       ├── form.tsx
│       ├── input.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── label.tsx
│       └── sonner.tsx
└── db/
    └── schema.ts                    # Updated with users table
```