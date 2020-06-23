import { fetch } from "../index";
import { IntegrationMeta } from "../types";
/*
  Meta is:
  0: "Pretty" name
  1: ShortDesc
  2: Icon
  3: LongDesc
  4: "Type" string. Only present in some cases, primarily client side.
 */
export const getMetas = async (): Promise<IntegrationMeta> => {
  const response = await fetch(`${process.env.BACKEND_URL}/integrations/global/meta`);
  return response.json();
};
export default getMetas;
