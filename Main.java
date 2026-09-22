import java.util.*;
import java.util.Calendar;
import java.io.*;
import java.sql.*;
import java.text.SimpleDateFormat;

// ======================================================
// ACCOUNT CLASS
// ======================================================
class Account {

    private String username;
    private String password;
    private double balance;

    Account(String username, String password, double balance) {
        this.username = username;
        this.password = password;
        this.balance = balance;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public double getBalance() {
        return balance;
    }

    public void addBalance(double amount) {
        balance = balance + amount;
    }

    public boolean deductBalance(double amount) {

        if (balance >= amount) {
            balance = balance - amount;
            return true;
        }

        return false;
    }
}

// ======================================================
// ABSTRACT PAYMENT CLASS
// ======================================================
abstract class Payment {

    protected String paymentId;
    protected double amount;

    Payment(String paymentId, double amount) {
        this.paymentId = paymentId;
        this.amount = amount;
    }

    abstract void processPayment();

    abstract void refundPayment();

    public double getAmount() {
        return amount;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public abstract String getMethodType();

    public abstract String getDetails();
}

// ======================================================
// CREDIT CARD PAYMENT
// ======================================================
class CreditCardPayment extends Payment {

    private String cardNumber;
    private int expiryYear;

    CreditCardPayment(String paymentId, double amount,
                      String cardNumber, int expiryYear) {

        super(paymentId, amount);
        this.cardNumber = cardNumber;
        this.expiryYear = expiryYear;
    }

    public int getExpiryYear() {
        return expiryYear;
    }

    @Override
    public String getMethodType() {
        return "Credit Card";
    }

    @Override
    public String getDetails() {
        String last4 = cardNumber.length() >= 4 ? cardNumber.substring(cardNumber.length() - 4) : cardNumber;
        return "Card: **** **** **** " + last4 + " (Exp: " + expiryYear + ")";
    }

    @Override
    void processPayment() {

        System.out.println("\nProcessing Credit Card Payment...");

        System.out.println("Payment ID : " + paymentId);
        System.out.println("Amount     : Rs." + amount);

        System.out.println(
                "Card       : **** **** **** "
                        + (cardNumber.length() >= 4 ? cardNumber.substring(cardNumber.length() - 4) : cardNumber));

        System.out.println("Credit Card Payment Successful!");
    }

    @Override
    void refundPayment() {

        System.out.println("\nProcessing Credit Card Refund...");

        System.out.println("Refund Amount : Rs." + amount);

        System.out.println(
                "Refund sent to Credit Card.");

        System.out.println(
                "Credit Card Refund Successful!");
    }
}

// ======================================================
// PAYPAL PAYMENT
// ======================================================
class PayPalPayment extends Payment {

    private String email;

    PayPalPayment(String paymentId, double amount,
                  String email) {

        super(paymentId, amount);
        this.email = email;
    }

    @Override
    public String getMethodType() {
        return "PayPal";
    }

    @Override
    public String getDetails() {
        return "PayPal ID: " + email;
    }

    @Override
    void processPayment() {

        System.out.println("\nProcessing PayPal Payment...");

        System.out.println("Payment ID : " + paymentId);
        System.out.println("PayPal ID  : " + email);
        System.out.println("Amount     : Rs." + amount);

        System.out.println(
                "PayPal Payment Successful!");
    }

    @Override
    void refundPayment() {

        System.out.println("\nProcessing PayPal Refund...");

        System.out.println("Refund Amount : Rs." + amount);

        System.out.println(
                "Refund sent to PayPal account.");

        System.out.println(
                "PayPal Refund Successful!");
    }
}

// ======================================================
// BANK TRANSFER PAYMENT
// ======================================================
class BankTransferPayment extends Payment {

    private String accountNumber;

    BankTransferPayment(String paymentId, double amount,
                        String accountNumber) {

        super(paymentId, amount);
        this.accountNumber = accountNumber;
    }

    @Override
    public String getMethodType() {
        return "Bank Transfer";
    }

    @Override
    public String getDetails() {
        String last4 = accountNumber.length() >= 4 ? accountNumber.substring(accountNumber.length() - 4) : accountNumber;
        return "Bank Account: ****" + last4;
    }

    @Override
    void processPayment() {

        System.out.println("\nProcessing Bank Transfer...");

        System.out.println("Payment ID : " + paymentId);
        System.out.println("Amount     : Rs." + amount);

        System.out.println(
                "Bank Account : ****"
                        + (accountNumber.length() >= 4 ? accountNumber.substring(accountNumber.length() - 4) : accountNumber));

        System.out.println(
                "Bank Transfer Successful!");
    }

    @Override
    void refundPayment() {

        System.out.println(
                "\nProcessing Bank Transfer Refund...");

        System.out.println(
                "Refund Amount : Rs." + amount);

        System.out.println(
                "Refund sent to Bank Account.");

        System.out.println(
                "Bank Transfer Refund Successful!");
    }
}

// ======================================================
// PAYMENT VALIDATOR
// ======================================================
class PaymentValidator {

    boolean validatePayment(Payment payment,
                            Account account) {

        // Check amount
        if (payment.getAmount() <= 0) {

            System.out.println(
                    "Invalid payment amount!");

            return false;
        }

        // Check account balance
        if (account.getBalance() < payment.getAmount()) {

            System.out.println(
                    "Insufficient account balance!");

            return false;
        }

        // Credit Card validation
        if (payment instanceof CreditCardPayment) {

            CreditCardPayment card =
                    (CreditCardPayment) payment;

            int currentYear =
                    Calendar.getInstance()
                            .get(Calendar.YEAR);

            if (card.getExpiryYear() < currentYear) {

                System.out.println(
                        "Credit Card has expired!");

                return false;
            }
        }

        return true;
    }
}

// ======================================================
// DATABASE TRANSACTION MODEL
// ======================================================
class TransactionRecord {
    String paymentId;
    String username;
    double amount;
    String methodType;
    String details;
    String status;
    String timestamp;

    TransactionRecord(String paymentId, String username, double amount,
                      String methodType, String details, String status, String timestamp) {
        this.paymentId = paymentId;
        this.username = username;
        this.amount = amount;
        this.methodType = methodType;
        this.details = details;
        this.status = status;
        this.timestamp = timestamp;
    }
}

// ======================================================
// DATABASE MANAGER (JDBC & BUILT-IN PERSISTENT STORAGE)
// ======================================================
class DatabaseManager {

    private String dbType = "FILE"; // "FILE", "MYSQL", or "SQLITE"
    private String jdbcUrl = "";
    private String jdbcUser = "root";
    private String jdbcPass = "";
    private Connection jdbcConn = null;

    private static final String FILE_DB_NAME = "cynexbank_data.db";
    private File fileDb = new File(FILE_DB_NAME);

    // In-memory cache synced with persistent database
    private Map<String, Account> accountsCache = new LinkedHashMap<>();
    private List<TransactionRecord> transactionsCache = new ArrayList<>();

    public DatabaseManager() {
        initDefaultDatabase();
        createDefaultAccounts();
    }

    private void initDefaultDatabase() {
        // Try MySQL or SQLite if drivers exist, otherwise initialize persistent file database
        boolean connectedJdbc = false;

        // Check for SQLite JDBC driver
        try {
            Class.forName("org.sqlite.JDBC");
            jdbcUrl = new File("cynexbank.db").exists() ? "jdbc:sqlite:cynexbank.db" : "jdbc:sqlite:akshitpay.db";
            jdbcConn = DriverManager.getConnection(jdbcUrl);
            dbType = "SQLITE";
            initJdbcTables();
            connectedJdbc = true;
            System.out.println("[DATABASE] Connected via JDBC to SQLite (" + jdbcUrl + ")");
        } catch (Throwable e1) {
            // Check for MySQL JDBC driver
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                jdbcUrl = "jdbc:mysql://localhost:3306/cynexbank_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true";
                jdbcConn = DriverManager.getConnection(jdbcUrl, jdbcUser, jdbcPass);
                dbType = "MYSQL";
                initJdbcTables();
                connectedJdbc = true;
                System.out.println("[DATABASE] Connected via JDBC to MySQL (cynexbank_db)");
            } catch (Throwable e2) {
                // Default to zero-dependency persistent file database
                connectedJdbc = false;
            }
        }

        if (!connectedJdbc) {
            dbType = "FILE";
            initFileDatabase();
            System.out.println("[DATABASE] Active Database: Built-in Persistent Storage (" + FILE_DB_NAME + ")");
            System.out.println("[DATABASE] All accounts, balances, and transactions will be permanently saved.");
        }
    }

    // ----------------------------------------------------
    // JDBC TABLE INITIALIZATION
    // ----------------------------------------------------
    private void initJdbcTables() {
        if (jdbcConn == null) return;
        try (Statement stmt = jdbcConn.createStatement()) {
            if ("SQLITE".equals(dbType)) {
                stmt.execute("CREATE TABLE IF NOT EXISTS accounts (" +
                        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                        "username TEXT NOT NULL UNIQUE, " +
                        "password TEXT NOT NULL, " +
                        "balance REAL NOT NULL DEFAULT 0.00, " +
                        "created_at TEXT DEFAULT (datetime('now', 'localtime'))" +
                        ");");
                stmt.execute("CREATE TABLE IF NOT EXISTS transactions (" +
                        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                        "payment_id TEXT NOT NULL UNIQUE, " +
                        "username TEXT NOT NULL, " +
                        "amount REAL NOT NULL, " +
                        "method_type TEXT NOT NULL, " +
                        "details TEXT DEFAULT '', " +
                        "status TEXT NOT NULL DEFAULT 'SUCCESS', " +
                        "created_at TEXT DEFAULT (datetime('now', 'localtime'))" +
                        ");");
            } else if ("MYSQL".equals(dbType)) {
                stmt.execute("CREATE TABLE IF NOT EXISTS accounts (" +
                        "id INT AUTO_INCREMENT PRIMARY KEY, " +
                        "username VARCHAR(50) NOT NULL UNIQUE, " +
                        "password VARCHAR(255) NOT NULL, " +
                        "balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00, " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                        ");");
                stmt.execute("CREATE TABLE IF NOT EXISTS transactions (" +
                        "id INT AUTO_INCREMENT PRIMARY KEY, " +
                        "payment_id VARCHAR(50) NOT NULL UNIQUE, " +
                        "username VARCHAR(50) NOT NULL, " +
                        "amount DECIMAL(12, 2) NOT NULL, " +
                        "method_type VARCHAR(30) NOT NULL, " +
                        "details VARCHAR(255) DEFAULT '', " +
                        "status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS', " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                        ");");
            }
        } catch (SQLException e) {
            System.err.println("[DATABASE WARNING] Could not verify JDBC tables: " + e.getMessage());
        }
    }

    // ----------------------------------------------------
    // FILE DATABASE LOAD & SAVE
    // ----------------------------------------------------
    private void initFileDatabase() {
        accountsCache.clear();
        transactionsCache.clear();

        if (!fileDb.exists()) {
            try {
                fileDb.createNewFile();
                saveFileDatabase();
            } catch (IOException e) {
                System.err.println("[DATABASE ERROR] Could not create database file: " + e.getMessage());
            }
            return;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(fileDb))) {
            String line;
            String section = "";

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    if (line.equalsIgnoreCase("# [ACCOUNTS]")) section = "ACCOUNTS";
                    else if (line.equalsIgnoreCase("# [TRANSACTIONS]")) section = "TRANSACTIONS";
                    continue;
                }

                String[] parts = line.split("\\|", -1);
                if ("ACCOUNTS".equals(section) && parts.length >= 3) {
                    String u = parts[0];
                    String p = parts[1];
                    double b = Double.parseDouble(parts[2]);
                    accountsCache.put(u, new Account(u, p, b));
                } else if ("TRANSACTIONS".equals(section) && parts.length >= 7) {
                    transactionsCache.add(new TransactionRecord(
                            parts[0], parts[1], Double.parseDouble(parts[2]),
                            parts[3], parts[4], parts[5], parts[6]
                    ));
                }
            }
        } catch (Exception e) {
            System.err.println("[DATABASE ERROR] Could not read database file: " + e.getMessage());
        }
    }

    private synchronized void saveFileDatabase() {
        try (PrintWriter writer = new PrintWriter(new FileWriter(fileDb, false))) {
            writer.println("# ======================================================");
            writer.println("# CyneX Bank - PERSISTENT DATABASE STORAGE");
            writer.println("# ======================================================");
            writer.println();
            writer.println("# [ACCOUNTS]");
            for (Account acc : accountsCache.values()) {
                writer.println(acc.getUsername() + "|" + acc.getPassword() + "|" + acc.getBalance());
            }
            writer.println();
            writer.println("# [TRANSACTIONS]");
            for (TransactionRecord tx : transactionsCache) {
                writer.println(tx.paymentId + "|" + tx.username + "|" + tx.amount + "|" +
                        tx.methodType + "|" + tx.details + "|" + tx.status + "|" + tx.timestamp);
            }
        } catch (IOException e) {
            System.err.println("[DATABASE ERROR] Failed to save database: " + e.getMessage());
        }
    }

    // ----------------------------------------------------
    // ACCOUNT OPERATIONS
    // ----------------------------------------------------
    // Predefined demo accounts
    private void createDefaultAccounts() {
        createAccountIfMissing("akshith", "Akshith@123", 10000.00);
        createAccountIfMissing("allen", "Allen@123", 10000.00);
        createAccountIfMissing("ishitha", "Ishitha@123", 10000.00);
        createAccountIfMissing("pooja", "Pooja@123", 10000.00);
        createAccountIfMissing("shivapriya", "Shivapriya@123", 10000.00);
    }

    private void createAccountIfMissing(String username, String password, double balance) {
        if (!userExists(username)) {
            createAccount(username, password, balance);
        }
    }

    public boolean userExists(String username) {
        if (jdbcConn != null) {
            try (PreparedStatement ps = jdbcConn.prepareStatement("SELECT username FROM accounts WHERE username = ?")) {
                ps.setString(1, username);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next();
                }
            } catch (SQLException e) {
                System.err.println("[DATABASE ERROR] Query failed: " + e.getMessage());
            }
        }
        return accountsCache.containsKey(username);
    }

    public boolean createAccount(String username, String password, double initialBalance) {
        if (userExists(username)) {
            return false;
        }

        if (jdbcConn != null) {
            try (PreparedStatement ps = jdbcConn.prepareStatement(
                    "INSERT INTO accounts (username, password, balance) VALUES (?, ?, ?)")) {
                ps.setString(1, username);
                ps.setString(2, password);
                ps.setDouble(3, initialBalance);
                ps.executeUpdate();
                return true;
            } catch (SQLException e) {
                System.err.println("[DATABASE ERROR] Insert failed: " + e.getMessage());
                // Fall back to file cache on JDBC error
            }
        }

        accountsCache.put(username, new Account(username, password, initialBalance));
        saveFileDatabase();
        return true;
    }

    public Account authenticate(String username, String password) {
        if (jdbcConn != null) {
            try (PreparedStatement ps = jdbcConn.prepareStatement(
                    "SELECT username, password, balance FROM accounts WHERE username = ? AND password = ?")) {
                ps.setString(1, username);
                ps.setString(2, password);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        return new Account(
                                rs.getString("username"),
                                rs.getString("password"),
                                rs.getDouble("balance")
                        );
                    }
                }
            } catch (SQLException e) {
                System.err.println("[DATABASE ERROR] Authentication query error: " + e.getMessage());
            }
        }

        Account acc = accountsCache.get(username);
        if (acc != null && acc.getPassword().equals(password)) {
            return acc;
        }
        return null;
    }

    public void updateBalance(String username, double newBalance) {
        if (jdbcConn != null) {
            try (PreparedStatement ps = jdbcConn.prepareStatement(
                    "UPDATE accounts SET balance = ? WHERE username = ?")) {
                ps.setDouble(1, newBalance);
                ps.setString(2, username);
                ps.executeUpdate();
            } catch (SQLException e) {
                System.err.println("[DATABASE ERROR] Update balance error: " + e.getMessage());
            }
        }

        Account acc = accountsCache.get(username);
        if (acc != null) {
            // Update in memory cache
            accountsCache.put(username, new Account(username, acc.getPassword(), newBalance));
            saveFileDatabase();
        }
    }

    // ----------------------------------------------------
    // TRANSACTION OPERATIONS
    // ----------------------------------------------------
    public void recordTransaction(String paymentId, String username, double amount,
                                  String methodType, String details, String status) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date());

        if (jdbcConn != null) {
            try (PreparedStatement ps = jdbcConn.prepareStatement(
                    "INSERT INTO transactions (payment_id, username, amount, method_type, details, status, created_at) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?)")) {
                ps.setString(1, paymentId);
                ps.setString(2, username);
                ps.setDouble(3, amount);
                ps.setString(4, methodType);
                ps.setString(5, details);
                ps.setString(6, status);
                ps.setString(7, timestamp);
                ps.executeUpdate();
            } catch (SQLException e) {
                System.err.println("[DATABASE ERROR] Insert transaction error: " + e.getMessage());
            }
        }

        transactionsCache.add(new TransactionRecord(paymentId, username, amount, methodType, details, status, timestamp));
        saveFileDatabase();
    }

    public void updateTransactionStatus(String paymentId, String newStatus) {
        if (jdbcConn != null) {
            try (PreparedStatement ps = jdbcConn.prepareStatement(
                    "UPDATE transactions SET status = ? WHERE payment_id = ?")) {
                ps.setString(1, newStatus);
                ps.setString(2, paymentId);
                ps.executeUpdate();
            } catch (SQLException e) {
                System.err.println("[DATABASE ERROR] Update transaction status error: " + e.getMessage());
            }
        }

        for (TransactionRecord tx : transactionsCache) {
            if (tx.paymentId.equals(paymentId)) {
                tx.status = newStatus;
                break;
            }
        }
        saveFileDatabase();
    }

    public void printTransactionHistory(String username) {
        System.out.println("\n==========================================================================================");
        System.out.println("                         TRANSACTION STATEMENT FOR: " + username);
        System.out.println("==========================================================================================");

        List<TransactionRecord> list = new ArrayList<>();

        if (jdbcConn != null) {
            try (PreparedStatement ps = jdbcConn.prepareStatement(
                    "SELECT payment_id, username, amount, method_type, details, status, created_at " +
                            "FROM transactions WHERE username = ? ORDER BY id DESC")) {
                ps.setString(1, username);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        list.add(new TransactionRecord(
                                rs.getString("payment_id"),
                                rs.getString("username"),
                                rs.getDouble("amount"),
                                rs.getString("method_type"),
                                rs.getString("details"),
                                rs.getString("status"),
                                rs.getString("created_at")
                        ));
                    }
                }
            } catch (SQLException e) {
                System.err.println("[DATABASE ERROR] Fetch transactions error: " + e.getMessage());
            }
        }

        if (list.isEmpty()) {
            for (TransactionRecord tx : transactionsCache) {
                if (tx.username.equalsIgnoreCase(username)) {
                    list.add(tx);
                }
            }
        }

        if (list.isEmpty()) {
            System.out.println("No transactions found for user: " + username);
            System.out.println("==========================================================================================");
            return;
        }

        System.out.printf("%-14s | %-15s | %-12s | %-10s | %-19s | %s\n",
                "Payment ID", "Method", "Amount", "Status", "Date / Time", "Details");
        System.out.println("------------------------------------------------------------------------------------------");

        for (TransactionRecord tx : list) {
            System.out.printf("%-14s | %-15s | Rs.%-9.2f | %-10s | %-19s | %s\n",
                    tx.paymentId, tx.methodType, tx.amount, tx.status, tx.timestamp, tx.details);
        }

        System.out.println("==========================================================================================");
    }

    public String getDatabaseStatus() {
        if ("MYSQL".equals(dbType)) {
            return "MySQL Database (cynexbank_db via JDBC)";
        } else if ("SQLITE".equals(dbType)) {
            return "SQLite Database (cynexbank.db via JDBC)";
        } else {
            return "Built-in Persistent Database (" + FILE_DB_NAME + ")";
        }
    }

    public void configureDatabase(Scanner sc) {
        System.out.println("\n----------------------------------------");
        System.out.println("       DATABASE CONFIGURATION");
        System.out.println("----------------------------------------");
        System.out.println("Current Active Database: " + getDatabaseStatus());
        System.out.println("1. Use Built-in Persistent Database (" + FILE_DB_NAME + ")");
        System.out.println("2. Connect to SQLite Database (cynexbank.db)");
        System.out.println("3. Connect to MySQL Database (localhost:3306)");
        System.out.println("4. Back to Main Menu");
        System.out.print("\nEnter choice: ");

        int choice = sc.nextInt();
        if (choice == 1) {
            try {
                if (jdbcConn != null) jdbcConn.close();
            } catch (Exception ignored) {}
            jdbcConn = null;
            dbType = "FILE";
            initFileDatabase();
            System.out.println("\nSwitched to Built-in Persistent Storage (" + FILE_DB_NAME + ") successfully!");
        } else if (choice == 2) {
            try {
                Class.forName("org.sqlite.JDBC");
                if (jdbcConn != null) jdbcConn.close();
                jdbcUrl = "jdbc:sqlite:cynexbank.db";
                jdbcConn = DriverManager.getConnection(jdbcUrl);
                dbType = "SQLITE";
                initJdbcTables();
                System.out.println("\nConnected to SQLite database successfully!");
            } catch (Throwable e) {
                System.out.println("\nSQLite JDBC driver not available in classpath. Kept active database: " + getDatabaseStatus());
            }
        } else if (choice == 3) {
            System.out.print("Enter MySQL Host [localhost]: ");
            String host = sc.next();
            if (host.trim().isEmpty()) host = "localhost";

            System.out.print("Enter MySQL Port [3306]: ");
            int port = sc.nextInt();

            System.out.print("Enter MySQL Username [root]: ");
            String user = sc.next();

            System.out.print("Enter MySQL Password (or '-' for empty): ");
            String pass = sc.next();
            if ("-".equals(pass)) pass = "";

            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                if (jdbcConn != null) jdbcConn.close();
                jdbcUrl = "jdbc:mysql://" + host + ":" + port + "/cynexbank_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true";
                jdbcConn = DriverManager.getConnection(jdbcUrl, user, pass);
                dbType = "MYSQL";
                jdbcUser = user;
                jdbcPass = pass;
                initJdbcTables();
                System.out.println("\nConnected to MySQL database successfully!");
            } catch (Throwable e) {
                System.out.println("\nCould not connect to MySQL (" + e.getMessage() + ").");
                System.out.println("Kept active database: " + getDatabaseStatus());
            }
        }
    }
}

// ======================================================
// PAYMENT GATEWAY
// ======================================================
class PaymentGateway {

    private PaymentValidator validator =
            new PaymentValidator();
    private DatabaseManager db;

    PaymentGateway(DatabaseManager db) {
        this.db = db;
    }

    void processPayment(Payment payment,
                        Account account) {

        // Validate payment
        if (validator.validatePayment(
                payment, account)) {

            // Deduct money from account
            boolean success =
                    account.deductBalance(
                            payment.getAmount());

            if (success) {

                // Persist new balance and transaction in database
                if (db != null) {
                    db.updateBalance(account.getUsername(), account.getBalance());
                    db.recordTransaction(
                            payment.getPaymentId(),
                            account.getUsername(),
                            payment.getAmount(),
                            payment.getMethodType(),
                            payment.getDetails(),
                            "SUCCESS"
                    );
                }

                // Dynamic Polymorphism
                payment.processPayment();

                System.out.println(
                        "\n--------------------------------");

                System.out.println(
                        "Payment Amount : Rs."
                                + payment.getAmount());

                System.out.println(
                        "Remaining Balance : Rs."
                                + account.getBalance());

                System.out.println(
                        "--------------------------------");
                System.out.println("[DB] Transaction and updated balance saved to database.");
            }
        } else {

            System.out.println(
                    "Payment Failed!");
        }
    }

    void processRefund(Payment payment,
                       Account account) {

        // Add refunded amount back
        account.addBalance(
                payment.getAmount());

        // Update balance and transaction status in database
        if (db != null) {
            db.updateBalance(account.getUsername(), account.getBalance());
            db.updateTransactionStatus(payment.getPaymentId(), "REFUNDED");
        }

        // Dynamic Polymorphism
        payment.refundPayment();

        System.out.println(
                "\nRefund Amount : Rs."
                        + payment.getAmount());

        System.out.println(
                "Updated Balance : Rs."
                        + account.getBalance());
        System.out.println("[DB] Refund recorded and balance updated in database.");
    }
}

// ======================================================
// MAIN CLASS
// ======================================================
public class Main {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        // Initialize Database Manager
        DatabaseManager db = new DatabaseManager();

        boolean loggedIn = false;
        Account currentAccount = null;

        // ==================================================
        // ACCOUNT MENU
        // ==================================================

        while (!loggedIn) {

            System.out.println(
                    "\n========================================");

            System.out.println(
                    "       CYNEX BANK PAYMENT SYSTEM");

            System.out.println(
                    "========================================");

            System.out.println("Storage  : " + db.getDatabaseStatus());
            System.out.println("----------------------------------------");
            System.out.println("1. Create Account");
            System.out.println("2. Login");
            System.out.println("3. Database Settings / Status");
            System.out.println("4. Exit");

            System.out.print(
                    "\nEnter your choice: ");

            int choice = sc.nextInt();

            // ==================================================
            // CREATE ACCOUNT
            // ==================================================

            if (choice == 1) {

                System.out.print(
                        "\nEnter Username: ");

                String username = sc.next();

                if (db.userExists(username)) {

                    System.out.println(
                            "Username already exists in database!");

                    continue;
                }

                System.out.print(
                        "Create Password: ");

                String password = sc.next();

                System.out.print(
                        "Enter Initial Amount: Rs.");

                double initialAmount =
                        sc.nextDouble();

                if (initialAmount < 0) {

                    System.out.println(
                            "Amount cannot be negative!");

                    continue;
                }

                // Create new account in database
                boolean created = db.createAccount(username, password, initialAmount);

                if (created) {
                    System.out.println(
                            "\nAccount created and saved to database successfully!");

                    System.out.println(
                            "Username : " + username);

                    System.out.println(
                            "Balance  : Rs."
                                    + initialAmount);
                } else {
                    System.out.println("Failed to create account. Please try again.");
                }
            }

            // ==================================================
            // LOGIN
            // ==================================================

            else if (choice == 2) {

                System.out.print(
                        "\nEnter Username: ");

                String username = sc.next();

                System.out.print(
                        "Enter Password: ");

                String password = sc.next();

                if (!db.userExists(username)) {
                    System.out.println(
                            "Account does not exist in database!");
                    continue;
                }

                Account account = db.authenticate(username, password);

                if (account != null) {

                    loggedIn = true;
                    currentAccount = account;

                    System.out.println(
                            "\nLogin Successful!");

                    System.out.println(
                            "Welcome, "
                                    + username + "!");

                    System.out.println(
                            "Current Balance : Rs."
                                    + account.getBalance());

                } else {

                    System.out.println(
                            "Incorrect Password!");
                }
            }

            // ==================================================
            // DATABASE SETTINGS
            // ==================================================

            else if (choice == 3) {
                db.configureDatabase(sc);
            }

            // ==================================================
            // EXIT
            // ==================================================

            else if (choice == 4) {

                System.out.println(
                        "\nThank you for using CyneX Bank!");

                sc.close();

                return;
            } else {

                System.out.println(
                        "Invalid choice!");
            }
        }

        // ==================================================
        // PAYMENT GATEWAY & DASHBOARD
        // ==================================================

        PaymentGateway gateway =
                new PaymentGateway(db);

        boolean running = true;

        while (running) {

            System.out.println(
                    "\n========================================");

            System.out.println(
                    "       CYNEX BANK - PAYMENT MENU");

            System.out.println(
                    "========================================");

            System.out.println(
                    "Logged in as : "
                            + currentAccount.getUsername());

            System.out.println(
                    "Balance      : Rs."
                            + currentAccount.getBalance());

            System.out.println("Storage      : " + db.getDatabaseStatus());

            System.out.println(
                    "\n1. Make Payment");

            System.out.println(
                    "2. Add Money");

            System.out.println(
                    "3. View Transaction History (Database)");

            System.out.println(
                    "4. Logout");

            System.out.print(
                    "\nEnter your choice: ");

            int choice = sc.nextInt();

            // ==================================================
            // MAKE PAYMENT
            // ==================================================

            if (choice == 1) {

                Payment payment = null;

                System.out.println(
                        "\n--------------------------------");

                System.out.println(
                        "SELECT PAYMENT METHOD");

                System.out.println(
                        "--------------------------------");

                System.out.println(
                        "1. Credit Card");

                System.out.println(
                        "2. PayPal");

                System.out.println(
                        "3. Bank Transfer");

                System.out.print(
                        "\nEnter choice: ");

                int paymentChoice =
                        sc.nextInt();

                System.out.print(
                        "Enter Payment ID: ");

                String paymentId =
                        sc.next();

                System.out.print(
                        "Enter Amount: Rs.");

                double amount =
                        sc.nextDouble();

                // Credit Card
                if (paymentChoice == 1) {

                    System.out.print(
                            "Enter Card Number: ");

                    String cardNumber =
                            sc.next();

                    System.out.print(
                            "Enter Card Expiry Year: ");

                    int expiryYear =
                            sc.nextInt();

                    payment =
                            new CreditCardPayment(
                                    paymentId,
                                    amount,
                                    cardNumber,
                                    expiryYear
                            );
                }

                // PayPal
                else if (paymentChoice == 2) {

                    System.out.print(
                            "Enter PayPal Email: ");

                    String email =
                            sc.next();

                    payment =
                            new PayPalPayment(
                                    paymentId,
                                    amount,
                                    email
                            );
                }

                // Bank Transfer
                else if (paymentChoice == 3) {

                    System.out.print(
                            "Enter Bank Account Number: ");

                    String accountNumber =
                            sc.next();

                    payment =
                            new BankTransferPayment(
                                    paymentId,
                                    amount,
                                    accountNumber
                            );
                } else {

                    System.out.println(
                            "Invalid payment method!");

                    continue;
                }

                // ==================================================
                // PROCESS PAYMENT
                // ==================================================

                System.out.println(
                        "\n--------------------------------");

                System.out.println(
                        "PAYMENT PROCESSING");

                System.out.println(
                        "--------------------------------");

                gateway.processPayment(
                        payment,
                        currentAccount);

                // ==================================================
                // REFUND
                // ==================================================

                System.out.print(
                        "\nDo you want a refund? (yes/no): ");

                String refund =
                        sc.next();

                if (refund.equalsIgnoreCase("yes")) {

                    gateway.processRefund(
                            payment,
                            currentAccount);
                }

                // Display final balance
                System.out.println(
                        "\nCurrent Account Balance : Rs."
                                + currentAccount.getBalance());
            }

            // ==================================================
            // ADD MONEY
            // ==================================================

            else if (choice == 2) {

                System.out.print(
                        "\nEnter amount to add: Rs.");

                double amount =
                        sc.nextDouble();

                if (amount > 0) {

                    currentAccount.addBalance(
                            amount);

                    // Persist updated balance in database
                    db.updateBalance(currentAccount.getUsername(), currentAccount.getBalance());

                    // Record deposit transaction
                    String depId = "DEP-" + (System.currentTimeMillis() % 1000000);
                    db.recordTransaction(depId, currentAccount.getUsername(), amount, "Deposit", "Direct Account Deposit", "SUCCESS");

                    System.out.println(
                            "Money added successfully!");

                    System.out.println(
                            "New Balance : Rs."
                                    + currentAccount.getBalance());

                    System.out.println("[DB] Updated balance and deposit transaction saved to database.");
                } else {

                    System.out.println(
                            "Invalid amount!");
                }
            }

            // ==================================================
            // VIEW TRANSACTION HISTORY (DATABASE)
            // ==================================================

            else if (choice == 3) {
                db.printTransactionHistory(currentAccount.getUsername());
            }

            // ==================================================
            // LOGOUT
            // ==================================================

            else if (choice == 4) {

                System.out.println(
                        "\nLogged out successfully!");

                System.out.println(
                        "Thank you, "
                                + currentAccount.getUsername()
                                + "!");

                running = false;
            } else {

                System.out.println(
                        "Invalid choice!");
            }
        }

        sc.close();
    }
}
