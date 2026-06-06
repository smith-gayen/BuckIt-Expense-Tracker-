# Trackify - AI-Powered Expense Tracker

An intelligent expense tracking application built with Next.js, featuring OCR receipt scanning, AI-powered insights, and automated saving rules.

## Features

### 🧠 AI-Powered Features
- **Receipt Scanning with OCR + NLP**: Upload receipts to automatically extract merchant, amount, date, and category
- **Natural Language Chatbot**: Ask questions like "Show me food expenses from last 3 months"
- **Predictive Analytics**: AI forecasts next month's expenses and budget overruns
- **Smart Auto-Saver**: AI-driven saving rules based on weather, spending patterns, and behavior

### 💰 Core Functionality
- Expense and income tracking
- Budget management with visual progress indicators
- Savings goals with progress tracking
- Category-based expense organization
- Interactive charts and analytics

### 🤖 Intelligent Features
- Anomaly & fraud detection
- Context-aware notifications
- Smart budget recommendations
- Goal-oriented savings automation
- Self-learning expense categorization

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Turbopack
- **UI Components**: Headless UI, Heroicons
- **Charts**: Recharts
- **OCR**: Tesseract.js
- **Forms**: React Hook Form with Zod validation

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and visit `http://localhost:3000`

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Design System

### Color Palette
- **Primary**: Deep Blue (#0A3D62, #1D2D50, #2C3E50)
- **Accent**: Success Green (#2ECC71, #1ABC9C, #00B894)
- **Neutral**: Off-white backgrounds (#F7F7F7, #ECF0F1)
- **Text**: Dark Gray (#34495E, #2C3E50)

### Typography
- **Headings**: Poppins (Bold, Semi-bold)
- **Body**: Inter (Regular, Medium)

## Project Structure

```
src/
├── app/                    # Next.js app router
├── components/            
│   ├── dashboard/         # Dashboard components
│   ├── expenses/          # Expense management
│   ├── budget/            # Budget tracking
│   ├── savings/           # Savings goals
│   ├── receipt/           # OCR receipt scanning
│   ├── chat/              # AI chatbot
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
├── utils/                 # Helper functions
├── hooks/                 # Custom React hooks
└── styles/                # Global styles
```

## Features Roadmap

- [x] Dashboard with expense overview
- [x] Receipt scanning with OCR
- [x] AI chatbot for natural language queries
- [x] Budget tracking and visualization
- [x] Savings goals and auto-saver rules
- [ ] Predictive analytics implementation
- [ ] Real-time fraud detection
- [ ] Weather-based saving rules
- [ ] Mobile app companion
- [ ] Bank account integration
- [ ] Export functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.
