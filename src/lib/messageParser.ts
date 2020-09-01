export const messageParser = (content: string, timeParser): Record<string, unknown> => {
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
