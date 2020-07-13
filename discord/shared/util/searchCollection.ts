import { Collection } from "eris";

const searchCollection = <T extends { id: string | number }, K extends keyof T>(
  collection: Collection<T>,
  key: K,
  compare: T[K]
): T | undefined => collection.find(item => {
    const property = item[key];

    // `compare` is be string if `property` is (see type definition above) but TypeScript obviously does not pick up on that
    if (typeof property === "string" && typeof compare === "string") {
      return property.toLowerCase() === compare.toLowerCase();
    }

    return property === compare;
  });

export default searchCollection;
