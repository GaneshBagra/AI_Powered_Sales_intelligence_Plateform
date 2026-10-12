export class ApiResponse {
    success: boolean;
    message: string;
    data?: any;
    statusCode: number;
    constructor(success: boolean, message: string, data?: any, statusCode: number = 200) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
    }

}