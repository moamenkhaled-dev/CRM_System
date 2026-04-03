import { RoleEnum } from "../../common/enums/user.enums.js";

export const DealEndPoints = {
  createDeal: [RoleEnum.Admin, RoleEnum.Sales_Rep],
  updateDeal: [RoleEnum.Admin, RoleEnum.Sales_Rep],
  deleteDeal: [RoleEnum.Admin],
};
