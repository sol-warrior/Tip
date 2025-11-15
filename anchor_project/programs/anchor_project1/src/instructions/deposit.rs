use crate::errors::TipError;
use crate::events::TipDeposited;
use crate::state::Vault;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction::transfer};

pub fn _deposit_tip(ctx: Context<DepositTip>, amount: u64) -> Result<()> {
    let bal = ctx.accounts.sender.get_lamports();

    if bal == 0 || bal < amount {
        return err!(TipError::InsufficientBalance);
    }
    let ix = transfer(
        &ctx.accounts.sender.key(),
        &ctx.accounts.vault.key(),
        amount,
    );
    invoke(
        &ix,
        &[
            ctx.accounts.sender.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    let vault = &mut ctx.accounts.vault;
    vault.total_tips = vault
        .total_tips
        .checked_add(amount)
        .ok_or(TipError::Overflow)?;

    emit!(TipDeposited {
        sender: ctx.accounts.sender.key(),
        recipient: vault.creator.key(),
        amount
    });
    Ok(())
}

#[derive(Accounts)]
pub struct DepositTip<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(mut, seeds = [b"vault", vault.creator.as_ref()], bump = vault.bump)]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}
