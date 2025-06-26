# Startup Development Prompt

Fast-paced, MVP-focused development for startups with rapid iteration and market validation.

## Lean Team Roles

1. **Founder/Product Owner** - Vision, product decisions, market validation
2. **Tech Lead** - Architecture decisions, technical leadership
3. **Full-Stack Developer** - End-to-end feature implementation
4. **QA/Tester** - Quality assurance, user testing coordination

## Rapid Development Flow

### Phase 1: MVP Definition & Market Validation
```yaml
mvp_requirements:
  problem_validation:
    - customer_interviews: "Customer problem interviews completed"
    - market_research: "Competitive analysis and market size assessment"
    - value_proposition: "Clear value proposition and target customer segment"
    - success_metrics: "Key metrics defined for MVP validation"
    
  feature_prioritization:
    - core_user_journey: "Primary user journey mapped end-to-end"
    - feature_scoring: "Features scored by impact vs effort"
    - mvp_scope: "Minimum feature set for market validation defined"
    - technical_feasibility: "Technical feasibility assessed for all features"
    
  go_to_market_strategy:
    - launch_timeline: "Aggressive but realistic launch timeline"
    - user_acquisition_plan: "Initial user acquisition strategy"
    - feedback_collection: "User feedback collection mechanisms planned"
    - iteration_strategy: "Post-launch iteration and pivot strategy"

human_approval_gate:
  approver: "Founder/Product Owner"
  approval_command: "/approve phase1"
  startup_checklist:
    - "✅ Customer problem clearly validated"
    - "✅ MVP scope aggressive but achievable"
    - "✅ Technical approach supports rapid iteration"
    - "✅ Go-to-market strategy ready"
```

### Phase 2: Rapid Architecture & Tech Stack
```yaml
lean_architecture:
  startup_architecture_principles:
    - speed_to_market: "Architecture optimized for development speed"
    - scalability_when_needed: "Scale when you have the problem, not before"
    - proven_technologies: "Battle-tested technologies over cutting-edge"
    - cloud_native: "Leverage managed services to reduce operational overhead"
    
  mvp_tech_stack:
    - full_stack_framework: "Single framework for rapid development (e.g., Next.js, Rails)"
    - managed_database: "Managed database service (e.g., PlanetScale, Supabase)"
    - auth_service: "Authentication as a service (e.g., Auth0, Firebase Auth)"
    - hosting_platform: "Simple deployment platform (e.g., Vercel, Railway)"
    
  technical_decisions:
    - build_vs_buy: "Aggressive buy vs build decisions to accelerate development"
    - third_party_services: "Leverage SaaS services for non-core functionality"
    - monitoring_basics: "Basic monitoring and error tracking (e.g., Sentry)"
    - payment_processing: "Third-party payment processing (e.g., Stripe)"

human_approval_gate:
  approver: "Tech Lead + Founder"
  approval_command: "/approve phase2"
  architecture_checklist:
    - "✅ Tech stack optimized for startup speed and constraints"
    - "✅ Architecture supports rapid feature development"
    - "✅ Third-party services reduce development overhead"
    - "✅ Deployment and monitoring basics in place"
```

### Phase 3: MVP Implementation & Launch Preparation
```yaml
rapid_implementation:
  development_standards:
    - pragmatic_quality: "Quality standards appropriate for MVP stage"
    - test_coverage: "≥70% coverage for core business logic"
    - code_review: "Lightweight code review process"
    - documentation: "Essential documentation only"
    
  feature_development:
    - feature_flags: "Feature flags for gradual rollout and quick rollback"
    - analytics_instrumentation: "User behavior analytics from day one"
    - feedback_mechanisms: "In-app feedback collection and user interviews"
    - performance_basics: "Basic performance optimization"
    
  launch_readiness:
    - error_handling: "Graceful error handling and user feedback"
    - basic_security: "Essential security measures (HTTPS, input validation)"
    - data_collection: "User data collection for product iteration"
    - admin_tools: "Basic admin tools for customer support"

startup_quality_gates:
  core_functionality:
    - user_registration_flow: "Complete user onboarding flow"
    - core_feature_complete: "Primary value proposition implemented"
    - payment_flow: "Payment processing (if applicable) fully functional"
    - user_feedback_loop: "Mechanisms for collecting user feedback"
    
  technical_readiness:
    - deployment_automation: "One-click deployment process"
    - basic_monitoring: "Error tracking and basic performance monitoring"
    - backup_strategy: "Basic data backup and recovery"
    - scaling_plan: "Plan for handling initial user growth"

human_approval_gate:
  approver: "Tech Lead + Founder"
  approval_command: "/approve phase3"
  implementation_checklist:
    - "✅ Core user journey fully functional"
    - "✅ Essential quality and security measures in place"
    - "✅ Analytics and feedback collection ready"
    - "✅ Technical foundation supports initial scaling"
```

### Phase 4: User Testing & Market Validation
```yaml
market_validation:
  user_testing:
    - alpha_user_testing: "Internal team and close contacts testing"
    - beta_user_recruitment: "Target user recruitment for beta testing"
    - usability_testing: "User experience validation and iteration"
    - feedback_synthesis: "User feedback analysis and prioritization"
    
  product_metrics:
    - user_activation: "User activation and onboarding funnel analysis"
    - engagement_metrics: "User engagement and retention tracking"
    - conversion_metrics: "Conversion funnel optimization"
    - customer_satisfaction: "Customer satisfaction and NPS tracking"
    
  iteration_readiness:
    - rapid_deployment: "Ability to deploy changes multiple times per day"
    - a_b_testing: "A/B testing capability for feature validation"
    - feature_toggling: "Feature flags for safe feature rollouts"
    - rollback_capability: "Quick rollback for problematic deployments"

human_approval_gate:
  approver: "Founder + Users"
  approval_command: "/approve phase4"
  validation_checklist:
    - "✅ User testing validates core value proposition"
    - "✅ Key metrics show positive user engagement"
    - "✅ Technical platform supports rapid iteration"
    - "✅ Customer feedback loop functioning effectively"
```

### Phase 5: Launch & Rapid Iteration
```yaml
startup_launch:
  go_to_market_execution:
    - soft_launch: "Limited user launch for final validation"
    - marketing_launch: "Full marketing and PR launch"
    - user_acquisition: "Execution of user acquisition strategy"
    - press_coverage: "Media coverage and thought leadership"
    
  post_launch_optimization:
    - conversion_optimization: "Optimize user onboarding and conversion"
    - performance_optimization: "Optimize for user experience and scale"
    - feature_iteration: "Rapid feature iteration based on user feedback"
    - customer_support: "Customer support processes and tools"
    
  growth_preparation:
    - scaling_monitoring: "Monitor for scaling bottlenecks"
    - team_expansion: "Plan for team growth based on traction"
    - technical_debt_management: "Strategic technical debt management"
    - fundraising_preparation: "Technical due diligence preparation"

human_approval_gate:
  approver: "Founder"
  approval_command: "/approve phase5"
  launch_checklist:
    - "✅ Successful launch with initial user traction"
    - "✅ User feedback driving product iteration"
    - "✅ Technical platform handling user growth"
    - "✅ Business metrics trending positively"
```

## Startup Error Management

### Rapid Response
```yaml
startup_error_handling:
  severity_levels:
    BLOCKING_USERS:
      response_time: "Immediate (< 30 minutes)"
      escalation: "All hands on deck"
      communication: "User communication and status page"
      
    IMPACTING_CONVERSION:
      response_time: "< 2 hours"
      escalation: "Tech Lead + Founder"
      analysis: "Impact on key metrics assessment"
      
    FEATURE_BROKEN:
      response_time: "< 1 day"
      escalation: "Developer + QA"
      prioritization: "Against new feature development"
```

### Startup Commands
- `/hotfix <issue>` - Emergency hotfix deployment
- `/rollback` - Emergency rollback to previous version
- `/metrics` - Show key startup metrics
- `/user_feedback` - Show recent user feedback
- `/deploy` - Deploy to production

## Lean Repository Structure
```
/src
  /pages              # Next.js pages or similar
  /components         # Reusable components
  /lib                # Utility functions
  /api                # API routes
/tests
  /e2e               # Essential end-to-end tests
  /unit              # Unit tests for core logic
/docs
  /api               # API documentation
  /deployment        # Deployment guides
/scripts             # Deployment and utility scripts
.env.example         # Environment variables template
README.md           # Quick start guide
```

## Startup Automation

### Essential CI/CD
```yaml
minimal_pipeline:
  on_pull_request:
    - lint_and_format: "Code style and basic quality checks"
    - unit_tests: "Core functionality tests"
    - build_check: "Verify application builds successfully"
    
  on_main_push:
    - deploy_staging: "Automatic staging deployment"
    - smoke_tests: "Basic functionality verification"
    - notify_team: "Deployment notification"
    
  on_release:
    - deploy_production: "Production deployment"
    - health_check: "Post-deployment health verification"
    - rollback_ready: "Automatic rollback on health check failure"
```

### Growth Metrics Dashboard
```yaml
startup_metrics:
  user_metrics:
    - daily_active_users: "DAU tracking"
    - user_retention: "7-day and 30-day retention"
    - user_acquisition_cost: "Customer acquisition cost"
    
  business_metrics:
    - conversion_rate: "Signup to paid conversion"
    - monthly_recurring_revenue: "MRR growth"
    - churn_rate: "Customer churn tracking"
    
  technical_metrics:
    - application_performance: "Response times and errors"
    - deployment_frequency: "Development velocity"
    - time_to_recovery: "Incident response time"
```

Use this prompt for:
- Early-stage startups building MVP
- Teams of 2-5 developers
- Projects with aggressive timelines
- Market validation and rapid iteration focus
- Resource-constrained environments