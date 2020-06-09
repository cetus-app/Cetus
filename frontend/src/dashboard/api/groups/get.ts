import { fetch } from "..";
import { PartialGroup, UnlinkedGroup } from "../types";

export const getGroups = async (): Promise<PartialGroup[]> => {
  const response = await fetch(`${process.env.BACKEND_URL}/groups`);
  return response.json();
};

export const getUnlinkedGroups = async (): Promise<UnlinkedGroup[]> => {
  const response = await fetch(`${process.env.BACKEND_URL}/groups/unlinked`);
  return response.json();
};

