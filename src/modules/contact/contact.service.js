import mongoose from "mongoose";
import { RoleEnum } from "../../common/enums/user.enums.js";
import { del, get, keys, RedisKeys, set } from "../../common/services/index.js";
import {
  ConflictException,
  NotFoundException,
  UnAuthorizedException,
} from "../../common/utils/response/error.response.js";
import { phoneValidator } from "../../common/validators/index.js";
import {
  createOne,
  find,
  findOne,
  findOneAndUpdate,
  paginate,
  updateMany,
} from "../../DB/db.repository.js";
import { Activity, Contact, Deal } from "../../DB/models/index.js";

//create contact
export const createContact = async (inputs) => {
  const {
    user,
    firstName,
    lastName,
    email,
    countryCode,
    phone,
    company,
    jobTitle,
    status,
    source,
    notes,
  } = inputs;
  let phoneValidation;
  if (phone) {
    phoneValidation = await phoneValidator({ countryCode, phone });
  }
  const contact = await findOne({
    model: Contact,
    filter: { email, deletedAt: { $exists: false } },
  });
  if (contact) {
    return ConflictException({
      code: "CONFLICT_DATA",
      message: "contact already exist",
    });
  }
  const newContact = await createOne({
    model: Contact,
    data: {
      firstName,
      lastName,
      email,
      phone: phoneValidation,
      company,
      jobTitle,
      status,
      source,
      ownerId: user._id,
      notes,
    },
  });
  const cacheSalesKeys = await keys({
    pattern: `${RedisKeys.Contact.BaseList({ userId: user._id, role: RoleEnum.Sales_Rep })}*`,
  });
  const cacheAdminKeys = await keys({
    pattern: `${RedisKeys.Contact.BaseList({ userId: "all", role: "all" })}*`,
  });
  await del({ keys: [...(cacheSalesKeys || []), ...(cacheAdminKeys || [])] });

  return newContact;
};

//get all contacts
export const contactsList = async (inputs) => {
  const { user, page, limit, status, search } = inputs;
  const cacheKey = RedisKeys.Contact.List({
    userId: user.role == RoleEnum.Sales_Rep ? user._id : "all",
    role: user.role == RoleEnum.Sales_Rep ? user.role : "all",
    status,
    page,
    limit,
    search,
  });
  const cacheList = await get({ key: cacheKey });
  if (cacheList) {
    return cacheList;
  }
  const filter = {};
  if (search) {
    filter = {
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
  }
  filter.deletedAt = { $exists: false };
  if (status) {
    filter.status = status;
  }
  if (user.role === RoleEnum.Sales_Rep) filter.ownerId = user._id;
  const contacts = await paginate({
    model: Contact,
    filter,
    page,
    limit,
  });
  if (contacts.data.length <= 0) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "no contacts found",
    });
  }
  await set({ key: cacheKey, value: contacts, time: 15 * 60 });

  return contacts;
};

//get contact by id
export const getContactById = async (inputs) => {
  const { user, id } = inputs;
  const cacheKey =
    user.role == RoleEnum.Sales_Rep
      ? RedisKeys.Contact.single({ contactId: id, userId: user._id })
      : await keys({
          pattern: `${RedisKeys.Contact.BaseSingle({ contactId: id })}*`,
        });
  const cacheContact = await get({ key: cacheKey.toString() });
  if (cacheContact) {
    return cacheContact;
  }
  const filter = { _id: id, deletedAt: { $exists: false } };
  if (user.role == RoleEnum.Sales_Rep) filter.ownerId = user._id;
  const contact = await findOne({
    model: Contact,
    filter,
    options: {
      populate: [
        {
          path: "ownerId",
          select: "name email role",
        },
      ],
    },
  });
  if (!contact) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "contact not found",
    });
  }
  await set({
    key: RedisKeys.Contact.single({
      contactId: id,
      userId: contact.ownerId._id.toString(),
    }),
    value: contact,
    time: 10 * 60,
  });

  return contact;
};

//update contact
export const updateContact = async (inputs) => {
  const {
    user,
    id,
    firstName,
    lastName,
    email,
    phone,
    countryCode,
    company,
    jobTitle,
    status,
    source,
    notes,
  } = inputs;
  const filter = { _id: id, deletedAt: { $exists: false } };
  if (user.role == RoleEnum.Sales_Rep) {
    filter.ownerId = user._id;
  }
  let updates = {};
  if (firstName) updates.firstName = firstName;
  if (lastName) updates.lastName = lastName;
  if (email) updates.email = email;
  if (phone) {
    const validatePhone = await phoneValidator({ countryCode, phone });
    updates.phone = validatePhone;
  }
  if (company) updates.company = company;
  if (jobTitle) updates.jobTitle = jobTitle;
  if (status) updates.status = status;
  if (source) updates.source = source;
  if (notes) updates.notes = notes;
  if (Object.keys(updates).length === 0) {
    return BadRequestException({
      message: "No fields to update",
    });
  }
  const contact = await findOneAndUpdate({
    model: Contact,
    filter,
    updates,
    options: {
      populate: [
        {
          path: "ownerId",
          select: "name email role",
        },
      ],
    },
  });
  if (!contact) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "contact not found",
    });
  }
  const cacheSingleKeys = await keys({
    pattern: `${RedisKeys.Contact.BaseSingle({ contactId: id })}*`,
  });
  const cacheSalesKeys = await keys({
    pattern: `${RedisKeys.Contact.BaseList({ userId: contact.ownerId.toString(), role: RoleEnum.Sales_Rep })}*`,
  });
  const cacheAdminKeys = await keys({
    pattern: `${RedisKeys.Contact.BaseList({ userId: "all", role: "all" })}*`,
  });
  await del({
    keys: [
      ...(cacheSalesKeys || []),
      ...(cacheAdminKeys || []),
      ...(cacheSingleKeys || []),
    ],
  });

  return contact;
};

//delete contact
export const deleteContact = async (inputs) => {
  const { id } = inputs;
  const session = await mongoose.startSession();
  session.startTransaction();
  let contact;
  try {
    contact = await findOneAndUpdate({
      model: Contact,
      filter: { _id: id, deletedAt: { $eq: null } },
      updates: { deletedAt: new Date() },
      session,
    });
    if (!contact) {
      return NotFoundException({
        code: "NOT_FOUND",
        message: "contact not found",
      });
    }
    await updateMany({
      model: Deal,
      filter: { contactId: id, deletedAt: { $eq: null } },
      updates: { deletedAt: new Date() },
      session,
    });
    await updateMany({
      model: Activity,
      filter: { contactId: id, deletedAt: { $eq: null } },
      updates: { deletedAt: new Date() },
      session,
    });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    return BadRequestException({
      code: "BAD_REQUEST",
      message: "something went wrong try again later",
    });
  } finally {
    session.endSession();
  }
  const cacheSingleKeys = await keys({
    pattern: `${RedisKeys.Contact.BaseSingle({ contactId: id })}*`,
  });
  const cacheSalesKeys = await keys({
    pattern: `${RedisKeys.Contact.BaseList({ userId: contact.ownerId.toString(), role: RoleEnum.Sales_Rep })}*`,
  });
  const cacheAdminKeys = await keys({
    pattern: `${RedisKeys.Contact.BaseList({ userId: "all", role: "all" })}*`,
  });
  await del({
    keys: [
      ...(cacheSalesKeys || []),
      ...(cacheAdminKeys || []),
      ...(cacheSingleKeys || []),
    ],
  });

  return;
};

//search
export const contactSearch = async (inputs) => {
  const { key } = inputs;
  const contacts = await find({
    model: Contact,
    filter: {
      deletedAt: { $exists: false },
      $or: [
        { firstName: { $regex: key, $options: "i" } },
        { lastName: { $regex: key, $options: "i" } },
        { email: { $regex: key, $options: "i" } },
      ],
    },
  });
  if (contacts.length <= 0) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "contact not found",
    });
  }

  return contacts;
};
