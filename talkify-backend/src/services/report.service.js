// src/services/report.service.js

import { v4 as uuidv4 } from 'uuid';
import * as db from './db.service.js';
import { formatError } from '../utils/helpers.js';

export const REPORT_REASONS = {
  SPAM: 'spam',
  HARASSMENT: 'harassment',
  INAPPROPRIATE: 'inappropriate',
  FAKE_ACCOUNT: 'fake_account',
  VIOLENCE: 'violence',
  OTHER: 'other',
};

export const createReport = async (reporterId, reportedId, reason, description) => {
  const reportedUser = await db.getUserById(reportedId);
  if (!reportedUser) {
    throw formatError('User not found', 404);
  }

  const reports = await db.getReports();
  const existingReport = reports.find(
    (r) => r.reporterId === reporterId && r.reportedId === reportedId && r.status === 'pending'
  );

  if (existingReport) {
    throw formatError('You have already reported this user', 400);
  }

  const reporter = await db.getUserById(reporterId);

  const newReport = {
    id: uuidv4(),
    reporterId,
    reporterUsername: reporter.username,
    reportedId,
    reportedUsername: reportedUser.username,
    reason,
    description: description || '',
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    resolution: null,
    createdAt: new Date().toISOString(),
  };

  await db.createReport(newReport);
  return newReport;
};

export const getAllReports = async (status = null) => {
  const reports = await db.getReports();

  if (status) {
    return reports.filter((r) => r.status === status);
  }

  return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const reviewReport = async (reportId, adminId, resolution, action) => {
  const report = await db.getReportById(reportId);
  if (!report) {
    throw formatError('Report not found', 404);
  }

  const updatedReport = await db.updateReport(reportId, {
    status: 'reviewed',
    reviewedBy: adminId,
    reviewedAt: new Date().toISOString(),
    resolution,
    action,
  });

  return updatedReport;
};

export const dismissReport = async (reportId, adminId) => {
  const report = await db.getReportById(reportId);
  if (!report) {
    throw formatError('Report not found', 404);
  }

  const updatedReport = await db.updateReport(reportId, {
    status: 'dismissed',
    reviewedBy: adminId,
    reviewedAt: new Date().toISOString(),
    resolution: 'The report was dismissed',
  });

  return updatedReport;
};
