export type ComparisonValue = string | boolean;

export type ComparisonRow = {
  feature: string;
  rolepilot: ComparisonValue;
  autofill: ComparisonValue;
  cloudAppliers: ComparisonValue;
};

export const comparisonColumns = [
  { key: 'rolepilot', label: 'RolePilot' },
  { key: 'autofill', label: 'Autofill extensions' },
  { key: 'cloudAppliers', label: 'Cloud appliers' },
] as const;

export const comparisonRows: ComparisonRow[] = [
  { feature: 'Finds jobs for you', rolepilot: true, autofill: false, cloudAppliers: true },
  { feature: 'Tailors resume per listing', rolepilot: true, autofill: false, cloudAppliers: 'Limited' },
  { feature: 'Submits applications for you', rolepilot: true, autofill: 'Form-fill only', cloudAppliers: true },
  { feature: 'Tracks replies & interview requests', rolepilot: true, autofill: false, cloudAppliers: 'Limited' },
  { feature: 'ATS coverage', rolepilot: '19+ platforms', autofill: 'Varies by site', cloudAppliers: '5–10 platforms' },
  { feature: 'Account required', rolepilot: 'None', autofill: 'Sometimes', cloudAppliers: 'Yes' },
  { feature: 'Price', rolepilot: 'Free', autofill: 'Free – $15/mo', cloudAppliers: '$30–$200/mo' },
];
