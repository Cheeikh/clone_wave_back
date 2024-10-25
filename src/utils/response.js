export const sendResponse = (res, statusCode, data) => {
    res.status(statusCode).json(data);
};

export const sendErrorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({ error: message });
};