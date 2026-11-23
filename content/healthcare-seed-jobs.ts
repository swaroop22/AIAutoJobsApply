import type { JobPosting } from '@/lib/app-db/types';

export const HEALTHCARE_SEED_JOBS: JobPosting[] = [
  {
    id: 'anthc-outpatient-coding-specialist-iii',
    provider: 'custom',
    boardSlug: 'anthc',
    externalId: 'anthc-10492',
    title: 'Outpatient Coding Specialist III - Hospital Rev Cycle - Remote',
    company: 'Alaska Native Tribal Health Consortium',
    location: 'Remote',
    remote: true,
    descriptionHtml: `<p>The <strong>Outpatient Coding Specialist III</strong> reviews clinical documentation, extracts relevant clinical diagnostic and procedure information, and assigns ICD-10-CM and CPT/HCPCS codes in accordance with official coding guidelines for outpatient hospital and clinical encounters across hospital revenue cycle operations.</p>
<p><strong>Key Requirements:</strong></p>
<ul>
  <li>Minimum 3+ years coding experience in acute care or hospital health systems.</li>
  <li>AHIMA or AAPC credential: CCS, CPC, or RHIA / RHIT required.</li>
  <li>Strong proficiency in ICD-10-CM, CPT, HCPCS, and APC hospital billing guidelines.</li>
  <li>100% Remote position with comprehensive health benefits.</li>
</ul>`,
    descriptionText: `The Outpatient Coding Specialist III reviews clinical documentation, extracts relevant clinical diagnostic and procedure information, and assigns ICD-10-CM and CPT/HCPCS codes in accordance with official coding guidelines for outpatient hospital and clinical encounters across hospital revenue cycle operations. Minimum 3+ years coding experience with CCS, CPC, or RHIA certification required. 100% Remote position.`,
    applyUrl: 'https://css-anthc-prd.inforcloudsuite.com:443/hcm/Jobs/navigation/JobBoard(1000,ANTHCEXTERNAL).JobSearchCompositeFormNav?csk.HROrganization=1000&csk.JobBoard=ANTHCEXTERNAL&web10x=true',
    postedAt: new Date(Date.now() - 17 * 3600 * 1000).toISOString(),
  },
  {
    id: 'svh-him-coder-hospital-coding-services-ft-day',
    provider: 'workday',
    boardSlug: 'stormontvail',
    externalId: 'svh-90142',
    title: 'HIM Coder - Hospital Coding Services - FT - Day',
    company: 'Stormont Vail Health',
    location: 'Topeka, KS',
    remote: false,
    descriptionHtml: `<p>The <strong>HIM Coder</strong> reviews medical records and assigns ICD-10-CM and CPT/HCPCS diagnosis and procedure codes for hospital outpatient and inpatient encounters in Topeka, KS. Maintains code assignment quality and 95%+ accuracy standard.</p>
<ul>
  <li>Requires CCS, CPC, RHIT, or RHIA certification.</li>
  <li>Full-Time Day Shift (Hospital Coding Services).</li>
  <li>Comprehensive healthcare and retirement benefits.</li>
</ul>`,
    descriptionText: `Reviews medical records and assigns ICD-10-CM and CPT/HCPCS diagnosis and procedure codes for hospital encounters in Topeka, KS. Requires Certified Coding Specialist (CCS), CPC, or RHIT/RHIA. Full-Time Day Shift in Topeka, KS.`,
    applyUrl: 'https://stormontvail.wd1.myworkdayjobs.com/careers',
    postedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
  {
    id: 'camplejeune-inpatient-medical-coder',
    provider: 'custom',
    boardSlug: 'camp-lejeune-health',
    externalId: 'cl-4482',
    title: 'Inpatient Medical Coder (Hybrid / Remote)',
    company: 'Camp Lejeune Naval Medical Center',
    location: 'Camp Lejeune, NC',
    remote: false,
    descriptionHtml: `<p>Assigns diagnostic and procedural codes (ICD-10-CM/PCS) for acute care inpatient hospital stays and surgical procedures. Ensures compliance with coding guidelines and MHS coding policies. Requires CCS or RHIA with 2+ years hospital inpatient coding experience.</p>`,
    descriptionText: `Assigns diagnostic and procedural codes (ICD-10-CM/PCS) for acute care inpatient hospital stays and surgical procedures. Ensures compliance with coding guidelines and MHS coding policies. Requires CCS or RHIA with 2+ years hospital inpatient coding experience.`,
    applyUrl: 'https://camplejeune.tricare.mil/',
    postedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'augusta-coder-medical-coding-specialist',
    provider: 'custom',
    boardSlug: 'augusta-health',
    externalId: 'augusta-9281',
    title: 'Coder / Medical Coding Specialist - Hospital Health Information Management',
    company: 'Augusta Health',
    location: 'Fishersville, VA',
    remote: false,
    descriptionHtml: `<p>Reviews inpatient and outpatient medical records, abstracts diagnostic and procedural data, and assigns accurate ICD-10-CM/PCS and CPT codes. Requires AHIMA or AAPC credential (CPC, CCS, RHIT, RHIA). Full-time day shift at Fishersville hospital campus.</p>`,
    descriptionText: `Reviews inpatient and outpatient medical records, abstracts diagnostic and procedural data, and assigns accurate ICD-10-CM/PCS and CPT codes. Requires AHIMA or AAPC credential (CPC, CCS, RHIT, RHIA). Full-time day shift at Fishersville hospital campus.`,
    applyUrl: 'https://www.augustahealth.com/careers/',
    postedAt: new Date(Date.now() - 17 * 3600 * 1000).toISOString(),
  },
  {
    id: 'bsw-inpatient-coding-specialist-remote',
    provider: 'custom',
    boardSlug: 'bswhealth',
    externalId: 'bsw-8812',
    title: 'Inpatient Coding Specialist - Hospital Health Information Management - Remote',
    company: 'Baylor Scott & White Health',
    location: 'Remote',
    remote: true,
    descriptionHtml: `<p>Reviews acute care inpatient medical records, analyzes clinical documentation, and assigns accurate ICD-10-CM and ICD-10-PCS diagnosis and procedure codes. Ensures optimal DRG assignment and hospital compliance.</p>
<ul>
  <li>AHIMA Certified Coding Specialist (CCS) or RHIA/RHIT required.</li>
  <li>Minimum 2+ years hospital inpatient acute care coding experience.</li>
  <li>100% Remote, competitive pay, comprehensive healthcare benefits.</li>
</ul>`,
    descriptionText: `Reviews acute care inpatient medical records, analyzes clinical documentation, and assigns accurate ICD-10-CM and ICD-10-PCS diagnosis and procedure codes. Ensures optimal DRG assignment and hospital compliance. AHIMA Certified Coding Specialist (CCS) or RHIA/RHIT required. Minimum 2+ years hospital inpatient acute care coding experience. 100% Remote.`,
    applyUrl: 'https://jobs.bswhealth.com/',
    postedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
  },
  {
    id: 'cleveland-clinic-him-coder-remote',
    provider: 'custom',
    boardSlug: 'clevelandclinic',
    externalId: 'cc-7741',
    title: 'HIM Coder II - Hospital Inpatient & Surgical Coding - Remote',
    company: 'Cleveland Clinic',
    location: 'Remote',
    remote: true,
    descriptionHtml: `<p>Assigns ICD-10-CM/PCS and CPT codes for complex hospital admissions, outpatient surgeries, and specialized clinical encounters. Collaborates with Clinical Documentation Improvement (CDI) specialists and medical staff.</p>
<ul>
  <li>Credentials accepted: CCS, CPC, CIC, RHIT, RHIA.</li>
  <li>In-depth knowledge of APR-DRG and MS-DRG methodologies.</li>
  <li>Remote within the United States. Equipment provided.</li>
</ul>`,
    descriptionText: `Assigns ICD-10-CM/PCS and CPT codes for complex hospital admissions, outpatient surgeries, and specialized clinical encounters. Collaborates with Clinical Documentation Improvement (CDI) specialists and medical staff. Credentials accepted: CCS, CPC, CIC, RHIT, RHIA. Remote within the United States. Equipment provided.`,
    applyUrl: 'https://jobs.clevelandclinic.org/',
    postedAt: new Date(Date.now() - 19 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mayo-clinic-coding-specialist-him',
    provider: 'custom',
    boardSlug: 'mayoclinic',
    externalId: 'mayo-5421',
    title: 'Medical Coding Specialist - Health Information Management',
    company: 'Mayo Clinic',
    location: 'Remote',
    remote: true,
    descriptionHtml: `<p>Responsible for accurate coding of hospital diagnoses and procedures utilizing ICD-10-CM and CPT-4 coding classification systems. Reviews electronic medical records in Epic.</p>
<ul>
  <li>Certified Coding Specialist (CCS) or Certified Professional Coder (CPC) required.</li>
  <li>Excellent communication skills and understanding of medical terminology.</li>
  <li>Remote opportunity with Mayo Clinic health benefits.</li>
</ul>`,
    descriptionText: `Responsible for accurate coding of hospital diagnoses and procedures utilizing ICD-10-CM and CPT-4 coding classification systems. Reviews electronic medical records in Epic. Certified Coding Specialist (CCS) or Certified Professional Coder (CPC) required. Remote opportunity with Mayo Clinic health benefits.`,
    applyUrl: 'https://jobs.mayoclinic.org/',
    postedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];
