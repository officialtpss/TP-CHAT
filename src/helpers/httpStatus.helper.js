const sendError400 = (message, res) =>
  res.status(400).send({ status: 400, message: message });

const sendError404 = (message, res) =>
  res.status(404).send({ status: 404, message: message },);

const sendResp200 = (object, res) =>
  res.status(200).send({ status: 200, message: "ok", data: object });

const sendError401 = (message, res) => res.status(401).send(message);

const sendError409 = (message, res) => res.status(409).send({ status: 409, message: message });

module.exports = {
  sendError400,
  sendError404,
  sendResp200,
  sendError401,
  sendError409,
};
