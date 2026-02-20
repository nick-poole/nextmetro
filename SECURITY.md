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
- The WMATA API key is stored server-side in environment variables and is never exposed to the client.
- All client requests are proxied through the Express backend.

### HTTP Security Headers
- [Helmet](https://helmetjs.github.io/) is used to set secure HTTP headers including `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, and others.
- A Content Security Policy (CSP) restricts resource loading to trusted origins.

### CORS
- Cross-Origin Resource Sharing is restricted to the production frontend domain and localhost for development.

### Rate Limiting
- API endpoints are rate-limited to 60 requests per minute per IP to prevent abuse and protect the upstream WMATA API quota.

### Input Validation
- All station code parameters are validated against the expected WMATA format (`/^[A-K][0-9]{2}$/`) before being forwarded to the upstream API.

### Transport Security
- HTTPS is enforced on both the Netlify frontend and Render backend.
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
