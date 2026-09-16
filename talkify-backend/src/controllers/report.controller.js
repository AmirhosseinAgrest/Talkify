// src/controllers/report.controller.js

import * as reportService from '../services/report.service.js';
import { formatResponse } from '../utils/helpers.js';

export const createReport = async (req, res, next) => {
  try {
    const { reportedId, reason, description } = req.body;

    if (!reportedId || !reason) {
      return res
        .status(400)
        .json(formatResponse(false, null, 'User and report reason are required'));
    }

    const report = await reportService.createReport(req.userId, reportedId, reason, description);

    res.status(201).json(formatResponse(true, report, 'Report submitted'));
  } catch (error) {
    next(error);
  }
};

export const getAllReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const reports = await reportService.getAllReports(status);
    res.json(formatResponse(true, reports));
  } catch (error) {
    next(error);
  }
};

export const reviewReport = async (req, res, next) => {
  try {
    const { resolution, action } = req.body;
    const report = await reportService.reviewReport(
      req.params.reportId,
      req.userId,
      resolution,
      action
    );
    res.json(formatResponse(true, report, 'Report reviewed'));
  } catch (error) {
    next(error);
  }
};

export const dismissReport = async (req, res, next) => {
  try {
    const report = await reportService.dismissReport(req.params.reportId, req.userId);
    res.json(formatResponse(true, report, 'Report dismissed'));
  } catch (error) {
    next(error);
  }
};
