import ServicesMiddleware from "./Services";
import AuthMiddleware from "./auth";


export default [AuthMiddleware, ServicesMiddleware];

export { AuthMiddleware, ServicesMiddleware };
