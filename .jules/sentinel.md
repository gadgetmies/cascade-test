## 2025-05-22 - XML Injection in JUnit Reporter
**Vulnerability:** JUnit XML reporter was not escaping test names, class names, or suite names in XML attributes, allowing specially crafted names (e.g., containing quotes) to break the XML structure.
**Learning:** Reporters often handle dynamic data like test paths and file names that are assumed to be safe but can contain characters that must be escaped for structured formats like XML.
**Prevention:** Always use escaping functions for all dynamic data being interpolated into structured output formats (XML, HTML, JSON). For XML attributes specifically, ensure quotes are escaped.
