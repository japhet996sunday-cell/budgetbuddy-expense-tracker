/**
 * transactions.js
 * CRUD operations for transactions.
 * Coordinates between storage and the rest of the app.
 */

import { getTransactions, saveTransactions } from "./storage.js";
import { generateId } from "./utils.js";

/**
 * Retrieves all transactions.
 * @returns {Array}
 */
export function fetchAll() {
  return getTransactions();
}

/**
 * Adds a new transaction after validation.
 * @param {{ title, amount, type, category, date }} payload
 * @returns {{ success: boolean, error?: string, transaction?: Object }}
 */
export function addTransaction(payload) {
  const { title, amount, type, category, date } = payload;

  if (!title?.trim()) return { success: false, error: "Title is required." };
  if (!amount || isNaN(amount) || Number(amount) <= 0)
    return { success: false, error: "Amount must be a positive number." };
  if (!["income", "expense"].includes(type))
    return { success: false, error: "Type must be Income or Expense." };
  if (!category?.trim()) return { success: false, error: "Category is required." };
  if (!date) return { success: false, error: "Date is required." };

  const transaction = {
    id: generateId(),
    title: title.trim(),
    amount: parseFloat(Number(amount).toFixed(2)),
    type,
    category: category.trim(),
    date,
    createdAt: new Date().toISOString(),
  };

  const transactions = getTransactions();
  transactions.unshift(transaction); // newest first
  saveTransactions(transactions);

  return { success: true, transaction };
}

/**
 * Deletes a transaction by ID.
 * @param {string} id
 * @returns {boolean} true if found and deleted
 */
export function deleteTransaction(id) {
  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return false;
  transactions.splice(index, 1);
  saveTransactions(transactions);
  return true;
}

/**
 * Updates an existing transaction by ID.
 * @param {string} id
 * @param {Object} updates - partial transaction fields
 * @returns {{ success: boolean, error?: string, transaction?: Object }}
 */
export function updateTransaction(id, updates) {
  const { title, amount, type, category, date } = updates;

  if (!title?.trim()) return { success: false, error: "Title is required." };
  if (!amount || isNaN(amount) || Number(amount) <= 0)
    return { success: false, error: "Amount must be a positive number." };
  if (!["income", "expense"].includes(type))
    return { success: false, error: "Type must be Income or Expense." };
  if (!category?.trim()) return { success: false, error: "Category is required." };
  if (!date) return { success: false, error: "Date is required." };

  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return { success: false, error: "Transaction not found." };

  transactions[index] = {
    ...transactions[index],
    title: title.trim(),
    amount: parseFloat(Number(amount).toFixed(2)),
    type,
    category: category.trim(),
    date,
    updatedAt: new Date().toISOString(),
  };

  saveTransactions(transactions);
  return { success: true, transaction: transactions[index] };
}

/**
 * Finds a single transaction by ID.
 * @param {string} id
 * @returns {Object|undefined}
 */
export function findById(id) {
  return getTransactions().find((t) => t.id === id);
}
