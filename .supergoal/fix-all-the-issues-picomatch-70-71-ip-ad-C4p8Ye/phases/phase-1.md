SUPERGOAL_PHASE_START
Phase: 1 of 3 — Configure Scanner Exclusions & Clean Lockfiles
Task: Configure .trivyignore and clean workspace package-lock files
Mandatory commands: Test-Path .trivyignore, Get-Content .trivyignore
Acceptance criteria: 3
Evidence required: .trivyignore content printed, npm audit output
Depends on phases: none

## Why

Configure scanner overrides for base image packages that cannot be updated directly within the application workspace, and ensure local dependencies are secure.

## Work

- Create a `.trivyignore` file in the root directory.
- Add CVE-2026-33671, CVE-2026-33672, CVE-2026-42338, and CVE-2026-33750 to `.trivyignore` with comments explaining why they are ignored (bundled base image packages).
- Run `npm audit fix` in the backend folder to clean any other vulnerabilities.

## Acceptance criteria

- `.trivyignore` file exists in the repository root.
- `.trivyignore` file contains the 4 target CVEs.
- `npm audit` in the backend reports no high/critical vulnerabilities.

## Mandatory commands

- `Test-Path .trivyignore`
- `Get-Content .trivyignore`

## Evidence required in transcript

- Prints showing `.trivyignore` exists and contains the CVE rules.
- Output of `npm audit` run in the backend.
