# FTC Live Scout - Quick Start

## ✅ What's Been Set Up

A complete authentication system using Appwrite has been implemented with:

### Core Components
- **Authentication Service** (`lib/auth.ts`) - Login, signup, logout, and user session management
- **Appwrite Client** (`lib/appwrite.ts`) - Configured Appwrite SDK
- **Auth Context** (`context/AuthContext.tsx`) - Global authentication state management

### Pages
1. **Home Page** (`/`) - Landing page with auth status and links
2. **Login Page** (`/login`) - User authentication
3. **Signup Page** (`/signup`) - New user registration
4. **Dashboard** (`/dashboard`) - Protected route (requires authentication)

## 🚀 Getting Started

### 1. Set Up Appwrite (Required)

1. Create a free account at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create a new project
3. Enable Email/Password authentication
4. Add `localhost` as a web platform

### 2. Configure Environment Variables

Edit `.env.local` and add your Appwrite Project ID:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=YOUR_PROJECT_ID_HERE
```

### 3. Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📖 Detailed Setup Guide

See **AUTH_SETUP.md** for complete step-by-step instructions.

## 🎯 Features

- ✅ User registration with email & password
- ✅ User login/logout
- ✅ Protected routes (dashboard)
- ✅ Global auth state management
- ✅ Automatic session restoration
- ✅ Responsive UI with Tailwind CSS
- ✅ Dark mode support

## 📁 Project Structure

```
app/
├── login/page.tsx        # Login page
├── signup/page.tsx       # Signup page
├── dashboard/page.tsx    # Protected dashboard
├── layout.tsx            # Root layout with AuthProvider
└── page.tsx              # Home page

context/
└── AuthContext.tsx       # Auth state management

lib/
├── appwrite.ts           # Appwrite configuration
└── auth.ts               # Auth functions
```

## 🔐 Security Notes

- `.env.local` is gitignored (never commit credentials)
- Passwords must be at least 8 characters
- Sessions are managed securely by Appwrite
- HTTPS is enforced in production

## 🛠️ Next Steps

1. Configure your Appwrite project
2. Add your Project ID to `.env.local`
3. Test the authentication flow
4. Build your scouting features!

## 📚 Resources

- [Appwrite Docs](https://appwrite.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Complete Setup Guide](./AUTH_SETUP.md)
