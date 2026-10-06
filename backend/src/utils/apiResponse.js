

export class ApiResponse {

  constructor(statusCode = 200, data = null, message = 'Success', meta = null, pagination = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (pagination) {
      this.pagination = pagination;
    } else if (meta && meta.currentPage !== undefined && meta.totalPages !== undefined) {
      this.pagination = meta;
    } else if (meta && meta.pagination) {
      this.pagination = meta.pagination;
    }

    if (meta) {
      this.meta = meta;
    }
  }


  send(res) {
    const payload = {
      success: this.success,
      message: this.message,
      data: this.data
    };

    if (this.pagination) {
      payload.pagination = this.pagination;
    }

    if (this.meta) {
      payload.meta = this.meta;
    }

    return res.status(this.statusCode).json(payload);
  }
}

export default ApiResponse;
