import { RoleEnum } from "../../common/enums/user.enums.js";
import { RedisKeys } from "../../common/services/redis.keys.js";
import { get, incr, set } from "../../common/services/redis.service.js";
import {
  NotFoundException,
  UnAuthorizedException,
} from "../../common/utils/response/error.response.js";
import { findOne } from "../../DB/index.js";
import { Contact, Deal, User } from "../../DB/models/index.js";

//validate ownership of activity
export const validateOwnership = async ({
  user,
  ownerId,
  contactId,
  dealId,
}) => {
  const userId = user._id.toString();
  if (user.role === RoleEnum.Admin) {
    if (userId === ownerId) {
      return UnAuthorizedException({
        code: "Unauthorized",
        message: "You can't assign activities to yourself",
      });
    }
  } else if (user.role === RoleEnum.Sales_Rep) {
    if (ownerId && userId !== ownerId) {
      return UnAuthorizedException({
        code: "Unauthorized",
        message: "You are not allowed to assign activities to another user",
        details: "You are not the owner of this contact",
      });
    }
  }
  const [contact, deal, checkUser] = await Promise.all([
    user.role === RoleEnum.Admin
      ? findOne({ model: User, filter: { _id: ownerId } })
      : true,
    findOne({ model: Contact, filter: { _id: contactId, ownerId } }),
    dealId
      ? findOne({
          model: Deal,
          filter: { _id: dealId, ownerId, contactId },
        })
      : Promise.resolve(null),
  ]);
  if (!checkUser && user.role == RoleEnum.Admin) {
    return NotFoundException({
      code: "NOT_FOUND",
      message:
        "user not found or (contact,deal) are not belong to this user or deal not belong to this contact or user",
    });
  }
  if (!contact) {
    return UnAuthorizedException({
      code: "Unauthorized",
      message:
        user.role === RoleEnum.Admin
          ? "This user is not the owner of this contact or contact is deleted"
          : "You are not allowed to assign activity to this contact or contact is deleted",
    });
  }
  if (dealId && !deal) {
    return UnAuthorizedException({
      code: "Unauthorized",
      message:
        user.role === RoleEnum.Admin
          ? "This user is not the owner of this deal or this deal is not belong to this contact"
          : "You are not allowed to assign activity to this deal or this deal is not belong to this contact",
    });
  }

  return { checkUser, contact, deal };
};

//check version key
export const checkVersionKey = async ({ userId }) => {
  const versionKey = RedisKeys.Activity.Version.User({ userId });
  let version = await get({ key: versionKey });
  if (!version) {
    version = 1;
    await set({ key: versionKey, value: version });
  }

  return version;
};

//increment version keys
export const incrVersionKeys = async ({ userId, contactId, dealId }) => {
  await Promise.all([
    incr({
      key: RedisKeys.Activity.Version.User({ userId }),
    }),
    incr({
      key: RedisKeys.Activity.Version.User({ userId: "all" }),
    }),
    contactId &&
      incr({
        key: RedisKeys.Activity.Version.Contact({
          userId,
          contactId,
        }),
      }),
    incr({
      key: RedisKeys.Activity.Version.Contact({
        userId: "all",
        contactId,
      }),
    }),
    dealId &&
      incr({
        key: RedisKeys.Activity.Version.Contact({
          userId,
          dealId,
        }),
      }),
    incr({
      key: RedisKeys.Activity.Version.Contact({
        userId: "all",
        dealId,
      }),
    }),
  ]);
};
