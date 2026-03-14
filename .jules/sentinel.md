## 2026-03-14 - XML Injection in JUnitReporter
**Vulnerability:** Test names, class names, and suite names were directly injected into the JUnit XML output without escaping, allowing for XML injection.
**Learning:** Even internal-facing reports can be vulnerability vectors if they process developer-controlled strings (like test names) and are later consumed by other systems (like CI/CD dashboards).
**Prevention:** Always escape or sanitize any string that is used to build structured output formats like XML, HTML, or JSON.
