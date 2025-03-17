import { Response } from 'express';

class SuccessResponse {
  message: string;
  data: any;
  status: number;
  constructor({ message, status, data }: { message: string; status: number; data: any }) {
    this.message = message;
    this.data = data;
    this.status = status;
  }
  send(res: Response) {
    return res.status(200).json({
      success: true,
      message: this.message,
      data: this.data
    });
  }
}

class OKResponse extends SuccessResponse {
  constructor({ message, data }: { message: string; data: any }) {
    super({ message, data, status: 200 });
  }
}

class CreatedResponse extends SuccessResponse {
  constructor({ message, data }: { message: string; data: any }) {
    super({ message, data, status: 201 });
  }
}

export { CreatedResponse, OKResponse, SuccessResponse };
