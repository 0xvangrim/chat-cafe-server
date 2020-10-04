"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createLogger, format, transports } = require('winston');
const { combine, prettyPrint, timestamp } = format;
const logger = createLogger({
    format: combine(timestamp(), prettyPrint()),
    transports: [new transports.Console()],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map