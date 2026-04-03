import { Router } from "express";

import {
  authentication,
  authorization,
  contactSearchLimiter,
  contactsListLimiter,
  createContactLimiter,
  deleteContactLimiter,
  getContactByIdLimiter,
  updatePasswordLimiter,
  validate,
} from "../../middlewares/index.js";
import {
  contactSearch,
  contactsList,
  createContact,
  deleteContact,
  getContactById,
  updateContact,
} from "./contact.service.js";
import {
  contactSearchSchema,
  contactsListSchema,
  createContactSchema,
  deleteContactSchema,
  getContactByIdSchema,
  updateContactSchema,
} from "./contact.validation.js";
import { successResponse } from "../../common/utils/response/success.response.js";
import { contactEndPoints } from "./contact.authorization.js";

const router = Router();

//create contact
router.post(
  "/contacts",
  authentication(),
  authorization(contactEndPoints.createContact),
  createContactLimiter,
  validate(createContactSchema),
  async (req, res, next) => {
    const {
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
    } = req.body;
    const contact = await createContact({
      user: req.user,
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
    });

    return successResponse({ res, status: 201, data: contact });
  },
);

//search
router.get(
  "/contacts/search",
  authentication(),
  contactSearchLimiter,
  validate(contactSearchSchema),
  async (req, res, next) => {
    const { key } = req.query;
    const contacts = await contactSearch({ key });

    return successResponse({ res, data: contacts });
  },
);

//get contacts list
router.get(
  "/contacts",
  authentication(),
  contactsListLimiter,
  validate(contactsListSchema),
  async (req, res, next) => {
    const { page, limit, status, search } = req.query;
    const contacts = await contactsList({
      user: req.user,
      page,
      limit,
      status,
      search,
    });

    return successResponse({ res, data: contacts });
  },
);

//get contact by id
router.get(
  "/contacts/:id",
  authentication(),
  getContactByIdLimiter,
  validate(getContactByIdSchema),
  async (req, res, next) => {
    const { id } = req.params;
    const contact = await getContactById({ user: req.user, id });

    return successResponse({ res, data: contact });
  },
);

//update contact
router.put(
  "/contacts/:id",
  authentication(),
  authentication(contactEndPoints.updateContact),
  updatePasswordLimiter,
  validate(updateContactSchema),
  async (req, res, next) => {
    const {
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
    } = req.body;
    const { id } = req.params;
    const contact = await updateContact({
      user: req.user,
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
    });

    return successResponse({ res, data: contact });
  },
);

//delete contact
router.delete(
  "/contacts/:id",
  authentication(),
  authorization(contactEndPoints.deleteContact),
  deleteContactLimiter,
  validate(deleteContactSchema),
  async (req, res, next) => {
    const { id } = req.params;
    await deleteContact({ user: req.user, id });

    return successResponse({ res });
  },
);

//export router
export default router;
