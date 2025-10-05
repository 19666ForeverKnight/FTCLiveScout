# FTC Live Scout - Authentication Setup Guide

This guide will walk you through setting up Appwrite authentication for the FTC Live Scout app.

## Prerequisites

- Node.js and npm installed
- An Appwrite account (free at [cloud.appwrite.io](https://cloud.appwrite.io))

## Step 1: Create an Appwrite Project

1. Go to [https://cloud.appwrite.io/console](https://cloud.appwrite.io/console)
2. Sign up or log in to your account
3. Click **"Create Project"**
4. Give your project a name (e.g., "FTC Live Scout")
5. Copy your **Project ID** - you'll need this later

## Step 2: Configure Authentication

1. In your Appwrite project console, navigate to **Auth** in the sidebar
2. Under **Settings**, enable **Email/Password** authentication
3. (Optional) Configure other authentication providers if desired

## Step 3: Add Platform (Web App)

1. In your Appwrite console, go to **Settings** → **Platforms**
2. Click **"Add Platform"** → **"Web App"**
3. Enter the following details:
   - **Name**: FTC Live Scout Web
   - **Hostname**: `localhost` (for development)
   - For production, add your production domain as well

## Step 4: Configure Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your Appwrite credentials:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
   ```

   Replace `your_project_id_here` with your actual Project ID from Step 1.

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Features Implemented

### Authentication Pages
- **Sign Up** (`/signup`) - Create a new account
- **Login** (`/login`) - Sign in to existing account
- **Dashboard** (`/dashboard`) - Protected route for authenticated users

### Authentication Flow
1. Users can create an account with email, password, and name
2. After signup, users are automatically logged in
3. Users can log in with email and password
4. The dashboard is protected and requires authentication
5. Users can log out from the dashboard

## File Structure

```
├── app/
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   ├── dashboard/page.tsx      # Protected dashboard
│   ├── layout.tsx              # Root layout with AuthProvider
│   └── page.tsx                # Home page
├── context/
│   └── AuthContext.tsx         # Authentication context
├── lib/
│   ├── appwrite.ts             # Appwrite client configuration
│   └── auth.ts                 # Authentication service functions
└── .env.local                  # Environment variables (create this)
```

## Testing the Authentication

1. **Create an Account**:
   - Go to `/signup`
   - Fill in your name, email, and password (min 8 characters)
   - Click "Create account"
   - You'll be redirected to the dashboard

2. **Log Out**:
   - Click the "Logout" button in the dashboard
   - You'll be redirected to the home page

3. **Log In**:
   - Go to `/login`
   - Enter your email and password
   - Click "Sign in"
   - You'll be redirected to the dashboard

## Troubleshooting

### "Invalid credentials" error
- Make sure your `.env.local` file has the correct Project ID
- Verify that your Appwrite project has Email/Password authentication enabled

### "Hostname not allowed" error
- Add `localhost` as a platform in your Appwrite project settings
- Make sure you're accessing the app from the correct hostname

### Changes not reflecting
- Restart the development server after modifying `.env.local`
- Clear your browser cache and cookies

## Next Steps

Now that authentication is set up, you can:
1. Add user profile management
2. Implement password reset functionality
3. Add OAuth providers (Google, GitHub, etc.)
4. Create database collections for scouting data
5. Build out the scouting features

## Security Notes

- Never commit `.env.local` to version control (it's in `.gitignore`)
- Use strong passwords for production accounts
- For production, use environment variables provided by your hosting platform
- Consider implementing rate limiting and CAPTCHA for production

## Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Appwrite Auth Guide](https://appwrite.io/docs/products/auth)
