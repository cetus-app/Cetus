// Takes an object and returns it with camelCased keys
export default function camelify (obj: any) {
  if (!obj) throw new Error("No object supplied to camelify");
  const keys = Object.keys(obj);
  const out: any = {};

  for (const key of keys) {
    // lowercase first char
    const newKey = key.charAt(0).toLowerCase() + key.slice(1);

    // Deal with the various value types so we lowercase nested objects too
    if (Array.isArray(obj[key])) {
      const outArr = [];
      for (const item of obj[key]) {
        outArr.push(camelify(item));
      }
      out[newKey] = outArr;
      // For some reason typeof null is "object" => https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      // Try camelify it
      out[newKey] = camelify(obj[key]);
    } else {
      out[newKey] = obj[key];
    }
  }
  return out;
}
