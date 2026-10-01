# SMS OTP testing (UAE)

The registration and password recovery forms allow UAE (+971) mobile numbers only. Enter the national mobile number, or paste the complete international number. The backend validates and normalizes numbers to E.164 before sending or checking them.

## Free local development (no SMS or account required)

Temporary testing code: **123456**. Start the backend with `./backend/start-local.ps1`, click **Send OTP**, then enter **123456**. This applies only to the `local-otp` profile; real SMS verification is unchanged. Codes still expire after five minutes and can only be used once per request.

From the repository root run `./backend/start-local.ps1`. It activates the `local-otp` profile and binds the API to 127.0.0.1. Enter a valid UAE mobile and a registration password, then request OTP. Copy the six-digit code from the backend terminal line `LOCAL DEVELOPMENT OTP` and enter it in the form. The UI indicates that no SMS was sent.

Codes expire after five minutes, allow five incorrect attempts, can be used only once, and have a 30-second resend cooldown. Resending replaces the previous code. Restarting the backend clears all codes. This mode sends no SMS and requires no credentials.

For real SMS locally use `./backend/start-local.ps1 -RealSms` with Twilio credentials. Production must not activate the `local-otp` profile; the standard application configuration continues to require Twilio. The local store is also excluded when `prod` or `production` is active.

## Server setup

### Free development SMS using the Twilio trial

The existing integration supports Twilio trial accounts without code changes. As checked on 2026-09-30, Twilio documents a 30-day trial with 40 successful verifications and a shared allowance of 100 SMS units. This is a limited free trial, not an unlimited free SMS service.

1. Create a Twilio trial account and open Identity > Verify > Try out Verify.
2. Add and verify your own UAE (+971) recipient number. Trial sending is restricted to verified recipients (up to five). Confirm that your account permits delivery to the UAE before testing the app.
3. Copy the Verify Service SID from the trial page's API example, and configure the account SID and auth token below in your local backend environment. Use the trial account's actual API credentials, not simulated test credentials.
4. Restart the backend and follow the live test below. Track remaining free units in the Twilio Console; do not upgrade the development account if you want to remain within the free trial.

Keep production credentials separate in the production server environment. UAE (+971) support remains enabled in the application.

Reference: [Twilio Verify trial setup and limits](https://www.twilio.com/docs/usage/trials/try-out-verify).

Set these environment variables in the backend process (never in the web app):

```dotenv
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
```

Use a Twilio Verify service configured for six-digit SMS codes. Enable the required destinations in the service's geographic permissions and configure provider rate limits for your traffic. For trial accounts, verify the receiving test number in Twilio first. Restart the backend after setting credentials. The application does not automatically load `.env` files; use your deployment environment or export the variables in the shell launching Java.

In real-SMS mode, without credentials, sending returns HTTP 503; it does not simulate delivery or expose an OTP. UAE numbers use the configured Verify service. Provider expiry, attempt limits, and one-time consumption apply.

## Live test

1. Open `/register`, enter your own UAE +971 mobile number and choose a password and select Send OTP.
2. Confirm receipt on the handset. Enter an incorrect code first and confirm rejection, then enter the received code and confirm progression to business details.
3. Request another code after the resend countdown. Check expired and already-used codes are rejected.
4. Confirm that a non-UAE number is rejected and that an already registered mobile displays a clear validation message.
5. For password recovery, use an existing account whose phone is stored in canonical international form. Enter the received code alongside the new password. Existing records with spaced phone numbers may need normalization before recovery.

Automated tests mock provider responses; they do not establish handset delivery. Live delivery requires funded/authorized provider access and a receiving handset. This change implements OTP send/check and password-reset verification; the existing registration endpoint is not newly gated with a server-side verification receipt.

Provider references: [start verification](https://www.twilio.com/docs/verify/api/verification), [check verification](https://www.twilio.com/docs/verify/api/verification-check).
