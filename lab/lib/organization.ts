/**
 * This file provides guidance on the organization of the scientific data system.
 * It's meant as documentation for developers working on the system.
 */

/**
 * Current Structure:
 *
 * /app - Next.js pages and routes
 * /components - React components (mixed UI and domain)
 * /services - Data services
 * /types - TypeScript type definitions
 * /hooks - React hooks
 * /lib - Utility functions
 *
 * Issues:
 * - Components mix UI and domain logic
 * - Services have inconsistent patterns
 * - Types are scattered across files
 * - No clear separation between data access and processing
 */

/**
 * Improved Structure (without major refactoring):
 *
 * /app - Next.js pages and routes (unchanged)
 * /components
 *   /ui - Pure UI components (buttons, cards, etc.)
 *   /domain - Domain-specific components
 *     /samples - Sample-related components
 *     /measurements - Measurement-related components
 *     /visualizations - Visualization components
 * /services
 *   /api - API clients and data fetching
 *   /processing - Data transformation and processing
 * /types - Consolidated type definitions
 * /hooks - React hooks (unchanged)
 * /lib - Utility functions (unchanged)
 *
 * Benefits:
 * - Clearer separation of concerns
 * - Easier to find related code
 * - More maintainable as the system grows
 * - Better alignment with scientific data needs
 */

export {} // This export is needed to make TypeScript treat this as a module

