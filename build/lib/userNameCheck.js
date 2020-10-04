"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userNameCheck = void 0;
const logger_1 = __importDefault(require("../logger"));
const messages_1 = require("../messages");
const channels_1 = require("../channels");
exports.userNameCheck = (username, userList, socket) => {
    if (username === null || username === '' || username === undefined) {
        logger_1.default.error(messages_1.LOGGER.ERROR.USERNAME_INVALID);
        socket.emit(channels_1.CHANNELS.USERNAME_TAKEN, {
            errorMessage: messages_1.USERNAME_CHECK.INVALID_USERNAME,
        });
    }
    if (userList.includes(username)) {
        logger_1.default.error(messages_1.LOGGER.ERROR.USERNAME_TAKEN);
        socket.emit(channels_1.CHANNELS.USERNAME_TAKEN, {
            userNameIsTaken: true,
            errorMessage: messages_1.USERNAME_CHECK.USERNAME_TAKEN,
        });
    }
    else {
        userList.push(username);
        logger_1.default.info(messages_1.LOGGER.INFO.USERNAME_OK);
        socket.emit(channels_1.CHANNELS.USERNAME_OK, {
            userNameIsTaken: false,
            errorMessage: '',
        });
        return true;
    }
};
//# sourceMappingURL=userNameCheck.js.map