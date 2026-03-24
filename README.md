
# 🔥 Token Burn Mechanism (Soroban Smart Contract)

## 📌 Project Description

This project implements a basic Token Burn Mechanism using Soroban smart contracts on the Stellar blockchain. The contract allows users to permanently remove (burn) tokens from their balance, reducing the total circulating supply.

Token burning is commonly used in blockchain ecosystems to control inflation, increase scarcity, and potentially improve token value over time.

---

## ⚙️ What It Does

- Allows users to burn tokens from their own balance
- Ensures only the token holder can authorize the burn operation
- Updates on-chain storage to reflect reduced balances
- Includes mint functionality for testing and demonstration purposes

---

## ✨ Features

- 🔐 Secure authorization using Soroban's `require_auth()`
- 🔥 Token burn functionality (reduces supply)
- 🪙 Simple balance tracking system
- ➕ Minting support (for testing only)
- ⚡ Lightweight and efficient smart contract design

---

## 🚀 How It Works

1. Tokens are stored in contract storage mapped to user addresses.
2. Users can:
   - Mint tokens (for demo/testing)
   - Burn tokens (reducing their balance permanently)
3. Burn operation checks:
   - Authorization of the user
   - Sufficient balance
4. If valid, tokens are deducted and effectively destroyed.

---

## 🛠 Tech Stack

- Rust (Soroban SDK)
- Stellar Soroban Smart Contracts

---

## 📦 Functions Overview

| Function | Description |
|--------|-------------|
| `mint(to, amount)` | Adds tokens to a user's balance |
| `burn(from, amount)` | Burns tokens from a user's balance |
| `balance(user)` | Returns user's token balance |

---

## 🔗 Deployed Smart Contract Link

https://stellar.expert/explorer/testnet/contract/CCJZ76Y5Y3JDI224Y6V5IEJ3E7YBTXQTNGCTON7B3BSA6JF6GRHLE7QY

---

## ⚠️ Notes

- This is a basic implementation for educational purposes.
- No total supply tracking is implemented.
- No token standard (like SEP-41) is fully followed here.
- Minting should be restricted in production environments.

---

## 📈 Future Improvements

- Add total supply tracking
- Integrate with official Soroban token interface
- Add event logging for burns
- Implement access control for minting
- Add allowance/approval system

---

## 👨‍💻 Author

SHIVANSH THAKUR
