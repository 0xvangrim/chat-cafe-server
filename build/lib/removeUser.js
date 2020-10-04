"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUser = void 0;
exports.removeUser = (userList, username) => {
    const newUserList = userList.filter((item) => item !== username);
    return [newUserList];
};
//# sourceMappingURL=removeUser.js.map