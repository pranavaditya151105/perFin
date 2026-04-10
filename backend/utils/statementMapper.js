const xlsx = require('xlsx');

const CATEGORIES = {
  HOUSING: "Housing",
  FOOD: "Food & Groceries",
  TRANSPORT: "Transport",
  UTILITIES: "Utilities",
  ENTERTAINMENT: "Entertainment",
  INVESTMENTS_STOCKS: "Stocks",
  INVESTMENTS_MF: "Mutual Funds",
  INVESTMENTS_CRYPTO: "Crypto",
  SHOPPING: "Shopping",
  CASH: "Cash Withdrawal",
  BANK_CHARGES: "Bank Charges",
  TAX_PAYMENT: "Tax Payment",
  INCOME_SALARY: "Salary Income",
  INCOME_BUSINESS: "Business Income",
  INCOME_OTHER: "Other Income",
  TRANSFERS: "Transfers",
  DEPOSITS: "Deposits",
  OTHERS: "Others"
};

const MERCHANTS = {
  FOOD: ["SWIGGY", "ZOMATO", "RESTAURANT", "FOOD", "BIGBAZAAR", "PARADISE", "DMART", "BLINKIT", "ZEPTO", "DOMINOS", "KFC", "PIZZA", "MC DONALDS", "BURGER KING", "SUBWAY", "CAFE", "HALDIRAMS", "NATURALS", "MEHFIL"],
  SHOPPING: ["AMAZON", "FLIPKART", "MYNTRA", "AJIO", "MEESHO", "NYKAA", "RELIANCE RETAIL", "TATA CLIQ", "SNAPDEAL"],
  HOUSING: ["RENT", "HOUSE", "LANDLORD", "MAINTENANCE", "LODGING", "SOCIETY", "HOUSING"],
  TRANSPORT: ["UBER", "OLA", "FUEL", "PETROL", "FASTAG", "INDIAN OIL", "BPCL", "HPCL", "SHELL", "IRCTC", "MAKE MY TRIP", "RED BUS", "RAPIDO", "DIESEL", "NAMMA METRO", "BMTC", "AUTO"],
  UTILITIES: ["ELECTRICITY", "WATER BILL", "RECHARGE", "AIRTEL", "JIO", "VODAFONE", "ACT FIBERNET", "BESCOM", "TATA SKY", "BROADBAND", "MSEDCL", "TNEB", "CESC", "TORRENT"],
  ENTERTAINMENT: ["NETFLIX", "SPOTIFY", "PRIME VIDEO", "HOTSTAR", "BOOKMYSHOW", "PVR", "INOX", "STEAM", "YOUTUBE PREMIUM", "APPLE MUSIC", "GAANA", "ZEE5"],
  INVESTMENTS_STOCKS: ["ZERODHA", "UPSTOX", "ANGEL ONE", "INDMONEY", "ICICIDIRECT", "HDFCSEC", "KOTAK SEC", "MOTILAL", "SHAREKHAN"],
  INVESTMENTS_MF: ["GROWW", "MUTUAL FUND", "SIP", "CAMS", "KFINTECH", "NJ INDYA", "PRUDENTIAL", "MF-", "MIRAE", "AXIS MF", "SBI MF", "HDFC MF", "NIPPON MF", "PARAG PARIKH"],
  INVESTMENTS_CRYPTO: ["WAZIRX", "BINANCE", "COINSWITCH", "COINDCX", "CRYPTO", "MUDREX"],
  TAX_PAYMENT: ["GST PMT", "INCOME TAX", "TDS PAYMENT", "ADVANCE TAX", "CHALLAN", "NSDL TAX", "OLTAS"],
  BANK_CHARGES: ["PENALTY", "ANNUAL FEE", "INTEREST DEBIT", "STAMP DUTY", "SMS CHARGE", "LOCKER CHARGE", "PROCESSING FEE"],
  CASH: ["ATM WDL", "ATM CASH", "CASH WITHDRAWAL", "ATM-"],
  TRANSFERS: ["SWEEP", "SELF TRANSFER", "OWN A/C", "INTERNAL TRANSFER", "LINKED A/C", "IMPS-SELF", "NEFT-SELF"]
};

const SALARY_KEYWORDS = ["SALARY", "PAYROLL", "BONUS", "STIPEND", "CMS-SAL", "HR-PAY", "EMPL"];
const BUSINESS_INCOME_KEYWORDS = ["CLIENT", "INVOICE", "CONSULTING", "FREELANCE", "PROJECT", "PAYMENT FROM", "RECEIVED FROM", "GST-CR", "VENDOR PMT"];

const DEPOSIT_KEYWORDS = [
  "CASH DEP", "CASH DEPOSIT", "ATM DEP", "ATM DEPOSIT",
  "CDM", "SELF DEP", "BRANCH DEP", "CASH CR", "CASH CREDIT",
  "DEP BY CASH", "DEPOSIT BY CASH", "COUNTER DEP"
];

const toCleanNumber = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === 'number') return Math.abs(val);
  const cleaned = String(val).replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num);
};

const sanitizeDescription = (desc) => {
  if (!desc) return "";
  return desc.toString()
    .toUpperCase()
    .replace(/\d{10,}/g, "[ID]")
    .replace(/[a-zA-Z0-9.\-_]+@[a-zA-Z]+/g, "[VPA]")
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, "[CARD]")
    .trim();
};

const classifyIncome = (narration) => {
  const clean = narration.toUpperCase();
  if (SALARY_KEYWORDS.some(kw => clean.includes(kw))) return "INCOME_SALARY";
  if (BUSINESS_INCOME_KEYWORDS.some(kw => clean.includes(kw))) return "INCOME_BUSINESS";
  if (clean.includes("UPI/") || clean.includes("IMPS/") || clean.includes("NEFT/")) return "INCOME_OTHER";
  if (clean.includes("INT ") || clean.includes("INTEREST CREDIT")) return "INCOME_OTHER";
  return "INCOME_OTHER";
};

const categorizeTransaction = (description) => {
  const rawUpper = description.toUpperCase();
  const cleanDesc = sanitizeDescription(description);

  for (const [category, keywords] of Object.entries(MERCHANTS)) {
    if (keywords.some(kw => rawUpper.includes(kw))) {
      return { category, confidence: "high", cleanDesc };
    }
  }

  return { category: "OTHERS", confidence: "low", cleanDesc };
};

const isValidDateCell = (val) => {
  if (val === null || val === undefined) return false;
  if (val instanceof Date) return !isNaN(val.getTime());
  if (typeof val === 'number') return val > 30000 && val < 60000;
  const strVal = String(val).trim();
  if (!strVal) return false;
  return /\d{1,2}[-/][A-Za-z\d]{2,3}[-/]\d{2,4}/.test(strVal);
};

const parseMonthKey = (val) => {
  try {
    let date;
    if (val instanceof Date) {
      date = val;
    } else if (typeof val === 'number') {
      date = new Date(Math.round((val - 25569) * 86400 * 1000));
    } else {
      const parts = String(val).split(/[-/]/);
      if (parts.length < 3) return null;
      date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    if (!date || isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  } catch {
    return null;
  }
};

const detectHeaders = (rows) => {
  for (let i = 0; i < Math.min(rows.length, 50); i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;

    const rowStr = row.map(c => String(c || "").toUpperCase());

    const dateIdx = rowStr.findIndex(c => c.includes("DATE"));
    const descIdx = rowStr.findIndex(c => c.includes("NARRATION") || c.includes("DESCRIPTION") || c.includes("PARTICULAR") || c.includes("DETAILS") || c.includes("REMARKS"));
    const debitIdx = rowStr.findIndex(c => c.includes("WITHDRAWAL") || c.includes("DEBIT") || /\bDR\b/.test(c));
    const creditIdx = rowStr.findIndex(c => c.includes("DEPOSIT") || c.includes("CREDIT") || /\bCR\b/.test(c));
    const balanceIdx = rowStr.findIndex(c => c.includes("BALANCE"));

    if (dateIdx !== -1 && descIdx !== -1 && balanceIdx !== -1) {
      return { dateIdx, descIdx, debitIdx, creditIdx, balanceIdx, headerRow: i };
    }
  }
  return null;
};

const parseBankStatement = (buffer) => {
  let workbook;
  try {
    workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });
  } catch (err) {
    console.error("Excel Read Error:", err);
    return {
      income: { salary: 0, business: 0, other: 0, by_month: {} },
      expenses: {
        housing: 0, food: 0, transport: 0, utilities: 0, entertainment: 0,
        shopping: 0, cash_withdrawals: 0, bank_charges: 0, tax_payments: 0,
        investments: { stocks: 0, mutual_funds: 0, crypto: 0 }, others: 0, by_month: {}
      },
      deposits: { total: 0, by_month: {} },
      closing_balance: 0, unclassified: [],
      warnings: ["Failed to read Excel file. Please ensure it's a valid .xlsx or .xls file."],
      metrics: { total_income: 0, total_expenses: 0, total_investments: 0, total_deposits: 0, current_savings: 0, avg_monthly_income: 0, savings_ratio: 0, expense_ratio: 0, months_analyzed: 0, unclassified_count: 0 }
    };
  }

  const summary = {
    income: { salary: 0, business: 0, other: 0, by_month: {} },
    expenses: {
      housing: 0, food: 0, transport: 0, utilities: 0, entertainment: 0,
      shopping: 0, cash_withdrawals: 0, bank_charges: 0, tax_payments: 0,
      investments: { stocks: 0, mutual_funds: 0, crypto: 0 }, others: 0, by_month: {}
    },
    deposits: { total: 0, by_month: {} },
    closing_balance: 0, unclassified: [], warnings: []
  };

  let totalSheetsProcessed = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
    const headers = detectHeaders(rows);

    if (!headers) {
      summary.warnings.push(`Sheet "${sheetName}": could not detect header row — skipped`);
      continue;
    }

    const { dateIdx, descIdx, debitIdx, creditIdx, balanceIdx, headerRow } = headers;

    let lastBalance = 0;

    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const dateVal = row[dateIdx];
      const dateValid = isValidDateCell(dateVal);

      if (i < headerRow + 6) {
        // Debug logging removed for production
      }

      if (!dateValid) continue;

      const monthKey = parseMonthKey(row[dateIdx]) || "unknown";
      const narration = String(row[descIdx] || "").trim();
      const debit = debitIdx !== -1 ? toCleanNumber(row[debitIdx]) : 0;
      const credit = creditIdx !== -1 ? toCleanNumber(row[creditIdx]) : 0;
      const balance = balanceIdx !== -1 ? toCleanNumber(row[balanceIdx]) : 0;

      if (balance > 0) lastBalance = balance;

      // Init buckets
      if (!summary.income.by_month[monthKey]) summary.income.by_month[monthKey] = { salary: 0, business: 0, other: 0 };
      if (!summary.expenses.by_month[monthKey]) summary.expenses.by_month[monthKey] = { housing: 0, food: 0, transport: 0, utilities: 0, entertainment: 0, shopping: 0, investments: 0, others: 0 };
      if (!summary.deposits.by_month[monthKey]) summary.deposits.by_month[monthKey] = 0;

      if (credit > 0) {
        const upperNarr = narration.toUpperCase();
        const isTransfer = MERCHANTS.TRANSFERS.some(kw => upperNarr.includes(kw));
        if (isTransfer) continue;

        const isDeposit = DEPOSIT_KEYWORDS.some(kw => upperNarr.includes(kw));
        if (isDeposit) {
          summary.deposits.total += credit;
          summary.deposits.by_month[monthKey] += credit;
        } else {
          const incomeType = classifyIncome(narration);
          if (incomeType === "INCOME_SALARY") {
            summary.income.salary += credit;
            summary.income.by_month[monthKey].salary += credit;
          } else if (incomeType === "INCOME_BUSINESS") {
            summary.income.business += credit;
            summary.income.by_month[monthKey].business += credit;
          } else {
            summary.income.other += credit;
            summary.income.by_month[monthKey].other += credit;
          }
        }
      }

      if (debit > 0) {
        const { category, confidence, cleanDesc } = categorizeTransaction(narration);
        if (category === "TRANSFERS") continue;

        if (confidence === "low" && summary.unclassified.length < 100) {
          summary.unclassified.push({ narration: cleanDesc, amount: debit, month: monthKey });
        }

        switch (category) {
          case "HOUSING":
            summary.expenses.housing += debit;
            summary.expenses.by_month[monthKey].housing += debit;
            break;
          case "FOOD":
            summary.expenses.food += debit;
            summary.expenses.by_month[monthKey].food += debit;
            break;
          case "TRANSPORT":
            summary.expenses.transport += debit;
            summary.expenses.by_month[monthKey].transport += debit;
            break;
          case "UTILITIES":
            summary.expenses.utilities += debit;
            summary.expenses.by_month[monthKey].utilities += debit;
            break;
          case "ENTERTAINMENT":
            summary.expenses.entertainment += debit;
            summary.expenses.by_month[monthKey].entertainment += debit;
            break;
          case "SHOPPING":
            summary.expenses.shopping += debit;
            summary.expenses.by_month[monthKey].shopping += debit;
            break;
          case "INVESTMENTS_STOCKS":
            summary.expenses.investments.stocks += debit;
            summary.expenses.by_month[monthKey].investments += debit;
            break;
          case "INVESTMENTS_MF":
            summary.expenses.investments.mutual_funds += debit;
            summary.expenses.by_month[monthKey].investments += debit;
            break;
          case "INVESTMENTS_CRYPTO":
            summary.expenses.investments.crypto += debit;
            summary.expenses.by_month[monthKey].investments += debit;
            break;
          case "TAX_PAYMENT":
            summary.expenses.tax_payments += debit;
            break;
          case "BANK_CHARGES":
            summary.expenses.bank_charges += debit;
            break;
          case "CASH":
            summary.expenses.cash_withdrawals += debit;
            break;
          default:
            summary.expenses.others += debit;
            summary.expenses.by_month[monthKey].others += debit;
        }
      }
    }

    summary.closing_balance += lastBalance;
    totalSheetsProcessed++;
  }

  if (totalSheetsProcessed === 0) {
    summary.warnings.push("No sheets could be processed — check file format");
  }

  summary.metrics = deriveMetrics(summary);
  return summary;
};

const deriveMetrics = (summary) => {
  const months = Object.keys(summary.income.by_month).filter(m => m !== "unknown");
  const monthCount = months.length || 1;

  const totalIncome = summary.income.salary + summary.income.business + summary.income.other;
  const totalExpenses = summary.expenses.housing + summary.expenses.food + summary.expenses.transport + summary.expenses.utilities + summary.expenses.entertainment + summary.expenses.shopping + summary.expenses.cash_withdrawals + summary.expenses.bank_charges + summary.expenses.tax_payments + summary.expenses.others;
  const totalInvestments = summary.expenses.investments.stocks + summary.expenses.investments.mutual_funds + summary.expenses.investments.crypto;

  const avgMonthlyIncome = totalIncome / monthCount;
  const currentSavings = summary.closing_balance;

  const savingsRatio = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome * 100).toFixed(1) : 0;

  return {
    total_income: Math.round(totalIncome),
    total_expenses: Math.round(totalExpenses),
    total_investments: Math.round(totalInvestments),
    total_deposits: Math.round(summary.deposits.total),
    current_savings: Math.round(currentSavings),
    avg_monthly_income: Math.round(avgMonthlyIncome),
    savings_ratio: parseFloat(savingsRatio),
    expense_ratio: parseFloat(expenseRatio),
    months_analyzed: monthCount,
    unclassified_count: summary.unclassified.length
  };
};

module.exports = { parseBankStatement, sanitizeDescription, categorizeTransaction, classifyIncome };

