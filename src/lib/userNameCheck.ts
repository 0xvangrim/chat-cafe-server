import logger from '../logger';
import { LOGGER, USERNAME_CHECK } from '../messages';
import { CHANNELS } from '../channels';

export const userNameCheck = (username, userList, socket) => {
    if (username === null || username === '' || username === undefined) {
        logger.error(LOGGER.ERROR.USERNAME_INVALID);
        socket.emit(CHANNELS.USERNAME_TAKEN, {
            errorMessage: USERNAME_CHECK.INVALID_USERNAME,
        });
    }
    if (userList.includes(username)) {
        logger.error(LOGGER.ERROR.USERNAME_TAKEN);
        socket.emit(CHANNELS.USERNAME_TAKEN, {
            userNameIsTaken: true,
            errorMessage: USERNAME_CHECK.USERNAME_TAKEN,
        });
    } else {
        userList.push(username);
        logger.info(LOGGER.INFO.USERNAME_OK);
        socket.emit(CHANNELS.USERNAME_OK, {
            userNameIsTaken: false,
            errorMessage: '',
        });
        return true;
    }
};
