import parsePhoneNumberFromString from "libphonenumber-js/max";
import { BadRequestException } from "../utils/response/index.js";

export const phoneValidator = async ({ countryCode, phone }) => {
  if (phone && typeof phone !== "string") {
    return BadRequestException({
      code: "BAD_DATA",
      message: "phone must be string",
    });
  }
  const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
  if (phoneNumber.country !== countryCode) {
    return BadRequestException({
      code: "BAD_DATA",
      message: "invalid country code",
    });
  }
  if (!phoneNumber || !phoneNumber.isValid()) {
    return BadRequestException({
      code: "BAD_DATA",
      message: "invalid phone number",
    });
  }
  const type = phoneNumber.getType();
  if (type !== "MOBILE" && type !== "FIXED_LINE_OR_MOBILE") {
    return BadRequestException({
      code: "BAD_DATA",
      message: "invalid phone type",
      details: "please enter a mobile number",
    });
  }

  return phoneNumber.number;
};
