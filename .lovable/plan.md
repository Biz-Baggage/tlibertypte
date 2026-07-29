## Goal

Restore admin access for `contact@tlibertypte.com`. The existing password cannot be recovered — it is stored as a one-way hash — so it will be replaced.

## What I'll do

1. Set the password for the `contact@tlibertypte.com` account to `Bangladesh#123` using the backend Auth admin API.
2. Verify the account is confirmed and able to sign in at `/auth`.
3. Confirm the account still holds the admin role so the admin panel loads.

No application code changes are needed.

## Note

Since this password has now been shared in plain chat, please change it right after logging in via Admin → Account → Change password.
