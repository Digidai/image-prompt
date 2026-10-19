# Security

The public service is read-only and requires no login. It does not accept uploads or run prompt text. Browser favorites remain local.

Do not publish credentials or private reference images in issues. Use GitHub private vulnerability reporting for a security issue when available. For ordinary attribution or source corrections, use a public issue without sensitive information.

Dependencies are locked in package-lock.json. CI runs output validation and API tests; the Worker validates pagination and filters, enforces read-only methods, redirects secondary hosts, and sends CSP and other security headers. No API token belongs in data/, public/, dist/, source code or logs. Public IndexNow validation material is intentionally public and is not a Cloudflare/Google/Bing credential.
