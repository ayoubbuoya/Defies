//! src/service/position_service.rs

use sea_orm::{
    ConnectionTrait, DatabaseConnection, DbErr, FromQueryResult, Statement, TransactionTrait,
};
use serde::Serialize;

// Since we cannot use the domain models, we'll define a struct here
// to represent the data returned from our queries.
#[derive(Debug, FromQueryResult, Serialize)]
pub struct Position {
    pub pb_key: String,
    pub trans_id: i32,
    pub left: f32,
    pub right: f32,
    pub value_locker: f32,
}

/// Adds a new position. If the wallet address doesn't exist, it creates it first.
///
/// # Errors
///
/// Will return `Err` if there is a database error during the transaction.
pub async fn add_position(
    db: &DatabaseConnection,
    pb_key: String,
    trans_id: i32,
    left: f32,
    right: f32,
    value_locker: f32,
) -> Result<Position, DbErr> {
    let txn = db.begin().await?;

    // Check if wallet exists, using a raw SQL query
    let wallet_exists: Option<i32> = txn
        .query_one(Statement::from_sql_and_values(
            db.get_database_backend(),
            "SELECT 1 FROM wallets WHERE pb_key = $1",
            [pb_key.clone().into()],
        ))
        .await?
        .map(|res| res.try_get("", "0"))
        .transpose()?;

    // If wallet does not exist, insert it
    if wallet_exists.is_none() {
        txn.execute(Statement::from_sql_and_values(
            db.get_database_backend(),
            "INSERT INTO wallets (pb_key) VALUES ($1)",
            [pb_key.clone().into()],
        ))
        .await?;
    }

    // Insert the new position
    txn.execute(Statement::from_sql_and_values(
        db.get_database_backend(),
        r#"INSERT INTO positions (pb_key, trans_id, "left", "right", value_locker) VALUES ($1, $2, $3, $4, $5)"#,
        [
            pb_key.clone().into(),
            trans_id.into(),
            left.into(),
            right.into(),
            value_locker.into(),
        ],
    ))
    .await?;

    txn.commit().await?;

    // Return the newly created position
    Ok(Position {
        pb_key,
        trans_id,
        left,
        right,
        value_locker,
    })
}

/// Deletes a specific position for a given wallet.
///
/// # Errors
///
/// Will return `Err` if the position does not exist or if there is a database error.
pub async fn delete_position(
    db: &DatabaseConnection,
    pb_key: String,
    trans_id: i32,
) -> Result<(), DbErr> {
    let result = db
        .execute(Statement::from_sql_and_values(
            db.get_database_backend(),
            "DELETE FROM positions WHERE pb_key = $1 AND trans_id = $2",
            [pb_key.into(), trans_id.into()],
        ))
        .await?;

    if result.rows_affected() == 0 {
        return Err(DbErr::RecordNotFound("Position not found".to_string()));
    }

    Ok(())
}

/// Retrieves all positions associated with a specific wallet.
///
/// # Errors
///
/// Will return `Err` if there is a database error.
pub async fn get_all_positions_for_wallet(
    db: &DatabaseConnection,
    pb_key: String,
) -> Result<Vec<Position>, DbErr> {
    Position::find_by_statement(Statement::from_sql_and_values(
        db.get_database_backend(),
        "SELECT * FROM positions WHERE pb_key = $1",
        [pb_key.into()],
    ))
    .all(db)
     .await
}