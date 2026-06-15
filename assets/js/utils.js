/**
 * utils.js
 * Pure helper functions with no side effects.
 * Reusable across the entire module system.
 */

/**
 * Generates a unique ID using timestamp + random string.
 * @returns {string}
 */
export function generateId() {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Formats a number as Nigerian Naira currency.
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats an ISO date string to a human-readable format.
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Returns today's date as an ISO string (YYYY-MM-DD).
 * @returns {string}
 */
export function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Sanitizes a string to prevent basic XSS in innerHTML usage.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Debounces a function call.
 * @param {Function} fn
 * @param {number} delay - ms
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
