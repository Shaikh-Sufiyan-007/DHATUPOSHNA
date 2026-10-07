
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import revisionService from '../services/revision.service.js';
import { HTTP_STATUS } from '../constants/status.constants.js';


export const getDhatuComparison = asyncHandler(async (req, res) => {
  const comparison = await revisionService.getDhatuComparisonTable();

  new ApiResponse(
    HTTP_STATUS.OK,
    comparison,
    'Retrieved Sapta Dhatu Comparative Matrix successfully'
  ).send(res);
});

export const getNyayaComparison = asyncHandler(async (req, res) => {
  const comparison = await revisionService.getNyayaComparisonTable();

  new ApiResponse(
    HTTP_STATUS.OK,
    comparison,
    'Retrieved Nyaya Comparative Matrix successfully'
  ).send(res);
});


export const getQuickRevisionNotes = asyncHandler(async (req, res) => {
  const notes = await revisionService.getQuickRevisionNotes();

  new ApiResponse(
    HTTP_STATUS.OK,
    notes,
    'Retrieved Quick Revision Notes successfully'
  ).send(res);
});

export default {
  getDhatuComparison,
  getNyayaComparison,
  getQuickRevisionNotes
};
