class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode; // Ensure statusCode is set properly
    }
}
module.exports=ExpressError;