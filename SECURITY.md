# Security policy

## Supported versions

Only the latest commit on the default branch is supported with security fixes.

## Reporting a vulnerability

Please do **not** open a public issue for security problems.

Use GitHub's private vulnerability reporting: open the repository's
**Security** tab and choose **Report a vulnerability**. We will acknowledge the
report, assess it and publish a fix and advisory once users can update.

## Deploying securely

- Generate a unique `APP_SECRET` per installation and never commit `.env.local`.
- The application has no built-in authentication. Restrict `/admin` at the web
  server (basic auth over HTTPS, IP allow-list or an identity-aware proxy).
- Serve only `public/`, over HTTPS, and run with `APP_ENV=prod`.
- Keep dependencies current, `composer audit` and `npm audit` run in CI.
