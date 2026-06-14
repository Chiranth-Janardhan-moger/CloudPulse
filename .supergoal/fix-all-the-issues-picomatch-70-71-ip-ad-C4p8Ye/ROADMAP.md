# Roadmap: Security Vulnerabilities Fix (Picomatch, IP-Address, Brace-Expansion)

**Task:** Fix vulnerability alerts #70, #71 (picomatch), #56 (ip-address), and #51 (brace-expansion) via .trivyignore and Dockerfile/dependency updates.
**Type:** brownfield, security
**Created:** 2026-06-14
**Total phases:** 3

## Context summary

- **Stack:** Node.js (Express backend, React frontend) with Alpine-based Docker container builds.
- **Package manager:** npm
- **Build / test / lint commands:**
  - Backend: `npm start`
  - Frontend: `npm run build`
- **Risky areas:** Global container build dependencies in node base images that trigger Trivy reports.

## Assumptions

Non-blocking decisions recorded here so we can proceed without round-trips. If any are wrong, stop the run and tell us:

- Upgrading the global npm package to the latest version inside the container is acceptable and desired.
- The use of `.trivyignore` is the standard and accepted practice to suppress base image bundled package vulnerabilities that cannot be directly resolved via local workspace package upgrades.
- The CVE mapping is:
  - Picomatch ReDoS: CVE-2026-33671 / GHSA-4wq5-52p5-q7xq
  - Picomatch POSIX: CVE-2026-33672 / GHSA-36xx-2gf8-98m7
  - IP-Address XSS: CVE-2026-42338 / GHSA-w3q5-96h4-g2c3
  - Brace-Expansion DoS: CVE-2026-33750 / GHSA-f886-m6hf-6m8v

## Risk top 3

1. **Dockerfile build failures** — likelihood: Low, mitigation: Run local `docker build` syntax checks and ensure npm updates do not break standard installation flows.
2. **Missing/Incorrect CVEs in ignore list** — likelihood: Low, mitigation: Map the exact CVEs corresponding to Trivy alerts #70, #71, #56, and #51.
3. **Caching issues** — likelihood: Medium, mitigation: Clean npm cache inside the Dockerfiles using `--force`.

## Phase map

| # | Phase | Depends on | Deliverable |
|---|-------|------------|-------------|
| 1 | Configure Scanner Exclusions & Clean Lockfiles | — | `.trivyignore` and clean local lockfiles |
| 2 | Dockerfile Security Hardening & Dependency Updates | 1 | Hardened `backend/Dockerfile` and `frontend/Dockerfile` |
| 3 | Polish & Harden | 1, 2 | Clean builds, diff verification, and final compliance audit |

---

## Phase 1 — Configure Scanner Exclusions & Clean Lockfiles

**Why:** Define the scanner overrides for base image packages and clean any local workspace dependencies.

**Deliverables:**
- `.trivyignore` file in the workspace root.
- Clean package locks via `npm audit fix`.

**Acceptance criteria:**
- [ ] `.trivyignore` file exists in the repository root.
- [ ] `.trivyignore` file contains all four required CVEs (CVE-2026-33671, CVE-2026-33672, CVE-2026-42338, CVE-2026-33750).
- [ ] No `picomatch`, `ip-address`, or `brace-expansion` vulnerabilities remain in the local package-lock files.

**Mandatory commands:**
- `Test-Path .trivyignore`
- `Get-Content .trivyignore`

**Evidence required:**
- Content of `.trivyignore` printed to the console.
- Output of `npm audit` inside the workspace.

**Dependencies:** none

---

## Phase 2 — Dockerfile Security Hardening & Dependency Updates

**Why:** Upgrade the global CLI package manager inside the container to replace older bundled libraries with their secure versions.

**Deliverables:**
- Hardened `backend/Dockerfile`.
- Hardened `frontend/Dockerfile`.

**Acceptance criteria:**
- [ ] `backend/Dockerfile` includes `RUN npm install -g npm@latest && npm cache clean --force` or similar upgrade.
- [ ] `frontend/Dockerfile` includes `RUN npm install -g npm@latest && npm cache clean --force` or similar upgrade in the build stage.
- [ ] Dockerfiles are syntactically valid and pass basic checks.

**Mandatory commands:**
- `Get-Content backend/Dockerfile`
- `Get-Content frontend/Dockerfile`

**Evidence required:**
- Prints of Dockerfiles showing the upgrade commands.

**Dependencies:** 1

---

## Phase 3 — Polish & Harden

**Why:** Catch what earlier phases missed because they were focused on shipping behavior. This is how "every aspect is perfect" gets enforced.

**Sub-passes (each must produce evidence):**

- [ ] **UX & copy** — ensure comments/documentation in Dockerfiles or `.trivyignore` are clear and explain the reasons for the ignored CVEs.
- [ ] **States** — ensure the ignore policy is correctly picked up by scanning templates.
- [ ] **Edges** — check if there are any trailing/missing newlines or invalid characters in configuration files.
- [ ] **Security** — verify no secrets or temporary files were left behind.
- [ ] **Diff review** — `git diff` reviewed for stray changes or unexpected modifications.
- [ ] **Regression sweep** — verify backend and frontend projects build locally after lockfile updates.

**Mandatory commands:**
- `cd frontend; npm run build`

**Evidence required:**
- One paragraph per sub-pass with what was checked and what was found/fixed
- Final `git diff --stat` summary
- Final test/build summary
