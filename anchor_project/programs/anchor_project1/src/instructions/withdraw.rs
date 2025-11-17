use crate::errors::TipError;
use crate::events::TipWithdrawEvent;
use crate::state::Vault;
use anchor_lang::prelude::*;

pub fn _withdraw_tip(ctx: Context<WithdrawTip>) -> Result<()> {
    require_eq!(
        &ctx.accounts.creator.key(),
        &ctx.accounts.vault.creator.key()
    );

    let vault = &mut ctx.accounts.vault;
    let creator = &mut ctx.accounts.creator;

    let rent_lamp = Rent::get()?.minimum_balance(8 + Vault::INIT_SPACE);
    let vault_lamp = &vault.get_lamports();
    let withdraw_lamp = vault_lamp - rent_lamp;

    if withdraw_lamp <= 0 {
        return err!(TipError::InsufficientBalance);
    }
    // 🔥 SOLANA-APPROVED WAY TO MOVE LAMPORTS BETWEEN PROGRAM-OWNED ACCOUNTS 🔥
    **vault.to_account_info().try_borrow_mut_lamports()? -= withdraw_lamp;
    **creator.to_account_info().try_borrow_mut_lamports()? += withdraw_lamp;

    emit!(TipWithdrawEvent {
        recipient: vault.creator,
        sender: vault.key(),
        amount: withdraw_lamp,
    });
    emit!(TipWithdrawEvent {
        recipient: vault.creator.key(),
        sender: vault.key(),
        amount: withdraw_lamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawTip<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut, seeds = [b"vault", creator.key().as_ref()], bump = vault.bump, has_one = creator)]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}
