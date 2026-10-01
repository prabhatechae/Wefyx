# Account email and mobile validation

Registration and admin account creation require a valid email and a UAE (+971) mobile. Email addresses are trimmed and stored in lowercase. Phone numbers are stored in international form without spacing, parentheses or hyphens; the `00971` prefix is accepted as an equivalent of `+971`.

Duplicate emails and mobile numbers return HTTP 409 with a message displayed by the forms. Registration never updates an existing account or automatically signs in after a duplicate conflict. Admin edits may retain the current account's own contact details, but cannot take another account's email or mobile. Legacy accounts without a phone can still be edited; missing phones are stored as NULL, not a shared empty string.

On startup, `UserIdentityMigration` validates all existing account identities before normalizing them and adding unique indexes. Legacy mobile values are preserved, including invalid numbers. Duplicate historical mobiles are retained and logged by account ID; a separate unique phone_identity column reserves each number once and application checks block reuse. Invalid emails or duplicate normalized emails still require explicit correction. No accounts are automatically merged or deleted. New and changed mobiles remain strictly validated. The migration does not change support-request contact details, which may legitimately repeat across requests.

Database uniqueness protects concurrent application writes in addition to the friendly pre-save duplicate checks. Entity persistence callbacks normalize identifiers for other repository write paths. Regression tests run against an isolated H2 database. The startup fix has also been verified against the existing local H2 database.

## Local startup / registration proxy

From the repository root, run `./backend/start-local.ps1` and keep it running. This wrapper clears unrelated non-JDBC DATABASE_URL values for the local process. In a second terminal run `cd web` then `npm run dev`. Check `http://127.0.0.1:8080/api` before testing registration; Vite proxies `/api` to port 8080 by default.

A stopped backend can cause proxy failures. A 503 from `/api/auth/send-otp` with an SMS-configuration message is a separate issue: configure the trial credentials in OTP-TESTING.md to send real SMS.

Registration requires a user-chosen password of at least 8 characters (maximum 72 UTF-8 bytes). Passwords are stored as BCrypt hashes. Email or international mobile login verifies the stored hash; shared demo/fallback passwords are not accepted. Configured administrator/vendor credentials remain supported. Registration OTP requests reject already registered mobiles before delivery.
