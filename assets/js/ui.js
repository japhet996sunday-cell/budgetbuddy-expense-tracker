/**
 * ui.js
 * All DOM rendering and UI update functions.
 * Receives data — never fetches it directly.
 */

import { formatCurrency, formatDate, escapeHtml, capitalize } from "./utils.js";
import {
  calcBalance,
  calcTotalIncome,
  calcTotalExpenses,
  calcChartData,
} from "./calculations.js";

// Chart.js instance reference (singleton)
let chartInstance = null;

// ─── Summary Cards ────────────────────────────────────────────────

/**
 * Updates the three summary cards in the dashboard.
 * @param {Array} transactions
 */
export function renderSummary(transactions) {
  const balance = calcBalance(transactions);
  const income = calcTotalIncome(transactions);
  const expenses = calcTotalExpenses(transactions);

  const balanceEl = document.getElementById("summary-balance");
  const incomeEl = document.getElementById("summary-income");
  const expenseEl = document.getElementById("summary-expense");

  if (balanceEl) {
    balanceEl.textContent = formatCurrency(balance);
    balanceEl.className = `summary-amount ${balance < 0 ? "text-danger" : "text-success"}`;
  }
  if (incomeEl) incomeEl.textContent = formatCurrency(income);
  if (expenseEl) expenseEl.textContent = formatCurrency(expenses);
}

// ─── Transaction List ─────────────────────────────────────────────

/**
 * Renders the transaction table rows.
 * @param {Array} transactions - already filtered
 */
export function renderTransactions(transactions) {
  const tbody = document.getElementById("transaction-tbody");
  const emptyState = document.getElementById("empty-state");
  const tableWrapper = document.getElementById("table-wrapper");

  if (!tbody) return;

  // Update count badge
  const countBadge = document.getElementById("txn-count");
  if (countBadge) countBadge.textContent = transactions.length;

  if (transactions.length === 0) {
    if (emptyState) emptyState.classList.remove("d-none");
    if (tableWrapper) tableWrapper.classList.add("d-none");
    return;
  }

  if (emptyState) emptyState.classList.add("d-none");
  if (tableWrapper) tableWrapper.classList.remove("d-none");

  tbody.innerHTML = transactions
    .map(
      (t) => `
    <tr class="transaction-row" data-id="${t.id}">
      <td>
        <div class="txn-title">${escapeHtml(t.title)}</div>
        <div class="txn-category-mobile text-muted small">${escapeHtml(capitalize(t.category))}</div>
      </td>
      <td>
        <span class="txn-amount ${t.type === "income" ? "amount-income" : "amount-expense"}">
          ${t.type === "income" ? "+" : "−"}${formatCurrency(t.amount)}
        </span>
      </td>
      <td class="d-none d-md-table-cell">
        <span class="category-pill">${escapeHtml(capitalize(t.category))}</span>
      </td>
      <td class="d-none d-sm-table-cell text-muted">${formatDate(t.date)}</td>
      <td>
        <span class="type-badge badge ${t.type === "income" ? "badge-income" : "badge-expense"}">
          ${capitalize(t.type)}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-edit" data-id="${t.id}" title="Edit">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn-action btn-delete" data-id="${t.id}" title="Delete">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
}

// ─── Category Options ─────────────────────────────────────────────

/**
 * Extracts unique categories from transactions and populates filter dropdown.
 * @param {Array} transactions
 */
export function renderCategoryOptions(transactions) {
  const filterSelect = document.getElementById("filter-category");
  if (!filterSelect) return;

  const categories = [...new Set(transactions.map((t) => t.category))].sort();
  const currentVal = filterSelect.value;

  filterSelect.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = capitalize(cat);
    if (cat === currentVal) opt.selected = true;
    filterSelect.appendChild(opt);
  });
}

// ─── Modal / Form ─────────────────────────────────────────────────

/**
 * Populates the transaction form with existing data (for editing).
 * @param {Object} transaction
 */
export function populateEditForm(transaction) {
  document.getElementById("txn-id").value = transaction.id;
  document.getElementById("txn-title").value = transaction.title;
  document.getElementById("txn-amount").value = transaction.amount;
  document.getElementById("txn-type").value = transaction.type;
  document.getElementById("txn-category").value = transaction.category;
  document.getElementById("txn-date").value = transaction.date;

  const modalTitle = document.getElementById("modal-title");
  if (modalTitle) modalTitle.textContent = "Edit Transaction";

  const submitBtn = document.getElementById("modal-submit-btn");
  if (submitBtn) submitBtn.textContent = "Save Changes";
}

/**
 * Resets the transaction form to its default (add) state.
 */
export function resetForm() {
  const form = document.getElementById("transaction-form");
  if (form) form.reset();

  document.getElementById("txn-id").value = "";

  const modalTitle = document.getElementById("modal-title");
  if (modalTitle) modalTitle.textContent = "Add Transaction";

  const submitBtn = document.getElementById("modal-submit-btn");
  if (submitBtn) submitBtn.textContent = "Add Transaction";

  // Clear validation states
  form?.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
}

/**
 * Marks a form field as invalid and shows a message.
 * @param {string} fieldId
 * @param {string} message
 */
export function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add("is-invalid");
  const feedback = field.nextElementSibling;
  if (feedback?.classList.contains("invalid-feedback")) {
    feedback.textContent = message;
  }
}

// ─── Toast Notifications ──────────────────────────────────────────

/**
 * Shows a Bootstrap toast notification.
 * @param {string} message
 * @param {'success'|'danger'|'warning'|'info'} type
 */
export function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const id = `toast-${Date.now()}`;
  const icons = {
    success: "bi-check-circle-fill",
    danger: "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  };

  const toastEl = document.createElement("div");
  toastEl.id = id;
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi ${icons[type] || icons.info}"></i>
        ${escapeHtml(message)}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toastEl);

  const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
  toast.show();

  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

// ─── Chart ────────────────────────────────────────────────────────

/**
 * Renders or updates the income vs expense doughnut chart.
 * @param {Array} transactions
 */
export function renderChart(transactions) {
  const canvas = document.getElementById("overview-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const { income, expense } = calcChartData(transactions);
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#e2e8f0" : "#374151";

  if (chartInstance) {
    chartInstance.data.datasets[0].data = [income, expense];
    chartInstance.options.plugins.legend.labels.color = textColor;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          data: [income, expense],
          backgroundColor: ["#10b981", "#ef4444"],
          borderColor: isDark ? "#1e293b" : "#ffffff",
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: textColor,
            padding: 16,
            font: { family: "'DM Sans', sans-serif", size: 13 },
            usePointStyle: true,
            pointStyleWidth: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw;
              return ` ${formatCurrency(val)}`;
            },
          },
        },
      },
    },
  });
}

/**
 * Updates chart colors when theme toggles.
 */
export function updateChartTheme() {
  if (!chartInstance) return;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  chartInstance.data.datasets[0].borderColor = isDark ? "#1e293b" : "#ffffff";
  chartInstance.options.plugins.legend.labels.color = isDark ? "#e2e8f0" : "#374151";
  chartInstance.update();
}

// ─── Dark Mode ────────────────────────────────────────────────────

/**
 * Applies the saved theme preference on page load.
 */
export function applyTheme() {
  const saved = localStorage.getItem("budgetbuddy_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  const icon = document.getElementById("theme-icon");
  if (icon) icon.className = saved === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
}

/**
 * Toggles between light and dark mode.
 */
export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("budgetbuddy_theme", next);
  const icon = document.getElementById("theme-icon");
  if (icon) icon.className = next === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
  updateChartTheme();
}
