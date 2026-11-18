export type ComparisonValue = string | boolean;

export type ComparisonRow = {
  feature: string;
  offerlane: ComparisonValue;
  autofill: ComparisonValue;
  cloudAppliers: ComparisonValue;
};

export const comparisonColumns = [
  { key: 'offerlane', label: 'Offerlane' },
  { key: 'autofill', label: 'Autofill extensions' },
  { key: 'cloudAppliers', label: 'Cloud appliers' },
] as const;

export const comparisonRows: ComparisonRow[] = [
  { feature: 'Finds jobs for you', offerlane: true, autofill: false, cloudAppliers: true },
  { feature: 'Tailors resume per listing', offerlane: true, autofill: false, cloudAppliers: 'Limited' },
  { feature: 'Submits applications for you', offerlane: true, autofill: 'Form-fill only', cloudAppliers: true },
  { feature: 'Tracks replies & interview requests', offerlane: true, autofill: false, cloudAppliers: 'Limited' },
  { feature: 'ATS coverage', offerlane: '19+ platforms', autofill: 'Varies by site', cloudAppliers: '5–10 platforms' },
  { feature: 'Account required', offerlane: 'None', autofill: 'Sometimes', cloudAppliers: 'Yes' },
  { feature: 'Price', offerlane: 'Free', autofill: 'Free – $15/mo', cloudAppliers: '$30–$200/mo' },
];
