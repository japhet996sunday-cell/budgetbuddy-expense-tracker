/**
 * app.js
 * Application entry point.
 * Wires up events, coordinates between modules,
 * and manages application state (filter state).
 */

import { fetchAll, addTransaction, deleteTransaction, updateTransaction, findById } from "./transactions.js";
import { applyFilters } from "./filters.js";
import { renderSummary, renderTransactions, renderCategoryOptions, renderChart, showToast, showFieldError, populateEditForm, resetForm, applyTheme, toggleTheme } from "./ui.js";
import { getTodayISO, debounce } from "./utils.js";

// ─── Application State ────────────────────────────────────────────

/** Active filter values — the only "state" the app holds in memory. */
const filterState = {
  search: "",
  category: "all",
  type: "all",
  from: "",
  to: "",
};

// ─── Core Refresh ─────────────────────────────────────────────────

/**
 * Fetches all data, applies filters, and re-renders the entire UI.
 * Called after any data mutation.
 */
function refreshUI() {
  const all = fetchAll();
  const filtered = applyFilters(all, filterState);

  renderSummary(all);           // summary always shows totals of ALL transactions
  renderTransactions(filtered); // list respects active filters
  renderCategoryOptions(all);   // filter dropdown shows all existing categories
  renderChart(all);             // chart always uses all data
}

// ─── Form Handling ────────────────────────────────────────────────

function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("txn-id").value.trim();
  const payload = {
    title: document.getElementById("txn-title").value,
    amount: document.getElementById("txn-amount").value,
    type: document.getElementById("txn-type").value,
    category: document.getElementById("txn-category").value,
    date: document.getElementById("txn-date").value,
  };

  const isEdit = Boolean(id);
  const result = isEdit
    ? updateTransaction(id, payload)
    : addTransaction(payload);

  if (!result.success) {
    // Map generic error to the relevant field
    const fieldMap = {
      "Title is required.": "txn-title",
      "Amount must be a positive number.": "txn-amount",
      "Type must be Income or Expense.": "txn-type",
      "Category is required.": "txn-category",
      "Date is required.": "txn-date",
    };
    const fieldId = fieldMap[result.error] || "txn-title";
    showFieldError(fieldId, result.error);
    return;
  }

  // Success: close modal, refresh, notify
  const modal = bootstrap.Modal.getInstance(document.getElementById("transactionModal"));
  modal?.hide();
  resetForm();
  refreshUI();
  showToast(isEdit ? "Transaction updated." : "Transaction added.", "success");
}

// ─── Delete Handling ──────────────────────────────────────────────

function handleDeleteClick(id) {
  const confirmModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
  const confirmBtn = document.getElementById("confirm-delete-btn");

  // Replace listener to avoid stacking multiple handlers
  const newBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

  newBtn.addEventListener("click", () => {
    const deleted = deleteTransaction(id);
    confirmModal.hide();
    if (deleted) {
      refreshUI();
      showToast("Transaction deleted.", "danger");
    }
  });

  confirmModal.show();
}

// ─── Edit Handling ────────────────────────────────────────────────

function handleEditClick(id) {
  const transaction = findById(id);
  if (!transaction) return showToast("Transaction not found.", "warning");

  resetForm();
  populateEditForm(transaction);

  const modal = new bootstrap.Modal(document.getElementById("transactionModal"));
  modal.show();
}

// ─── Event Delegation for Table Buttons ──────────────────────────

function handleTableAction(e) {
  const editBtn = e.target.closest(".btn-edit");
  const deleteBtn = e.target.closest(".btn-delete");

  if (editBtn) handleEditClick(editBtn.dataset.id);
  if (deleteBtn) handleDeleteClick(deleteBtn.dataset.id);
}

// ─── Filter Events ────────────────────────────────────────────────

const debouncedRefresh = debounce(refreshUI, 250);

function bindFilterEvents() {
  document.getElementById("search-input")?.addEventListener("input", (e) => {
    filterState.search = e.target.value;
    debouncedRefresh();
  });

  document.getElementById("filter-category")?.addEventListener("change", (e) => {
    filterState.category = e.target.value;
    refreshUI();
  });

  document.getElementById("filter-type")?.addEventListener("change", (e) => {
    filterState.type = e.target.value;
    refreshUI();
  });

  document.getElementById("filter-from")?.addEventListener("change", (e) => {
    filterState.from = e.target.value;
    refreshUI();
  });

  document.getElementById("filter-to")?.addEventListener("change", (e) => {
    filterState.to = e.target.value;
    refreshUI();
  });

  document.getElementById("clear-filters-btn")?.addEventListener("click", () => {
    filterState.search = "";
    filterState.category = "all";
    filterState.type = "all";
    filterState.from = "";
    filterState.to = "";

    document.getElementById("search-input").value = "";
    document.getElementById("filter-category").value = "all";
    document.getElementById("filter-type").value = "all";
    document.getElementById("filter-from").value = "";
    document.getElementById("filter-to").value = "";

    refreshUI();
  });
}

// ─── Modal Reset on Close ─────────────────────────────────────────

function bindModalEvents() {
  document.getElementById("transactionModal")?.addEventListener("hidden.bs.modal", () => {
    resetForm();
  });

  // Clear field validation on input
  document.getElementById("transaction-form")?.addEventListener("input", (e) => {
    e.target.classList.remove("is-invalid");
  });
}

// ─── Init ────────────────────────────────────────────────────────

function init() {
  // Set today's date as default in form
  const dateInput = document.getElementById("txn-date");
  if (dateInput) dateInput.value = getTodayISO();

  // Apply saved theme
  applyTheme();

  // Bind events
  document.getElementById("transaction-form")?.addEventListener("submit", handleFormSubmit);
  document.getElementById("transaction-tbody")?.addEventListener("click", handleTableAction);
  document.getElementById("theme-toggle-btn")?.addEventListener("click", toggleTheme);

  bindFilterEvents();
  bindModalEvents();

  // Initial render
  refreshUI();
}

// Wait for DOM before initialising
document.addEventListener("DOMContentLoaded", init);
