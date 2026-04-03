import { RoleEnum } from "../../common/enums/user.enums.js";

export const ActivityEdPoints = {
  createActivity: [RoleEnum.Admin, RoleEnum.Sales_Rep],
  updateActivity: [RoleEnum.Admin, RoleEnum.Sales_Rep],
  deleteActivity: [RoleEnum.Admin],
};
