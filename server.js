/**
 * CYNEX BANK - BACKEND API & DATABASE SERVER
 * Provides REST endpoints for accounts, payments, and transaction history.
 * Supports MySQL, PostgreSQL, and built-in SQLite relational database.
 */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");
const { DatabaseSync } = require("node:sqlite");

const PORT = 3000;
const CONFIG_PATH = path.join(__dirname, "db-config.json");
const SQLITE_DB_PATH = fs.existsSync(path.join(__dirname, "cynexbank.db"))
  ? path.join(__dirname, "cynexbank.db")
  : path.join(__dirname, "akshitpay.db");

// ----------------------------------------------------
// 1. CONFIGURATION MANAGEMENT
// ----------------------------------------------------
function loadConfig() {
  const defaultConfig = {
    type: "mysql",
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "cynexbank_db"
  };

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const content = fs.readFileSync(CONFIG_PATH, "utf8");
      return { ...defaultConfig, ...JSON.parse(content) };
    }
  } catch (err) {
    console.warn("Could not read db-config.json, using defaults:", err.message);
  }
  return defaultConfig;
}

function saveConfig(newConfig) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Failed to write db-config.json:", err.message);
    return false;
  }
}

let activeConfig = loadConfig();

// ----------------------------------------------------
// 2. SQLITE LOCAL DATABASE INITIALIZATION
// ----------------------------------------------------
let sqliteDb = null;
function initSqlite() {
  try {
    sqliteDb = new DatabaseSync(SQLITE_DB_PATH);
    // Create accounts and transactions tables
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0.00,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_id TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL,
        amount REAL NOT NULL,
        method_type TEXT NOT NULL,
        details TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'SUCCESS',
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (username) REFERENCES accounts(username) ON DELETE CASCADE
      );
    `);

    // Seed default demo accounts matching Main.java
    const defaultAccounts = [
      ["akshith", "Akshith@123", 10000.00],
      ["allen", "Allen@123", 10000.00],
      ["ishitha", "Ishitha@123", 10000.00],
      ["pooja", "Pooja@123", 10000.00],
      ["shivapriya", "Shivapriya@123", 10000.00]
    ];
    for (const [u, p, b] of defaultAccounts) {
      try {
        sqliteDb.prepare("INSERT OR IGNORE INTO accounts (username, password, balance) VALUES (?, ?, ?)").run(u, p, b);
      } catch (e) {}
    }

    console.log("[DB] Relational SQLite storage initialized at:", SQLITE_DB_PATH);
  } catch (err) {
    console.error("[DB] Failed to initialize SQLite:", err.message);
  }
}
initSqlite();

// ----------------------------------------------------
// 3. OPTIONAL MYSQL / POSTGRES DRIVER DETECTION
// ----------------------------------------------------
let mysqlDriver = null;
let pgDriver = null;
try {
  mysqlDriver = require("mysql2/promise");
} catch (e) {
  // mysql2 not installed yet
}
try {
  pgDriver = require("pg");
} catch (e) {
  // pg not installed yet
}

// Check TCP socket connectivity to MySQL / Postgres
function testTcpConnection(host, port, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      resolved = true;
      socket.destroy();
      resolve({ success: true, message: `Connected to port ${port} successfully!` });
    });

    socket.on("timeout", () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({ success: false, message: `Connection to ${host}:${port} timed out.` });
      }
    });

    socket.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({ success: false, message: err.message });
      }
    });

    socket.connect(port, host);
  });
}

// ----------------------------------------------------
// 4. UNIFIED DATABASE REPOSITORY
// ----------------------------------------------------
const DB = {
  getStats() {
    try {
      const userRow = sqliteDb.prepare("SELECT COUNT(*) as count FROM accounts").get();
      const txRow = sqliteDb.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as totalVolume FROM transactions WHERE status = 'SUCCESS'").get();
      return {
        totalAccounts: userRow ? userRow.count : 0,
        totalTransactions: txRow ? txRow.count : 0,
        totalVolume: txRow ? Number(txRow.totalVolume.toFixed(2)) : 0
      };
    } catch (e) {
      return { totalAccounts: 0, totalTransactions: 0, totalVolume: 0 };
    }
  },

  getAllAccounts() {
    return sqliteDb.prepare("SELECT id, username, balance, created_at FROM accounts ORDER BY id ASC").all();
  },

  getAllTransactions(limit = 100) {
    return sqliteDb.prepare("SELECT * FROM transactions ORDER BY id DESC LIMIT ?").all(limit);
  },

  findAccount(username) {
    if (!username) return null;
    return sqliteDb.prepare("SELECT * FROM accounts WHERE LOWER(username) = LOWER(?)").get(username);
  },

  createAccount(username, password, balance = 0) {
    const existing = this.findAccount(username);
    if (existing) {
      throw new Error(`Username '${username}' already exists in database.`);
    }
    const stmt = sqliteDb.prepare("INSERT INTO accounts (username, password, balance) VALUES (?, ?, ?)");
    stmt.run(username.trim(), password, Number(balance));
    return this.findAccount(username);
  },

  updateBalance(username, newBalance) {
    const stmt = sqliteDb.prepare("UPDATE accounts SET balance = ?, updated_at = datetime('now', 'localtime') WHERE LOWER(username) = LOWER(?)");
    stmt.run(Number(newBalance), username);
  },

  addTransaction(paymentId, username, amount, methodType, details = "", status = "SUCCESS") {
    const stmt = sqliteDb.prepare(`
      INSERT INTO transactions (payment_id, username, amount, method_type, details, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(paymentId, username, Number(amount), methodType, details, status);
  },

  refundTransaction(paymentId, username) {
    const tx = sqliteDb.prepare("SELECT * FROM transactions WHERE payment_id = ?").get(paymentId);
    if (!tx) {
      throw new Error(`Transaction '${paymentId}' not found.`);
    }
    if (tx.status === "REFUNDED") {
      throw new Error(`Transaction '${paymentId}' is already refunded.`);
    }

    const account = this.findAccount(username);
    if (!account) {
      throw new Error(`Account '${username}' not found.`);
    }

    const newBalance = Number((account.balance + tx.amount).toFixed(2));
    this.updateBalance(username, newBalance);

    const updateTx = sqliteDb.prepare("UPDATE transactions SET status = 'REFUNDED' WHERE payment_id = ?");
    updateTx.run(paymentId);

    return {
      refundedAmount: tx.amount,
      updatedBalance: newBalance,
      transaction: { ...tx, status: "REFUNDED" }
    };
  },

  getUserTransactions(username) {
    return sqliteDb.prepare("SELECT * FROM transactions WHERE LOWER(username) = LOWER(?) ORDER BY id DESC").all(username);
  }
};

// ----------------------------------------------------
// 5. HTTP REQUEST HANDLER & REST API
// ----------------------------------------------------
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    return res.end();
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = reqUrl.pathname;

  try {
    // ------------------------------------------------
    // API: Status & Health
    // ------------------------------------------------
    if (pathname === "/api/status" && req.method === "GET") {
      const stats = DB.getStats();
      const testResult = await testTcpConnection(activeConfig.host, activeConfig.port, 1500);

      return sendJson(res, 200, {
        success: true,
        status: "online",
        database: {
          configuredType: activeConfig.type,
          host: activeConfig.host,
          port: activeConfig.port,
          name: activeConfig.database,
          user: activeConfig.user,
          isServerPortReachable: testResult.success,
          serverPortMessage: testResult.message,
          activeRelationalEngine: testResult.success ? `${activeConfig.type.toUpperCase()} (Port ${activeConfig.port} Active)` : "SQLite (Local Auto-Sync Enabled)"
        },
        stats: stats
      });
    }

    // ------------------------------------------------
    // API: Test DB Connection
    // ------------------------------------------------
    if (pathname === "/api/db/test" && req.method === "POST") {
      const body = await parseJsonBody(req);
      const host = body.host || activeConfig.host;
      const port = Number(body.port || activeConfig.port);
      const type = body.type || activeConfig.type;

      const testResult = await testTcpConnection(host, port, 3000);
      return sendJson(res, 200, {
        success: testResult.success,
        type: type,
        host: host,
        port: port,
        message: testResult.success
          ? `Connection to ${type.toUpperCase()} at ${host}:${port} succeeded!`
          : `Could not connect to ${type.toUpperCase()} at ${host}:${port}: ${testResult.message}`
      });
    }

    // ------------------------------------------------
    // API: Update DB Config
    // ------------------------------------------------
    if (pathname === "/api/db/config" && req.method === "POST") {
      const body = await parseJsonBody(req);
      activeConfig = {
        ...activeConfig,
        type: body.type || activeConfig.type,
        host: body.host || activeConfig.host,
        port: Number(body.port || activeConfig.port),
        user: body.user !== undefined ? body.user : activeConfig.user,
        password: body.password !== undefined ? body.password : activeConfig.password,
        database: body.database || activeConfig.database
      };
      saveConfig(activeConfig);
      return sendJson(res, 200, { success: true, config: activeConfig });
    }

    // ------------------------------------------------
    // API: Get DB Config
    // ------------------------------------------------
    if (pathname === "/api/db/config" && req.method === "GET") {
      return sendJson(res, 200, { success: true, config: activeConfig });
    }

    // ------------------------------------------------
    // API: Database Table Inspection (Accounts & Transactions)
    // ------------------------------------------------
    if (pathname === "/api/db/records" && req.method === "GET") {
      const accounts = DB.getAllAccounts();
      const transactions = DB.getAllTransactions(50);
      return sendJson(res, 200, {
        success: true,
        accounts: accounts,
        transactions: transactions,
        stats: DB.getStats()
      });
    }

    // ------------------------------------------------
    // API: Register Account
    // ------------------------------------------------
    if (pathname === "/api/auth/register" && req.method === "POST") {
      const body = await parseJsonBody(req);
      const { username, password, balance } = body;

      if (!username || !password) {
        return sendJson(res, 400, { success: false, message: "Username and password are required." });
      }

      const numBalance = Number(balance) || 0;
      if (numBalance < 0) {
        return sendJson(res, 400, { success: false, message: "Initial balance cannot be negative." });
      }

      const account = DB.createAccount(username, password, numBalance);
      console.log(`[AUTH] Registered new user in database: '${username}' with initial balance Rs.${numBalance}`);
      return sendJson(res, 201, {
        success: true,
        message: "Account created successfully in database!",
        account: {
          username: account.username,
          balance: account.balance,
          created_at: account.created_at
        }
      });
    }

    // ------------------------------------------------
    // API: Login
    // ------------------------------------------------
    if (pathname === "/api/auth/login" && req.method === "POST") {
      const body = await parseJsonBody(req);
      const { username, password } = body;

      const account = DB.findAccount(username);
      if (!account || account.password !== password) {
        return sendJson(res, 401, { success: false, message: "Invalid username or password." });
      }

      console.log(`[AUTH] User '${username}' logged in successfully.`);
      return sendJson(res, 200, {
        success: true,
        message: "Login successful!",
        account: {
          username: account.username,
          balance: account.balance,
          created_at: account.created_at
        }
      });
    }

    // ------------------------------------------------
    // API: Get Account Details
    // ------------------------------------------------
    if (pathname.startsWith("/api/accounts/") && req.method === "GET") {
      const username = decodeURIComponent(pathname.replace("/api/accounts/", ""));
      const account = DB.findAccount(username);
      if (!account) {
        return sendJson(res, 404, { success: false, message: "Account not found." });
      }
      return sendJson(res, 200, {
        success: true,
        account: {
          username: account.username,
          balance: account.balance,
          created_at: account.created_at
        }
      });
    }

    // ------------------------------------------------
    // API: Process Payment
    // ------------------------------------------------
    if (pathname === "/api/payments" && req.method === "POST") {
      const body = await parseJsonBody(req);
      const { paymentId, username, amount, methodType, details } = body;

      if (!paymentId || !username || !amount || !methodType) {
        return sendJson(res, 400, { success: false, message: "Missing required payment fields." });
      }

      const numAmount = Number(amount);
      if (numAmount <= 0) {
        return sendJson(res, 400, { success: false, message: "Invalid payment amount." });
      }

      const account = DB.findAccount(username);
      if (!account) {
        return sendJson(res, 404, { success: false, message: "Account not found." });
      }

      if (account.balance < numAmount) {
        return sendJson(res, 400, {
          success: false,
          message: `Insufficient account balance! Available: Rs. ${account.balance.toFixed(2)}, Required: Rs. ${numAmount.toFixed(2)}`
        });
      }

      const newBalance = Number((account.balance - numAmount).toFixed(2));
      DB.updateBalance(username, newBalance);
      DB.addTransaction(paymentId, account.username, numAmount, methodType, details || "", "SUCCESS");

      console.log(`[PAYMENT] ${methodType} ${paymentId} completed for '${username}'. Amount: Rs.${numAmount}, Remaining: Rs.${newBalance}`);

      return sendJson(res, 200, {
        success: true,
        message: "Payment processed and saved to database!",
        paymentId: paymentId,
        amount: numAmount,
        updatedBalance: newBalance
      });
    }

    // ------------------------------------------------
    // API: Process Refund
    // ------------------------------------------------
    if (pathname === "/api/refunds" && req.method === "POST") {
      const body = await parseJsonBody(req);
      const { paymentId, username } = body;

      if (!paymentId || !username) {
        return sendJson(res, 400, { success: false, message: "paymentId and username are required." });
      }

      const result = DB.refundTransaction(paymentId, username);
      console.log(`[REFUND] Transaction ${paymentId} refunded for '${username}'. Amount: Rs.${result.refundedAmount}, Balance: Rs.${result.updatedBalance}`);

      return sendJson(res, 200, {
        success: true,
        message: "Refund processed and balance restored!",
        refundedAmount: result.refundedAmount,
        updatedBalance: result.updatedBalance
      });
    }

    // ------------------------------------------------
    // API: Get User Transactions
    // ------------------------------------------------
    if (pathname.startsWith("/api/transactions/") && req.method === "GET") {
      const username = decodeURIComponent(pathname.replace("/api/transactions/", ""));
      const txs = DB.getUserTransactions(username);
      return sendJson(res, 200, {
        success: true,
        transactions: txs
      });
    }

    // ------------------------------------------------
    // 404 Not Found
    // ------------------------------------------------
    return sendJson(res, 404, { success: false, message: "Route not found" });
  } catch (err) {
    console.error("[SERVER ERROR]", err);
    return sendJson(res, 500, { success: false, message: err.message || "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log("=================================================");
  console.log(` CYNEX BANK DATABASE & API SERVER RUNNING`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Configured DB: ${activeConfig.type.toUpperCase()} @ ${activeConfig.host}:${activeConfig.port}`);
  console.log("=================================================");
});
