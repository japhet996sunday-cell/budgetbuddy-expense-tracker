/**
 * filters.js
 * Pure filtering functions for the transaction list.
 * All functions take a transactions array and return a filtered copy.
 */

/**
 * Filters transactions by a search query (title match, case-insensitive).
 * @param {Array} transactions
 * @param {string} query
 * @returns {Array}
 */
export function filterBySearch(transactions, query) {
  if (!query?.trim()) return transactions;
  const q = query.toLowerCase().trim();
  return transactions.filter((t) => t.title.toLowerCase().includes(q));
}

/**
 * Filters transactions by category.
 * @param {Array} transactions
 * @param {string} category - "all" or a specific category string
 * @returns {Array}
 */
export function filterByCategory(transactions, category) {
  if (!category || category === "all") return transactions;
  return transactions.filter(
    (t) => t.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Filters transactions by type.
 * @param {Array} transactions
 * @param {string} type - "all", "income", or "expense"
 * @returns {Array}
 */
export function filterByType(transactions, type) {
  if (!type || type === "all") return transactions;
  return transactions.filter((t) => t.type === type);
}

/**
 * Filters transactions within a date range (inclusive).
 * @param {Array} transactions
 * @param {string} from - ISO date string (YYYY-MM-DD)
 * @param {string} to - ISO date string (YYYY-MM-DD)
 * @returns {Array}
 */
export function filterByDateRange(transactions, from, to) {
  if (!from && !to) return transactions;
  return transactions.filter((t) => {
    const d = t.date;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
}

/**
 * Applies all active filters from a filter state object.
 * @param {Array} transactions
 * @param {{ search: string, category: string, type: string, from: string, to: string }} state
 * @returns {Array}
 */
export function applyFilters(transactions, state) {
  let result = [...transactions];
  result = filterBySearch(result, state.search);
  result = filterByCategory(result, state.category);
  result = filterByType(result, state.type);
  result = filterByDateRange(result, state.from, state.to);
  return result;
}
