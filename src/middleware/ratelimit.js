const slowDown = require("express-slow-down");

module.exports = slowDown({
    windowMs: 2 * 60 * 1000,
    delayAfter: 10,
    delayMs: 100
});
