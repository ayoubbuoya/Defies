// migration/src/m20250806_062648_create_post_table.rs
use sea_orm_migration::prelude::*; // Corrected import

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create the 'wallets' table
        manager
            .create_table(
                Table::create()
                    .table(Wallets::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Wallets::PbKey).string().not_null().primary_key())
                    .col(ColumnDef::new(Wallets::Email).string().null())
                    .to_owned(),
            )
            .await?;

        // Create the 'positions' table
        manager
            .create_table(
                Table::create()
                    .table(Positions::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Positions::PbKey).string().not_null())
                    .col(ColumnDef::new(Positions::TransId).integer().not_null())
                    .col(ColumnDef::new(Positions::Left).float().not_null())
                    .col(ColumnDef::new(Positions::Right).float().not_null())
                    .col(ColumnDef::new(Positions::ValueLocker).float().not_null())
                    // Define the composite primary key
                    .primary_key(
                        Index::create()
                            .name("pk-positions-pb_key-trans_id")
                            .col(Positions::PbKey)
                            .col(Positions::TransId),
                    )
                    // Define the foreign key constraint
                    .foreign_key(
                        ForeignKey::create()
                            .from(Positions::Table, Positions::PbKey)
                            .to(Wallets::Table, Wallets::PbKey)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop tables in reverse order of creation to avoid foreign key issues
        manager
            .drop_table(Table::drop().table(Positions::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Wallets::Table).to_owned())
            .await
    }
}

// Enum for the 'wallets' table and its columns
#[derive(DeriveIden)]
enum Wallets {
    Table,
    PbKey,
    Email,
}

// Enum for the 'positions' table and its columns
#[derive(DeriveIden)]
enum Positions {
    Table,
    PbKey,
    TransId,
    Left,
    Right,
    ValueLocker,
}