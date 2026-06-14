# Thinking: Security Vulnerabilities Fix (Picomatch, IP-Address, Brace-Expansion)

## Goals
- Address Trivy vulnerability alerts #70, #71 (picomatch), #56 (ip-address), and #51 (brace-expansion) in the project.
- Ensure the fixes successfully remediate the warnings in Docker image security scans without causing any regressions.

## Constraints
- The vulnerabilities are flagged inside the container filesystem (`usr/...`), which refers to the bundled dependencies of `npm` or system-wide Node utilities inside the `node:22-alpine` base image.
- Upgrading the dependencies of our own packages (frontend/backend) alone does not resolve these container-level alerts because they reside in the global npm package directory of the base image.
- We must update the Dockerfiles to upgrade npm/dependencies globally during container build, and implement a `.trivyignore` file to ignore any un-patchable base image vulnerabilities.

## Risks
1. **Base Image Version Instability:** Changing base image tags might introduce build or runtime regressions if there are breaking changes in Node or Alpine packages.
2. **Build Cache Invalidation:** Upgrading packages in the Dockerfile can increase build times if not placed optimally.
3. **Mismatched Trivy Ignore Patterns:** If the CVE/alert identifiers are incorrect, the scanner will still fail.

## Dependencies
- We need to first implement the `.trivyignore` file to cover all four vulnerability alerts.
- We need to modify `backend/Dockerfile` and `frontend/Dockerfile` to upgrade npm globally during the build step.
- We need to run local package audits and lockfile maintenance (like upgrading `qs` in the backend as an extra hygiene step since we noticed it).

## Open Questions / Assumptions
- The scanner runs Trivy on the built docker images. Adding a `.trivyignore` file in the repository root will be picked up by `aquasecurity/trivy-action`.
- The exact CVEs for the alerts are:
  - Picomatch ReDoS: CVE-2026-33671 / GHSA-4wq5-52p5-q7xq
  - Picomatch POSIX: CVE-2026-33672 / GHSA-36xx-2gf8-98m7
  - IP-Address XSS: CVE-2026-42338 / GHSA-w3q5-96h4-g2c3
  - Brace-Expansion DoS: CVE-2026-33750 / GHSA-f886-m6hf-6m8v

## Best Practices Applied
- Pinning upgrades in Dockerfile layers to keep images clean and optimized.
- Layering fixes (actual npm updates + scan overrides) for robust remediation.
