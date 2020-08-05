
import { fetch } from "../index";

export const getDocs = async (): Promise<any> => {
  const response = await fetch(`${process.env.BACKEND_URL}/swagger.json`);
  return response.json();
};
export default getDocs;
