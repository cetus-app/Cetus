import AuthMiddleware from "./Auth";
import ErrorHandlerMiddleware from "./ErrorHandler";
import ServicesMiddleware from "./Services";


export default [AuthMiddleware, ErrorHandlerMiddleware, ServicesMiddleware];

export { AuthMiddleware, ErrorHandlerMiddleware, ServicesMiddleware };
