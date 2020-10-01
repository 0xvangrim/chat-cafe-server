import express from 'express';
import * as http from 'http';
import { timeParser } from './lib/date';
import logger from './logger';
import { messageParser } from './lib/messageParser';
import { startInactivityTimer, resetInactivityTimer, INACTIVITY_TIMER } from './lib/inactivity';
import { LOGGER, SERVER_MESSAGES } from './messages';
import { CHANNELS } from './channels';
import { userNameCheck } from './lib/userNameCheck';

const socketio = require('socket.io');

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

const io = socketio(server);

const clients = {};
const activeUserList = [];

let inactivity;

const disconnectUser = (socket, username) => {
    socket.broadcast.emit(CHANNELS.USER_INACTIVITY, `${username} ${SERVER_MESSAGES.DISCONNECT_INACTIVITY}`);
    logger.info(`${username} ${LOGGER.USER.HAS_BEEN_DISCONNECTED}`);
    if (io.sockets.connected[socket.id]) {
        io.sockets.connected[socket.id].disconnect(true);
    }
    const indexOfUser = activeUserList.indexOf(username);
    activeUserList.splice(indexOfUser, 1);
};

io.on(CHANNELS.CONNECTION, (socket: any) => {
    logger.info(LOGGER.INFO.CLIENT_CONNECTED);
    clients[socket.id] = socket;
    socket.on(CHANNELS.DISCONNECT, (username) => {
        socket.removeAllListeners();
        delete clients[socket.id];
        resetInactivityTimer(inactivity);
        logger.info(LOGGER.INFO.CLIENT_DISCONNECTED);
        const indexOfUser = activeUserList.indexOf(username);
        activeUserList.splice(indexOfUser, 1);
    });

    socket.on(CHANNELS.USER_HAS_LEFT, (username) => {
        socket.broadcast.emit(CHANNELS.USER_HAS_LEFT, `${username} ${SERVER_MESSAGES.USER_HAS_LEFT}`);
        logger.info(`${username} ${LOGGER.USER.HAS_LEFT}`);
        const indexOfUser = activeUserList.indexOf(username);
        activeUserList.splice(indexOfUser, 1);
    });

    socket.on(CHANNELS.USERNAME, (username) => {
        resetInactivityTimer(inactivity);
        inactivity = startInactivityTimer(disconnectUser, INACTIVITY_TIMER, socket, username);
        socket.broadcast.emit(CHANNELS.USER_HAS_JOINED, `${username} ${SERVER_MESSAGES.USER_HAS_JOINED}`);
        logger.info(`${username} ${LOGGER.USER.LOGGED_IN}`);
    });


    socket.on(CHANNELS.USERNAME_CHECK, (username) => {
        userNameCheck(username, activeUserList, socket);
    });
    socket.on(CHANNELS.SEND_MESSAGES, (content) => {
        const newContent = messageParser(content, timeParser);
        resetInactivityTimer(inactivity);
        socket.broadcast.emit(CHANNELS.RECEIVE_MESSAGES, JSON.stringify(newContent));
        console.log('UPDATED LULU')
        if (newContent !== null || newContent !== undefined) {
            inactivity = startInactivityTimer(disconnectUser, INACTIVITY_TIMER, socket, newContent.user);
        }
        logger.info(LOGGER.USER.NEW_MESSAGES);
    });

    const handleExit = (signal) => {
        logger.info(`${signal} ${LOGGER.INFO.RECEIVED_SIGNAL}`);
        delete clients[socket.id];
        socket.removeAllListeners();
        server.close(() => {
            logger.info(LOGGER.INFO.HTTP_SERVER_CLOSED);
            process.exit();
        });
        setImmediate(() => server.emit(CHANNELS.CLOSE));
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
    logger.error(`${err.message} or ${LOGGER.ERROR.INTERNAL_SERVER_ERROR}`);
});

server.listen(PORT, () => {
    logger.info(`${LOGGER.INFO.LISTENING_ON} ${PORT}`);
});
