# DevOps Documentation

## Overview

This project implements a comprehensive DevOps pipeline with automated testing, security scanning, and deployment.

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. **Main CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
1. **Dependency Scan** - Checks for vulnerable dependencies
2. **Code Quality** - Linting and code style checks
3. **Automated Tests** - Runs unit and integration tests
4. **Build** - Builds Docker images
5. **Container Scan** - Scans containers for vulnerabilities
6. **Deploy** - Deploys to production (main branch only)

#### 2. **Security Scanning** (`.github/workflows/security-scan.yml`)

**Triggers:**
- Daily at 2 AM UTC
- Manual trigger

**Scans:**
- **SAST** - Static Application Security Testing with CodeQL
- **Dependency Review** - Snyk vulnerability scanning
- **Container Security** - Trivy and Grype scanners
- **Secret Detection** - TruffleHog for leaked secrets
- **License Compliance** - License checker

#### 3. **Docker Publishing** (`.github/workflows/docker-publish.yml`)

**Triggers:**
- Release published
- Manual trigger

**Features:**
- Multi-platform builds (amd64, arm64)
- Semantic versioning
- SBOM (Software Bill of Materials) generation
- Publishes to GitHub Container Registry

#### 4. **PR Checks** (`.github/workflows/pr-checks.yml`)

**Triggers:**
- Pull request opened/updated

**Checks:**
- PR title validation
- Merge conflict detection
- Bundle size check
- Docker build test

## Security Features

### 1. Container Vulnerability Scanning

**Tools:**
- **Trivy** - Comprehensive vulnerability scanner
- **Grype** - Anchore vulnerability scanner

**Severity Levels:**
- CRITICAL
- HIGH
- MEDIUM

### 2. Dependency Scanning

**Tools:**
- **npm audit** - Built-in npm security auditing
- **Snyk** - Advanced dependency vulnerability detection
- **Dependabot** - Automated dependency updates

### 3. Code Security

**Tools:**
- **CodeQL** - Semantic code analysis
- **TruffleHog** - Secret detection

### 4. License Compliance

- Automated license checking
- Summary reports for all dependencies

## Automated Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
Run via Docker Compose:
```bash
docker-compose up --build
```

## Deployment

### Manual Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Automated Deployment

Deployment happens automatically when:
1. Code is pushed to `main` branch
2. All tests pass
3. Security scans pass
4. Docker images build successfully

### Container Registry

Images are published to GitHub Container Registry:
- `ghcr.io/[username]/[repo]/frontend:latest`
- `ghcr.io/[username]/[repo]/backend:latest`

## Monitoring & Alerts

### GitHub Security Alerts

- Dependabot alerts for vulnerable dependencies
- CodeQL security alerts
- Container vulnerability alerts

### Build Status

Check workflow status:
- Go to Actions tab in GitHub
- View individual workflow runs
- Download artifacts (audit reports, SBOMs)

## Best Practices

### 1. Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `hotfix/*` - Urgent fixes

### 2. Commit Messages

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `chore:` - Maintenance
- `test:` - Tests
- `ci:` - CI/CD changes

### 3. Pull Requests

- All changes via PR
- Require passing CI checks
- Code review required
- Squash and merge

### 4. Security

- Never commit secrets
- Use environment variables
- Rotate credentials regularly
- Review security alerts promptly

## Configuration

### Required Secrets

Add these to GitHub repository secrets:

```
SNYK_TOKEN          # Snyk API token (optional)
AWS_ACCESS_KEY_ID   # For deployment (optional)
AWS_SECRET_KEY      # For deployment (optional)
```

### Environment Variables

**Backend:**
```env
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
PORT=5000
```

**Frontend:**
```env
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Build Failures

1. Check workflow logs in Actions tab
2. Verify all dependencies are installed
3. Check Docker build context
4. Ensure environment variables are set

### Security Scan Failures

1. Review vulnerability reports
2. Update dependencies: `npm audit fix`
3. Check for false positives
4. Create exceptions if needed

### Deployment Issues

1. Verify container registry access
2. Check image tags
3. Review deployment logs
4. Verify environment configuration

## Maintenance

### Weekly Tasks

- Review Dependabot PRs
- Check security alerts
- Update dependencies
- Review build logs

### Monthly Tasks

- Audit container images
- Review license compliance
- Update documentation
- Performance review

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Snyk Documentation](https://docs.snyk.io/)

## Support

For issues or questions:
1. Check workflow logs
2. Review this documentation
3. Open an issue on GitHub
4. Contact DevOps team
