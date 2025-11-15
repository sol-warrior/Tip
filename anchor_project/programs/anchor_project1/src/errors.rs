use anchor_lang::prelude::*;

#[error_code]
pub enum TipError {
    #[msg("Overflow")]
    Overflow,
    #[msg("Insufficient balance")]
    InsufficientBalance,
}
