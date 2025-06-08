# Open Source Development Prompt

Collaborative development prompt optimized for open source projects with community contributions.

## Community Roles

1. **Maintainer** - Project oversight, final decisions on architecture and direction
2. **Core Contributor** - Regular contributors with commit access
3. **Contributor** - Community members making contributions
4. **Reviewer** - Community members helping with code review
5. **Triager** - Issue and PR triage, community management

## Development Flow

### Phase 1: Community Planning
```yaml
community_requirements:
  project_definition:
    - problem_statement: "Clear problem statement and target audience"
    - solution_overview: "High-level solution approach"
    - success_metrics: "Measurable success criteria for the project"
    - roadmap_draft: "Initial roadmap with major milestones"
    
  community_setup:
    - contributing_guidelines: "Clear contribution guidelines (CONTRIBUTING.md)"
    - code_of_conduct: "Community code of conduct established"
    - issue_templates: "GitHub issue templates for bugs and features"
    - pr_templates: "Pull request templates with checklists"
    
  technical_foundation:
    - tech_stack_rationale: "Technology choices with clear reasoning"
    - architecture_overview: "High-level architecture documentation"
    - development_setup: "Easy onboarding for new contributors"

human_approval_gate:
  approver: "Maintainer"
  approval_command: "/approve phase1"
  community_checklist:
    - "✅ Project goals and scope clearly defined"
    - "✅ Community guidelines established"
    - "✅ Technical foundation documented"
    - "✅ Contributor onboarding process ready"
```

### Phase 2: Architecture & Design
```yaml
open_architecture:
  design_principles:
    - modularity: "Modular design allowing independent contributions"
    - extensibility: "Plugin/extension architecture where appropriate"
    - documentation_first: "Architecture decisions documented before implementation"
    - backwards_compatibility: "Clear versioning and compatibility strategy"
    
  community_input:
    - rfc_process: "Request for Comments process for major changes"
    - design_discussions: "Public design discussions on GitHub Discussions"
    - prototype_validation: "Prototypes validated with community feedback"
    
  technical_decisions:
    - adr_public: "Architecture Decision Records publicly available"
    - api_design: "Public API design with stability guarantees"
    - security_considerations: "Security model documented and reviewed"

human_approval_gate:
  approver: "Maintainer + Core Contributors"
  approval_command: "/approve phase2"
  design_checklist:
    - "✅ Architecture supports community contributions"
    - "✅ Major design decisions have community input"
    - "✅ API design is stable and well-documented"
    - "✅ Security model is appropriate for open source"
```

### Phase 3: Community Implementation
```yaml
collaborative_implementation:
  contribution_standards:
    - code_style: "Automated code formatting and linting"
    - test_requirements: "≥80% test coverage for new code"
    - documentation_requirements: "All public APIs documented"
    - commit_message_format: "Conventional commit message format"
    
  review_process:
    - peer_review_required: "All changes require peer review"
    - maintainer_review: "Core changes require maintainer review"
    - automated_checks: "CI/CD pipeline validates all contributions"
    - community_feedback: "Community input encouraged on significant changes"
    
  quality_gates:
    - automated_testing: "Comprehensive test suite runs on all PRs"
    - security_scanning: "Automated security vulnerability scanning"
    - license_compliance: "License compatibility checking"
    - breaking_change_detection: "Breaking changes flagged and reviewed"

community_approval_process:
  small_changes:
    - reviewer_count: "≥1 community reviewer"
    - automated_merge: "Auto-merge after checks pass and approval"
    
  significant_changes:
    - reviewer_count: "≥2 reviewers (including 1 core contributor)"
    - discussion_period: "48-hour discussion period for community input"
    
  breaking_changes:
    - rfc_required: "RFC process required for breaking changes"
    - maintainer_approval: "Explicit maintainer approval required"
    - deprecation_period: "Appropriate deprecation timeline"

human_approval_gate:
  approver: "Core Contributors"
  approval_command: "/approve phase3"
  implementation_checklist:
    - "✅ Code quality meets project standards"
    - "✅ All features properly tested and documented"
    - "✅ Community review process followed"
    - "✅ No breaking changes without proper process"
```

### Phase 4: Community Testing
```yaml
community_testing:
  testing_strategy:
    - unit_testing: "Comprehensive unit test suite"
    - integration_testing: "Integration tests for major components"
    - end_to_end_testing: "E2E tests for critical user workflows"
    - performance_testing: "Performance regression testing"
    - compatibility_testing: "Testing across supported platforms/versions"
    
  community_validation:
    - alpha_testing: "Early adopters test development builds"
    - beta_testing: "Community beta testing program"
    - dogfooding: "Maintainers and core contributors use the software"
    - feedback_collection: "Structured feedback collection from community"
    
  quality_assurance:
    - bug_triage: "Community-driven bug triage process"
    - regression_testing: "Automated regression test suite"
    - documentation_testing: "Community validates documentation accuracy"
    - accessibility_testing: "Accessibility compliance where applicable"

human_approval_gate:
  approver: "Maintainer + Community"
  approval_command: "/approve phase4"
  testing_checklist:
    - "✅ All automated tests passing"
    - "✅ Community testing feedback incorporated"
    - "✅ No critical bugs or regressions"
    - "✅ Documentation accurate and complete"
```

### Phase 5: Release & Community Distribution
```yaml
community_release:
  release_preparation:
    - changelog_generation: "Comprehensive changelog with breaking changes highlighted"
    - migration_guides: "Migration guides for breaking changes"
    - release_notes: "User-friendly release notes"
    - security_advisories: "Security advisories for any security fixes"
    
  distribution:
    - package_managers: "Distribution via appropriate package managers"
    - release_artifacts: "Signed release artifacts"
    - documentation_updates: "Updated documentation for new version"
    - announcement_plan: "Community announcement strategy"
    
  post_release:
    - community_support: "Community support channels monitored"
    - issue_triage: "Rapid triage of post-release issues"
    - patch_release_plan: "Process for urgent patch releases"
    - feedback_collection: "Collection of community feedback on release"

human_approval_gate:
  approver: "Maintainer"
  approval_command: "/approve phase5"
  release_checklist:
    - "✅ Release artifacts properly tested and signed"
    - "✅ Documentation updated and accurate"
    - "✅ Community notification completed"
    - "✅ Support processes ready for post-release"
```

## Community Error Management

### Issue Triage Process
```yaml
issue_classification:
  bug_reports:
    - reproduction_steps: "Clear steps to reproduce the issue"
    - environment_info: "Environment and version information"
    - impact_assessment: "Assessment of bug impact and severity"
    
  feature_requests:
    - use_case_description: "Clear use case and motivation"
    - implementation_discussion: "Community discussion on implementation"
    - maintainer_review: "Maintainer review for roadmap alignment"
    
  security_issues:
    - private_disclosure: "Private security disclosure process"
    - coordinator_assignment: "Security coordinator assigned"
    - timeline_establishment: "Disclosure timeline established"
```

### Community Commands
- `/triage <issue>` - Triage new issues
- `/review <pr>` - Request community review
- `/rfc <proposal>` - Start RFC process
- `/release <version>` - Initiate release process
- `/security <issue>` - Handle security issue

## Repository Structure
```
/src                    # Source code
/tests                  # Test files
/docs                   # Documentation
  /adr                  # Architecture Decision Records
  /guides               # User and contributor guides
  /api                  # API documentation
/examples               # Usage examples
/scripts                # Build and utility scripts
/.github
  /ISSUE_TEMPLATE       # Issue templates
  /workflows            # GitHub Actions
  /PULL_REQUEST_TEMPLATE.md
CONTRIBUTING.md         # Contribution guidelines
CODE_OF_CONDUCT.md      # Community code of conduct
SECURITY.md             # Security policy
CHANGELOG.md            # Change log
```

## Community Automation

### Automated Workflows
```yaml
github_actions:
  pr_validation:
    - code_quality_checks: "Linting, formatting, type checking"
    - test_execution: "Full test suite execution"
    - security_scanning: "Dependency and code security scanning"
    - documentation_checks: "Documentation build and link checking"
    
  issue_management:
    - auto_labeling: "Automatic labeling based on content"
    - stale_issue_management: "Automatic stale issue handling"
    - duplicate_detection: "Duplicate issue detection"
    
  release_automation:
    - automated_changelog: "Automatic changelog generation"
    - package_publishing: "Automated package publishing"
    - documentation_deployment: "Automatic documentation updates"
```

Use this prompt for:
- Open source libraries and frameworks
- Community-driven projects
- Projects seeking widespread adoption
- Educational or research projects
- Projects with distributed contributor base