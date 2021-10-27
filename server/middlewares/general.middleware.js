exports.initializePayload = () => (req, res, next) => {
  req.payload = req.payload || {};
  next();
};
