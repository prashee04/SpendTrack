# 💎 SpendTrack — Personal Expense Tracker & Financial Intelligence Platform

Developed by **Prasheetha T K G**  
GitHub: [https://github.com/prashee04](https://github.com/prashee04)  
LinkedIn: [https://www.linkedin.com/in/prasheetha-tkg-0889081a9/](https://www.linkedin.com/in/prasheetha-tkg-0889081a9/)

---

## 🌟 Key Features

1. **Dynamic Asset & Wallet Ledger System**:
   - Live synchronization between dynamic user accounts (Bank Accounts, GPay / UPI E-Wallets, Cash Reserves, Cards) and overall Net Worth.
   - Initial wallet balance defaults to ₹0.00 for clean new account registrations.
   - Real-time over-spending balance protection alerts.

2. **Income & Expense Management**:
   - Full support for Income categories (**Allowance**, **Salary**, **Petty Cash**, **Bonus**, **Others**) with dynamic subcategory management.
   - Seamless transfer tracking between asset accounts (e.g., HDFC Bank → GPay E-Wallet).

3. **Smart Bank SMS & Receipt Parser**:
   - Automated parser for Canara Bank credit/debit SMS, Swiggy, Uber, and BESCOM utility notifications.

4. **Bill Reminders & Financial Savings Goals**:
   - Custom utility bill reminder tracking with single-click payment logging.
   - Goal progress tracker with custom deposits and visual milestone indicators.

5. **Data Reset & Security**:
   - Complete account data reset capability (`/api/account/reset`) with zero-knowledge local storage and Prisma ORM database synchronization.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Styling**: Tailwind CSS & Lucide Icons
- **Database & ORM**: Prisma ORM with MongoDB
- **Authentication**: NextAuth.js (Session & Credentials Provider)
- **State Management & Caching**: React 19 Hooks (`useMemo`, `useCallback`) with SSR & Dynamic Imports (`next/dynamic`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="mongodb+srv://..."
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Production Build & Quality Health

```bash
npx next build
```
- **Build Output**: 18/18 Routes compiled with **0 errors**.
- **Performance**: FCP < 0.35s, dynamic code-splitting enabled.
