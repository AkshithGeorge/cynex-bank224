# CYNEX BANK - Online Payment & Banking System

A modern, responsive online banking application and payment gateway built based on object-oriented programming (OOP) principles in Java.

---

## 🚀 Quick Start: How to Run the Website

### Option 1: Direct in Browser (No installation needed)
Simply double-click **`index.html`** or right-click and choose **Open With -> Google Chrome / Microsoft Edge / Brave / Firefox**.

Or open it via command prompt/PowerShell:
```powershell
start index.html
```

---

## 💳 Account Management & Predefined Accounts

Both the **Java application** (`Main.java`) and the **Web dashboard** (`index.html` / `app.js`) come pre-loaded with **5 demo accounts** (each starting with **Rs. 10,000.00** balance):

| Username | Password | Initial Balance | Role |
| :--- | :--- | :--- | :--- |
| `akshith` | `Akshith@123` | Rs. 10,000.00 | Standard Account |
| `allen` | `Allen@123` | Rs. 10,000.00 | Standard Account |
| `ishitha` | `Ishitha@123` | Rs. 10,000.00 | Standard Account |
| `pooja` | `Pooja@123` | Rs. 10,000.00 | Standard Account |
| `shivapriya` | `Shivapriya@123`| Rs. 10,000.00 | Standard Account |

You can also create your own custom account directly from the website or Java console:
1. Click **"Create Account"** on the home screen.
2. Enter your desired username, a password of your choice, and an initial deposit.
3. Your account will be saved to the database and you will be signed in immediately.

---

## 🏛️ Java Architecture & OOP Mapping

| Java Concept / Class | File / Web Implementation | Details |
| :--- | :--- | :--- |
| `Account` | `app.js` (`class Account`) | Encapsulates `username`, `password`, `balance`, `addBalance()`, `deductBalance()` |
| `Payment` (Abstract) | `app.js` (`class Payment`) | Abstract base with polymorphic `processPayment()` and `refundPayment()` |
| `CreditCardPayment` | `app.js` (`CreditCardPayment`) | Masked card format `**** **** **** 1234`, card brand detection, expiry year validation |
| `PayPalPayment` | `app.js` (`PayPalPayment`) | Email authentication & digital payment processing |
| `BankTransferPayment`| `app.js` (`BankTransferPayment`)| Destination account masking `****1234`, routing code |
| `PaymentValidator` | `app.js` (`PaymentValidator`) | Amount > 0 check, Insufficient balance check, Credit card expiry year check |
| `PaymentGateway` | `app.js` (`PaymentGateway`) | Coordinates balance deduction, dynamic polymorphic execution, and refund settlement |
| Console Outputs | **Live Gateway Console Dock** | An embedded real-time terminal dock at the bottom showing exact Java `System.out.println` logs |

---

## ✨ Key Features of the Web Application

1. **Authentication & Account Creation**:
   - Secure login with password eye toggles.
   - New account registration with unique username check and non-negative initial deposit validation.
   - Persistent account state using browser `localStorage`.

2. **Interactive Banking Dashboard**:
   - **Interactive Virtual Debit Card**: Shows the user's name, masked account number, expiry date, contactless symbol, and hover tilt effect.
   - **Live Balance Card**: Displays available balance with one-click eye privacy toggle (`••••••`).
   - **Quick Stat Metrics**: Real-time counters for Total Payments, Deposits, and Transaction count.

3. **Multi-Channel Payment Gateway**:
   - Tabbed interface for Credit Card, PayPal, and Bank Transfer.
   - Automatic 16-digit card number spacing and live card brand detector (Visa, Mastercard, Amex).
   - Auto-generated unique Payment IDs (`CC-XXXXXX`, `PP-XXXXXX`, `BT-XXXXXX`).
   - Strict validation with informative error alerts.

4. **Instant Refund System**:
   - An interactive post-payment prompt matching the Java console flow:
     `Do you want a refund? (yes/no)`.
   - On-demand refunds directly from the Transaction Statement table.
   - Automatically credits the refunded amount back to the user's account and updates status.

5. **Transaction Statement & Digital Receipts**:
   - Filter transactions by payment method.
   - Generates formatted, printable digital receipts with status stamp (`PAID` / `REFUNDED`) and barcode.

6. **Live Gateway System Console (Terminal)**:
   - A collapsible drawer dock at the bottom of the screen that prints the exact terminal logs in real time as payments and refunds are processed.

7. **Original Java Source Code**:
   - `Main.java` is preserved in the project directory ready for compilation with `javac Main.java` and `java Main`.
