import React from 'react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ATSRunnerApplicant } from './types';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: 'Helvetica', color: '#111827' },
  name: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 3, textTransform: 'uppercase' },
  contact: { fontSize: 9, color: '#4B5563', marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 2,
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  roleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  roleTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  roleCompany: { fontSize: 9.5, color: '#374151' },
  date: { fontSize: 9, color: '#6B7280' },
  bullet: { fontSize: 9, marginBottom: 2.5, paddingLeft: 8, lineHeight: 1.3 },
  skillsText: { fontSize: 9, lineHeight: 1.4 },
});

export async function generateResumePdfBuffer(applicant: ATSRunnerApplicant, tailoredSummary?: string, tailoredSkills?: string[]): Promise<Buffer> {
  const summaryText = tailoredSummary || applicant.summary || '';
  const skillsList = tailoredSkills && tailoredSkills.length ? tailoredSkills : applicant.skills || [];

  const docElement = React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Header
      React.createElement(Text, { style: styles.name }, applicant.fullName),
      React.createElement(
        Text,
        { style: styles.contact },
        [applicant.email, applicant.phone, 'United States'].filter(Boolean).join('  ·  '),
      ),
      // Summary
      summaryText
        ? React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.sectionTitle }, 'Professional Summary'),
            React.createElement(Text, { style: { fontSize: 9.5, lineHeight: 1.35 } }, summaryText),
          )
        : null,
      // Skills
      skillsList.length > 0
        ? React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.sectionTitle }, 'Core Technical & Clinical Skills'),
            React.createElement(Text, { style: styles.skillsText }, skillsList.join('  •  ')),
          )
        : null,
      // Experience
      applicant.experience && applicant.experience.length > 0
        ? React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.sectionTitle }, 'Professional Experience'),
            ...applicant.experience.map((exp: any, idx: number) =>
              React.createElement(
                View,
                { key: idx, style: { marginBottom: 8 } },
                React.createElement(
                  View,
                  { style: styles.roleHeader },
                  React.createElement(Text, { style: styles.roleTitle }, exp.title),
                  React.createElement(
                    Text,
                    { style: styles.date },
                    [exp.startDate, exp.endDate || 'Present'].filter(Boolean).join(' – '),
                  ),
                ),
                React.createElement(Text, { style: styles.roleCompany }, exp.company),
                ...(exp.bullets || []).map((b: string, bIdx: number) =>
                  React.createElement(Text, { key: bIdx, style: styles.bullet }, `•  ${b}`),
                ),
              ),
            ),
          )
        : null,
      // Education
      applicant.education && applicant.education.length > 0
        ? React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.sectionTitle }, 'Education & Credentials'),
            ...applicant.education.map((ed: any, idx: number) =>
              React.createElement(
                Text,
                { key: idx, style: { fontSize: 9.5, marginBottom: 3 } },
                `${ed.school}${ed.degree ? ` — ${ed.degree}` : ''}`,
              ),
            ),
          )
        : null,
    ),
  );

  const instance = pdf(docElement as any);
  const blob = await instance.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
