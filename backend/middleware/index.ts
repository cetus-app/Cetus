import ErrorHandlerMiddleware from "./ErrorHandler";
import ServicesMiddleware from "./Services";
import AuthMiddleware from "./auth";


export default [AuthMiddleware, ErrorHandlerMiddleware, ServicesMiddleware];

export { AuthMiddleware, ErrorHandlerMiddleware, ServicesMiddleware };
