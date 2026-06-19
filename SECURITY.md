# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x.x   | ✅        |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in this project, please report it responsibly by emailing the maintainer directly. We take all security reports seriously and will respond promptly.

**How to report:**
1. Email a detailed description of the vulnerability.
2. Include steps to reproduce the issue.
3. Include the potential impact of the vulnerability.
4. We will acknowledge receipt within **48 hours**.
5. We will provide a more detailed response within **7 days**.
6. If the vulnerability is confirmed, we will release a patch and credit you in the release notes (unless you wish to remain anonymous).

## Scope

The following are **in scope** for security reports:
- Authentication and authorization flaws
- SQL injection vulnerabilities
- Cross-Site Scripting (XSS)
- Remote Code Execution
- Sensitive data exposure (e.g., API keys, user data)
- CORS misconfiguration

The following are **out of scope:**
- Denial of service attacks
- Issues in third-party dependencies (please report these upstream)
- Social engineering attacks

## Best Practices for Users

- **Never commit your `.env` file** to version control.
- **Rotate your `SECRET_KEY`** if you suspect it has been compromised.
- **Keep dependencies updated** regularly with `pip install -U -r requirements.txt` and `npm update`.
