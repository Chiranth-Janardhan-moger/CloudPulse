<div align="center">

# ️ CloudPulse

### Real-Time AWS EC2 Instance Monitor & Cost Optimizer

[![CI/CD Pipeline](https://github.com/chiranth-janardhan-moger/cloudpulse/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/chiranth-janardhan-moger/cloudpulse/actions/workflows/ci-cd.yml)
[![Security Scan](https://github.com/chiranth-janardhan-moger/cloudpulse/actions/workflows/security-scan.yml/badge.svg)](https://github.com/chiranth-janardhan-moger/cloudpulse/actions/workflows/security-scan.yml)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://github.com/chiranth-janardhan-moger/cloudpulse/pkgs/container/cloudpulse%2Ffrontend)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Monitor your AWS infrastructure across all regions • Detect idle instances • Optimize costs • Manage multiple accounts**

[Features](#-features) • [Quick Start](#-quick-start) • [Demo](#-demo) • [Documentation](#-documentation)

</div>

---

##  Overview

CloudPulse is a comprehensive AWS monitoring solution that helps you visualize, manage, and optimize your EC2 infrastructure across all AWS regions. With real-time metrics, idle instance detection, and cost analysis, CloudPulse makes cloud management effortless.

##  Features

###  Multi-Region Monitoring
- **Automatic scanning** across all enabled AWS regions
- **Real-time instance discovery** with auto-refresh every 30 seconds
- **Unified dashboard** showing instances from all regions

###  Cost Optimization
- **Idle instance detection** (CPU < 5% for 7 days)
- **Cost waste estimation** for idle resources
- **AWS billing dashboard** with monthly/yearly breakdowns
- **Visual cost analytics** with interactive charts

###  Multi-Account Management
- **Profile system** for managing multiple AWS accounts
- **Quick switching** between different accounts
- **Secure credential storage** in browser localStorage
- **User-friendly login** with username support

###  Advanced Analytics
- **CPU utilization tracking** via CloudWatch
- **Instance status visualization** with color coding
- **Interactive charts** for cost and usage trends
- **Detailed instance information** (type, IPs, launch time)

###  Instance Management
- **One-click instance stop** directly from dashboard
- **Advanced filtering** by region, state, and search
- **Bulk operations** support
- **Real-time status updates**

###  Security & DevOps
- **Automated CI/CD pipeline** with GitHub Actions
- **Container vulnerability scanning** (Trivy, Grype)
- **Dependency security checks** (npm audit, Snyk)
- **SAST with CodeQL** for code security
- **Secret detection** with TruffleHog
- **Automated dependency updates** via Dependabot

##  Quick Start

### Prerequisites
- Docker & Docker Compose
- AWS Account with EC2 access
- IAM credentials with required permissions

### One-Command Deployment

```bash
docker-compose up -d
```

That's it! Access the application at **http://localhost**

### What Happens?
1.  Pulls pre-built images from GitHub Container Registry
2.  Starts backend API server (port 5000)
3.  Starts frontend web app (port 80)
4.  Sets up networking and health checks
5.  Auto-restarts on failure

##  Demo

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=CloudPulse+Dashboard)

### Billing Analytics
![Billing](https://via.placeholder.com/800x400/10B981/FFFFFF?text=Billing+Dashboard)

### Profile Manager
![Profiles](https://via.placeholder.com/800x400/F59E0B/FFFFFF?text=Profile+Manager)

## ️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Vite** - Lightning-fast build tool

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **AWS SDK v3** - AWS service integration
  - EC2 Client
  - CloudWatch Client
  - Cost Explorer Client
- **CORS** - Cross-origin support

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD automation
- **Nginx** - Web server for frontend
- **Multi-stage builds** - Optimized images

### Security Tools
- **Trivy** - Container vulnerability scanner
- **Grype** - Dependency scanner
- **CodeQL** - Static code analysis
- **Snyk** - Dependency security
- **TruffleHog** - Secret detection

##  IAM Permissions Required

Your AWS IAM user needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:StopInstances",
        "cloudwatch:GetMetricStatistics",
        "ce:GetCostAndUsage"
      ],
      "Resource": "*"
    }
  ]
}
```

See [IAM_PERMISSIONS.txt](IAM_PERMISSIONS.txt) for detailed setup.

##  Documentation

- **[DEPLOYMENT.txt](DEPLOYMENT.txt)** - Deployment guide and troubleshooting
- **[DEVOPS.md](DEVOPS.md)** - CI/CD pipeline and security documentation
- **[SETUP.txt](SETUP.txt)** - Development setup instructions

##  Usage

### 1. Login
- Enter your username
- Provide AWS credentials (Access Key ID & Secret)
- Select default region
- Or use **Profile Manager** for multiple accounts

### 2. Monitor
- View all instances across regions
- Check CPU utilization and idle status
- Filter by region, state, or search
- Auto-refresh every 30 seconds

### 3. Optimize
- Identify idle instances (CPU < 5%)
- View estimated cost waste
- Stop unused instances with one click
- Track savings over time

### 4. Analyze
- Open **Billing Dashboard**
- View current month, last month, and YTD costs
- Analyze monthly trends with charts
- Export data for reporting

##  Development

### Local Development

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

### Build from Source

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## ️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│            (React + TypeScript)                  │
└────────────────────┬────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────┐
│              Frontend (Nginx)                   │
│         Serves static React build               │
└────────────────────┬────────────────────────────┘
                     │ Proxy /api
                     ▼
┌─────────────────────────────────────────────────┐
│          Backend (Node.js/Express)              │
│    - EC2 Instance Management                    │
│    - CloudWatch Metrics                         │
│    - Cost Explorer Integration                  │
└────────────────────┬────────────────────────────┘
                     │ AWS SDK v3
                     ▼
┌─────────────────────────────────────────────────┐
│                 AWS Services                    │
│  • EC2  • CloudWatch  • Cost Explorer           │
└─────────────────────────────────────────────────┘
```

##  Security

-  Credentials stored locally in browser
-  HTTPS recommended for production
-  No credentials stored on server
-  Automated security scanning in CI/CD
-  Container vulnerability checks
-  Dependency auditing
-  Secret detection in commits

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure CI/CD passes

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- AWS SDK team for excellent documentation
- React and TypeScript communities
- Docker for containerization
- GitHub Actions for CI/CD
- All open-source contributors

##  Support

-  Email: support@cloudpulse.dev
-  Issues: [GitHub Issues](https://github.com/chiranth-janardhan-moger/cloudpulse/issues)
-  Discussions: [GitHub Discussions](https://github.com/chiranth-janardhan-moger/cloudpulse/discussions)

## ️ Roadmap

- [ ] Support for other cloud providers (Azure, GCP)
- [ ] Advanced cost forecasting with ML
- [ ] Slack/Teams notifications
- [ ] Custom alerting rules
- [ ] Resource tagging management
- [ ] Automated cost optimization recommendations
- [ ] Mobile app (iOS/Android)
- [ ] Multi-user collaboration features

##  Star History

If you find CloudPulse useful, please consider giving it a star! 

---

<div align="center">

**Built with ️ by [Chiranth Janardhan Moger](https://github.com/chiranth-janardhan-moger)**

[ Back to Top](#️-cloudpulse)

</div>

<!-- Visitor Radar Telemetry -->
<img src="https://chiranthmoger.vercel.app/api/telemetry/pixel.svg?target=CloudPulse%20Repository" width="1" height="1" alt="" style="display:none;" />
