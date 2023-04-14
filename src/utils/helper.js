const throwError = function ({ error = null, name = "Unknown Error", message = "Internal Server Error", status = 500 }) {
    if (error) return new Error(error);
    const err = new Error();
    err.name = name;
    err.message = message;
    err.status = status;
    return err;
};

module.exports = { throwError };
