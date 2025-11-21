# GhostLog Frontend Dashboard

Modern React dashboard for visualizing crash logs from embedded devices.

## 📋 Features

- ✅ **Device Management**: View all devices and their crash statistics
- ✅ **Crash Visualization**: Display crash logs with syntax highlighting
- ✅ **Crash Grouping**: Group similar crashes by fingerprint
- ✅ **Search & Filter**: Find specific crashes quickly
- ✅ **Trend Charts**: Visualize crash trends over time
- ✅ **Dark Mode UI**: Beautiful dark theme with glassmorphism
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js          # API client
│   ├── components/
│   │   ├── CrashCard.jsx      # Crash log display
│   │   ├── DeviceCard.jsx     # Device info card
│   │   ├── SearchFilterBar.jsx # Search & filter
│   │   └── CrashChart.jsx     # Chart component
│   ├── pages/
│   │   ├── DeviceList.jsx     # Home page
│   │   ├── DeviceDetail.jsx   # Device details
│   │   └── CrashGroups.jsx    # Grouped crashes
│   ├── App.jsx                # Main app with routing
│   └── index.css              # Global styles
├── tailwind.config.js         # Tailwind configuration
└── package.json               # Dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend server running on http://localhost:3000

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Dashboard runs on **http://localhost:5173**

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Design

### Color Scheme

- **Primary**: Red-Purple gradient (for crash severity)
- **Background**: Dark slate with gradients
- **Accents**: Blue for interactive elements
- **Text**: White/Gray for readability

### Features

- **Glassmorphism**: Translucent cards with backdrop blur
- **Smooth Animations**: Fade-in and slide-up effects
- **Responsive Grid**: Adapts to all screen sizes
- **Custom Badges**: Color-coded crash types

### Crash Type Colors

```
🔥 Panic       → Red
⚠️  HardFault   → Yellow
✋ Assertion   → Purple
🎯 Null Ptr    → Orange
❓ Unknown     → Gray
```

## 📊 Pages

### Device List (`/`)

- Overview statistics (total devices, crashes, active)
- Grid of all devices with crash counts
- Status indicators (green/yellow/red based on last crash)

### Device Detail (`/device/:id`)

- Crash trend chart (last 30 days)
- Search and filter crash logs
- List of all crashes for device
- Crash log syntax highlighting

### Crash Groups (`/crashes`)

- Crashes grouped by fingerprint
- Occurrence counts
- Affected devices list
- First/last seen dates

## 🔌 API Integration

The frontend connects to the backend API at:
```
http://localhost:3000/api
```

Configure via `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
```

### API Endpoints Used

- `GET /api/devices` - List all devices
- `GET /api/logs/device/:id` - Get device logs
- `GET /api/crashes/groups` - Get crash groups
- `GET /api/stats/daily` - Get daily statistics

## 🧩 Components

### CrashCard

Displays individual crash log with:
- Device ID and crash type badge
- Timestamp and firmware version
- Formatted crash log text
- Crash fingerprint

### DeviceCard

Shows device information with:
- Device ID and status indicator
- Crash count and last crash date
- First/last seen timeline
- Link to device details

### SearchFilterBar

Filter interface with:
- Search input for text matching
- Quick filter buttons by crash type
- Clear filters button

### CrashChart

Line chart showing:
- Crashes per day (last 30 days)
- Smooth line with area fill
- Interactive tooltips
- Chart.js powered

## 🎯 Usage

### Viewing Devices

1. Open http://localhost:5173
2. See all devices on home page
3. Click device card to view details

### Filtering Crashes

1. Go to device detail page
2. Use search bar to find specific crashes
3. Click filter buttons for crash types
4. Clear filters to reset

### Viewing Trends

1. Charts automatically load on device pages
2. Hover over points for exact counts
3. Last 30 days displayed

## 🛠️ Development

### Project Structure

- **Components**: Reusable UI components
- **Pages**: Route-based page components
- **API**: Backend communication layer
- **Styles**: Tailwind CSS + custom CSS

### Adding New Features

1. Create component in `src/components/`
2. Add route in `src/App.jsx` if needed
3. Connect to API via `src/api/client.js`
4. Style with Tailwind classes

### Styling Guide

Use existing patterns:
```jsx
// Glassmorphism card
<div className="glass rounded-lg p-6">

// Badge
<span className="badge badge-panic">PANIC</span>

// Code block
<div className="code-block">
  <pre>{code}</pre>
</div>
```

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| react | UI framework |
| react-router-dom | Routing |
| chart.js | Charts |
| react-chartjs-2 | React wrapper for Chart.js |
| tailwindcss | Styling |

## 📝 License

MIT License

## 🤝 Contributing

For production use, consider:
- User authentication
- Real-time updates (WebSockets)
- Export crash logs (CSV/JSON)
- Advanced filtering and sorting
- Crash log comparison
- Device management (delete, rename)
- Alert notifications
