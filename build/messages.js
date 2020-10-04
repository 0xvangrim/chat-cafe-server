"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USERNAME_CHECK = exports.SERVER_MESSAGES = exports.LOGGER = void 0;
exports.LOGGER = {
    INFO: {
        LISTENING_ON: 'server is listening on',
        HTTP_SERVER_CLOSED: 'HTTP server closed',
        RECEIVED_SIGNAL: 'received. Graceful shutdown commencing',
        CLIENT_DISCONNECTED: 'Client has disconnected',
        CLIENT_CONNECTED: 'Client has connected',
        USERNAME_OK: 'The username was OK',
    },
    ERROR: {
        INTERNAL_SERVER_ERROR: '500 Internal Server Error occurred',
        USERNAME_TAKEN: 'The username was taken',
        USERNAME_INVALID: 'The username was invalid',
    },
    USER: {
        NEW_MESSAGES: 'new messages are being sent',
        LOGGED_IN: 'has logged in',
        HAS_LEFT: 'has left the chat',
        HAS_BEEN_DISCONNECTED: 'has been disconnected due to inactivity',
    },
};
exports.SERVER_MESSAGES = {
    USER_HAS_LEFT: 'has left the chat',
    USER_HAS_JOINED: 'has joined us!',
    DISCONNECT_INACTIVITY: 'has been disconnected due to inactivity',
    WELCOME: 'Welcome',
};
exports.USERNAME_CHECK = {
    INVALID_USERNAME: 'This username is invalid, try another one',
    USERNAME_TAKEN: 'This username has already been taken, try another one',
};
//# sourceMappingURL=messages.js.map