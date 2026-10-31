// Billing rules come from the shared, dependency-free package in packages/billing.
// The relative path works both on the host (backend/src -> repo/packages) and in the
// container (/app/src -> /packages), because docker-compose mounts packages at /packages.
export * from '../../packages/billing/src/index.js';
