
import referenceService from '../services/reference.service.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/status.constants.js';


export const getReferences = asyncHandler(async (req, res) => {
  const { type, sourceType, samhita, status, search, page, limit, sort } = req.query;

  const result = await referenceService.getReferences(
    { type, sourceType, samhita, status, search },
    { page, limit, sort }
  );

  new ApiResponse(
    HTTP_STATUS.OK,
    result.references,
    'References retrieved successfully',
    result.meta,
    result.pagination
  ).send(res);
});


export const getReferenceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reference = await referenceService.getReferenceById(id);

  new ApiResponse(HTTP_STATUS.OK, reference, 'Reference citation retrieved successfully').send(res);
});


export const createReference = asyncHandler(async (req, res) => {
  const createdReference = await referenceService.createReference(req.body);

  new ApiResponse(
    HTTP_STATUS.CREATED,
    createdReference,
    'Reference citation created successfully'
  ).send(res);
});

export const updateReference = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedReference = await referenceService.updateReference(id, req.body);

  new ApiResponse(
    HTTP_STATUS.OK,
    updatedReference,
    'Reference citation updated successfully'
  ).send(res);
});


export const deleteReference = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await referenceService.deleteReference(id);

  new ApiResponse(
    HTTP_STATUS.OK,
    result,
    `Reference citation '${result.title}' deleted successfully`
  ).send(res);
});

export default {
  getReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference
};
