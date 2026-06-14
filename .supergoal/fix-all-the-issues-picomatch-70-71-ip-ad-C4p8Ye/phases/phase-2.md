SUPERGOAL_PHASE_START
Phase: 2 of 3 — Dockerfile Security Hardening & Dependency Updates
Task: Upgrade npm to latest in backend/Dockerfile and frontend/Dockerfile
Mandatory commands: Get-Content backend/Dockerfile, Get-Content frontend/Dockerfile
Acceptance criteria: 3
Evidence required: Dockerfile contents printed
Depends on phases: 1

## Why

Upgrading the bundled package manager inside the container ensures that any base image packages (like `picomatch`, `brace-expansion`, and `ip-address`) are replaced with their latest secure versions when the containers are built.

## Work

- Edit `backend/Dockerfile` to add a step updating `npm` globally: `RUN npm install -g npm@latest && npm cache clean --force` before `npm install`.
- Edit `frontend/Dockerfile` to add a step updating `npm` globally: `RUN npm install -g npm@latest && npm cache clean --force` before `npm install` in the build stage.

## Acceptance criteria

- `backend/Dockerfile` contains the global npm upgrade command.
- `frontend/Dockerfile` contains the global npm upgrade command in its build stage.
- Both Dockerfiles contain clean cache instructions.

## Mandatory commands

- `Get-Content backend/Dockerfile`
- `Get-Content frontend/Dockerfile`

## Evidence required in transcript

- Printed content of modified Dockerfiles showing the added steps.
