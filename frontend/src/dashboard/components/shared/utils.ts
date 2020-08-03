import * as Yup from "yup";

export function typedKeys<T> (o: T): (keyof T)[] {
  return Object.keys(o) as (keyof T)[];
}
// This is used where-ever a valid password is required, e.g Login, register
// Update password, delete account. Surprisingly a lot of places.
export const PasswordValidation = Yup.string()
  .min(6, "A password must be at least 6 characters long.")
  .max(100, "Must be 100 characters or less")
  .required("This field is required.");
export function getCookie (cname: string) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export default typedKeys;
