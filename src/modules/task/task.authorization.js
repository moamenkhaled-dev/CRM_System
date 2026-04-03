import { RoleEnum } from "../../common/enums/user.enums.js";

export const TaskEndPoints = {
  createTask: [RoleEnum.Admin, RoleEnum.Sales_Rep],
  deleteTask: [RoleEnum.Admin],
  updateTask: [RoleEnum.Admin, RoleEnum.Sales_Rep],
};
