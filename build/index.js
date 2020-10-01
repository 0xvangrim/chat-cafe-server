"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const date_1 = require("./lib/date");
const logger_1 = __importDefault(require("./logger"));
const messageParser_1 = require("./lib/messageParser");
const inactivity_1 = require("./lib/inactivity");
const messages_1 = require("./messages");
const channels_1 = require("./channels");
const userNameCheck_1 = require("./lib/userNameCheck");
const socketio = require('socket.io');
const app = express_1.default();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socketio(server);
const clients = {};
const activeUserList = [];
let inactivity;
const disconnectUser = (socket, username) => {
    socket.broadcast.emit(channels_1.CHANNELS.USER_INACTIVITY, `${username} ${messages_1.SERVER_MESSAGES.DISCONNECT_INACTIVITY}`);
    logger_1.default.info(`${username} ${messages_1.LOGGER.USER.HAS_BEEN_DISCONNECTED}`);
    if (io.sockets.connected[socket.id]) {
        io.sockets.connected[socket.id].disconnect(true);
    }
    const indexOfUser = activeUserList.indexOf(username);
    activeUserList.splice(indexOfUser, 1);
};
io.on(channels_1.CHANNELS.CONNECTION, (socket) => {
    logger_1.default.info(messages_1.LOGGER.INFO.CLIENT_CONNECTED);
    clients[socket.id] = socket;
    socket.on(channels_1.CHANNELS.DISCONNECT, (username) => {
        socket.removeAllListeners();
        delete clients[socket.id];
        inactivity_1.resetInactivityTimer(inactivity);
        logger_1.default.info(messages_1.LOGGER.INFO.CLIENT_DISCONNECTED);
        const indexOfUser = activeUserList.indexOf(username);
        activeUserList.splice(indexOfUser, 1);
    });
    socket.on(channels_1.CHANNELS.USER_HAS_LEFT, (username) => {
        socket.broadcast.emit(channels_1.CHANNELS.USER_HAS_LEFT, `${username} ${messages_1.SERVER_MESSAGES.USER_HAS_LEFT}`);
        logger_1.default.info(`${username} ${messages_1.LOGGER.USER.HAS_LEFT}`);
        const indexOfUser = activeUserList.indexOf(username);
        activeUserList.splice(indexOfUser, 1);
    });
    socket.on(channels_1.CHANNELS.USERNAME, (username) => {
        inactivity_1.resetInactivityTimer(inactivity);
        inactivity = inactivity_1.startInactivityTimer(disconnectUser, inactivity_1.INACTIVITY_TIMER, socket, username);
        socket.broadcast.emit(channels_1.CHANNELS.USER_HAS_JOINED, `${username} ${messages_1.SERVER_MESSAGES.USER_HAS_JOINED}`);
        logger_1.default.info(`${username} ${messages_1.LOGGER.USER.LOGGED_IN}`);
    });
    socket.on(channels_1.CHANNELS.USERNAME_CHECK, (username) => {
        userNameCheck_1.userNameCheck(username, activeUserList, socket);
    });
    socket.on(channels_1.CHANNELS.SEND_MESSAGES, (content) => {
        const newContent = messageParser_1.messageParser(content, date_1.timeParser);
        inactivity_1.resetInactivityTimer(inactivity);
        socket.broadcast.emit(channels_1.CHANNELS.RECEIVE_MESSAGES, JSON.stringify(newContent));
        console.log('UPDATED LULU');
        if (newContent !== null || newContent !== undefined) {
            inactivity = inactivity_1.startInactivityTimer(disconnectUser, inactivity_1.INACTIVITY_TIMER, socket, newContent.user);
        }
        logger_1.default.info(messages_1.LOGGER.USER.NEW_MESSAGES);
    });
    const handleExit = (signal) => {
        logger_1.default.info(`${signal} ${messages_1.LOGGER.INFO.RECEIVED_SIGNAL}`);
        delete clients[socket.id];
        socket.removeAllListeners();
        server.close(() => {
            logger_1.default.info(messages_1.LOGGER.INFO.HTTP_SERVER_CLOSED);
            process.exit();
        });
        setImmediate(() => server.emit(channels_1.CHANNELS.CLOSE));
    };
    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message || '500: Internal Server Error',
        },
    });
    logger_1.default.error(`${err.message} or ${messages_1.LOGGER.ERROR.INTERNAL_SERVER_ERROR}`);
});
server.listen(PORT, () => {
    logger_1.default.info(`${messages_1.LOGGER.INFO.LISTENING_ON} ${PORT}`);
});
//# sourceMappingURL=index.js.map