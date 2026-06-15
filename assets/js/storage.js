/**
 * storage.js
 * Handles all localStorage read/write operations.
 * Single source of truth for persisted data.
 */

const STORAGE_KEY = "budgetbuddy_transactions";

/**
 * Retrieves all transactions from localStorage.
 * @returns {Array} Array of transaction objects
 */
export function getTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("[Storage] Failed to read transactions:", err);
    return [];
  }
}

/**
 * Persists the full transactions array to localStorage.
 * @param {Array} transactions
 */
export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error("[Storage] Failed to save transactions:", err);
  }
}

/**
 * Clears all transaction data from localStorage.
 */
export function clearTransactions() {
  localStorage.removeItem(STORAGE_KEY);
}
