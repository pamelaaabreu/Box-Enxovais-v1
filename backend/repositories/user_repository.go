package repositories

import (
	"backend/db"
)

func GetUserEmail(email string) (string, error) {
	var userEmail string
	err := db.DB.QueryRow("SELECT email FROM users WHERE LOWER(email) = $1", email).Scan(&userEmail)
	return userEmail, err
}

func UpdatePasswordByEmail(password, email string) error {
	_, err := db.DB.Exec(
		"UPDATE users SET password = $1 WHERE email = $2",
		password,
		email,
	)
	return err
}
