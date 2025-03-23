# Migration Plan for File Structure Reorganization

## Components Reorganization

### UI Components
- Move all shadcn/ui components to `/components/ui/`

### Layout Components
- Create `/components/layout/`
- Move `app/layout.tsx` to `/components/layout/root-layout.tsx`
- Move `app/clientLayout.tsx` to `/components/layout/client-layout.tsx`

### Domain-Specific Components
- Create `/components/measurements/`
  - Move `measurement-list.tsx`, `measurement-detail.tsx`, `measurement-form.tsx`, etc.
- Create `/components/samples/`
  - Move `sample-list.tsx`, `sample-detail.tsx`, `sample-form.tsx`, etc.
- Create `/components/visualizations/`
  - Move `visualization-list.tsx`, `visualization-detail.tsx`, `visualization-modal.tsx`, etc.
  - Move visualization chart components from `/components/visualizations/` to `/components/visualizations/charts/`
- Create `/components/instruments/`
  - Move `instrument-list.tsx`, `instrument-detail.tsx`, etc.
- Create `/components/dashboard/`
  - Move `dashboard.tsx`, `stats-cards.tsx`, `recent-samples.tsx`, `activity-log.tsx`, etc.
- Create `/components/common/`
  - Move `search-bar.tsx`, `error-boundary.tsx`, etc.

## Services Reorganization

- Create `/services/api/`
  - Add `client.ts` for API client configuration
- Create `/services/measurements/`
  - Move `measurement-service.ts`
- Create `/services/samples/`
  - Create `sample-service.ts`
- Create `/services/visualizations/`
  - Move `visualization-service.ts`
- Create `/services/instruments/`
  - Move `instrument-service.ts`
- Create `/services/mock/`
  - Move `mock-data-service.ts`

## Types Reorganization

- Create `/types/measurements.ts`
  - Move measurement types from `types/measurement-types.ts`
- Create `/types/samples.ts`
  - Move sample types from `types/measurement-types.ts`
- Create `/types/visualizations.ts`
  - Move visualization types from `services/visualization-service.ts`
- Create `/types/instruments.ts`
  - Create instrument types
- Create `/types/common.ts`
  - Add shared types used across domains

## Hooks Reorganization

- Create `/hooks/use-measurements.ts`
  - Move measurement hooks from `hooks/use-measurement-form.ts`
- Create `/hooks/use-samples.ts`
  - Create sample hooks
- Create `/hooks/use-visualizations.ts`
  - Create visualization hooks

## Lib Reorganization

- Create `/lib/utils.ts`
  - Move utility functions
- Create `/lib/validators.ts`
  - Add validation functions
- Create `/lib/formatters.ts`
  - Add formatting functions for dates, numbers, etc.

## Public Assets Reorganization

- Create `/public/images/`
  - Move image files
- Create `/public/icons/`
  - Add icon files if needed

