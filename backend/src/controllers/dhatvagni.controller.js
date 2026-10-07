
import dhatvagniService from '../services/dhatvagni.service.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/status.constants.js';

export const getDhatvagniList = asyncHandler(async (req, res) => {
  const { dhatuId, status, search } = req.query;

  const results = await dhatvagniService.getAllDhatvagni({
    dhatuId,
    status,
    search
  });

  new ApiResponse(
    HTTP_STATUS.OK,
    results,
    'Dhatvagni records retrieved successfully',
    { count: results.length }
  ).send(res);
});


export const getDhatvagniById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dhatvagni = await dhatvagniService.getDhatvagniById(id);

  new ApiResponse(
    HTTP_STATUS.OK,
    dhatvagni,
    `${dhatvagni.name} information retrieved successfully`
  ).send(res);
});

export const createDhatvagni = asyncHandler(async (req, res) => {
  const created = await dhatvagniService.createDhatvagni(req.body);

  new ApiResponse(
    HTTP_STATUS.CREATED,
    created,
    `${created.name} registered successfully`
  ).send(res);
});


export const updateDhatvagni = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await dhatvagniService.updateDhatvagni(id, req.body);

  new ApiResponse(
    HTTP_STATUS.OK,
    updated,
    `${updated.name} updated successfully`
  ).send(res);
});


export const deleteDhatvagni = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await dhatvagniService.deleteDhatvagni(id);

  new ApiResponse(
    HTTP_STATUS.OK,
    result,
    `Dhatvagni '${result.name}' deleted successfully`
  ).send(res);
});

export default {
  getDhatvagniList,
  getDhatvagniById,
  createDhatvagni,
  updateDhatvagni,
  deleteDhatvagni
};
