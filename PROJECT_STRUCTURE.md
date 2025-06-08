# Project Structure

This document describes the file organization of the Claude Code Development Starter Kit.

## Root Level Files

### Core Configuration
- **`CLAUDE.md`** - AI agent guidelines and project context
- **`README.md`** - Project overview and setup instructions
- **`PROMPT.md`** - Main development prompt (simplified version)

### Project Management
- **`PROGRESS.md`** - Development progress tracking template
- **`DEVELOPMENT_ROADMAP.md`** - Strategic roadmap template
- **`CONTRIBUTING.md`** - Contribution guidelines

### Setup and Customization
- **`CUSTOMIZATION_GUIDE.md`** - Step-by-step customization guide
- **`PROJECT_STRUCTURE.md`** - This file

## Directory Structure

```
/
├── README.md                              # Project overview
├── CLAUDE.md                              # AI agent guidelines
├── PROMPT.md                              # Main development prompt
├── PROGRESS.md                            # Progress tracking template
├── DEVELOPMENT_ROADMAP.md                 # Roadmap template
├── CONTRIBUTING.md                        # Contribution guidelines
├── CUSTOMIZATION_GUIDE.md                 # Customization guide
├── PROJECT_STRUCTURE.md                   # This file
│
├── .claude/                               # Claude Code configuration
│   └── settings.json.template             # Settings template
│
├── .github/                               # GitHub configuration
│   └── workflows/                         # GitHub Actions workflows
│       ├── ci.yml                         # Main CI pipeline
│       ├── test.yml                       # E2E test runner
│       └── deploy.yml.template            # Deployment template
│
├── prompts/                               # Development prompt templates
│   ├── README.md                          # Prompt selection guide
│   ├── README-ja.md                       # Japanese guide
│   ├── basic-development.md               # Basic development prompt
│   ├── basic-development-ja.md            # Basic prompt (Japanese)
│   ├── enterprise-development.md          # Enterprise prompt
│   ├── opensource-development.md          # Open source prompt
│   └── startup-development.md             # Startup prompt
│
├── docs/                                  # Documentation
│   ├── tech-stack.md                      # Technology stack definitions
│   ├── architecture.md                    # System architecture template
│   ├── implementation-plan.md             # Implementation plan template
│   ├── prd.md                            # Product requirements template
│   ├── requirements.md                    # Requirements documentation
│   ├── setup-guide.md                    # Setup instructions
│   │
│   ├── adr/                              # Architecture Decision Records
│   │   └── template.md                   # ADR template
│   │
│   └── phase-reports/                    # Phase completion reports
│       └── phase1-requirements.md.template
│
├── decisions/                             # Architecture Decision Records
│   ├── 0001-aws-serverless-architecture.md
│   └── 0002-nextjs-frontend-choice.md
│
├── infrastructure/                        # Infrastructure as Code
│   ├── README.md                          # Infrastructure overview
│   ├── deployment-env.yaml.template       # Environment configuration
│   ├── cdk.json                          # AWS CDK configuration
│   ├── package.json                      # Dependencies
│   ├── tsconfig.json                     # TypeScript configuration
│   │
│   ├── bin/                              # CDK application entry points
│   ├── lib/                              # CDK stack definitions
│   │   ├── infrastructure-stack.ts
│   │   ├── stacks/                       # Individual stacks
│   │   │   ├── api-stack.ts
│   │   │   ├── auth-stack.ts
│   │   │   ├── frontend-stack.ts
│   │   │   ├── monitoring-stack.ts
│   │   │   └── storage-stack.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   └── test/                             # Infrastructure tests
│       └── infrastructure.test.ts
│
└── packages/                             # Monorepo structure (optional)
    ├── frontend/                         # Frontend application
    ├── backend/                          # Backend services
    └── shared/                           # Shared utilities
```

## File Categories

### Templates
Files ending with `.template` are meant to be copied and customized:
- `.claude/settings.json.template`
- `infrastructure/deployment-env.yaml.template`
- `.github/workflows/deploy.yml.template`
- `docs/phase-reports/*.template`

### Language Variants
Some files have Japanese variants:
- `prompts/README.md` / `prompts/README-ja.md`
- `prompts/basic-development.md` / `prompts/basic-development-ja.md`

### Configuration Files
- **`.claude/settings.json`** - Claude Code configuration
- **`infrastructure/cdk.json`** - AWS CDK configuration
- **`infrastructure/package.json`** - Infrastructure dependencies
- **`.github/workflows/`** - CI/CD pipeline configuration

## Usage Patterns

### For New Projects
1. Copy template files and remove `.template` extension
2. Customize placeholders marked with `[brackets]`
3. Choose appropriate prompt from `prompts/` directory
4. Update file paths in chosen prompt
5. Set up infrastructure configuration

### For Existing Projects
1. Review existing project structure
2. Adopt relevant templates and guidelines
3. Integrate CI/CD workflows
4. Implement progress tracking
5. Add architecture documentation

## Maintenance

### Adding New Prompts
1. Create new prompt file in `prompts/`
2. Follow existing naming convention
3. Update `prompts/README.md` with selection criteria
4. Add Japanese version if needed

### Adding New Templates
1. Create template file with `.template` extension
2. Use `[placeholder]` format for customizable values
3. Document usage in relevant README
4. Update this structure documentation

### Version Control
- All `.template` files should be committed
- Actual configuration files (without `.template`) should be gitignored
- Document any environment-specific requirements

## Best Practices

### File Naming
- Use kebab-case for files: `file-name.md`
- Use UPPER_CASE for root-level important files: `README.md`
- Add `.template` suffix for template files
- Add language codes for translations: `-ja.md`

### Documentation
- Keep documentation close to relevant code
- Use relative links between documents
- Maintain consistent formatting across files
- Update this structure guide when adding new directories

### Organization Principles
- Group by function rather than file type
- Keep templates together with their usage context
- Separate configuration from documentation
- Maintain clear hierarchy and naming conventions