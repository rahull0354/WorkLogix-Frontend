# 📋 Time Tracker Frontend - Implementation Plan

## **API Summary:**

### **Base URL**
- Variable: `{{baseURL}}` (to be configured in environment)

### **Authentication**
- Type: JWT Bearer Token
- Header: `Authorization: Bearer <token>`

---

## **📡 API Endpoints Overview**

### **👤 User Management**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/user/register` | Register new user | ❌ No |
| GET | `/user/login` | Login user | ❌ No |
| GET | `/user/profile` | Get profile details | ✅ Yes |
| PUT | `/user/update/:id` | Update user | ✅ Yes |
| DELETE | `/user/delete` | Delete user | ✅ Yes |

**Request Bodies:**
```json
// Register
{
  "username": "rahul",
  "email": "rahul@gmail.com",
  "password": "rahul",
  "fullname": "Rahul Mehta"
}

// Login
{
  "email": "rahul@gmail.com",
  "password": "rahul"
}

// Update
{
  "email": "rahul@gmail.com"
}
```

---

### **📁 Project Management**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/project/create` | Create new project | ✅ Yes |
| GET | `/project/myProjects` | Get all user projects | ✅ Yes |
| GET | `/project/projectDetails/:id` | Get project details | ✅ Yes |
| PUT | `/project/update/:id` | Update project | ✅ Yes |
| PUT | `/project/changeStatus/:id` | Change project status | ✅ Yes |
| DELETE | `/project/delete/:id` | Delete project | ✅ Yes |

**Request Bodies:**
```json
// Create Project
{
  "projectName": "Home Management System",
  "clientName": "Umer Saiyed",
  "hourlyRate": 200,
  "description": "This is the project done for week - (7) | Database Management"
}

// Update Project
{
  "projectName": "Time Tracker - API [TS]"
}

// Change Status
{
  "status": "hold" // or "active", "completed"
}
```

---

### **⏱️ Time Entry Management**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/timeEntry/startTimeEntry/:projectId` | Start timer for project | ✅ Yes |
| POST | `/timeEntry/stopTimeEntry/:entryId` | Stop timer | ✅ Yes |
| POST | `/timeEntry/break/:entryId` | Apply break | ✅ Yes |
| POST | `/timeEntry/resume/:entryId` | Resume timer | ✅ Yes |
| POST | `/timeEntry/complete/:entryId` | Complete time entry | ✅ Yes |

**Request Bodies:**
```json
// Start Time Entry
{
  "description": "Started development for module - 1"
}
```

---

### **📤 Export Functionality**
| Method | Endpoint | Description | Format |
|--------|----------|-------------|--------|
| GET | `/export/project/csv` | Export all projects | CSV |
| GET | `/export/project/excel` | Export all projects | Excel |
| GET | `/export/timeEntry/csv` | Export all time entries | CSV |
| GET | `/export/timeEntry/excel` | Export all time entries | Excel |
| GET | `/export/projectEntries/:id/csv/` | Export project time entries | CSV |
| GET | `/export/projectEntries/:id/excel` | Export project time entries | Excel |
| GET | `/export/summary/csv` | Export summary report | CSV |
| GET | `/export/summary/excel` | Export summary report | Excel |
| GET | `/export/entriesByDate/:startDate/:endDate/excel` | Export by date range | Excel |

---

## **🎯 Implementation Chunks**

### **📦 CHUNK 1: Project Setup & Configuration**
**Priority:** 🔴 Critical (Foundation)

**Tasks:**
- [ ] Install required dependencies
- [ ] Setup environment variables (.env.local)
- [ ] Configure Axios instance with interceptors
- [ ] Create API service layer structure
- [ ] Setup Authentication Context
- [ ] Create TypeScript types/interfaces
- [ ] Setup protected routes middleware
- [ ] Create base UI components (Button, Input, Modal, etc.)
- [ ] Configure Tailwind theme if needed
- [ ] Setup error handling utilities

**Dependencies to Install:**
```bash
npm install axios react-hook-form zod @hookform/resolvers date-fns
npm install lucide-react react-hot-toast
npm install recharts # for charts
npm install zustand # optional for state management
```

**Environment Variables:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

**File Structure:**
```
src/
├── lib/
│   ├── api/
│   │   ├── axios.ts
│   │   ├── user.ts
│   │   ├── project.ts
│   │   └── timeEntry.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── project.ts
│   │   └── timeEntry.ts
│   └── utils/
│       ├── validation.ts
│       └── formatters.ts
├── contexts/
│   └── AuthContext.tsx
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Card.tsx
└── middleware.ts
```

**Estimated Time:** 1-2 hours

---

### **🔐 CHUNK 2: Authentication System**
**Priority:** 🔴 Critical

**Pages to Create/Enhance:**
- [ ] `/login` - Login page
- [ ] `/register` - Register page
- [ ] `/profile` - Profile management

**Tasks:**
- [ ] Create login form with validation
- [ ] Create register form with validation
- [ ] Implement login API integration
- [ ] Implement register API integration
- [ ] Setup token storage (localStorage/cookies)
- [ ] Create AuthContext for state management
- [ ] Implement protected route wrapper
- [ ] Create profile page
- [ ] Implement profile update
- [ ] Implement logout functionality
- [ ] Add loading states
- [ ] Add error handling with toast notifications

**Features:**
- Email validation
- Password strength indicator
- Remember me checkbox
- Show/hide password toggle
- Redirect after login/register
- Auto-redirect to login if not authenticated

**Estimated Time:** 2-3 hours

---

### **📊 CHUNK 3: Dashboard & Overview**
**Priority:** 🟡 High

**Pages to Create:**
- [ ] `/dashboard` - Main dashboard (update existing)

**Tasks:**
- [ ] Design dashboard layout
- [ ] Create stats cards (total projects, active entries, today's hours, etc.)
- [ ] Implement active timer widget
- [ ] Create recent time entries list
- [ ] Create project overview cards
- [ ] Add quick actions panel
- [ ] Implement date range picker
- [ ] Add productivity charts
- [ ] Create welcome message with user info

**Features:**
- Real-time timer updates
- Quick start timer button
- Recent activity feed
- Project status overview
- Weekly/monthly time summary
- Quick project switching

**Estimated Time:** 3-4 hours

---

### **📁 CHUNK 4: Project Management**
**Priority:** 🟡 High

**Pages to Create:**
- [ ] `/projects` - Projects list page
- [ ] `/projects/[id]` - Project details page

**Tasks:**
- [ ] Create projects list with filters
- [ ] Implement create project modal
- [ ] Create project details page
- [ ] Implement edit project functionality
- [ ] Implement delete project with confirmation
- [ ] Add change project status feature
- [ ] Create project time entries view
- [ ] Add search and filter functionality
- [ ] Implement pagination
- [ ] Add project statistics
- [ ] Create project cards with status badges

**Features:**
- Project cards with key info
- Status indicators (active/hold/completed)
- Filter by status
- Search by name/client
- Sort by name/date/hours
- Quick actions menu
- Delete confirmation modal
- Duplicate project option

**Estimated Time:** 4-5 hours

---

### **⏱️ CHUNK 5: Time Entry System**
**Priority:** 🟡 High

**Pages to Create:**
- [ ] `/timer` - Main timer page
- [ ] `/time-entries` - Time entries history

**Tasks:**
- [ ] Create timer component (start/stop/pause/resume)
- [ ] Implement active time entry display
- [ ] Create manual time entry form
- [ ] Create time entries list with pagination
- [ ] Implement edit time entry
- [ ] Implement delete time entry
- [ ] Add break functionality
- [ ] Implement complete time entry
- [ ] Create timer history view
- [ ] Add real-time timer updates
- [ ] Implement project selection for timer
- [ ] Add description field
- [ ] Create time entry details modal

**Features:**
- Large timer display
- Play/pause/stop controls
- Project selector dropdown
- Description input
- Break button
- Manual time entry option
- Edit past entries
- Bulk delete
- Filter by date/project
- Export button
- Time duration formatting
- Running timer indicator

**Estimated Time:** 4-5 hours

---

### **📈 CHUNK 6: Reports & Analytics**
**Priority:** 🟢 Medium

**Pages to Create:**
- [ ] `/reports` - Reports overview
- [ ] `/reports/summary` - Summary reports
- [ ] `/reports/analytics` - Detailed analytics

**Tasks:**
- [ ] Create summary reports page
- [ ] Implement daily view
- [ ] Implement weekly view
- [ ] Implement monthly view
- [ ] Create charts and graphs
- [ ] Add project-wise time distribution
- [ ] Implement productivity insights
- [ ] Add date range filtering
- [ ] Create comparison charts
- [ ] Add export options
- [ ] Implement statistics cards

**Features:**
- Bar charts (daily/weekly hours)
- Pie charts (project distribution)
- Line charts (productivity trends)
- Time summaries
- Project comparisons
- Client billing summaries
- Date range picker
- Export buttons
- Print functionality
- Drill-down capabilities

**Estimated Time:** 3-4 hours

---

### **📤 CHUNK 7: Export Functionality**
**Priority:** 🟢 Medium

**Tasks:**
- [ ] Create export button component
- [ ] Implement export modal with options
- [ ] Add CSV export handlers
- [ ] Add Excel export handlers
- [ ] Implement date range export
- [ ] Add download management
- [ ] Create export history
- [ ] Add export notifications
- [ ] Implement file download handling
- [ ] Add export loading states

**Export Options:**
- Export all time entries (CSV/Excel)
- Export all projects (CSV/Excel)
- Export specific project entries (CSV/Excel)
- Export by date range (Excel)
- Export summary reports (CSV/Excel)
- Export options modal

**Estimated Time:** 2-3 hours

---

### **🎨 CHUNK 8: UI Polish & Enhancements**
**Priority:** 🟢 Medium

**Tasks:**
- [ ] Add loading states everywhere
- [ ] Implement error handling
- [ ] Create toast notifications system
- [ ] Add confirmation modals
- [ ] Improve responsive design
- [ ] Add dark/light mode toggle (optional)
- [ ] Implement animations & transitions
- [ ] Add skeleton loaders
- [ ] Create empty state components
- [ ] Add success/error messages
- [ ] Implement form validation messages
- [ ] Add accessibility features
- [ ] Optimize performance
- [ ] Add SEO meta tags

**Enhancements:**
- Smooth page transitions
- Loading spinners
- Skeleton screens
- Error boundaries
- Toast notifications for actions
- Confirmation dialogs for destructive actions
- Empty state illustrations
- Hover effects
- Focus states
- Keyboard navigation
- Mobile responsiveness
- Tablet optimization

**Estimated Time:** 2-3 hours

---

## **📁 Complete Folder Structure**

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── timer/
│   │   └── page.tsx
│   ├── time-entries/
│   │   └── page.tsx
│   ├── reports/
│   │   ├── page.tsx
│   │   ├── summary/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Toast.tsx
│   │   └── Loading.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectList.tsx
│   │   ├── CreateProjectModal.tsx
│   │   └── EditProjectModal.tsx
│   ├── timer/
│   │   ├── TimerDisplay.tsx
│   │   ├── TimerControls.tsx
│   │   └── TimeEntryList.tsx
│   ├── reports/
│   │   ├── SummaryCard.tsx
│   │   └── Chart.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── lib/
│   ├── api/
│   │   ├── axios.ts
│   │   ├── user.ts
│   │   ├── project.ts
│   │   ├── timeEntry.ts
│   │   └── export.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   ├── useTimeEntries.ts
│   │   └── useTimer.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── project.ts
│   │   ├── timeEntry.ts
│   │   └── index.ts
│   └── utils/
│       ├── validation.ts
│       ├── formatters.ts
│       ├── constants.ts
│       └── helpers.ts
├── contexts/
│   └── AuthContext.tsx
├── middleware.ts
└── next.config.js
```

---

## **🔧 Tech Stack**

### **Core**
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS

### **State Management**
- Context API + Hooks (recommended)
- OR Zustand (alternative)

### **HTTP Client**
- Axios (recommended)
- OR Fetch API

### **Forms & Validation**
- React Hook Form
- Zod validation schema

### **UI Components**
- Lucide React (icons)
- Headless UI (modals, dropdowns)
- OR Shadcn/ui

### **Notifications**
- react-hot-toast
- OR Sonner

### **Charts**
- Recharts
- OR Chart.js

### **Date Handling**
- date-fns

### **Additional**
- clsx / cn (className utilities)
- tailwind-merge

---

## **✅ Development Checklist**

### **Phase 1: Foundation**
- [ ] Chunk 1: Setup & Configuration
- [ ] Chunk 2: Authentication System

### **Phase 2: Core Features**
- [ ] Chunk 3: Dashboard & Overview
- [ ] Chunk 4: Project Management
- [ ] Chunk 5: Time Entry System

### **Phase 3: Advanced Features**
- [ ] Chunk 6: Reports & Analytics
- [ ] Chunk 7: Export Functionality

### **Phase 4: Polish**
- [ ] Chunk 8: UI Polish & Enhancements
- [ ] Testing
- [ ] Deployment

---

## **🚀 Getting Started**

1. **Review the API** - Understand all endpoints
2. **Setup Backend** - Ensure your backend is running
3. **Start with Chunk 1** - Foundation is critical
4. **Work Sequentially** - Each chunk builds on previous ones
5. **Test Thoroughly** - Test each chunk before moving forward
6. **Deploy & Iterate** - Get feedback and improve

---

## **📝 Notes**

- All authenticated routes require JWT token in Authorization header
- Project IDs and Time Entry IDs are MongoDB ObjectIds
- Status values: "active", "hold", "completed"
- Date format: YYYY-MM-DD
- All times should be stored and displayed in user's timezone

---

## **⏱️ Total Estimated Time**

- **Minimum**: 20-25 hours
- **With Polish**: 30-40 hours
- **Production Ready**: 40-50 hours

---

**Created for:** Time Tracker Application
**Last Updated:** 2026-02-24
**Version:** 1.0
