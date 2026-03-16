# WorkLogix

A modern, full-featured time tracking and project management application built with Next.js 16, React 19, and TypeScript. WorkLogix helps teams and individuals track productivity, manage projects, and generate insightful reports with an elegant, intuitive interface.

![WorkLogix](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### 🎯 Dashboard
- **Real-time Statistics**: View hours tracked, active projects, weekly goals, and total entries at a glance
- **Interactive Charts**:
  - Weekly activity line charts showing daily hours
  - Project distribution pie charts for time allocation
- **Recent Activity Feed**: Track latest time entries and project updates
- **Quick Actions**: Fast access to timer, new project, reports, and analytics

### ⏱️ Intelligent Timer
- **Live Time Tracking**: Real-time timer with hours, minutes, and seconds display
- **Break Management**: Take breaks and resume work seamlessly
- **Dual Timer Display**:
  - Main work timer with animated progress ring
  - Break timer for tracking pause durations
- **Project Association**: Select project and add task descriptions before tracking
- **Recent Entries**: View your latest completed time entries

### 📁 Project Management
- **Create & Edit Projects**: Define projects with name, type, and status
- **Project Types**: API Development, Web App, Mobile App, Consulting, Website Redesign
- **Status Management**: Active, On Hold, or Completed
- **Project Statistics**: View total time tracked and earnings per project
- **Hourly Rate Tracking**: Set and track billing rates for each project
- **Visual Indicators**: Color-coded project types with emoji icons

### 📊 Time Entries
- **Comprehensive List**: View all time entries with project, duration, and date
- **Advanced Filtering**:
  - Filter by project, date range, and status
  - Search functionality for quick lookups
- **Sorting Options**: Sort by date, duration, project, or status
- **Pagination**: Efficient navigation through large datasets
- **Bulk Actions**: Delete multiple entries at once
- **Excel Export**: Download filtered entries as XLSX files

### 📈 Reports & Analytics
- **Daily Breakdown**: Visual representation of hours and earnings per day
- **Project Analysis**: Pie charts showing time distribution across projects
- **Summary Statistics**:
  - Total hours tracked
  - Total earnings
  - Average daily hours
- **Date Range Filtering**: Generate reports for custom time periods
- **Export Functionality**: Download comprehensive reports as Excel files

### ⚙️ Settings & Preferences
- **Theme Customization**:
  - Light mode
  - Dark mode
  - System preference
- **Notification Management**:
  - Push notifications
  - Email alerts
  - Project updates
  - Weekly summaries
- **Account Settings**: Profile management and logout

### 👤 User Authentication
- **Secure Login**: JWT-based authentication
- **User Registration**: Create new accounts with validation
- **Profile Management**: Update personal information
- **Persistent Sessions**: Auto-login with localStorage

### 🎨 Modern UI/UX
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile
- **Dark Mode Support**: Seamless theme switching
- **Animated Backgrounds**: Floating orbs and particle effects
- **Smooth Transitions**: Framer Motion animations throughout
- **Glass Morphism**: Beautiful backdrop blur effects
- **Gradient Accents**: Purple-pink gradient theme
- **Interactive Elements**: Hover states and scale animations

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + DaisyUI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Excel Export**: XLSX

### Backend Integration
- **API Client**: Axios
- **Authentication**: JWT tokens
- **REST API**: Fully integrated backend services

## 📦 Installation

### Prerequisites
- Node.js 20+
- npm, yarn, or pnpm

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WorkLogix
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
WorkLogix/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/         # Dashboard page
│   │   ├── projects/          # Projects management
│   │   ├── timer/             # Timer page
│   │   ├── time-entries/      # Time entries list
│   │   ├── reports/           # Reports page
│   │   ├── settings/          # Settings page
│   │   └── profile/           # Profile page
│   ├── components/            # Reusable components
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                   # Utilities and configurations
│   │   ├── api/               # API clients
│   │   │   ├── axios.ts
│   │   │   ├── index.ts
│   │   │   ├── user.ts
│   │   │   ├── project.ts
│   │   │   └── timeEntry.ts
│   │   ├── stores/            # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── projectStore.ts
│   │   │   └── timerStore.ts
│   │   └── types/             # TypeScript types
│   │       ├── index.ts
│   │       ├── user.ts
│   │       ├── project.ts
│   │       └── timeEntry.ts
│   └── middleware.ts          # Next.js middleware
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🔧 Configuration

### API Configuration

Configure your API endpoint in `src/lib/api/axios.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';
```

### Theme Configuration

Customize themes in `tailwind.config.ts`:

```typescript
daisyui: {
  themes: ["light", "dark"],
  darkTheme: "dark",
}
```

## 📱 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | User authentication |
| Register | `/register` | Create new account |
| Dashboard | `/dashboard` | Overview with statistics |
| Projects | `/projects` | Manage projects |
| Timer | `/timer` | Time tracking interface |
| Time Entries | `/time-entries` | View all entries |
| Reports | `/reports` | Analytics and export |
| Settings | `/settings` | User preferences |
| Profile | `/profile` | Account management |

## 🎯 Key Features Explained

### Time Tracking Workflow
1. Select a project from the available projects
2. Add a task description
3. Click "Start Tracking" to begin the timer
4. Take breaks when needed - break time is tracked separately
5. Stop the timer when done
6. Complete the entry to save it

### Project Management
- Create projects with specific types and hourly rates
- Track time spent on each project
- Monitor project status (active, on hold, completed)
- View detailed statistics per project

### Reporting
- Generate reports for any date range
- View daily breakdown of hours and earnings
- Analyze project distribution
- Export data to Excel for further analysis

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [DaisyUI](https://daisyui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Charts powered by [Recharts](https://recharts.org/)

---

**Note**: This is a modern web application requiring a backend API to function properly. Ensure your backend server is running before starting the frontend.

For support, please open an issue in the repository.
