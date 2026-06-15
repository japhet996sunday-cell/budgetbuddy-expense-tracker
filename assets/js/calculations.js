/**
 * calculations.js
 * Pure financial computation functions.
 * No DOM interaction — takes data, returns numbers.
 */

/**
 * Sums all income transactions.
 * @param {Array} transactions
 * @returns {number}
 */
export function calcTotalIncome(transactions) {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Sums all expense transactions.
 * @param {Array} transactions
 * @returns {number}
 */
export function calcTotalExpenses(transactions) {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculates net balance (income - expenses).
 * @param {Array} transactions
 * @returns {number}
 */
export function calcBalance(transactions) {
  return calcTotalIncome(transactions) - calcTotalExpenses(transactions);
}

/**
 * Groups transactions by category and returns totals per category.
 * @param {Array} transactions
 * @returns {Object} { categoryName: totalAmount }
 */
export function calcByCategory(transactions) {
  return transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
}

/**
 * Returns income vs expense totals for chart rendering.
 * @param {Array} transactions
 * @returns {{ income: number, expense: number }}
 */
export function calcChartData(transactions) {
  return {
    income: calcTotalIncome(transactions),
    expense: calcTotalExpenses(transactions),
  };
}
