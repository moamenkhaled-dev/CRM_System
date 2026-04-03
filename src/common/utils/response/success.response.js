export const successResponse = ({
  res,
  success = true,
  status = 200,
  data,
}) => {
  return res.status(status).json({
    success,
    data,
  });
};
