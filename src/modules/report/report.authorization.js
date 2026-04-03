import { RoleEnum } from "../../common/enums/user.enums.js";

export const ReportEndPoints = {
  getWonDealsPerSalesRep: [RoleEnum.Admin, RoleEnum.Read_Only],
  countOfOverdueTasksByRep: [RoleEnum.Admin, RoleEnum.Read_Only],
};
