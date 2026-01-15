/**
 * Currency Context - Global currency display management.
 * Stores user's preferred display currency (USD or VND).
 * Note: This only changes display formatting, not conversion.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type CurrencyCode = "USD" | "VND";

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  decimals: number;
}

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
    decimals: 2,
  },
  VND: {
    code: "VND",
    symbol: "₫",
    locale: "vi-VN",
    decimals: 0, // VND doesn't use decimals
  },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  config: CurrencyConfig;
  setCurrency: (currency: CurrencyCode) => void;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const STORAGE_KEY = "finance_currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as CurrencyCode) || "USD";
  });

  const config = CURRENCIES[currency];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
  };

  const formatAmount = (amount: number): string => {
    const formatted = amount.toLocaleString(config.locale, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });
    // Place symbol appropriately
    if (currency === "VND") {
      return `${formatted}${config.symbol}`;
    }
    return `${config.symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, config, setCurrency, formatAmount }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

export { CURRENCIES };
