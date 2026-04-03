//createOne
export const createOne = async ({
  model,
  data = {},
  options = {},
  session,
} = {}) => {
  const opts = { ...options };
  if (session) opts.session = session;
  return await model.create([data], opts);
};

//findOne
export const findOne = async ({
  model,
  filter = {},
  select = "",
  options = {},
  session,
} = {}) => {
  const query = model.findOne(filter).select(select);
  if (options.lean) query.lean();
  if (options.populate) query.populate(options.populate);

  if (session) query.session(session);

  return await query.exec();
};

//find
export const find = async ({
  model,
  filter = {},
  select = "",
  options = {},
  session,
} = {}) => {
  const query = model
    .find(filter)
    .select(select)
    .skip(options.skip || 0)
    .limit(options.limit || 0);
  if (options.populate) query.populate(options.populate);
  if (session) query.session(session);

  return await query.exec();
};

//paginate
export const paginate = async ({
  model,
  filter = {},
  select = "",
  options = {},
  page = "all",
  limit = 5,
  session,
} = {}) => {
  let total = undefined;
  let totalPages = undefined;
  if (page !== "all") {
    page = Math.floor(page < 1 ? 1 : page);
    options.limit = Math.floor(limit < 1 || !limit ? 5 : limit);
    options.skip = (page - 1) * options.limit;
    total = await model.countDocuments(filter);
    totalPages = Math.ceil(total / options.limit);
  }
  const data = await find({ model, filter, select, options, session });
  total = await model.countDocuments(filter);
  totalPages = Math.ceil(total / 5);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
};

//findOneAndUpdate
export const findOneAndUpdate = async ({
  model,
  filter = {},
  updates = {},
  select = "",
  options = {},
  session,
} = {}) => {
  const opts = { ...options, runValidators: true, returnDocument: "after" };
  if (session) opts.session = session;
  const query = model
    .findOneAndUpdate(filter, { ...updates, $inc: { __v: 1 } }, opts)
    .select(select);
  if (options.populate) query.populate(options.populate);

  return await query.exec();
};

//updateMany
export const updateMany = async ({
  model,
  filter = {},
  updates = {},
  options = {},
  session,
} = {}) => {
  const query = model.updateMany(filter, updates);
  if (session) query.session(session);

  return await query.exec();
};

//deleteOne
export const deleteOne = async ({
  model,
  filter = {},
  options = {},
  session,
} = {}) => {
  const opts = { ...options };
  if (session) opts.session = session;
  return await model.deleteOne(filter, opts);
};

//findOneAndDelete
export const findOneAndDelete = async ({
  model,
  filter = {},
  options = {},
  session,
} = {}) => {
  const opts = { ...options };
  if (session) opts.session = session;
  return await model.findOneAndDelete(filter, opts);
};

//aggregate
export const aggregate = async ({
  model,
  matchStage = {},
  pipeline = [],
  options = {},
  session,
} = {}) => {
  if (Object.keys(matchStage).length > 0) {
    pipeline = [{ $match: matchStage }, ...pipeline];
  }
  const agg = model.aggregate(pipeline, options);
  if (session) agg.session(session);

  return await agg.exec();
};

//countDocuments
export const countDocuments = async ({ model, filter }) => {
  return await model.countDocuments(filter);
};
