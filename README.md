# Claude Code Development Starter Kit

A comprehensive starter kit for autonomous development with Claude Code, featuring multi-agent collaboration patterns and best practices for AI-driven software development.

## Overview

This starter kit provides a foundation for projects developed with Claude Code (claude.ai/code), including:
- Pre-configured development guidelines for AI agents
- Progress tracking templates
- Architecture documentation templates
- AWS CDK infrastructure scaffolding
- Best practices for test-driven development

## Quick Start

### Prerequisites

- Node.js 18+
- AWS CLI v2 (optional, for cloud deployments)
- Git

### Setup

#### Option 1: Interactive Setup Assistant (Recommended)

```bash
# Clone the repository
git clone https://github.com/daktu32/claude-code-dev-starter-kit.git
cd claude-code-dev-starter-kit

# Run the interactive setup assistant
npm run setup
```

The setup assistant will guide you through:
- Project configuration (name, description, repository)
- Development prompt selection based on your team and requirements
- Technology stack choices
- Automatic placeholder replacement and file customization

#### Option 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/daktu32/claude-code-dev-starter-kit.git
cd claude-code-dev-starter-kit

# Follow the customization guide
# See CUSTOMIZATION_GUIDE.md for detailed instructions
```

### Project Structure

```
project-root/
├── CLAUDE.md              # AI agent guidelines and project context
├── PROGRESS.md            # Development progress tracking
├── DEVELOPMENT_ROADMAP.md # Project roadmap and milestones
├── infrastructure/        # Infrastructure as Code (AWS CDK)
│   ├── lib/
│   │   └── stacks/       # Cloud infrastructure stacks
│   └── test/             # Infrastructure tests
├── packages/             # Monorepo packages
│   ├── frontend/         # Frontend application
│   ├── backend/          # Backend services
│   └── shared/           # Shared utilities
├── docs/                 # Project documentation
│   ├── ARCHITECTURE.md   # System architecture
│   ├── prd.md           # Product requirements
│   └── setup-guide.md   # Detailed setup instructions
└── decisions/           # Architecture Decision Records (ADRs)
```

## Key Files for AI Development

### CLAUDE.md
The central configuration file that guides Claude Code's behavior when working on your project. Customize this with:
- Project overview and goals
- Technology stack specifications
- Development workflow rules
- Coding standards
- Security guidelines

### Development Prompts (`prompts/`)
Choose from specialized prompts based on your project type:
- **Basic Development** - Small projects, MVPs, learning
- **Enterprise Development** - Large teams, compliance requirements
- **Open Source Development** - Community-driven projects
- **Startup Development** - Fast iteration, market validation

See [prompts/README.md](prompts/README.md) for detailed selection guide.

### PROGRESS.md
A living document that tracks:
- Completed tasks
- Current work in progress
- Upcoming tasks
- Blockers and issues
- Team updates

### DEVELOPMENT_ROADMAP.md
Strategic planning document containing:
- Phase-based development plan
- Milestones and deliverables
- Technical architecture decisions
- Risk assessments
- Success metrics

## Development Workflow

### 1. Task Planning
- Define requirements in `docs/`
- Update `DEVELOPMENT_ROADMAP.md` with new phases
- Create entries in `PROGRESS.md`

### 2. Test-Driven Development
```bash
# Write tests first
npm test -- --watch

# Implement features
npm run dev

# Verify all tests pass
npm test
```

### 3. Quality Checks
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

### 4. Progress Updates
- Update `PROGRESS.md` after each task
- Mark milestones in `DEVELOPMENT_ROADMAP.md`
- Commit with descriptive messages

## Infrastructure

This starter kit includes infrastructure templates for common architectures. See [docs/tech-stack.md](docs/tech-stack.md) for detailed technology choices and [infrastructure/](infrastructure/) for implementation.

### Deployment

```bash
cd infrastructure

# Deploy to development
npm run deploy:dev

# Deploy to production
npm run deploy:prod
```

## Customization Guide

### 1. Update Project Information
- Edit `CLAUDE.md` with your project details
- Customize `package.json` with your project name
- Update this README with project-specific information

### 2. Configure Technology Stack
- Modify infrastructure stacks in `infrastructure/lib/stacks/`
- Update dependencies in `package.json` files
- Configure build tools and linters

### 3. Set Development Rules
- Customize workflow in `CLAUDE.md`
- Add project-specific ADRs to `decisions/`
- Configure CI/CD pipelines

## Best Practices

### For AI Agents
1. Always update `PROGRESS.md` after completing tasks
2. Follow TDD principles - write tests first
3. Use git worktrees for feature development
4. Never commit secrets or credentials
5. Keep documentation in sync with code

### For Human Developers
1. Review AI-generated code thoroughly
2. Validate architectural decisions
3. Monitor costs and performance
4. Maintain security best practices
5. Provide clear context in `CLAUDE.md`

## Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code
npm run type-check   # TypeScript validation

# Infrastructure
npm run cdk:diff     # Preview infrastructure changes
npm run cdk:deploy   # Deploy infrastructure
npm run cdk:destroy  # Tear down infrastructure

# Utilities
npm run clean        # Clean build artifacts
npm run init         # Initialize new project
```

## CI/CD Workflows

This starter kit includes GitHub Actions workflows:

### Available Workflows

- **`.github/workflows/ci.yml`** - Comprehensive CI pipeline including:
  - Linting and code style checks
  - Type checking
  - Unit and integration tests
  - Build verification
  - E2E tests
  - Security scanning

- **`.github/workflows/test.yml`** - E2E test runner (can be used standalone)

- **`.github/workflows/deploy.yml.template`** - Deployment template (rename to `.yml` and customize)

### Customizing Workflows

1. Update the scripts in `package.json` to match your project:
   ```json
   "scripts": {
     "lint": "your-linter",
     "type-check": "your-type-checker",
     "test": "your-test-runner",
     "build": "your-build-command"
   }
   ```

2. Configure environment secrets in GitHub repository settings

3. Adjust Node.js versions in the matrix if needed

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this starter kit.

## Resources

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Architecture Decision Records](https://adr.github.io/)

## License

This starter kit is provided as-is for use with Claude Code development projects. Customize the license as needed for your specific project.