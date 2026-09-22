/**
 * CYNEX BANK - ONLINE PAYMENT & BANKING SYSTEM
 * Implements the Java OOP Architecture:
 * - Account
 * - Payment (Abstract), CreditCardPayment, PayPalPayment, BankTransferPayment
 * - PaymentValidator
 * - PaymentGateway
 */

// ======================================================
// 1. ACCOUNT CLASS (Matches Java Account)
// ======================================================
class Account {
  constructor(username, password, balance = 0) {
    this.username = username;
    this.password = password;
    this.balance = Number(balance);
  }

  getUsername() {
    return this.username;
  }

  getPassword() {
    return this.password;
  }

  getBalance() {
    return this.balance;
  }

  addBalance(amount) {
    this.balance = Number((this.balance + Number(amount)).toFixed(2));
  }

  deductBalance(amount) {
    amount = Number(amount);
    if (this.balance >= amount) {
      this.balance = Number((this.balance - amount).toFixed(2));
      return true;
    }
    return false;
  }
}

// ======================================================
// 2. ABSTRACT PAYMENT CLASS & SUBCLASSES (Matches Java)
// ======================================================
class Payment {
  constructor(paymentId, amount, methodType) {
    if (this.constructor === Payment) {
      throw new Error("Abstract class Payment cannot be instantiated directly.");
    }
    this.paymentId = paymentId;
    this.amount = Number(amount);
    this.methodType = methodType;
    this.timestamp = new Date().toISOString();
  }

  getAmount() {
    return this.amount;
  }

  getPaymentId() {
    return this.paymentId;
  }

  getMethodType() {
    return this.methodType;
  }

  processPayment() {
    throw new Error("processPayment() must be implemented by subclass.");
  }

  refundPayment() {
    throw new Error("refundPayment() must be implemented by subclass.");
  }

  getDetailsString() {
    return "";
  }
}

// ------------------------------------------------------
// Credit Card Payment Subclass
// ------------------------------------------------------
class CreditCardPayment extends Payment {
  constructor(paymentId, amount, cardNumber, expiryYear) {
    super(paymentId, amount, "Credit Card");
    this.cardNumber = String(cardNumber).replace(/\s+/g, "");
    this.expiryYear = parseInt(expiryYear, 10);
  }

  getExpiryYear() {
    return this.expiryYear;
  }

  getMaskedCard() {
    const clean = this.cardNumber;
    const last4 = clean.length >= 4 ? clean.substring(clean.length - 4) : "0000";
    return `**** **** **** ${last4}`;
  }

  getDetailsString() {
    return this.getMaskedCard();
  }

  processPayment() {
    Terminal.log("\nProcessing Credit Card Payment...", "proc");
    Terminal.log(`Payment ID : ${this.paymentId}`, "data");
    Terminal.log(`Amount     : Rs.${this.amount.toFixed(2)}`, "data");
    Terminal.log(`Card       : ${this.getMaskedCard()}`, "data");
    Terminal.log("Credit Card Payment Successful!", "success");
  }

  refundPayment() {
    Terminal.log("\nProcessing Credit Card Refund...", "proc");
    Terminal.log(`Refund Amount : Rs.${this.amount.toFixed(2)}`, "refund");
    Terminal.log("Refund sent to Credit Card.", "data");
    Terminal.log("Credit Card Refund Successful!", "success");
  }
}

// ------------------------------------------------------
// PayPal Payment Subclass
// ------------------------------------------------------
class PayPalPayment extends Payment {
  constructor(paymentId, amount, email) {
    super(paymentId, amount, "PayPal");
    this.email = email;
  }

  getEmail() {
    return this.email;
  }

  getDetailsString() {
    return this.email;
  }

  processPayment() {
    Terminal.log("\nProcessing PayPal Payment...", "proc");
    Terminal.log(`Payment ID : ${this.paymentId}`, "data");
    Terminal.log(`PayPal ID  : ${this.email}`, "data");
    Terminal.log(`Amount     : Rs.${this.amount.toFixed(2)}`, "data");
    Terminal.log("PayPal Payment Successful!", "success");
  }

  refundPayment() {
    Terminal.log("\nProcessing PayPal Refund...", "proc");
    Terminal.log(`Refund Amount : Rs.${this.amount.toFixed(2)}`, "refund");
    Terminal.log("Refund sent to PayPal account.", "data");
    Terminal.log("PayPal Refund Successful!", "success");
  }
}

// ------------------------------------------------------
// Bank Transfer Payment Subclass
// ------------------------------------------------------
class BankTransferPayment extends Payment {
  constructor(paymentId, amount, accountNumber) {
    super(paymentId, amount, "Bank Transfer");
    this.accountNumber = String(accountNumber);
  }

  getMaskedAccount() {
    const acc = this.accountNumber;
    const last4 = acc.length >= 4 ? acc.substring(acc.length - 4) : "0000";
    return `****${last4}`;
  }

  getDetailsString() {
    return `A/C ${this.getMaskedAccount()}`;
  }

  processPayment() {
    Terminal.log("\nProcessing Bank Transfer...", "proc");
    Terminal.log(`Payment ID : ${this.paymentId}`, "data");
    Terminal.log(`Amount     : Rs.${this.amount.toFixed(2)}`, "data");
    Terminal.log(`Bank Account : ${this.getMaskedAccount()}`, "data");
    Terminal.log("Bank Transfer Successful!", "success");
  }

  refundPayment() {
    Terminal.log("\nProcessing Bank Transfer Refund...", "proc");
    Terminal.log(`Refund Amount : Rs.${this.amount.toFixed(2)}`, "refund");
    Terminal.log("Refund sent to Bank Account.", "data");
    Terminal.log("Bank Transfer Refund Successful!", "success");
  }
}

// ======================================================
// 3. PAYMENT VALIDATOR (Matches Java PaymentValidator)
// ======================================================
class PaymentValidator {
  validatePayment(payment, account) {
    // Check amount
    if (payment.getAmount() <= 0) {
      Terminal.log("Invalid payment amount!", "err");
      return { valid: false, message: "Invalid payment amount! Amount must be greater than 0." };
    }

    // Check account balance
    if (account.getBalance() < payment.getAmount()) {
      Terminal.log("Insufficient account balance!", "err");
      return {
        valid: false,
        message: `Insufficient account balance! (Available: Rs. ${account.getBalance().toFixed(2)}, Required: Rs. ${payment.getAmount().toFixed(2)})`
      };
    }

    // Credit Card validation
    if (payment instanceof CreditCardPayment) {
      const currentYear = new Date().getFullYear();
      if (payment.getExpiryYear() < currentYear) {
        Terminal.log("Credit Card has expired!", "err");
        return {
          valid: false,
          message: `Credit Card has expired! (Card Expiry: ${payment.getExpiryYear()}, Current Year: ${currentYear})`
        };
      }
    }

    return { valid: true };
  }
}

// ======================================================
// 4. PAYMENT GATEWAY (Matches Java PaymentGateway)
// ======================================================
class PaymentGateway {
  constructor() {
    this.validator = new PaymentValidator();
  }

  processPayment(payment, account) {
    // Validate payment
    const validation = this.validator.validatePayment(payment, account);

    if (validation.valid) {
      // Deduct money from account
      const success = account.deductBalance(payment.getAmount());

      if (success) {
        // Dynamic Polymorphism execution
        payment.processPayment();

        Terminal.log("--------------------------------", "divider");
        Terminal.log(`Payment Amount : Rs.${payment.getAmount().toFixed(2)}`, "data");
        Terminal.log(`Remaining Balance : Rs.${account.getBalance().toFixed(2)}`, "data");
        Terminal.log("--------------------------------", "divider");

        return { success: true };
      } else {
        Terminal.log("Payment Failed! (Balance deduction failed)", "err");
        return { success: false, message: "Payment Failed! Could not deduct balance." };
      }
    } else {
      Terminal.log("Payment Failed!", "err");
      return { success: false, message: validation.message };
    }
  }

  processRefund(payment, account) {
    // Add refunded amount back
    account.addBalance(payment.getAmount());

    // Dynamic Polymorphism execution
    payment.refundPayment();

    Terminal.log("--------------------------------", "divider");
    Terminal.log(`Refund Amount : Rs.${payment.getAmount().toFixed(2)}`, "refund");
    Terminal.log(`Updated Balance : Rs.${account.getBalance().toFixed(2)}`, "data");
    Terminal.log("--------------------------------", "divider");

    return { success: true };
  }
}

// ======================================================
// 5. TERMINAL LOGGER (Real-Time System Console)
// ======================================================
const Terminal = {
  container: document.getElementById("terminalLogs"),

  log(message, type = "sys") {
    if (!this.container) return;
    const line = document.createElement("div");
    line.className = `term-line ${type}`;
    // Replace newline characters with br or formatting
    line.textContent = message;
    this.container.appendChild(line);
    this.container.scrollTop = this.container.scrollHeight;
  },

  clear() {
    if (this.container) {
      this.container.innerHTML = "";
      this.log("Terminal logs cleared.", "sys");
    }
  }
};

// ======================================================
// 6. DATABASE SERVICE (REST Backend & Relational DB)
// ======================================================
const DB_API_BASE = "http://localhost:3000/api";

const DatabaseService = {
  isOnline: false,
  activeEngine: "Offline / Local Storage",
  dbInfo: null,
  stats: { totalAccounts: 0, totalTransactions: 0, totalVolume: 0 },

  async checkStatus() {
    try {
      const res = await fetch(`${DB_API_BASE}/status`, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      this.isOnline = true;
      this.dbInfo = data.database;
      this.activeEngine = data.database?.activeRelationalEngine || "Connected";
      this.stats = data.stats || this.stats;
      return { online: true, data };
    } catch (e) {
      this.isOnline = false;
      this.activeEngine = "Local Browser Storage";
      this.dbInfo = null;
      return { online: false, error: e.message };
    }
  },

  async getConfig() {
    try {
      const res = await fetch(`${DB_API_BASE}/db/config`, { cache: "no-store" });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async saveConfig(cfg) {
    try {
      const res = await fetch(`${DB_API_BASE}/db/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg)
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async testConnection(cfg) {
    try {
      const res = await fetch(`${DB_API_BASE}/db/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg)
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: `Server not reachable at ${DB_API_BASE}: ${e.message}` };
    }
  },

  async getRecords() {
    try {
      const res = await fetch(`${DB_API_BASE}/db/records`, { cache: "no-store" });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message, accounts: [], transactions: [] };
    }
  },

  async registerUser(username, password, balance) {
    try {
      const res = await fetch(`${DB_API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, balance })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async loginUser(username, password) {
    try {
      const res = await fetch(`${DB_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async recordPayment(paymentId, username, amount, methodType, details) {
    try {
      const res = await fetch(`${DB_API_BASE}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, username, amount, methodType, details })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async recordRefund(paymentId, username) {
    try {
      const res = await fetch(`${DB_API_BASE}/refunds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, username })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async getUserTransactions(username) {
    try {
      const res = await fetch(`${DB_API_BASE}/transactions/${encodeURIComponent(username)}`, { cache: "no-store" });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message, transactions: [] };
    }
  }
};

// ======================================================
// 7. APPLICATION STATE & PERSISTENCE
// ======================================================
class BankingApp {
  constructor() {
    this.gateway = new PaymentGateway();
    this.accounts = new Map(); // username -> Account
    this.transactions = []; // array of transaction objects
    this.currentUser = null;
    this.lastProcessedPayment = null;
    this.isBalanceHidden = false;

    this.init();
  }

  init() {
    this.loadState();
    this.setupEventListeners();
    this.setupDbEventListeners();
    this.updateCurrentYearHint();
    this.syncWithDatabase();
    this.checkAutoLogin();
  }

  updateCurrentYearHint() {
    const hint = document.getElementById("currentYearHint");
    if (hint) hint.textContent = new Date().getFullYear();
    const expiryInput = document.getElementById("ccExpiryYearInput");
    if (expiryInput) expiryInput.value = new Date().getFullYear() + 3;
  }

  // Find account case-insensitively
  findAccount(username) {
    if (!username) return null;
    const clean = String(username).trim().toLowerCase();
    if (this.accounts.has(clean)) {
      return this.accounts.get(clean);
    }
    for (const [key, acc] of this.accounts.entries()) {
      if (key.toLowerCase() === clean || acc.getUsername().toLowerCase() === clean) {
        return acc;
      }
    }
    return null;
  }

  // Initial Seed / Storage (Starts empty with zero users)
  loadState() {
    // Clear all legacy pre-saved demo users from browser storage
    localStorage.removeItem("apexpay_accounts_v1");
    localStorage.removeItem("apexpay_accounts_v2");
    localStorage.removeItem("apexpay_accounts_v3");
    localStorage.removeItem("apexpay_accounts_v4");
    localStorage.removeItem("apexpay_txs_v1");
    localStorage.removeItem("apexpay_txs_v2");
    localStorage.removeItem("apexpay_txs_v3");
    localStorage.removeItem("apexpay_txs_v4");
    localStorage.removeItem("apexpay_session_user");

    const savedAccounts = localStorage.getItem("cynexbank_accounts_v1") || localStorage.getItem("akshitpay_accounts_v1");
    const savedTxs = localStorage.getItem("cynexbank_txs_v1") || localStorage.getItem("akshitpay_txs_v1");

    this.accounts.clear();

    if (savedAccounts) {
      try {
        const parsed = JSON.parse(savedAccounts);
        for (const [uname, accData] of Object.entries(parsed)) {
          this.accounts.set(uname.toLowerCase(), new Account(accData.username, accData.password, accData.balance));
        }
      } catch (e) {
        this.accounts.clear();
      }
    }

    // Ensure predefined accounts from Main.java are always available
    this.seedDefaultAccounts();

    if (savedTxs) {
      try {
        this.transactions = JSON.parse(savedTxs);
      } catch (e) {
        this.transactions = [];
      }
    } else {
      this.transactions = [];
    }
  }

  createAccountIfMissing(username, password, balance) {
    const key = username.toLowerCase();
    if (!this.accounts.has(key)) {
      this.accounts.set(key, new Account(username, password, balance));
    }
  }

  seedDefaultAccounts() {
    // Predefined demo accounts matching Main.java
    this.createAccountIfMissing("akshith", "Akshith@123", 10000.00);
    this.createAccountIfMissing("allen", "Allen@123", 10000.00);
    this.createAccountIfMissing("ishitha", "Ishitha@123", 10000.00);
    this.createAccountIfMissing("pooja", "Pooja@123", 10000.00);
    this.createAccountIfMissing("shivapriya", "Shivapriya@123", 10000.00);
    this.saveAccounts();
  }

  saveAccounts() {
    const obj = {};
    for (const [uname, acc] of this.accounts.entries()) {
      obj[uname.toLowerCase()] = {
        username: acc.getUsername(),
        password: acc.getPassword(),
        balance: acc.getBalance()
      };
    }
    localStorage.setItem("cynexbank_accounts_v1", JSON.stringify(obj));
  }

  saveTransactions() {
    localStorage.setItem("cynexbank_txs_v1", JSON.stringify(this.transactions));
  }

  checkAutoLogin() {
    const sessionUser = localStorage.getItem("cynexbank_session_user") || localStorage.getItem("akshitpay_session_user");
    if (sessionUser && this.findAccount(sessionUser)) {
      this.login(sessionUser);
    } else {
      this.showAuthView();
      // If no accounts exist yet, automatically display the Create Account tab
      if (this.accounts.size === 0) {
        const tabRegister = document.getElementById("tabRegister");
        if (tabRegister) tabRegister.click();
      }
    }
  }

  // ======================================================
  // AUTHENTICATION FLOWS
  // ======================================================
  login(username) {
    const account = this.findAccount(username);
    if (!account) return;

    this.currentUser = account;
    localStorage.setItem("cynexbank_session_user", account.getUsername().toLowerCase());

    Terminal.log(`\nUser '${account.getUsername()}' logged in successfully.`, "success");
    Terminal.log(`Current Balance : Rs.${this.currentUser.getBalance().toFixed(2)}`, "data");

    this.showToast(`Welcome, ${account.getUsername()}!`, "success");
    this.showDashboardView();
  }

  logout() {
    if (this.currentUser) {
      Terminal.log(`\nUser '${this.currentUser.getUsername()}' logged out.`, "sys");
    }
    this.currentUser = null;
    this.lastProcessedPayment = null;
    localStorage.removeItem("cynexbank_session_user");
    localStorage.removeItem("akshitpay_session_user");
    this.showToast("Logged out successfully.", "info");
    this.showAuthView();
  }

  createAccount(username, password, initialAmount) {
    const trimmedUsername = String(username).trim();
    const lookupKey = trimmedUsername.toLowerCase();
    initialAmount = Number(initialAmount);

    if (this.findAccount(trimmedUsername)) {
      Terminal.log(`Account creation failed: Username '${trimmedUsername}' already exists!`, "err");
      return { success: false, alreadyExists: true, message: `Username '${trimmedUsername}' already exists!` };
    }

    if (initialAmount < 0) {
      Terminal.log("Account creation failed: Amount cannot be negative!", "err");
      return { success: false, message: "Amount cannot be negative!" };
    }

    const newAccount = new Account(trimmedUsername, password, initialAmount);
    this.accounts.set(lookupKey, newAccount);
    this.saveAccounts();

    // Async sync to Database
    DatabaseService.registerUser(trimmedUsername, password, initialAmount).then(res => {
      if (res.success) {
        Terminal.log(`[SQL] INSERT INTO accounts (username, password, balance) VALUES ('${trimmedUsername}', '***', ${initialAmount.toFixed(2)});`, "sys");
      }
    }).catch(() => {});

    Terminal.log("\nAccount created successfully!", "success");
    Terminal.log(`Username : ${trimmedUsername}`, "data");
    Terminal.log(`Balance  : Rs.${initialAmount.toFixed(2)}`, "data");

    // Also record initial deposit transaction if amount > 0
    if (initialAmount > 0) {
      this.recordTransaction({
        paymentId: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
        method: "Initial Deposit",
        targetDetails: "Account Opening Balance",
        amount: initialAmount,
        type: "CREDIT",
        status: "Completed",
        user: username,
        timestamp: new Date().toISOString()
      });
    }

    return { success: true, account: newAccount };
  }

  // ======================================================
  // UI SWITCHING & UPDATES
  // ======================================================
  showAuthView() {
    document.body.classList.add("auth-page");
    document.body.classList.remove("dashboard-page");
    const loginBg = document.getElementById("loginBg");
    if (loginBg) loginBg.classList.remove("hidden-bg");

    document.getElementById("authView").classList.remove("hidden");
    document.getElementById("dashboardView").classList.add("hidden");
    document.getElementById("navUserSection").classList.add("hidden");
    this.resetForms();
  }

  showDashboardView() {
    document.body.classList.remove("auth-page");
    document.body.classList.add("dashboard-page");
    const loginBg = document.getElementById("loginBg");
    if (loginBg) loginBg.classList.add("hidden-bg");

    document.getElementById("authView").classList.add("hidden");
    document.getElementById("dashboardView").classList.remove("hidden");
    document.getElementById("navUserSection").classList.remove("hidden");

    this.updateDashboardUI();
    this.renderTransactions();
  }

  updateDashboardUI() {
    if (!this.currentUser) return;

    const username = this.currentUser.getUsername();
    const balance = this.currentUser.getBalance();

    // Nav elements
    document.getElementById("navUsername").textContent = username;
    document.getElementById("userAvatar").textContent = username.charAt(0).toUpperCase();
    this.renderBalance();

    // Virtual Card
    document.getElementById("cardHolderName").textContent = username.toUpperCase();
    const cardMaskedNum = document.getElementById("cardMaskedNum");
    const accHash = Math.abs(this.hashCode(username)) % 9000 + 1000;
    cardMaskedNum.textContent = `•••• •••• •••• ${accHash}`;

    // Stats
    const userTxs = this.transactions.filter(t => t.user === username);
    let totalSpent = 0;
    let totalDeposits = 0;

    userTxs.forEach(t => {
      if (t.type === "DEBIT" && t.status === "Completed") {
        totalSpent += t.amount;
      } else if (t.type === "CREDIT" || t.status === "Refunded") {
        totalDeposits += t.amount;
      }
    });

    document.getElementById("totalPaidStat").textContent = `Rs. ${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById("totalDepositsStat").textContent = `Rs. ${totalDeposits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById("txCountStat").textContent = userTxs.length;
  }

  renderBalance() {
    const balance = this.currentUser.getBalance();
    const formatted = `Rs. ${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const mainDisplay = document.getElementById("mainBalanceDisplay");
    const navDisplay = document.getElementById("navBalance");
    const eyeIcon = document.getElementById("balanceEyeIcon");

    if (this.isBalanceHidden) {
      mainDisplay.textContent = "Rs. •••••••";
      navDisplay.textContent = "Rs. •••••";
      eyeIcon.className = "fa-regular fa-eye-slash";
    } else {
      mainDisplay.textContent = formatted;
      navDisplay.textContent = formatted;
      eyeIcon.className = "fa-regular fa-eye";
    }
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // ======================================================
  // TRANSACTION RECORDING & STATEMENT
  // ======================================================
  recordTransaction(tx) {
    this.transactions.unshift(tx);
    this.saveTransactions();
    this.renderTransactions();
    this.updateDashboardUI();
  }

  renderTransactions() {
    const tbody = document.getElementById("txTableBody");
    const emptyState = document.getElementById("txEmptyState");
    const filter = document.getElementById("txFilterSelect").value;

    if (!tbody || !this.currentUser) return;

    tbody.innerHTML = "";

    const userTxs = this.transactions.filter(t => {
      if (t.user !== this.currentUser.getUsername()) return false;
      if (filter === "ALL") return true;
      return t.method === filter;
    });

    if (userTxs.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    } else {
      emptyState.classList.add("hidden");
    }

    userTxs.forEach(tx => {
      const tr = document.createElement("tr");

      // Method Icon
      let methodIcon = "fa-solid fa-credit-card";
      if (tx.method === "PayPal") methodIcon = "fa-brands fa-paypal";
      else if (tx.method === "Bank Transfer") methodIcon = "fa-solid fa-building-columns";
      else if (tx.method.includes("Deposit")) methodIcon = "fa-solid fa-wallet";

      // Status Badge
      let statusClass = "status-completed";
      if (tx.status === "Refunded") statusClass = "status-refunded";
      else if (tx.type === "CREDIT") statusClass = "status-deposit";

      // Actions
      const canRefund = tx.type === "DEBIT" && tx.status === "Completed";

      tr.innerHTML = `
        <td><code style="color:#a5b4fc;font-weight:600;">${tx.paymentId}</code></td>
        <td>
          <span class="badge-method">
            <i class="${methodIcon}"></i> ${tx.method}
          </span>
        </td>
        <td style="color:var(--text-muted);">${tx.targetDetails}</td>
        <td>
          <strong class="${tx.type === 'CREDIT' ? 'text-green' : 'text-red'}">
            ${tx.type === 'CREDIT' ? '+' : '-'}Rs. ${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </td>
        <td style="font-size:0.8rem;color:var(--text-dim);">${new Date(tx.timestamp).toLocaleString()}</td>
        <td><span class="status-tag ${statusClass}">${tx.status}</span></td>
        <td>
          <button class="btn-action-sm btn-action-receipt" data-txid="${tx.paymentId}" title="Print / View Receipt">
            <i class="fa-solid fa-receipt"></i> Receipt
          </button>
          ${canRefund ? `
            <button class="btn-action-sm btn-action-refund" data-txid="${tx.paymentId}" title="Refund this payment">
              <i class="fa-solid fa-rotate-left"></i> Refund
            </button>
          ` : ''}
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Attach row button events
    tbody.querySelectorAll(".btn-action-receipt").forEach(btn => {
      btn.addEventListener("click", () => this.openReceiptModal(btn.getAttribute("data-txid")));
    });

    tbody.querySelectorAll(".btn-action-refund").forEach(btn => {
      btn.addEventListener("click", () => this.handleRefundAction(btn.getAttribute("data-txid")));
    });
  }

  // ======================================================
  // PAYMENT PROCESSING
  // ======================================================
  executePayment(payment) {
    if (!this.currentUser) return;

    const result = this.gateway.processPayment(payment, this.currentUser);

    if (result.success) {
      // Save changes
      this.saveAccounts();

      // Record transaction
      const tx = {
        paymentId: payment.getPaymentId(),
        method: payment.getMethodType(),
        targetDetails: payment.getDetailsString(),
        amount: payment.getAmount(),
        type: "DEBIT",
        status: "Completed",
        user: this.currentUser.getUsername(),
        timestamp: new Date().toISOString(),
        paymentObj: {
          method: payment.getMethodType(),
          amount: payment.getAmount(),
          paymentId: payment.getPaymentId(),
          cardNumber: payment.cardNumber || null,
          expiryYear: payment.expiryYear || null,
          email: payment.email || null,
          accountNumber: payment.accountNumber || null
        }
      };

      this.recordTransaction(tx);
      this.lastProcessedPayment = payment;

      // Async Sync to Database
      DatabaseService.recordPayment(
        payment.getPaymentId(),
        this.currentUser.getUsername(),
        payment.getAmount(),
        payment.getMethodType(),
        payment.getDetailsString()
      ).then(dbRes => {
        if (dbRes.success) {
          Terminal.log(`[SQL] UPDATE accounts SET balance = ${dbRes.updatedBalance} WHERE username = '${this.currentUser.getUsername()}';`, "sys");
          Terminal.log(`[SQL] INSERT INTO transactions (payment_id, username, amount, method_type, details, status) VALUES ('${payment.getPaymentId()}', '${this.currentUser.getUsername()}', ${payment.getAmount()}, '${payment.getMethodType()}', '${payment.getDetailsString()}', 'SUCCESS');`, "sys");
        }
      }).catch(() => {});

      // Close modal
      this.closeModal("paymentModal");
      this.showToast(`Payment of Rs. ${payment.getAmount().toFixed(2)} processed successfully!`, "success");

      // Show interactive prompt banner (Matching Java prompt: "Do you want a refund? (yes/no):")
      this.showRefundPromptBanner(payment);
    } else {
      // Show error inside modal banner
      const banner = document.getElementById("paymentErrorBanner");
      const msg = document.getElementById("paymentErrorMsg");
      banner.classList.remove("hidden");
      msg.textContent = result.message || "Payment Failed!";
      this.showToast(result.message || "Payment Failed!", "error");
    }
  }

  // ======================================================
  // REFUND FLOW (Instant Banner & Transaction List)
  // ======================================================
  showRefundPromptBanner(payment) {
    const banner = document.getElementById("refundPromptBanner");
    const pid = document.getElementById("promptPaymentId");
    const amt = document.getElementById("promptPaymentAmount");

    pid.textContent = payment.getPaymentId();
    amt.textContent = `Rs. ${payment.getAmount().toFixed(2)}`;
    banner.classList.remove("hidden");
  }

  hideRefundPromptBanner() {
    const banner = document.getElementById("refundPromptBanner");
    banner.classList.add("hidden");
  }

  handleRefundAction(paymentId) {
    const tx = this.transactions.find(t => t.paymentId === paymentId && t.status === "Completed");
    if (!tx || !this.currentUser) {
      this.showToast("Transaction not found or already refunded.", "error");
      return;
    }

    // Reconstruct payment object for dynamic polymorphism dispatch
    let paymentInstance = null;
    const pData = tx.paymentObj;

    if (tx.method === "Credit Card") {
      paymentInstance = new CreditCardPayment(tx.paymentId, tx.amount, pData?.cardNumber || "0000000000000000", pData?.expiryYear || 2028);
    } else if (tx.method === "PayPal") {
      paymentInstance = new PayPalPayment(tx.paymentId, tx.amount, pData?.email || tx.targetDetails);
    } else if (tx.method === "Bank Transfer") {
      paymentInstance = new BankTransferPayment(tx.paymentId, tx.amount, pData?.accountNumber || tx.targetDetails);
    } else {
      // Fallback
      paymentInstance = new BankTransferPayment(tx.paymentId, tx.amount, "0000");
    }

    // Execute Refund on Gateway
    this.gateway.processRefund(paymentInstance, this.currentUser);

    // Async Sync Refund to Database
    DatabaseService.recordRefund(tx.paymentId, this.currentUser.getUsername()).then(dbRes => {
      if (dbRes.success) {
        Terminal.log(`[SQL] UPDATE transactions SET status = 'REFUNDED' WHERE payment_id = '${tx.paymentId}';`, "sys");
        Terminal.log(`[SQL] UPDATE accounts SET balance = ${dbRes.updatedBalance} WHERE username = '${this.currentUser.getUsername()}';`, "sys");
      }
    }).catch(() => {});

    // Update Transaction State
    tx.status = "Refunded";
    this.saveAccounts();
    this.saveTransactions();
    this.renderTransactions();
    this.updateDashboardUI();
    this.hideRefundPromptBanner();

    this.showToast(`Refund of Rs. ${tx.amount.toFixed(2)} credited back to your account!`, "success");
  }

  // ======================================================
  // ADD MONEY (DEPOSIT)
  // ======================================================
  depositMoney(amount) {
    amount = Number(amount);

    if (amount <= 0 || isNaN(amount)) {
      Terminal.log("Deposit failed: Invalid amount!", "err");
      return { success: false, message: "Invalid amount! Amount must be greater than 0." };
    }

    this.currentUser.addBalance(amount);
    this.saveAccounts();

    Terminal.log("\nMoney added successfully!", "success");
    Terminal.log(`Deposit Amount : Rs.${amount.toFixed(2)}`, "data");
    Terminal.log(`New Balance    : Rs.${this.currentUser.getBalance().toFixed(2)}`, "data");

    // Record Deposit Transaction
    this.recordTransaction({
      paymentId: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
      method: "Cash Deposit",
      targetDetails: "Account Top-up",
      amount: amount,
      type: "CREDIT",
      status: "Completed",
      user: this.currentUser.getUsername(),
      timestamp: new Date().toISOString()
    });

    this.closeModal("addMoneyModal");
    this.showToast(`Added Rs. ${amount.toFixed(2)} to account balance!`, "success");
    return { success: true };
  }

  // ======================================================
  // RECEIPT GENERATION & MODAL
  // ======================================================
  openReceiptModal(paymentId) {
    const tx = this.transactions.find(t => t.paymentId === paymentId);
    if (!tx) return;

    document.getElementById("receiptAmount").textContent = `Rs. ${tx.amount.toFixed(2)}`;
    document.getElementById("receiptPayId").textContent = tx.paymentId;
    document.getElementById("receiptMethod").textContent = tx.method;
    document.getElementById("receiptUser").textContent = tx.user;
    document.getElementById("receiptTarget").textContent = tx.targetDetails;
    document.getElementById("receiptDate").textContent = new Date(tx.timestamp).toLocaleString();
    document.getElementById("receiptStatus").textContent = tx.status;
    document.getElementById("receiptBarcodeText").textContent = `${tx.paymentId}-CYNEX-SECURE`;

    const stamp = document.getElementById("receiptStamp");
    if (tx.status === "Refunded") {
      stamp.textContent = "REFUNDED";
      stamp.className = "receipt-status-stamp refunded";
    } else {
      stamp.textContent = tx.type === "CREDIT" ? "CREDITED" : "PAID";
      stamp.className = "receipt-status-stamp";
    }

    this.openModal("receiptModal");
  }

  // ======================================================
  // MODALS & HELPERS
  // ======================================================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  generateRandomPaymentId(prefix = "TXN") {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${random}`;
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "fa-circle-info";
    if (type === "success") icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-xmark";

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  resetForms() {
    const loginForm = document.getElementById("loginForm");
    const regForm = document.getElementById("registerForm");
    if (loginForm) loginForm.reset();
    if (regForm) regForm.reset();
    document.getElementById("loginError").classList.add("hidden");
    document.getElementById("regError").classList.add("hidden");
  }

  // ======================================================
  // EVENT LISTENERS & UI SETUP
  // ======================================================
  setupEventListeners() {
    // Tab switching in Auth
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    const loginForm = document.getElementById("loginForm");
    const regForm = document.getElementById("registerForm");

    tabLogin.addEventListener("click", () => {
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      loginForm.classList.remove("hidden");
      regForm.classList.add("hidden");
      document.getElementById("authTitle").textContent = "Welcome to CyneX Bank";
      document.getElementById("authSubtitle").textContent = "Sign in to manage your finances & payments.";
    });

    tabRegister.addEventListener("click", () => {
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      regForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
      document.getElementById("authTitle").textContent = "Create New Account";
      document.getElementById("authSubtitle").textContent = "Open a bank account with initial deposit & zero maintenance fees.";
    });

    // Pre-saved accounts one-click chips
    document.querySelectorAll(".demo-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const u = chip.getAttribute("data-user");
        const p = chip.getAttribute("data-pass");
        document.getElementById("loginUsername").value = u;
        document.getElementById("loginPassword").value = p;
        // Switch to login tab if on register
        tabLogin.click();
        // Submit login immediately
        this.handleLoginSubmit(u, p);
      });
    });

    // Password visibility toggles
    document.querySelectorAll(".pwd-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (input.type === "password") {
          input.type = "text";
          btn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
        } else {
          input.type = "password";
          btn.innerHTML = '<i class="fa-regular fa-eye"></i>';
        }
      });
    });

    // Login Form Submit
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = document.getElementById("loginUsername").value.trim();
      const p = document.getElementById("loginPassword").value;
      this.handleLoginSubmit(u, p);
    });

    // Register Form Submit
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = document.getElementById("regUsername").value.trim();
      const p = document.getElementById("regPassword").value;
      const amt = document.getElementById("regAmount").value;

      const result = this.createAccount(u, p, amt);
      if (result.success) {
        this.login(u);
      } else {
        const errBanner = document.getElementById("regError");
        const errMsg = document.getElementById("regErrorMsg");
        errBanner.classList.remove("hidden");

        if (result.alreadyExists) {
          errMsg.innerHTML = `
            <div style="margin-bottom:6px;">Username <strong>'${u}'</strong> already exists!</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" id="quickLoginExistingBtn" style="background:#6366f1;color:white;border:none;padding:5px 12px;border-radius:6px;font-size:0.78rem;cursor:pointer;font-weight:600;">
                <i class="fa-solid fa-right-to-bracket"></i> Sign In to '${u}'
              </button>
              <button type="button" id="overwriteExistingBtn" style="background:rgba(255,255,255,0.08);color:#fca5a5;border:1px solid rgba(239,68,68,0.35);padding:5px 12px;border-radius:6px;font-size:0.78rem;cursor:pointer;">
                <i class="fa-solid fa-key"></i> Update with this Password
              </button>
            </div>
          `;

          document.getElementById("quickLoginExistingBtn").addEventListener("click", () => {
            tabLogin.click();
            document.getElementById("loginUsername").value = u;
            const existingAcc = this.findAccount(u);
            if (existingAcc) {
              document.getElementById("loginPassword").value = existingAcc.getPassword();
            }
            document.getElementById("loginPassword").focus();
          });

          document.getElementById("overwriteExistingBtn").addEventListener("click", () => {
            const initialAmt = Math.max(0, Number(amt) || 0);
            const updatedAccount = new Account(u, p, initialAmt);
            this.accounts.set(u.toLowerCase(), updatedAccount);
            this.saveAccounts();
            Terminal.log(`\nAccount '${u}' updated with new credentials.`, "success");
            this.login(u);
          });
        } else {
          errMsg.textContent = result.message;
        }
      }
    });

    // Logout Button
    document.getElementById("logoutBtn").addEventListener("click", () => this.logout());

    // Balance visibility toggle
    document.getElementById("toggleBalanceVisibility").addEventListener("click", () => {
      this.isBalanceHidden = !this.isBalanceHidden;
      this.renderBalance();
    });

    // Primary Action: Open Payment Modal
    document.getElementById("openPaymentModalBtn").addEventListener("click", () => {
      document.getElementById("payIdInput").value = this.generateRandomPaymentId("CC");
      document.getElementById("payAmountInput").value = "";
      document.getElementById("paymentErrorBanner").classList.add("hidden");
      this.openModal("paymentModal");
    });

    // Generate New Payment ID Button
    document.getElementById("genIdBtn").addEventListener("click", () => {
      const activeMethod = document.querySelector(".method-tab.active").getAttribute("data-method");
      let prefix = "CC";
      if (activeMethod === "paypal") prefix = "PP";
      if (activeMethod === "bankTransfer") prefix = "BT";
      document.getElementById("payIdInput").value = this.generateRandomPaymentId(prefix);
    });

    // Primary Action: Open Add Money Modal
    document.getElementById("openAddMoneyModalBtn").addEventListener("click", () => {
      document.getElementById("depositAmountInput").value = "";
      document.getElementById("depositErrorBanner").classList.add("hidden");
      this.openModal("addMoneyModal");
    });

    // Preset Deposit Chips
    document.querySelectorAll(".preset-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const amt = chip.getAttribute("data-amt");
        document.getElementById("depositAmountInput").value = amt;
      });
    });

    // Deposit Form Submit
    document.getElementById("addMoneyForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const amt = document.getElementById("depositAmountInput").value;
      const res = this.depositMoney(amt);
      if (!res.success) {
        const banner = document.getElementById("depositErrorBanner");
        const msg = document.getElementById("depositErrorMsg");
        banner.classList.remove("hidden");
        msg.textContent = res.message;
      }
    });

    // Reset Demo Data
    document.getElementById("resetDemoBtn").addEventListener("click", () => {
      if (confirm("Clear all accounts and transaction history?")) {
        localStorage.clear();
        this.seedDefaultAccounts();
        Terminal.clear();
        Terminal.log("All accounts and data cleared. System reset to fresh state.", "sys");
        this.showToast("All user accounts cleared.", "info");
        this.logout();
      }
    });

    // Payment Method Tabs inside Modal
    document.querySelectorAll(".method-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".method-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const method = tab.getAttribute("data-method");
        document.getElementById("fieldsCreditCard").classList.toggle("hidden", method !== "creditCard");
        document.getElementById("fieldsPayPal").classList.toggle("hidden", method !== "paypal");
        document.getElementById("fieldsBankTransfer").classList.toggle("hidden", method !== "bankTransfer");

        // Update Payment ID prefix
        let prefix = "CC";
        if (method === "paypal") prefix = "PP";
        if (method === "bankTransfer") prefix = "BT";
        document.getElementById("payIdInput").value = this.generateRandomPaymentId(prefix);
      });
    });

    // Credit Card Input Formatter & Brand Detector
    const ccInput = document.getElementById("ccNumberInput");
    ccInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "");
      val = val.substring(0, 16);
      const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
      e.target.value = formatted;

      // Brand badge
      const badge = document.getElementById("ccBrandBadge");
      if (val.startsWith("4")) {
        badge.innerHTML = '<i class="fa-brands fa-cc-visa" style="color:#60a5fa;"></i>';
      } else if (val.startsWith("5")) {
        badge.innerHTML = '<i class="fa-brands fa-cc-mastercard" style="color:#f87171;"></i>';
      } else if (val.startsWith("3")) {
        badge.innerHTML = '<i class="fa-brands fa-cc-amex" style="color:#34d399;"></i>';
      } else {
        badge.innerHTML = '<i class="fa-solid fa-credit-card"></i>';
      }
    });

    // Payment Form Submit
    document.getElementById("paymentForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const activeMethod = document.querySelector(".method-tab.active").getAttribute("data-method");
      const paymentId = document.getElementById("payIdInput").value.trim();
      const amount = parseFloat(document.getElementById("payAmountInput").value);

      let paymentInstance = null;

      if (activeMethod === "creditCard") {
        const cardNum = document.getElementById("ccNumberInput").value.replace(/\s+/g, "");
        const expiryYear = parseInt(document.getElementById("ccExpiryYearInput").value, 10);
        paymentInstance = new CreditCardPayment(paymentId, amount, cardNum, expiryYear);
      } else if (activeMethod === "paypal") {
        const email = document.getElementById("ppEmailInput").value.trim();
        paymentInstance = new PayPalPayment(paymentId, amount, email);
      } else if (activeMethod === "bankTransfer") {
        const accountNum = document.getElementById("btAccountInput").value.trim();
        paymentInstance = new BankTransferPayment(paymentId, amount, accountNum);
      }

      if (paymentInstance) {
        this.executePayment(paymentInstance);
      }
    });

    // Refund Prompt Banner Actions
    document.getElementById("instantRefundYesBtn").addEventListener("click", () => {
      if (this.lastProcessedPayment) {
        this.handleRefundAction(this.lastProcessedPayment.getPaymentId());
      }
    });

    document.getElementById("instantRefundNoBtn").addEventListener("click", () => {
      this.hideRefundPromptBanner();
      Terminal.log("User chose: Keep payment (No refund requested).", "sys");
    });

    // Filter selector for transactions
    document.getElementById("txFilterSelect").addEventListener("change", () => {
      this.renderTransactions();
    });

    // Print Receipt Button
    document.getElementById("printReceiptBtn").addEventListener("click", () => {
      window.print();
    });

    // Modal Close Buttons
    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-close");
        this.closeModal(target);
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          backdrop.classList.add("hidden");
        }
      });
    });

    // Terminal Controls
    const terminalEl = document.getElementById("gatewayTerminal");
    const terminalToggleBtn = document.getElementById("terminalToggleBtn");
    const toggleTerminalBtn = document.getElementById("toggleTerminalBtn");
    const terminalChevron = document.getElementById("terminalChevron");
    const clearTerminalBtn = document.getElementById("clearTerminalBtn");

    const toggleTerminal = () => {
      terminalEl.classList.toggle("minimized");
      if (terminalEl.classList.contains("minimized")) {
        terminalChevron.className = "fa-solid fa-chevron-up";
      } else {
        terminalChevron.className = "fa-solid fa-chevron-down";
      }
    };

    terminalToggleBtn.addEventListener("click", toggleTerminal);
    toggleTerminalBtn.addEventListener("click", toggleTerminal);
    document.getElementById("terminalHeader").addEventListener("click", (e) => {
      if (!e.target.closest(".terminal-controls")) {
        toggleTerminal();
      }
    });

    clearTerminalBtn.addEventListener("click", () => Terminal.clear());
  }

  handleLoginSubmit(username, password) {
    const loginError = document.getElementById("loginError");
    const loginErrorMsg = document.getElementById("loginErrorMsg");

    Terminal.log(`\n[SQL] SELECT * FROM accounts WHERE LOWER(username) = LOWER('${username}') LIMIT 1;`, "sys");

    const account = this.findAccount(username);

    if (account) {
      if (account.getPassword() === password) {
        loginError.classList.add("hidden");
        this.login(account.getUsername());
      } else {
        Terminal.log("Incorrect Password!", "err");
        loginError.classList.remove("hidden");
        loginErrorMsg.textContent = "Incorrect Password!";
      }
    } else {
      // Check database asynchronously if not found locally
      if (DatabaseService.isOnline) {
        DatabaseService.loginUser(username, password).then(res => {
          if (res.success) {
            loginError.classList.add("hidden");
            const dbAcc = new Account(res.account.username, password, res.account.balance);
            this.accounts.set(res.account.username.toLowerCase(), dbAcc);
            this.saveAccounts();
            this.login(res.account.username);
          } else {
            loginError.classList.remove("hidden");
            loginErrorMsg.textContent = res.message || "Invalid username or password!";
          }
        }).catch(() => {
          Terminal.log(`Account '${username}' does not exist!`, "err");
          loginError.classList.remove("hidden");
          loginErrorMsg.innerHTML = `Account <strong>"${username}"</strong> does not exist!<br><span style="font-size:0.8rem;color:#cbd5e1;">Click "Create Account" above to register this username.</span>`;
        });
      } else {
        Terminal.log(`Account '${username}' does not exist!`, "err");
        loginError.classList.remove("hidden");
        loginErrorMsg.innerHTML = `Account <strong>"${username}"</strong> does not exist!<br><span style="font-size:0.8rem;color:#cbd5e1;">Click "Create Account" above to register this username.</span>`;
      }
    }
  }

  // ======================================================
  // DATABASE MANAGER & EVENT LISTENERS
  // ======================================================
  async syncWithDatabase() {
    const statusRes = await DatabaseService.checkStatus();
    this.renderDbStatusBadge(statusRes);

    if (statusRes.online) {
      Terminal.log(`[DATABASE] Connected to ${DatabaseService.activeEngine}`, "proc");
      // Pull latest database records to sync accounts
      try {
        const records = await DatabaseService.getRecords();
        if (records.success && Array.isArray(records.accounts)) {
          records.accounts.forEach(acc => {
            if (!this.findAccount(acc.username)) {
              this.accounts.set(acc.username.toLowerCase(), new Account(acc.username, "********", acc.balance));
            }
          });
          this.saveAccounts();
        }
      } catch (e) {}
    } else {
      Terminal.log(`[DATABASE] Server offline. Using Local Browser Database.`, "sys");
    }
  }

  renderDbStatusBadge(statusRes) {
    const dot = document.getElementById("dbStatusDot");
    const text = document.getElementById("dbStatusText");
    const bannerDot = document.getElementById("bannerStatusDot");
    const bannerTitle = document.getElementById("bannerStatusTitle");
    const bannerDesc = document.getElementById("bannerStatusDesc");

    if (!dot || !text) return;

    if (statusRes?.online) {
      const db = statusRes.data.database;
      const isPortOpen = db.isServerPortReachable;
      const type = (db.configuredType || "mysql").toUpperCase();

      dot.className = "db-indicator-dot dot-active";
      text.textContent = isPortOpen ? `${type}: Connected (${db.name})` : `DB: Active (${db.configuredType.toUpperCase()} Standby)`;

      if (bannerDot && bannerTitle && bannerDesc) {
        bannerDot.className = "status-indicator-lg dot-active";
        bannerTitle.textContent = isPortOpen
          ? `Connected to ${type} Server (@ ${db.host}:${db.port})`
          : `Relational Engine Active (${type} Port ${db.port} Standby)`;
        bannerDesc.textContent = `Database: ${db.name} | Active Engine: ${db.activeRelationalEngine}`;
      }
    } else {
      dot.className = "db-indicator-dot dot-offline";
      text.textContent = "DB Server: Offline (Local Mode)";

      if (bannerDot && bannerTitle && bannerDesc) {
        bannerDot.className = "status-indicator-lg dot-offline";
        bannerTitle.textContent = "Database Server Disconnected";
        bannerDesc.textContent = "Run 'start-server.bat' to launch the MySQL/PostgreSQL backend API (port 3000).";
      }
    }
  }

  setupDbEventListeners() {
    const dbStatusBtn = document.getElementById("dbStatusBtn");
    if (dbStatusBtn) {
      dbStatusBtn.addEventListener("click", () => {
        this.openModal("dbModal");
        this.loadDbConfigForm();
        this.loadDbPreviewRecords();
      });
    }

    // Modal tabs
    const tabSettings = document.getElementById("tabDbSettings");
    const tabRecords = document.getElementById("tabDbRecords");
    const tabSchema = document.getElementById("tabDbSchema");
    const contentSettings = document.getElementById("dbTabContentSettings");
    const contentRecords = document.getElementById("dbTabContentRecords");
    const contentSchema = document.getElementById("dbTabContentSchema");

    const switchDbTab = (activeTab, activeContent) => {
      [tabSettings, tabRecords, tabSchema].forEach(t => t?.classList.remove("active"));
      [contentSettings, contentRecords, contentSchema].forEach(c => c?.classList.add("hidden"));
      activeTab?.classList.add("active");
      activeContent?.classList.remove("hidden");
    };

    if (tabSettings) tabSettings.addEventListener("click", () => switchDbTab(tabSettings, contentSettings));
    if (tabRecords) tabRecords.addEventListener("click", () => {
      switchDbTab(tabRecords, contentRecords);
      this.loadDbPreviewRecords();
    });
    if (tabSchema) tabSchema.addEventListener("click", () => switchDbTab(tabSchema, contentSchema));

    // Ping / Refresh DB Status
    const btnRefresh = document.getElementById("btnRefreshDbStatus");
    if (btnRefresh) {
      btnRefresh.addEventListener("click", async () => {
        btnRefresh.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Testing...`;
        await this.syncWithDatabase();
        btnRefresh.innerHTML = `<i class="fa-solid fa-rotate"></i> Ping Server`;
        this.showToast("Database status refreshed!", "info");
      });
    }

    // Test DB connection button
    const btnTest = document.getElementById("btnTestDbConnection");
    const testAlert = document.getElementById("dbTestAlert");
    if (btnTest) {
      btnTest.addEventListener("click", async () => {
        const type = document.getElementById("cfgDbType").value;
        const host = document.getElementById("cfgDbHost").value;
        const port = Number(document.getElementById("cfgDbPort").value);

        btnTest.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Testing Socket...`;
        const testRes = await DatabaseService.testConnection({ type, host, port });
        btnTest.innerHTML = `<i class="fa-solid fa-vial"></i> Test Connection`;

        if (testAlert) {
          testAlert.classList.remove("hidden", "alert-success", "alert-danger");
          if (testRes.success) {
            testAlert.classList.add("alert-success");
            testAlert.innerHTML = `<strong><i class="fa-solid fa-circle-check"></i> Connected!</strong> ${testRes.message}`;
          } else {
            testAlert.classList.add("alert-danger");
            testAlert.innerHTML = `<strong><i class="fa-solid fa-triangle-exclamation"></i> Connection Check:</strong> ${testRes.message}<br><span style="font-size:0.8rem;opacity:0.85;">Make sure your ${type.toUpperCase()} service is running on ${host}:${port}. Built-in SQLite local database continues to operate seamlessly.</span>`;
          }
        }
      });
    }

    // Config form save
    const configForm = document.getElementById("dbConfigForm");
    if (configForm) {
      configForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          type: document.getElementById("cfgDbType").value,
          host: document.getElementById("cfgDbHost").value,
          port: Number(document.getElementById("cfgDbPort").value),
          database: document.getElementById("cfgDbName").value,
          user: document.getElementById("cfgDbUser").value,
          password: document.getElementById("cfgDbPass").value
        };

        const saveRes = await DatabaseService.saveConfig(payload);
        if (saveRes.success) {
          this.showToast("Database configuration saved!", "success");
          await this.syncWithDatabase();
        } else {
          this.showToast(saveRes.message || "Failed to save configuration", "error");
        }
      });
    }

    // Reload preview records
    const btnReloadRecords = document.getElementById("btnReloadDbRecords");
    if (btnReloadRecords) {
      btnReloadRecords.addEventListener("click", () => this.loadDbPreviewRecords());
    }

    // Copy SQL Schema button
    const btnCopySchema = document.getElementById("btnCopySchema");
    if (btnCopySchema) {
      btnCopySchema.addEventListener("click", () => {
        const sqlText = document.getElementById("schemaCodePreview")?.textContent || "";
        navigator.clipboard.writeText(sqlText).then(() => {
          this.showToast("SQL Schema copied to clipboard!", "success");
        }).catch(() => {
          this.showToast("Could not copy SQL", "error");
        });
      });
    }
  }

  async loadDbConfigForm() {
    const res = await DatabaseService.getConfig();
    if (res.success && res.config) {
      const c = res.config;
      const typeEl = document.getElementById("cfgDbType");
      const hostEl = document.getElementById("cfgDbHost");
      const portEl = document.getElementById("cfgDbPort");
      const nameEl = document.getElementById("cfgDbName");
      const userEl = document.getElementById("cfgDbUser");
      const passEl = document.getElementById("cfgDbPass");

      if (typeEl) typeEl.value = c.type || "mysql";
      if (hostEl) hostEl.value = c.host || "localhost";
      if (portEl) portEl.value = c.port || 3306;
      if (nameEl) nameEl.value = c.database || "cynexbank_db";
      if (userEl) userEl.value = c.user || "root";
      if (passEl && c.password) passEl.value = c.password;
    }
  }

  async loadDbPreviewRecords() {
    const res = await DatabaseService.getRecords();
    const accountsBody = document.getElementById("tblAccountsBody");
    const txsBody = document.getElementById("tblTxsBody");
    const badgeAccounts = document.getElementById("badgeAccountsCount");
    const badgeTxs = document.getElementById("badgeTxsCount");
    const statAcc = document.getElementById("dbStatAccounts");
    const statTx = document.getElementById("dbStatTxs");
    const statVol = document.getElementById("dbStatVolume");

    if (res.success) {
      if (badgeAccounts) badgeAccounts.textContent = `${res.accounts.length} records`;
      if (badgeTxs) badgeTxs.textContent = `${res.transactions.length} records`;
      if (statAcc) statAcc.textContent = res.stats?.totalAccounts || res.accounts.length;
      if (statTx) statTx.textContent = res.stats?.totalTransactions || res.transactions.length;
      if (statVol) statVol.textContent = `Rs. ${(res.stats?.totalVolume || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

      // Render Accounts Table
      if (accountsBody) {
        if (res.accounts.length === 0) {
          accountsBody.innerHTML = `<tr><td colspan="4" class="text-muted text-center" style="padding:16px;">No accounts in database yet. Create one via "Create Account".</td></tr>`;
        } else {
          accountsBody.innerHTML = res.accounts.map(acc => `
            <tr>
              <td style="font-family:var(--font-mono);color:var(--text-muted);">${acc.id}</td>
              <td><strong>${acc.username}</strong></td>
              <td style="color:#10b981;font-weight:600;">Rs. ${Number(acc.balance).toFixed(2)}</td>
              <td style="color:var(--text-dim);font-size:0.8rem;">${acc.created_at || '-'}</td>
            </tr>
          `).join("");
        }
      }

      // Render Transactions Table
      if (txsBody) {
        if (res.transactions.length === 0) {
          txsBody.innerHTML = `<tr><td colspan="6" class="text-muted text-center" style="padding:16px;">No transactions recorded in database yet.</td></tr>`;
        } else {
          txsBody.innerHTML = res.transactions.map(tx => `
            <tr>
              <td style="font-family:var(--font-mono);color:#818cf8;font-size:0.8rem;">${tx.payment_id}</td>
              <td>${tx.username}</td>
              <td style="font-weight:600;">Rs. ${Number(tx.amount).toFixed(2)}</td>
              <td><span class="badge-sm">${tx.method_type}</span></td>
              <td><span class="status-tag ${tx.status === 'REFUNDED' ? 'refunded' : 'success'}">${tx.status}</span></td>
              <td style="color:var(--text-dim);font-size:0.8rem;">${tx.created_at || '-'}</td>
            </tr>
          `).join("");
        }
      }
    } else {
      if (accountsBody) {
        accountsBody.innerHTML = `<tr><td colspan="4" class="text-muted text-center" style="padding:16px;">Server offline. Start backend server to inspect live database tables.</td></tr>`;
      }
      if (txsBody) {
        txsBody.innerHTML = `<tr><td colspan="6" class="text-muted text-center" style="padding:16px;">Server offline. Start backend server to inspect live database tables.</td></tr>`;
      }
    }
  }
}

// Instantiate on load
document.addEventListener("DOMContentLoaded", () => {
  window.app = new BankingApp();
});
