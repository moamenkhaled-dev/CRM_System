import { RoleEnum } from "../../common/enums/user.enums.js";

export const contactEndPoints = {
  createContact: [RoleEnum.Admin, RoleEnum.Sales_Rep],
  updateContact: [RoleEnum.Admin, RoleEnum.Sales_Rep],
  deleteContact: [RoleEnum.Admin],
};
