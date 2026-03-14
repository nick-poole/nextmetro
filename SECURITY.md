# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in NextMetro, please report it responsibly.

**Email:** [nick@nickpoole.dev](mailto:nick@nickpoole.dev)

Please include:
- A description of the vulnerability
- Steps to reproduce the issue
- Any potential impact

I will acknowledge receipt within 48 hours and aim to provide a fix or mitigation within 7 days for confirmed issues.

**Please do not** open a public GitHub issue for security vulnerabilities.

## Security Measures

### API Key Protection
- The WMATA API key is stored as a Cloudflare Worker secret environment variable and is never exposed to the client.
- All client requests are proxied through the Cloudflare Worker backend.

### HTTP Security Headers
- Security headers are set on all HTML responses by the Cloudflare Worker, including:
  - `Content-Security-Policy` — restricts resource loading to trusted origins
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security` (HSTS)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` — disables camera, microphone, and geolocation

### CORS
- Cross-Origin Resource Sharing is restricted to the production frontend domain (`nextmetro.live`, `www.nextmetro.live`) and the workers subdomain. Localhost is included for local development.

### Input Validation
- All station code parameters are validated against the expected WMATA format (`/^[A-KNS][0-9]{2}$/`) before being forwarded to the upstream API.

### Transport Security
- HTTPS is enforced via Cloudflare on all routes.
- HSTS headers are set with a one-year max-age.
- No mixed content is served.

### Data Privacy
- NextMetro does not collect, store, or process any personally identifiable information (PII).
- No user accounts, cookies, or tracking are used.
- All data displayed is sourced from the public WMATA API.

## Supported Versions

Only the latest deployed version of NextMetro receives security updates.

| Version | Supported |
| ------- | --------- |
| 2.x     | Yes       |
| < 2.0   | No        |
