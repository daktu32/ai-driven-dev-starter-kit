# Claude Code Development Prompts

Choose the appropriate prompt template based on your project type and team size.

## Available Prompts

### 1. Basic Development (`basic-development.md`)
**Best for:**
- Small projects (1-3 developers)
- MVP development
- Learning Claude Code
- Rapid prototyping
- Personal or side projects

**Features:**
- 3 simple phases
- Basic quality gates (80% test coverage)
- Minimal bureaucracy
- Essential error handling

### 2. Enterprise Development (`enterprise-development.md`)
**Best for:**
- Large enterprises (10+ developers)
- Financial services, healthcare, government
- Strict compliance requirements
- Multi-environment deployments
- Complex approval workflows

**Features:**
- 5 comprehensive phases
- Strict quality gates (95%+ coverage for critical components)
- Extensive compliance and security requirements
- Multiple approval levels
- Comprehensive audit trails

### 3. Open Source Development (`opensource-development.md`)
**Best for:**
- Open source libraries and frameworks
- Community-driven projects
- Projects seeking widespread adoption
- Educational or research projects
- Distributed contributor teams

**Features:**
- Community-focused workflow
- RFC process for major changes
- Public design discussions
- Automated community management
- Contribution guidelines and CoC

### 4. Startup Development (`startup-development.md`)
**Best for:**
- Early-stage startups (2-5 developers)
- MVP to market validation
- Aggressive timelines
- Resource-constrained environments
- Rapid iteration and pivoting

**Features:**
- Lean development process
- Market validation focus
- Pragmatic quality standards
- Growth metrics tracking
- Rapid deployment and iteration

## How to Choose

### By Team Size
- **1-3 developers**: Basic Development
- **4-10 developers**: Startup Development or Open Source Development
- **10+ developers**: Enterprise Development

### By Industry
- **Regulated industries** (finance, healthcare): Enterprise Development
- **Tech startups**: Startup Development
- **Open source projects**: Open Source Development
- **General software development**: Basic Development

### By Compliance Requirements
- **High compliance** (SOX, HIPAA, GDPR): Enterprise Development
- **Medium compliance**: Basic Development with additional security
- **Low compliance**: Startup Development or Basic Development

### By Budget Constraints
- **High budget**: Enterprise Development
- **Medium budget**: Basic Development
- **Low budget/bootstrapped**: Startup Development

## Getting Started

1. **Choose your prompt** based on the criteria above
2. **Copy the prompt content** to your project
3. **Customize file paths** in the `<file_paths>` section
4. **Set up required files** (PRD, architecture docs, etc.)
5. **Configure `.claude/settings.json`** from the template
6. **Start development** with `/bootstrap` command

## Customization

Each prompt can be customized by:

### Adjusting Quality Gates
```yaml
# Example: Lowering test coverage for faster development
test_coverage_requirements:
  standard_features:
    line_coverage: "≥60%"  # Reduced from 80%
```

### Modifying Approval Process
```yaml
# Example: Removing approval gates for faster iteration
human_approval_gate:
  approver: "None"  # Skip manual approval
  auto_approve: true
```

### Adding Custom Phases
```yaml
# Example: Adding a performance testing phase
phase4_5_performance:
  performance_requirements:
    - load_testing: "Handle 1000 concurrent users"
    - response_time: "API responses < 200ms"
```

## Mixing Prompts

You can combine elements from different prompts:

### Example: Startup + Open Source
- Use Startup Development base
- Add Open Source community features
- Include RFC process for major changes

### Example: Basic + Enterprise Security
- Use Basic Development workflow
- Add Enterprise security requirements
- Include compliance checkpoints

## File Path Configuration

Update the `<file_paths>` section in your chosen prompt:

```yaml
<file_paths>
product_requirements = "./docs/prd.md"
architecture          = "./docs/ARCHITECTURE.md"
tech_stack            = "./docs/tech-stack.md"
ci_pipeline           = "./.github/workflows/ci.yml"
deployment_env        = "./infrastructure/deployment-env.yaml"
development_roadmap   = "./DEVELOPMENT_ROADMAP.md"
contributing_guide    = "./CONTRIBUTING.md"
claude_settings       = "./.claude/settings.json"
claude_guidelines     = "./CLAUDE.md"
</file_paths>
```

## Integration with Claude Code

1. **Place your chosen prompt** in the root of your project
2. **Reference it in your Claude Code session** when starting development
3. **Use the defined commands** (`/approve`, `/error_status`, etc.)
4. **Follow the phase progression** as defined in your prompt

## Support and Contributions

- Report issues with prompts in the project repository
- Contribute improvements via pull requests
- Share your customizations with the community
- Request new prompt templates for specific use cases