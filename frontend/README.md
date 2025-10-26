# SPMS Web Dashboard - Frontend

React web application for Student Pickup Management System (SPMS) admin dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js v20.x or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run on `http://localhost:3001`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   │   ├── common/      # Button, Input, Card, etc.
│   │   └── layout/      # DashboardLayout
│   ├── pages/           # Page components
│   │   ├── auth/        # Login page
│   │   ├── dashboard/   # Dashboard
│   │   ├── students/    # Student pages
│   │   ├── pickup/      # Pickup management
│   │   └── reports/     # Reports
│   ├── services/        # API services
│   ├── contexts/        # React contexts (Auth)
│   ├── utils/           # Helper functions
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎨 Features

### Completed ✅
- Login page with role selection
- Dashboard with statistics
- Responsive sidebar navigation
- Protected routes
- API integration setup
- Tailwind CSS styling
- Toast notifications

### To Be Implemented 🔄
- Full CRUD for students
- Pickup request approval flow
- GPS integration
- Real-time notifications
- Reports and analytics
- User profile management

## 🔐 Demo Login Credentials

```
Admin:    admin001
Teacher:  teacher001
Parent:   parent001
Guard:    guard001

(Any role can be selected during login)
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **React Router v6** - Routing
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## 📡 API Integration

The frontend connects to the backend API at `http://localhost:3000/api/v1`

Configure the API URL in `.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 🎯 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Development Tips

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/layout/DashboardLayout.jsx`

### Creating API Services

1. Create service file in `src/services/`
2. Use the `api` instance from `src/services/api.js`
3. Handle errors with try-catch
4. Show toast notifications

Example:
```javascript
import api from './api';

export const myService = {
  async getData() {
    const response = await api.get('/endpoint');
    return response.data;
  },
};
```

## 🎨 Styling Guide

Use Tailwind CSS utility classes:

```jsx
<div className="bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <p className="text-gray-600 mt-2">Description</p>
</div>
```

Custom components in `src/components/common/`:
- `<Button>` - Styled buttons
- `<Input>` - Form inputs
- `<Card>` - Content containers
- `<Badge>` - Status badges

## 🐛 Troubleshooting

### Port 3001 already in use
```bash
# Change port in vite.config.js
server: {
  port: 3002,  // Change to any available port
}
```

### API connection issues
1. Check backend is running on port 3000
2. Verify CORS settings in backend
3. Check browser console for errors

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 License

Educational purposes - Bachelor's thesis project

## 👨‍💻 Author

Д.Буянжаргал - Монгол Улсын Их Сургууль
