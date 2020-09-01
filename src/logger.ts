const { createLogger, format, transports } = require('winston');
const { combine, prettyPrint, timestamp } = format;

const logger = createLogger({
    format: combine(timestamp(), prettyPrint()),
    transports: [new transports.Console()],
});

export default logger;
