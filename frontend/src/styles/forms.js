// Shared layout styles for form panels. Kept out of component files for fast refresh.

export const panelStyle = {
  padding: 'var(--space-6)',
  marginBottom: 'var(--space-6)',
};

export const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 'var(--space-4)',
};

export const sectionTitleStyle = {
  fontSize: 'var(--font-size-section)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-secondary)',
  marginBottom: 'var(--space-4)',
};
