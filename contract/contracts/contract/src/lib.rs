#![no_std]

use soroban_sdk::{
    contract, contractimpl, Env, Address, Symbol
};

#[contract]
pub struct TokenBurnContract;

#[contractimpl]
impl TokenBurnContract {

    // Internal helper to generate key
    fn balance_key(user: &Address) -> (Symbol, Address) {
        (Symbol::short("BAL"), user.clone())
    }

    // Burn tokens
    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();

        let key = Self::balance_key(&from);

        let balance: i128 = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(0);

        if balance < amount {
            panic!("Insufficient balance");
        }

        env.storage().instance().set(&key, &(balance - amount));
    }

    // Mint tokens (for testing)
    pub fn mint(env: Env, to: Address, amount: i128) {
        let key = Self::balance_key(&to);

        let balance: i128 = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(0);

        env.storage().instance().set(&key, &(balance + amount));
    }

    // Get balance
    pub fn balance(env: Env, user: Address) -> i128 {
        let key = Self::balance_key(&user);

        env.storage()
            .instance()
            .get(&key)
            .unwrap_or(0)
    }
}