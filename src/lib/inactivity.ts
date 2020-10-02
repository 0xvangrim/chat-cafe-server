export const INACTIVITY_TIMER = 50000;

export const startInactivityTimer = (disconnectUserCallback, INACTIVITY_TIMER, socket, username) => {
    return setTimeout(disconnectUserCallback, INACTIVITY_TIMER, socket, username);
};

export const resetInactivityTimer = (inactivityTimer) => {
    return clearTimeout(inactivityTimer);
};
