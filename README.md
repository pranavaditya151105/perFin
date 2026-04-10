# PerFin AI - Personal Finance Copilot

PerFin AI is an intelligent, AI-powered personal finance management application that helps users track their financial health and provides tailored advice through dedicated AI financial advisors. With a clean, premium "Mossy Hollow" aesthetic, it offers a seamless way to manage your income, expenses, assets, liabilities, and financial goals.

## Features

- **Comprehensive Financial Tracking**: Input and manage your detailed financial data, including income, expenses, assets, liabilities, and credit health.
- **Goal Setting**: Set and monitor your financial goals (e.g., building an Emergency Fund).
- **AI Financial Advisors**: Powered by the Gemini API, get personalized advice from specialized MVP advisors:
  - 🛡️ **Insurance Advisor**
  - 🧾 **Tax Advisor**
  - 📈 **Credit Score Advisor**
- **Interactive Dashboard**: Visualize your finances with dynamic charts and graphs.
- **Premium UI/UX**: Built with a sleek, minimalist olive color palette to provide a calming, intuitive user experience.

## Tech Stack (MERN)

### Frontend
- **Framework**: Next.js 16 / React 19 (JavaScript)
- **Styling**: Tailwind CSS V4, Framer Motion (for animations)
- **State Management**: Zustand
- **Charting**: Recharts
- **Components**: Radix UI Primitives

### Backend
- **Framework**: Express.js / Node.js
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Google Generative AI (Gemini), Groq
- **Authentication**: JWT, bcrypt
- **Email Service**: Resend Email Integration

## Getting Started

### Prerequisites
- Node.js (for both frontend and backend)
- MongoDB Database (e.g., MongoDB Atlas)
- Google Gemini API Key
- Resend API Key

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a `.env` file and fill in your configuration:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `RESEND_API_KEY`
4. **Run the server**:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create or update `.env.local` with necessary environment variables.
4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

## Deployment

The application is configured to be deployed using industry-standard cloud providers:
- **Backend**: Recommended to deploy on [Render](https://render.com/).
- **Frontend**: Recommended to deploy on [Vercel](https://vercel.com/).
- **Database**: Recommended to use [MongoDB Atlas](https://www.mongodb.com/atlas/database) for a managed cloud database solution.

## License
[MIT License](LICENSE)
