
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import nyayaService from '../services/nyaya.service.js';
import { HTTP_STATUS } from '../constants/status.constants.js';


export const getNyayas = asyncHandler(async (req, res) => {
  const nyayas = await nyayaService.getAllNyayas();

  new ApiResponse(
    HTTP_STATUS.OK,
    nyayas,
    'Retrieved the Three Classical Nyayas of Dhatuposhana successfully',
    { count: nyayas.length }
  ).send(res);
});

export const getNyayaById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const nyaya = await nyayaService.getNyayaById(id);

  new ApiResponse(
    HTTP_STATUS.OK,
    nyaya,
    `Retrieved '${nyaya.name}' successfully`
  ).send(res);
});

export default {
  getNyayas,
  getNyayaById
};
