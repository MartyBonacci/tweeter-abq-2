# Quality Standards

## Project Info

- **Project**: Tweeter
- **Updated**: 2026-02-12
- **Quality Level**: Strict

## Quality Gates

### Thresholds
- **Minimum quality score**: 90/100
- **Minimum test coverage**: 90%
- **Enforce gates**: true

### Code Quality
- **Cyclomatic complexity threshold**: 10
- **Max file lines**: 300
- **Max function lines**: 50
- **Max function parameters**: 5
- **Loader/action max lines**: ~15 (extract to service if longer)

## Testing Requirements

### Required
- **Unit tests**: Required for all service functions (`app/services/*.server.ts`)
- **Integration tests**: Required for all API routes (`app/routes/api/v1/*.tsx`)
- **E2E tests**: Required for critical user flows (signup, signin, tweet, like, profile)

### Frameworks
- **Unit/Integration**: Vitest
- **E2E**: Playwright

### Coverage Targets
- Services layer: 90%+ (business logic)
- API routes: 90%+ (request/response handling)
- Page routes: 80%+ (thin orchestrators, less logic)
- Utilities: 90%+

## Performance Budgets

- **Enforce budgets**: true
- **Max bundle size**: 500 KB
- **Max initial load**: 1000 ms
- **Max chunk size**: 200 KB

## Accessibility

- WCAG 2.1 Level AA compliance
- Semantic HTML with proper ARIA attributes
- Forms work without JavaScript (progressive enhancement)

## Code Review

- **Require code review**: true
- **Minimum reviewers**: 1
- **Block merge on failure**: true

## Architecture Compliance

### API-First Validation
- Page routes must NOT import from `app/services/`
- Page routes must NOT import from `app/utils/db.server.ts`
- All data operations must go through `/api/v1/*` endpoints
- API routes must validate all inputs with Zod before calling services

### Type Safety
- No `any` types
- Zod schemas as single source of truth for types
- Route types imported from `+types` (run `npx react-router typegen` after route changes)

## Notes

- Quality level: Strict (90/90)
- Created by `/specswarm:init`
- Enforced by `/specswarm:ship` before merge
- Review and adjust these standards as the project matures
