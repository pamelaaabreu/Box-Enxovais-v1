package repositories

import (
	"backend/db"
	"database/sql"
)

func GetUserEmail(email string) (string, error) {
	var userEmail string
	err := db.DB.QueryRow("SELECT email FROM users WHERE LOWER(email) = LOWER(TRIM($1))", email).Scan(&userEmail)
	return userEmail, err
}

func UpdatePasswordByEmail(password, email string) error {
	result, err := db.DB.Exec(
		"UPDATE users SET password = $1 WHERE LOWER(email) = LOWER(TRIM($2))",
		password,
		email,
	)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows != 1 {
		return sql.ErrNoRows
	}
	return nil
}
