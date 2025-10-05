# FTC Live Scout

A live scouting system for FTC (FIRST Tech Challenge) competitions built with Next.js and Appwrite.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- An Appwrite account ([create one free](https://cloud.appwrite.io))

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Appwrite:**
   - Create a project at [cloud.appwrite.io](https://cloud.appwrite.io)
   - Enable Email/Password authentication
   - Add `localhost` as a web platform
   - Copy your Project ID

3. **Set environment variables:**
   
   Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   
   Visit [http://localhost:3000](http://localhost:3000)

📖 **See [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed setup instructions**

## ✨ Features

- 🔐 **User Authentication** - Secure signup/login with Appwrite
- 👤 **User Accounts** - Profile management and session handling
- 🛡️ **Protected Routes** - Dashboard requires authentication
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- 🌙 **Dark Mode** - Automatic theme switching
- ⚡ **Fast & Optimized** - Built with Next.js 15 and React 19

## 📁 Project Structure

```
ftclivescout/
├── app/
│   ├── login/          # Login page
│   ├── signup/         # Signup page
│   ├── dashboard/      # Protected dashboard
│   └── page.tsx        # Home page
├── context/
│   └── AuthContext.tsx # Auth state management
├── lib/
│   ├── appwrite.ts     # Appwrite config
│   └── auth.ts         # Auth functions
├── .env.local          # Environment variables (you create this)
└── AUTH_SETUP.md       # Detailed setup guide
```

## 🧪 Testing Authentication

1. Go to `/signup` and create an account
2. You'll be automatically logged in and redirected to `/dashboard`
3. Click "Logout" to sign out
4. Go to `/login` to sign back in

## 🔧 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org)
- **UI:** [React 19](https://react.dev) + [Tailwind CSS 4](https://tailwindcss.com)
- **Backend:** [Appwrite](https://appwrite.io) (Authentication & Database)
- **Language:** [TypeScript](https://www.typescriptlang.org)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
