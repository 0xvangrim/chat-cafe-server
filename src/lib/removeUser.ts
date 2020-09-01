export const removeUser = (userList, username) => {
    const newUserList = userList.filter((item) => item !== username);
    return [newUserList];
};
