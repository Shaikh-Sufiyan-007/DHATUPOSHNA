
import dhatuposhanaService from '../services/dhatuposhana.service.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/status.constants.js';

export const getDhatuposhanaList = asyncHandler(async (req, res) => {
  const { dhatuId, theoryCategory, status, search } = req.query;

  const results = await dhatuposhanaService.getAllDhatuposhana({
    dhatuId,
    theoryCategory,
    status,
    search
  });

  new ApiResponse(
    HTTP_STATUS.OK,
    results,
    'Dhatuposhana concepts retrieved successfully',
    { count: results.length }
  ).send(res);
});

export const getDhatuposhanaById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await dhatuposhanaService.getDhatuposhanaById(id);

  new ApiResponse(
    HTTP_STATUS.OK,
    item,
    `${item.name} retrieved successfully`
  ).send(res);
});


export const createDhatuposhana = asyncHandler(async (req, res) => {
  const created = await dhatuposhanaService.createDhatuposhana(req.body);

  new ApiResponse(
    HTTP_STATUS.CREATED,
    created,
    `${created.name} registered successfully`
  ).send(res);
});


export const updateDhatuposhana = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await dhatuposhanaService.updateDhatuposhana(id, req.body);

  new ApiResponse(
    HTTP_STATUS.OK,
    updated,
    `${updated.name} updated successfully`
  ).send(res);
});


export const deleteDhatuposhana = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await dhatuposhanaService.deleteDhatuposhana(id);

  new ApiResponse(
    HTTP_STATUS.OK,
    result,
    `Dhatuposhana concept '${result.name}' deleted successfully`
  ).send(res);
});

export default {
  getDhatuposhanaList,
  getDhatuposhanaById,
  createDhatuposhana,
  updateDhatuposhana,
  deleteDhatuposhana
};
