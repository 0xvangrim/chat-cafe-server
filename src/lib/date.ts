export default function timeParser(timestamp) {
    const dateObj = new Date(timestamp);
    const hours = dateObj.getHours();
    const minutes = '0' + dateObj.getMinutes();
    const formattedTime = hours + ':' + minutes.substr(-2);
    return formattedTime;
}
