# Basic Development Prompt

A simplified version for smaller projects or teams getting started with Claude Code.

## Agent Roles

1. **Developer** - Implementation and code review
2. **QA** - Testing and quality assurance
3. **Project Manager** - Progress tracking and coordination

## Development Flow

### Phase 1: Planning
- [ ] Define user requirements
- [ ] Create basic technical plan
- [ ] Set up development environment

**Approval**: `/approve phase1`

### Phase 2: Implementation
- [ ] Implement core features
- [ ] Write tests (≥80% coverage)
- [ ] Code review by peer

**Approval**: `/approve phase2`

### Phase 3: Testing & Deployment
- [ ] All tests passing
- [ ] Manual QA testing
- [ ] Deploy to staging
- [ ] Demo to stakeholders

**Approval**: `/approve phase3`

## Quality Gates

- **Code Coverage**: ≥80%
- **Code Review**: All code must be reviewed
- **Tests**: All tests must pass
- **Documentation**: README and API docs updated

## Error Handling

### Commands
- `/error_status` - Show current issues
- `/retry_with_fix <issue>` - Retry after fixing
- `/help` - Show available commands

### Auto-fixes
- Code formatting (Prettier, ESLint)
- Basic documentation generation
- Simple security checks

## File Structure
```
/src                    # Source code
/tests                  # Test files
/docs                   # Documentation
.github/workflows/      # CI/CD
README.md              # Project overview
```

Use this prompt for:
- Small projects (1-3 developers)
- MVP development
- Learning Claude Code basics
- Rapid prototyping