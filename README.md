# FTC Live Scout

A comprehensive, real-time scouting application for FIRST Tech Challenge (FTC) competitions, built with Next.js 15 and Appwrite.

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

4. **Set up your Appwrite database:**
   - Create database: `ftclivescout_db`
   - Create collections: `events`, `match_scouts`, `pit_scouts`
   - Create storage bucket: `pit_scout_images`
   - See [QUICKSTART.md](./QUICKSTART.md) for detailed database setup

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   
   Visit [http://localhost:3000](http://localhost:3000)

📖 **See [AUTH_SETUP.md](./AUTH_SETUP.md) and [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions**

## ✨ Features

### 🔐 Authentication & User Management
- Secure signup/login with Appwrite
- User profiles with customizable information
- Protected routes with automatic authentication checks
- Session management

### 🎯 Match Scouting
- Record detailed match data:
  - Team numbers and match information
  - Autonomous scoring (samples in net, specimens on chambers)
  - TeleOp scoring (samples in net/baskets, specimens on chambers)
  - Endgame positions (parked, low/high hang, full ascent)
  - Fouls and technical fouls tracking
  - Notes and observations
- View all match reports with filtering
- Comprehensive match analytics

### 🔧 Pit Scouting
- Document robot specifications:
  - Team information and robot name
  - Drive train type and motor configuration
  - Scoring capabilities (samples/specimens)
  - Robot dimensions (width, length, height)
  - Autonomous capabilities
  - Strengths and weaknesses
- **Image Upload**: Capture and store robot photos
- **Cascade Delete**: Automatically removes associated images when records are deleted

### 📊 Analytics Dashboard
- **Overview Tab**: Total matches, pit reports, teams scouted
- **Team Rankings**: Average scores, autonomous/TeleOp/endgame breakdowns, fouls
- **Match Analysis**: Detailed match-by-match breakdown
- Endgame position statistics

### 👥 Multi-User Collaboration
- **Event Sharing**: Share events with other users by user ID
- **Shared Event Management**: View and manage users with access
- **Unshare Capability**: Remove user access when needed
- Collaborative data collection within shared events

### 🎨 Modern UI/UX
- Beautiful, responsive design with blue and golden color scheme
- Dark mode support throughout the app
- Mobile-first bottom navigation
- Desktop sidebar navigation
- Floating action button for quick access to scouting forms
- Glass morphism effects and smooth animations

## 📁 Project Structure

```
ftclivescout/
├── app/
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── dashboard/          # Dashboard with quick stats
│   ├── events/             # Event management and sharing
│   ├── match-scout/        # Match scouting form
│   ├── matches/            # View all match reports
│   ├── pit-scout/          # Pit scouting form with image upload
│   ├── pits/               # View all pit reports
│   ├── analytics/          # Analytics dashboard with rankings
│   ├── profile/            # User profile management
│   └── page.tsx            # Home page
├── components/
│   ├── Navigation.tsx              # Responsive nav (sidebar + bottom)
│   ├── FloatingAddButton.tsx      # FAB for quick scouting
│   ├── CreateEventModal.tsx       # Event creation modal
│   ├── EditEventModal.tsx         # Event editing modal
│   └── ShareEventModal.tsx        # Multi-user sharing interface
├── context/
│   ├── AuthContext.tsx    # Auth state management
│   └── EventContext.tsx   # Current event state
├── lib/
│   ├── appwrite.ts        # Appwrite config
│   ├── auth.ts            # Auth functions
│   ├── events.ts          # Event & sharing functions
│   └── scouts.ts          # Match & pit scout CRUD
├── .env.local             # Environment variables (create this)
└── *.md                   # Documentation files
```

## 🗄️ Database Structure

### Collections

1. **events**
   - Stores FTC events with owner and shared user tracking
   - Fields: name, location, date, userId, sharedWith

2. **match_scouts**
   - Detailed match scouting data (29 attributes)
   - Fields: team numbers, scores, fouls, endgame positions, notes
   - Includes createdByName and lastEditedByName

3. **pit_scouts**
   - Robot specifications and capabilities (15 attributes - at Appwrite limit)
   - Fields: robot specs, drive train, scoring abilities, dimensions, imageId
   - Does not include createdByName/lastEditedByName due to attribute limit

### Storage

- **pit_scout_images**: Storage bucket for robot photos
  - Automatically cleaned up when pit scout records are deleted (cascade delete)

## 🧪 Testing the App

1. **Sign up**: Go to `/signup` and create an account
2. **Create Event**: Add your FTC event details
3. **Match Scout**: Use the FAB (+ button) to record match data
4. **Pit Scout**: Use the FAB to document robot specs and upload photos
5. **Analytics**: View team rankings and performance metrics
6. **Share Event**: Invite collaborators by their user ID
7. **View Data**: Browse all match and pit reports

## 🔧 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) with App Router and Turbopack
- **UI:** [React 19](https://react.dev) + [Tailwind CSS 4](https://tailwindcss.com)
- **Backend:** [Appwrite](https://appwrite.io) (Authentication, Database, Storage)
- **Language:** [TypeScript](https://www.typescriptlang.org)

## 📚 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Complete setup guide with database configuration
- [AUTH_SETUP.md](./AUTH_SETUP.md) - Authentication setup instructions
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - UI/UX design patterns and color scheme
- [NAVIGATION_REDESIGN.md](./NAVIGATION_REDESIGN.md) - Navigation structure and layout

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
