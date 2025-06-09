# Enterprise Development Prompt

Comprehensive multi-agent development for enterprise projects with strict compliance requirements.

## Agent Roles and Responsibilities

1. **Product Owner** - Business requirements, acceptance criteria (Final authority: Product decisions)
2. **Solution Architect** - Technical architecture, ADR documentation (Final authority: Technical decisions)
3. **Tech Lead** - Implementation oversight, code review standards
4. **Senior Developer** - Feature implementation, mentoring
5. **QA Engineer** - Test strategy, quality gates (Target: ≥95% coverage for critical components)
6. **Security Engineer** - Security review, vulnerability assessment
7. **DevOps Engineer** - Infrastructure, deployment automation
8. **Scrum Master** - Process facilitation, impediment removal
9. **Project Manager** - Timeline, risk management, stakeholder communication

## 5-Phase Development Lifecycle

### BOOTSTRAP (Automated)
```yaml
file_validation:
  required_files:
    - "./docs/prd.md"
    - "./docs/ARCHITECTURE.md"
    - "./docs/tech-stack.md"
    - "./.github/workflows/ci.yml"
    - "./infrastructure/deployment-env.yaml"
    - "./DEVELOPMENT_ROADMAP.md"
    - "./CONTRIBUTING.md"
    - "./.claude/settings.json"
    - "./CLAUDE.md"
    
validation_rules:
  security_requirements:
    - threat_model_documented: true
    - security_architecture_reviewed: true
    - compliance_framework_defined: true
  
  quality_standards:
    - coding_standards_established: true
    - test_strategy_documented: true
    - performance_benchmarks_defined: true
```

### Phase 1: Enterprise Requirements Analysis

#### Definition of Done
```yaml
enterprise_requirements:
  business_analysis:
    - stakeholder_mapping: "All key stakeholders identified and engaged"
    - business_case_validated: "ROI and business value clearly defined"
    - regulatory_compliance: "All applicable regulations identified (GDPR, SOX, HIPAA, etc.)"
    - risk_assessment: "Business and technical risks assessed and mitigation planned"
    
  detailed_requirements:
    - user_stories_with_personas: "Detailed user personas with journey mapping"
    - acceptance_criteria_comprehensive: "SMART criteria with measurable outcomes"
    - non_functional_requirements: "Performance, scalability, security, compliance requirements"
    - integration_requirements: "External system integration points documented"
    
  traceability_matrix:
    - requirement_to_test_mapping: "Each requirement mapped to test cases"
    - compliance_requirement_mapping: "Regulatory requirements traced to implementation"
    - business_rule_documentation: "All business rules clearly documented"

human_approval_gate:
  approvers: ["Product Owner", "Solution Architect", "Compliance Officer"]
  approval_command: "/approve phase1"
  compliance_checklist:
    - "✅ All regulatory requirements identified and documented"
    - "✅ Security and privacy requirements clearly defined"
    - "✅ Business stakeholder sign-off obtained"
    - "✅ Technical feasibility confirmed by architecture team"
```

### Phase 2: Enterprise Architecture & Security Design

#### Definition of Done
```yaml
enterprise_architecture:
  solution_architecture:
    - c4_model_diagrams: "Context, Container, Component, and Code level diagrams"
    - integration_architecture: "API design, message flows, data synchronization"
    - security_architecture: "Authentication, authorization, data protection, network security"
    - deployment_architecture: "Multi-environment deployment strategy (dev/test/stage/prod)"
    
  compliance_design:
    - data_classification: "Data sensitivity levels and handling requirements"
    - audit_trail_design: "Comprehensive logging and audit requirements"
    - access_control_design: "RBAC/ABAC implementation with principle of least privilege"
    - business_continuity: "Disaster recovery and business continuity planning"
    
  adr_documentation:
    - technology_selections: "Detailed rationale for all technology choices"
    - security_decisions: "Security architecture decisions with threat modeling"
    - performance_decisions: "Scalability and performance architecture decisions"
    - compliance_decisions: "Regulatory compliance implementation approach"

security_review_gate:
  security_approvals:
    - threat_model_approved: "STRIDE/PASTA threat modeling completed"
    - security_architecture_approved: "Security team architectural review passed"
    - penetration_test_plan: "Security testing strategy defined"
    - privacy_impact_assessment: "PIA completed for data privacy compliance"

human_approval_gate:
  approvers: ["Solution Architect", "Security Engineer", "Enterprise Architecture Board"]
  approval_command: "/approve phase2"
  architectural_checklist:
    - "✅ Solution aligns with enterprise architecture standards"
    - "✅ Security architecture meets corporate security policies"
    - "✅ All major technical decisions documented in ADRs"
    - "✅ Scalability and performance requirements addressed"
    - "✅ Compliance and regulatory requirements incorporated"
```

### Phase 3: Secure Implementation & Code Review

#### Definition of Done
```yaml
enterprise_implementation:
  code_quality_standards:
    security_critical_components:
      line_coverage: "≥98%"          # Authentication, authorization, payment processing
      branch_coverage: "≥95%"
      mutation_testing_score: "≥90%"
      required_reviewers: "≥4"        # Including security engineer
      security_review_mandatory: true
      
    business_critical_components:
      line_coverage: "≥95%"          # Core business logic, data processing
      branch_coverage: "≥90%"
      mutation_testing_score: "≥85%"
      required_reviewers: "≥3"        # Including senior developer
      
    standard_components:
      line_coverage: "≥85%"          # UI components, utilities
      branch_coverage: "≥80%"
      required_reviewers: "≥2"
      
  security_implementation:
    secure_coding_practices:
      - input_validation: "All inputs validated and sanitized"
      - output_encoding: "All outputs properly encoded"
      - authentication_implementation: "Multi-factor authentication where required"
      - session_management: "Secure session handling implemented"
      - error_handling: "No sensitive information in error messages"
      
    security_testing:
      - static_analysis_security_testing: "SAST tools integrated in CI/CD"
      - dynamic_analysis_security_testing: "DAST scanning for web vulnerabilities"
      - software_composition_analysis: "SCA for dependency vulnerabilities"
      - secrets_scanning: "No hardcoded secrets or credentials"
      
  compliance_implementation:
    audit_logging:
      - user_actions_logged: "All user actions comprehensively logged"
      - system_events_logged: "System events and errors logged"
      - log_integrity: "Log tampering protection implemented"
      - log_retention: "Compliance-required log retention implemented"
      
    data_protection:
      - encryption_at_rest: "Sensitive data encrypted in storage"
      - encryption_in_transit: "All communications encrypted"
      - data_anonymization: "PII anonymization/pseudonymization where required"
      - right_to_deletion: "GDPR deletion capabilities implemented"

human_approval_gate:
  approvers: ["Tech Lead", "Security Engineer", "Compliance Officer"]
  approval_command: "/approve phase3"
  implementation_checklist:
    - "✅ All code reviewed per enterprise standards"
    - "✅ Security testing passed with no critical vulnerabilities"
    - "✅ Compliance requirements implemented and verified"
    - "✅ Performance benchmarks met"
    - "✅ Code quality metrics meet enterprise standards"
```

### Phase 4: Enterprise Testing & Quality Assurance

#### Definition of Done
```yaml
enterprise_testing:
  comprehensive_testing:
    functional_testing:
      - unit_testing: "100% unit test execution with 0 flaky tests"
      - integration_testing: "All API and service integrations tested"
      - system_testing: "End-to-end system functionality verified"
      - user_acceptance_testing: "Business stakeholder UAT completed"
      
    non_functional_testing:
      - performance_testing: "Load, stress, and volume testing completed"
      - security_testing: "Penetration testing and vulnerability assessment"
      - usability_testing: "User experience validation completed"
      - accessibility_testing: "WCAG 2.1 AA compliance verified"
      - compatibility_testing: "Cross-browser and cross-platform testing"
      
    compliance_testing:
      - regulatory_compliance_testing: "All regulatory requirements verified"
      - audit_testing: "Audit trail functionality verified"
      - data_protection_testing: "Privacy and data protection controls tested"
      - business_continuity_testing: "Disaster recovery procedures tested"
      
  defect_management:
    enterprise_defect_thresholds:
      - critical_defects: "0 (Zero tolerance)"
      - high_severity_defects: "≤1 (With approved mitigation plan)"
      - medium_severity_defects: "≤5 (With documented acceptance)"
      - security_vulnerabilities: "0 critical, ≤1 high (with mitigation)"
      
  quality_gates:
    - test_automation_coverage: "≥90% of test cases automated"
    - test_data_management: "Test data properly managed and anonymized"
    - test_environment_parity: "Test environments match production configuration"

human_approval_gate:
  approvers: ["QA Lead", "Security Engineer", "Business Stakeholder"]
  approval_command: "/approve phase4"
  testing_checklist:
    - "✅ All test cases executed with documented results"
    - "✅ Security testing passed with acceptable risk level"
    - "✅ Performance requirements met under expected load"
    - "✅ Compliance testing verified regulatory adherence"
    - "✅ User acceptance testing completed by business users"
```

### Phase 5: Enterprise Deployment & Go-Live

#### Definition of Done
```yaml
enterprise_deployment:
  production_readiness:
    infrastructure_preparation:
      - production_environment_hardened: "Security hardening completed per standards"
      - monitoring_and_alerting: "Comprehensive monitoring and alerting configured"
      - backup_and_recovery: "Automated backup and tested recovery procedures"
      - capacity_planning: "Resource capacity planned for expected load"
      
    deployment_automation:
      - blue_green_deployment: "Zero-downtime deployment strategy implemented"
      - rollback_procedures: "Automated rollback capabilities tested"
      - configuration_management: "Infrastructure as Code fully implemented"
      - secret_management: "Production secrets properly managed"
      
  go_live_readiness:
    operational_readiness:
      - runbook_documentation: "Comprehensive operational runbooks created"
      - support_procedures: "24/7 support procedures documented and tested"
      - incident_response_plan: "Security and operational incident response procedures"
      - business_continuity_plan: "Disaster recovery and business continuity validated"
      
    stakeholder_approval:
      - business_sign_off: "Business stakeholders approve go-live"
      - security_clearance: "Security team provides production clearance"
      - compliance_approval: "Compliance team approves regulatory adherence"
      - operations_readiness: "Operations team confirms support readiness"

human_approval_gate:
  approvers: ["Project Manager", "Product Owner", "Security Engineer", "Operations Manager"]
  approval_command: "/approve phase5"
  go_live_checklist:
    - "✅ Production environment secured and monitored"
    - "✅ Deployment automation tested and verified"
    - "✅ All stakeholders approve production release"
    - "✅ Support and operational procedures in place"
    - "✅ Compliance and security clearances obtained"
```

## Enterprise Error Management

### Escalation Matrix
```yaml
severity_levels:
  CRITICAL:
    response_time: "15 minutes"
    escalation_path: "Project Manager → Program Manager → CTO"
    notification: ["All team members", "Management", "Stakeholders"]
    
  HIGH:
    response_time: "1 hour"
    escalation_path: "Tech Lead → Project Manager → Program Manager"
    notification: ["Development team", "Project stakeholders"]
    
  MEDIUM:
    response_time: "4 hours"
    escalation_path: "Developer → Tech Lead → Project Manager"
    notification: ["Development team"]
```

### Compliance Requirements
```yaml
audit_requirements:
  change_management:
    - all_changes_tracked: "Every change logged with justification"
    - approval_workflows: "Changes require appropriate approvals"
    - rollback_capability: "All changes must be reversible"
    
  documentation_requirements:
    - decision_documentation: "All decisions documented with rationale"
    - process_documentation: "All processes documented and maintained"
    - compliance_artifacts: "All compliance artifacts maintained"
```

## Repository Structure
```
/src
  /api                           # API services
  /web                           # Web application
  /shared                        # Shared components
/infrastructure
  /environments                  # Environment-specific configs
  /security                      # Security configurations
  /monitoring                    # Monitoring and alerting
/docs
  /architecture                  # Architectural documentation
  /compliance                    # Compliance documentation
  /security                      # Security documentation
  /operations                    # Operational runbooks
/tests
  /unit                         # Unit tests
  /integration                  # Integration tests
  /security                     # Security tests
  /performance                  # Performance tests
/.governance
  /policies                     # Development policies
  /standards                    # Coding standards
  /compliance                   # Compliance checklists
```

Use this prompt for:
- Enterprise applications with strict compliance requirements
- Financial services, healthcare, government projects
- Large teams (10+ developers)
- Projects requiring extensive audit trails
- Multi-environment deployments with complex approval workflows