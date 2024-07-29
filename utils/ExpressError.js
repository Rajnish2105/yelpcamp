class ExpressError extends Error {
    constructor(message, status) {
        //calling error constructor
        super();
        this.message = message;
        this.status = status;
    }
}
module.exports = ExpressError;