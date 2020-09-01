'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const logger_1 = __importDefault(require('./logger'));
const messages_1 = require('./messages');
const router = express_1.default.Router();
const activeUserList = [];
router.post('/check-username', (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const { currUser } = req.body;
        if (currUser === null || '') {
            logger_1.default.error(messages_1.LOGGER.ERROR.USERNAME_INVALID);
            return res.json({
                errorMessage: messages_1.USERNAME_CHECK.INVALID_USERNAME,
            });
        }
        if (activeUserList.includes(currUser)) {
            logger_1.default.error(messages_1.LOGGER.ERROR.USERNAME_TAKEN);
            return res.json({
                userNameIsTaken: true,
                errorMessage: messages_1.USERNAME_CHECK.USERNAME_TAKEN,
            });
        } else {
            activeUserList.push(currUser);
            logger_1.default.info(messages_1.LOGGER.INFO.USERNAME_OK);
            return res.json({
                userNameIsTaken: false,
                errorMessage: '',
            });
        }
    }),
);
exports.default = router;
//# sourceMappingURL=routes.js.map
