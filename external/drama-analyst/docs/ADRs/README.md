# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Drama Analyst project.

## What are ADRs?

Architecture Decision Records are documents that capture important architectural decisions made during the development of a project. They provide context, rationale, and consequences for each decision.

## ADR Format

Each ADR follows this structure:

1. **Title**: Clear, descriptive title
2. **Status**: Proposed, Accepted, Rejected, Superseded
3. **Context**: The situation and problem
4. **Decision**: The architectural decision made
5. **Consequences**: The positive and negative outcomes

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./ADR-001-agent-based-architecture.md) | Agent-Based Architecture | Accepted | 2024-01-15 |
| [ADR-002](./ADR-002-backend-proxy.md) | Backend Proxy for Security | Accepted | 2024-01-15 |
| [ADR-003](./ADR-003-typescript-strict.md) | TypeScript Strict Mode | Accepted | 2024-01-15 |
| [ADR-004](./ADR-004-monitoring-stack.md) | Monitoring and Observability Stack | Accepted | 2024-01-15 |
| [ADR-005](./ADR-005-pwa-implementation.md) | Progressive Web App (PWA) | Accepted | 2024-01-15 |
| [ADR-006](./ADR-006-docker-containerization.md) | Docker Containerization | Accepted | 2024-01-15 |
| [ADR-007](./ADR-007-ci-cd-pipeline.md) | CI/CD Pipeline Strategy | Accepted | 2024-01-15 |
| [ADR-008](./ADR-008-error-handling.md) | Error Handling Strategy | Accepted | 2024-01-15 |

## Creating New ADRs

When making architectural decisions:

1. Create a new ADR file: `ADR-XXX-descriptive-name.md`
2. Follow the standard ADR format
3. Update this README with the new ADR
4. Get team review and approval
5. Update status to "Accepted"

## ADR Lifecycle

- **Proposed**: Initial draft, under review
- **Accepted**: Decision approved and implemented
- **Rejected**: Decision not approved
- **Superseded**: Replaced by a newer ADR

## Best Practices

- Keep ADRs concise but complete
- Include concrete examples when possible
- Document both positive and negative consequences
- Review and update ADRs when context changes
- Link related ADRs together

