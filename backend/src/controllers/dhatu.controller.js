
import dhatuService from '../services/dhatu.service.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/status.constants.js';


export const getDhatus = asyncHandler(async (req, res) => {
  const { name, status } = req.query;
  const dhatus = await dhatuService.getAllDhatus({ name, status });

  new ApiResponse(
    HTTP_STATUS.OK,
    dhatus,
    'Sapta Dhatus retrieved successfully in classical sequence',
    { count: dhatus.length }
  ).send(res);
});

export const getDhatuById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dhatu = await dhatuService.getDhatuById(id);

  new ApiResponse(HTTP_STATUS.OK, dhatu, `${dhatu.name} Dhatu retrieved successfully`).send(res);
});

export const createDhatu = asyncHandler(async (req, res) => {
  const createdDhatu = await dhatuService.createDhatu(req.body);

  new ApiResponse(
    HTTP_STATUS.CREATED,
    createdDhatu,
    `${createdDhatu.name} Dhatu created successfully`
  ).send(res);
});


export const updateDhatu = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedDhatu = await dhatuService.updateDhatu(id, req.body);

  new ApiResponse(
    HTTP_STATUS.OK,
    updatedDhatu,
    `${updatedDhatu.name} Dhatu updated successfully`
  ).send(res);
});


export const deleteDhatu = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await dhatuService.deleteDhatu(id);

  new ApiResponse(
    HTTP_STATUS.OK,
    result,
    `Dhatu '${result.name}' deleted successfully`
  ).send(res);
});

export default {
  getDhatus,
  getDhatuById,
  createDhatu,
  updateDhatu,
  deleteDhatu
};
