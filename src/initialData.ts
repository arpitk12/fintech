import { Transaction, Budget, BillPaymentAlert, Goal } from "./types";

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-in001",
    merchant: "Reliance Smart Bazaar",
    amount: 3450.00,
    date: "2026-05-20",
    category: "Groceries",
    cardLast4: "4921",
    source: "bank",
    status: "cleared",
    currency: "INR"
  },
  {
    id: "tx-in002",
    merchant: "Zomato Food Delivery",
    amount: 680.00,
    date: "2026-05-19",
    category: "Food & Dining",
    cardLast4: "4921",
    source: "bank",
    status: "cleared",
    currency: "INR"
  },
  {
    id: "tx-in003",
    merchant: "BSES Rajdhani Power bill",
    amount: 4200.00,
    date: "2026-05-18",
    category: "Utilities",
    cardLast4: "7749",
    source: "gmail",
    status: "synced",
    currency: "INR"
  },
  {
    id: "tx-in004",
    merchant: "PVR Cinemas Director Cut",
    amount: 1800.00,
    date: "2026-05-15",
    category: "Entertainment",
    cardLast4: "4921",
    source: "bank",
    status: "cleared",
    currency: "INR"
  },
  {
    id: "tx-in005",
    merchant: "Tata Cliq Premium Order",
    amount: 9500.00,
    date: "2026-05-12",
    category: "Shopping",
    cardLast4: "4921",
    source: "bank",
    status: "cleared",
    currency: "INR"
  },
  {
    id: "tx-in006",
    merchant: "Uber India Rides New Delhi",
    amount: 450.00,
    date: "2026-05-10",
    category: "Travel",
    cardLast4: "7749",
    source: "gmail",
    status: "synced",
    currency: "INR"
  },
  {
    id: "tx-in007",
    merchant: "SBI Core Salary Deposit",
    amount: 185000.00,
    date: "2026-05-01",
    category: "Income",
    cardLast4: "1092",
    source: "bank",
    status: "cleared",
    currency: "INR"
  },
  {
    id: "tx-in008",
    merchant: "Shoppers Stop Mall",
    amount: 4800.00,
    date: "2026-05-05",
    category: "Shopping",
    cardLast4: "4921",
    source: "bank",
    status: "cleared",
    currency: "INR"
  },
  {
    id: "tx-in009",
    merchant: "MakeMyTrip Flights Indigo",
    amount: 14500.00,
    date: "2026-05-08",
    category: "Travel",
    cardLast4: "4921",
    source: "bank",
    status: "cleared",
    currency: "INR"
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  { category: "Groceries", limit: 15000, spent: 3450 },
  { category: "Food & Dining", limit: 8000, spent: 680 },
  { category: "Utilities", limit: 10000, spent: 4200 },
  { category: "Entertainment", limit: 6000, spent: 1800 },
  { category: "Shopping", limit: 25000, spent: 14300 },
  { category: "Travel", limit: 20000, spent: 14950 },
  { category: "General/Other", limit: 5000, spent: 0 }
];

export const INITIAL_ALERTS: BillPaymentAlert[] = [
  {
    id: "al-1",
    title: "HDFC Regalia Credit Card Due",
    dueDate: "2026-05-28",
    amount: 18500.00,
    category: "Credit Card Payment",
    status: "upcoming"
  },
  {
    id: "al-2",
    title: "BSES Rajdhani Electricity bill",
    dueDate: "2026-05-25",
    amount: 4200.00,
    category: "Utilities",
    status: "paid"
  },
  {
    id: "al-3",
    title: "ACT Fibernet Giga-Broadband",
    dueDate: "2026-06-02",
    amount: 1199.00,
    category: "Utilities",
    status: "upcoming"
  },
  {
    id: "al-4",
    title: "Prestige Golf Apartment Rent",
    dueDate: "2026-06-01",
    amount: 45000.00,
    category: "Rent/Housing",
    status: "upcoming"
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: "gl-1",
    name: "Infinia Annual Fee Reversal",
    cardName: "HDFC Infinia (*4921)",
    type: "annual_spend",
    target: 1000000,
    deadline: "2026-12-31",
    rewardDescription: "Waive annual fee of ₹12,500 + GST",
    completed: false
  },
  {
    id: "gl-2",
    name: "ICICI Sapphiro Lounge Access Booster",
    cardName: "ICICI Sapphiro (*7749)",
    type: "quarterly_spend",
    target: 150000,
    deadline: "2026-06-30",
    rewardDescription: "Unlock complimentary lounge benefits + 2 movie tickets",
    completed: false
  },
  {
    id: "gl-3",
    name: "SBI SimplyCLICK Spend Voucher Spark",
    cardName: "SBI SimplyCLICK (*1092)",
    type: "annual_spend",
    target: 100000,
    deadline: "2026-12-31",
    rewardDescription: "₹2,000 Cleartrip e-Voucher",
    completed: false
  },
  {
    id: "gl-4",
    name: "Axis Atlas High-Value Trans Count",
    cardName: "Axis Atlas (*4921)",
    type: "transaction_count",
    target: 10000, // Make transactions of at least ₹10,000 each
    targetCount: 5, // Count threshold limit
    deadline: "2026-05-31",
    rewardDescription: "Get 15,000 Bonus EDGE Miles",
    completed: false
  }
];
