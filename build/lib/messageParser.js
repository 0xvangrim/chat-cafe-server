'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.messageParser = void 0;
exports.messageParser = (content, timeParser) => {
    const parsedMessage = JSON.parse(content.toString());
    const { id, message, timestamp, user } = parsedMessage;
    const formattedTime = timeParser(timestamp);
    if (message === '' || message === null || message === undefined) return;
    const newContent = {
        id,
        message,
        user,
        messageTime: formattedTime,
        timestamp,
    };
    return newContent;
};
//# sourceMappingURL=messageParser.js.map
