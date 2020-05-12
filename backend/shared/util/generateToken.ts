import { randomBytes } from "crypto";

function generateToken (length:number = 100): Promise<string> {
  return new Promise(((resolve, reject) => {
    // we'll never use all the bytes, but might as well make sure
    randomBytes(length, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      const token = buffer.toString("base64");
      return resolve(token.substr(0, length));
    });
  }));
}
export default generateToken;
