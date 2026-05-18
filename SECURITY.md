# Security Policy

## Supported Version
Current repository head only.

## Vulnerability Reporting
Report security issues privately to the project maintainers with reproduction details and impact.

## Operational Recommendations
- Use strong random values for `APP_JWT_SECRET` and `APP_AI_API_KEY`.
- Run behind HTTPS in production.
- Restrict network access to internal service ports.
- Rotate credentials and monitor API and auth logs.
