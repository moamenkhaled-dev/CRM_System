import bcrypt from "bcrypt";
import { SALT_ROUND } from "../../../../config/config.service.js";

//hash
export const hash = async ({ plaintext, round = SALT_ROUND }) => {
  const salt = await bcrypt.genSalt(round);
  const hashedText = await bcrypt.hash(plaintext, salt);

  return hashedText;
};

//compare
export const compare = async ({ plaintext, hashedText }) => {
  const compareResult = await bcrypt.compare(plaintext, hashedText);

  return compareResult;
};
