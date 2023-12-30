import { Response } from "express";
import { StatusCodes } from "http-status-codes";

class PiplanApiResponse {
  private success: boolean;
  private code: StatusCodes;
  private message?: string;
  private data?: any;

  constructor(success: boolean, code: StatusCodes, message?: string, data?: any) {
    this.success = success;
    this.message = message;
    this.code = code;
    this.data = data;
  }

  static successMsg(res: Response, message: string) {
    res.status(StatusCodes.OK);
    let response = new PiplanApiResponse(true, StatusCodes.OK, message);
    return response.sendJson(res);
  }

  static successData(res: Response, data: any) {
    res.status(StatusCodes.OK);
    let response = new PiplanApiResponse(true, StatusCodes.OK, undefined, data);
    return response.sendJson(res);
  }

  static successDataAndMsg(res: Response, data: any, message: string) {
    res.status(StatusCodes.OK);
    let response = new PiplanApiResponse(true, StatusCodes.OK, message, data);
    return response.sendJson(res);
  }

  static error(
    res: Response,
    code: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR,
    message: string
  ) {
    res.status(code);
    const response = new PiplanApiResponse(false, code, message);
    return response.sendJson(res);
  }

  private sendJson(res: Response) {
    return res.json({
      code: this.code,
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

export default PiplanApiResponse;
