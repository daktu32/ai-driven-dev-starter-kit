# Setup Assistant

Interactive CLI tool to customize the Claude Code Development Starter Kit for your specific project.

## NEW: スケルトン生成コマンド

任意のパスに新しいプロジェクトのスケルトンを生成できます。

```bash
# scripts ディレクトリでビルド済みであることを確認
npm run build

# スケルトン生成コマンドを実行
npx ./skeleton-generator.js

# またはグローバルインストール後
npx skeleton
```

- 対話形式で生成先パスやプロジェクト名、含めるファイルを選択できます
- .cursorrules も自動生成されます

## Features

- 🎯 **Smart Prompt Selection** - Automatically recommends the best development prompt based on team size, industry, and compliance needs
- 🔧 **Automated Template Processing** - Replaces all placeholders with your project-specific information
- 💾 **Safe File Operations** - Creates backups before making any changes
- 🎨 **Interactive CLI** - User-friendly interface with progress indicators
- 🔍 **Dry Run Mode** - Preview changes before applying them
- ✅ **Comprehensive Validation** - Validates project structure and configuration

## Quick Start

```bash
# Navigate to the scripts directory
cd scripts

# Install dependencies
npm install

# Run the setup assistant
npm run setup

# Or run in dry-run mode to preview changes
npm run setup:dry-run
```

## Usage

### Interactive Setup (Recommended)

```bash
npm run setup
```

This will guide you through:
1. Project information (name, description, repository URL)
2. Team and development approach questions
3. Technology stack selection
4. Configuration summary and confirmation
5. Automated file processing

### Command Line Options

```bash
# Dry run mode - preview changes without modifying files
npm run setup:dry-run

# Skip prompt selection (use with --prompt)
npm run setup -- --skip-prompt --prompt=basic-development

# Verbose output
npm run setup -- --verbose

# Available prompts
npm run setup -- --prompt=basic-development
npm run setup -- --prompt=enterprise-development
npm run setup -- --prompt=opensource-development
npm run setup -- --prompt=startup-development
```

## What It Does

### 1. Project Validation
- Checks for required files and directories
- Validates project structure

### 2. Information Collection
- **Project Info**: Name, description, repository URL
- **Team Details**: Size, industry, compliance requirements
- **Tech Stack**: Frontend, backend, database, infrastructure choices

### 3. Prompt Selection
Based on your answers, recommends one of four development approaches:

- **Basic Development** - Small teams (1-3 developers), simple workflow
- **Enterprise Development** - Large teams, high compliance, complex governance
- **Open Source Development** - Community-driven projects, contributor management
- **Startup Development** - Fast iteration, MVP focus, rapid deployment

### 4. Template Processing
- Finds all files with `[placeholder]` patterns
- Replaces placeholders with your project-specific values
- Processes files in:
  - Root configuration files (`CLAUDE.md`, `README.md`)
  - Documentation (`docs/**/*.md`)
  - Infrastructure templates (`.claude/**/*.template`)
  - GitHub workflows (`.github/**/*.template`)

### 5. File Management
- Creates timestamped backups of all modified files
- Copies selected prompt to `PROMPT.md`
- Removes unused infrastructure files based on tech stack
- Generates `.claude/project-config.json` for future reference

## Configuration Output

The setup assistant creates a project configuration file at `.claude/project-config.json`:

```json
{
  "projectName": "My Awesome Project",
  "description": "A revolutionary new application",
  "repositoryUrl": "https://github.com/username/my-awesome-project",
  "prompt": "basic-development",
  "techStack": {
    "frontend": "Next.js",
    "backend": "AWS Lambda",
    "database": "DynamoDB",
    "infrastructure": "AWS CDK",
    "deployment": "GitHub Actions",
    "monitoring": "CloudWatch"
  },
  "team": {
    "size": 3,
    "type": "small",
    "industry": "technology",
    "complianceLevel": "medium"
  },
  "customizations": {}
}
```

## Placeholder System

The assistant automatically replaces these placeholders throughout your project:

### Project Placeholders
- `[Your project name]` → Project name
- `[Your Project Name]` → Title case project name
- `[project-name]` → Kebab case project name
- `[PROJECT_NAME]` → Upper case project name
- `[Brief description of your project]` → Project description
- `[your-repo-url]` → Repository URL
- `[your-username]` → GitHub username
- `[your-project]` → Repository name

### Tech Stack Placeholders
- `[Frontend Framework]` → Selected frontend
- `[Backend Framework]` → Selected backend
- `[Database]` → Selected database
- `[Infrastructure]` → Selected infrastructure
- `[Deployment Platform]` → Selected deployment method
- `[Monitoring Solution]` → Selected monitoring

### Date Placeholders
- `[YYYY-MM-DD]` → Current date (ISO format)
- `[Current Date]` → Current date (localized)
- `[Current Year]` → Current year

## Backup and Recovery

### Backup Creation
Every run creates a timestamped backup directory:
```
.backups/setup-2024-01-15T10-30-45-000Z/
├── CLAUDE.md
├── README.md
├── docs/
└── ...
```

### Restore from Backup
```bash
# Manual restore - copy files from backup directory
cp -r .backups/setup-TIMESTAMP/* .

# Or use the FileManager API programmatically
```

## Development

### Project Structure
```
scripts/
├── setup-assistant.ts          # Main CLI application
├── lib/
│   ├── types.ts               # TypeScript interfaces
│   ├── promptSelector.ts      # Prompt selection logic
│   ├── templateProcessor.ts   # Template processing
│   ├── fileManager.ts         # File operations
│   └── validator.ts           # Input validation
├── package.json               # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

### Building and Testing

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Run tests (when implemented)
npm test
```

### Adding New Placeholders

1. Add placeholder to template files using `[placeholder-name]` format
2. Update `createTemplateMapping()` in `templateProcessor.ts`
3. Add validation if needed in `validator.ts`
4. Update this documentation

### Adding New Tech Stack Options

1. Update choices in `collectTechStackInfo()` in `setup-assistant.ts`
2. Add any specific cleanup logic in `fileManager.ts`
3. Update infrastructure templates as needed

## Troubleshooting

### Common Issues

**"Missing required file" errors**
- Ensure you're running from the correct directory
- Check that all starter kit files are present

**"Project structure validation failed"**
- Make sure you have all required directories and files
- Run from the project root directory

**Permission errors**
- Check file permissions
- Run with appropriate user permissions
- Ensure backup directory is writable

### Debug Mode

Run with verbose output to see detailed processing information:
```bash
npm run setup -- --verbose
```

### Reset to Original State

If you need to start over:
1. Restore from the most recent backup in `.backups/`
2. Delete `.claude/project-config.json`
3. Run the setup assistant again

## Integration with Claude Code

This setup assistant is designed to work seamlessly with Claude Code:

- **Structured Output**: All operations provide clear feedback that Claude can parse
- **Error Handling**: Comprehensive error messages for troubleshooting
- **Configuration Storage**: Project config is saved for future Claude sessions
- **Extensible**: Easy to add new features and customizations

## Contributing

To contribute improvements to the setup assistant:

1. Fork the repository
2. Create a feature branch
3. Add your improvements with tests
4. Submit a pull request

Key areas for improvement:
- Additional tech stack options
- More sophisticated placeholder replacement
- Integration with other development tools
- Enhanced validation and error recovery