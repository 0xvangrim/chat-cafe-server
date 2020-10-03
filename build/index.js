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
exports.INACTIVITY_TIMER = void 0;
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const date_1 = require("./lib/date");
const logger_1 = __importDefault(require("./logger"));
const messageParser_1 = require("./lib/messageParser");
const messages_1 = require("./messages");
const channels_1 = require("./channels");
const userNameCheck_1 = require("./lib/userNameCheck");
const cors_1 = __importDefault(require("cors"));
exports.INACTIVITY_TIMER = 10000;
const socketio = require('socket.io');
const app = express_1.default();
app.use(cors_1.default());
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socketio(server, {
    handlePreflightRequest: (req, res) => {
        const headers = {
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': req.headers.origin,
            'Access-Control-Allow-Credentials': true,
        };
        res.writeHead(200, headers);
        res.end();
    },
});
//io.set('origins', 'https://chat-cafe-client.vercel.app/:*');
io.origins(['*:*']);
const clients = {};
const userTimeList = [];
const activeUserList = [];
const inactivityVariables = [];
let currentUser;
const disconnectUser = (socket, username) => {
    socket.emit(channels_1.CHANNELS.USER_INACTIVITY, `${username} `);
    socket.broadcast.emit(channels_1.CHANNELS.USER_HAS_LEFT, `${username} ${messages_1.SERVER_MESSAGES.DISCONNECT_INACTIVITY}`);
    logger_1.default.info(`${username} ${messages_1.LOGGER.USER.HAS_BEEN_DISCONNECTED}`);
    const indexOfUser = activeUserList.indexOf(username);
    activeUserList.splice(indexOfUser, 1);
};
const findUser = (activeUserList, username) => activeUserList.filter((r) => (r.username = username));
io.on(channels_1.CHANNELS.CONNECTION, (socket) => {
    logger_1.default.info(messages_1.LOGGER.INFO.CLIENT_CONNECTED);
    clients[socket.id] = socket;
    socket.on(channels_1.CHANNELS.DISCONNECT, (username) => {
        clients[socket.id].removeAllListeners();
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
        currentUser = findUser(userTimeList, username);
        currentUser[0].startTimer(username, socket);
        socket.emit(channels_1.CHANNELS.USER_HAS_JOINED, `${messages_1.SERVER_MESSAGES.WELCOME} ${username}`);
        socket.broadcast.emit(channels_1.CHANNELS.USER_HAS_JOINED, `${username} ${messages_1.SERVER_MESSAGES.USER_HAS_JOINED}`);
        logger_1.default.info(`${username} ${messages_1.LOGGER.USER.LOGGED_IN}`);
    });
    socket.on(channels_1.CHANNELS.USERNAME_CHECK, (username) => {
        userNameCheck_1.userNameCheck(username, activeUserList, socket);
        userTimeList.push({
            username,
            startTimer: (username, socket) => {
                inactivityVariables[username] = setTimeout(disconnectUser, exports.INACTIVITY_TIMER, socket, username);
            },
            resetTimer: (username) => {
                clearTimeout(inactivityVariables[username]);
            },
        });
    });
    socket.on(channels_1.CHANNELS.SEND_MESSAGES, (content) => {
        const newContent = messageParser_1.messageParser(content, date_1.timeParser);
        currentUser = findUser(userTimeList, newContent.user);
        currentUser[0].resetTimer(newContent.user);
        socket.broadcast.emit(channels_1.CHANNELS.RECEIVE_MESSAGES, JSON.stringify(newContent));
        logger_1.default.info(messages_1.LOGGER.USER.NEW_MESSAGES);
        currentUser[0].startTimer(newContent.user, socket);
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
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.status(err.status || 500);
    next();
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