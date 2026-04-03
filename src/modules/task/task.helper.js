import { TaskVersionKeyEnum } from "../../common/enums/task.enums.js";
import { get, incr, RedisKeys, set } from "../../common/services/index.js";

//get version
export const getVersion = async ({ userId, taskId, key }) => {
  let version;
  let versionKey;
  switch (key) {
    case TaskVersionKeyEnum.List:
      versionKey = RedisKeys.Task.Version.List({ userId });
      version = await get({ key: versionKey });
      if (!version) {
        version = 1;
        await set({ key: versionKey, value: version });
      }
      break;

    default:
      versionKey = RedisKeys.Task.Version.Single({ taskId });
      version = await get({ key: versionKey });
      if (!version) {
        version = 1;
        await set({ key: versionKey, value: version });
      }
      break;
  }

  return version;
};

//increment task version keys
export const incrementTaskVersionKeys = async ({
  userId,
  taskId,
  list,
}) => {
  await Promise.all([
    list && incr({ key: RedisKeys.Task.Version.List({ userId }) }),
    incr({ key: RedisKeys.Task.Version.List({}) }),
    taskId && incr({ key: RedisKeys.Task.Version.Single({ taskId }) }),
  ]);
};
