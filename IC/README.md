# Aap-IC: Investment Calculators

A modern, responsive financial analysis and planning web app built with Next.js, Tailwind CSS, and Recharts.

## Features

### 🎯 Dashboard (Income & Expense Tracking)
- Track monthly income, expenses, and savings
- **Two Calculation Modes:**
  - Shared Account: Combined household budget
  - Separate Accounts: Two-person mode with income ratio-based shared expense splitting
- Expanded expense categories with customizable person names
- Real-time calculations for:
  - Total Monthly Expenses
  - Net Leftover (Income - Expenses)
  - Expense Ratio
  - Savings Rate
- **Median Indicators**: Compare your income and savings against age bracket medians
  - Green badge: Above Median
  - Blue badge: At Median
  - Amber badge: Below Median

### 📈 Retirement Projection
- Input current age, retirement age, monthly investment amount, and expected annual return
- Interactive area chart showing wealth growth over time
- Summary statistics:
  - Years to retirement
  - Total contributions
  - Investment gains
  - Total estimated wealth at retirement

### ⚙️ Benchmark Settings
- Edit global median values for each age bracket (18-29, 30-44, 45-59, 60+)
- Customize income and savings benchmarks
- Real-time sync across all pages

## Getting Started

### Installation

```bash
cd /path/to/audit/audit
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
audit/
├── pages/
│   ├── _app.js              # App wrapper with global provider
│   ├── _document.js         # Document structure
│   ├── index.js             # Landing page
│   ├── dashboard.js         # Income & Expense Dashboard
│   ├── retirement.js        # Retirement Projection
│   └── settings.js          # Benchmark Settings
├── components/
│   ├── Sidebar.js           # Navigation sidebar
│   └── MedianBadge.js       # Median status indicator
├── context/
│   └── FinancialContext.js  # Global state management
├── styles/
│   └── globals.css          # Global styles
├── public/
│   ├── manifest.json        # PWA manifest
│   └── icon-*.png           # App icons
└── tailwind.config.js       # Tailwind CSS configuration
```

## Design System

### Theme
- **Color Scheme**: Modern Dark Mode (Background: #09090b)
- **Aesthetic**: Glassmorphism with backdrop blur
- **Typography**: Geist/Inter for general text, monospace for financial figures

### Components
- Glass cards with semi-transparent backgrounds and borders
- Smooth transitions and hover effects
- Responsive grid layouts
- Status badges with color coding

## State Management

Global financial data is managed through React Context (`FinancialContext`) which includes:
- Selected age bracket
- Median income and savings for each bracket
- Functions to update and retrieve benchmark data

All components can access this data via the `useFinancial()` hook.

## Technologies Used

- **Next.js 14**: React framework
- **Tailwind CSS**: Utility-first CSS
- **Recharts**: Data visualization
- **Lucide React**: Icons
- **React Context**: State management

## Deployment

### Deploy to Vercel

1. Push to GitHub:
```bash
git add .
git commit -m "Add Aap-FT financial tools app"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set Root Directory to `audit/`
5. Click Deploy

Your app will be live within minutes!

## Mobile App (iOS/iPad)

This app is PWA-enabled and can be installed on iOS:

1. Open the app in Safari
2. Tap Share → Add to Home Screen
3. The app will launch in fullscreen with your custom icon

## Future Enhancements

- [ ] Data persistence (localStorage/database)
- [ ] PDF export reports
- [ ] Monthly/yearly history tracking
- [ ] Goal setting and tracking
- [ ] Investment portfolio tracker
- [ ] Debt payoff calculator
- [ ] Multi-currency support

## Development Branches

- **main**: Stable release branch with core features
- **features/achievements-roasts**: Achievements system and roast mode features
- **fun-features**: Additional fun and easter egg features
- **secret-menu-features**: Secret menu and hidden functionality

## License

MIT License © 2026 Aap Financial Tools

