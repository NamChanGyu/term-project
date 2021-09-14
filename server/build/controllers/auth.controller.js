"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminAuthorization = exports.succeedAuthGoogle = exports.authGoogle = exports.verifyGoogle = exports.verifyToken = exports.login = exports.signup = void 0;
const passport_1 = __importDefault(require("passport"));
const http_errors_1 = __importDefault(require("http-errors"));
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const crypto_1 = require("crypto");
const jsonwebtoken_1 = require("jsonwebtoken");
const util_1 = require("util");
const makeSalt = async () => {
    const randomBytesPromise = (0, util_1.promisify)(crypto_1.randomBytes);
    const buf = await randomBytesPromise(64);
    return buf.toString("hex");
};
const hashPassword = async (password, salt) => {
    const pbkdf2Promise = (0, util_1.promisify)(crypto_1.pbkdf2);
    const hash = await pbkdf2Promise(password, salt, 100000, 64, "sha512");
    return hash.toString("hex");
};
const verifyPassword = async (password, hashedPassword, salt) => {
    return (await hashPassword(password, salt)) === hashedPassword;
};
const verifyToken = passport_1.default.authenticate("jwt", { session: false });
exports.verifyToken = verifyToken;
const verifyGoogle = passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
});
exports.verifyGoogle = verifyGoogle;
const authGoogle = passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:3000/login",
});
exports.authGoogle = authGoogle;
const succeedAuthGoogle = (req, res) => {
    const user = JSON.stringify(req.user);
    const token = (0, jsonwebtoken_1.sign)({
        id: req.user.id,
    }, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "30d",
    });
    res.redirect(`http://localhost:3000/login?token=${token}&user=${user}`);
};
exports.succeedAuthGoogle = succeedAuthGoogle;
const verifyAdminAuthorization = (req, res, next) => {
    const authorized = req.user && req.user.userId === "admin";
    if (!authorized) {
        return next((0, http_errors_1.default)(401, "admin is not authorized."));
    }
    next();
};
exports.verifyAdminAuthorization = verifyAdminAuthorization;
const signup = async (req, res, next) => {
    try {
        const { userId, password, nickname } = req.body;
        const userRepository = (0, typeorm_1.getRepository)(user_entity_1.User);
        const result = await userRepository.findOne({ userId });
        if (result) {
            return next((0, http_errors_1.default)(400, "user already exist."));
        }
        const user = new user_entity_1.User();
        const salt = await makeSalt();
        const hashedPassword = await hashPassword(password, salt);
        user.userId = userId;
        user.password = hashedPassword;
        user.nickname = nickname;
        user.salt = salt;
        user.image =
            "https://term-project-default.s3.ap-northeast-2.amazonaws.com/userdefault.png";
        user.imageKey = "userdefault.png";
        await userRepository.insert(user);
        res.status(201).json({
            message: "succeed.",
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "could not signup."));
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    try {
        const { userId, password } = req.body;
        const user = await (0, typeorm_1.getRepository)(user_entity_1.User).findOne({ userId });
        if (!user) {
            return next((0, http_errors_1.default)(404, "user not found."));
        }
        const check = await verifyPassword(password, user.password, user.salt);
        if (!check) {
            return next((0, http_errors_1.default)(400, "password don't match."));
        }
        const token = (0, jsonwebtoken_1.sign)({
            id: user.id,
        }, process.env.JWT_SECRET, {
            algorithm: "HS256",
            expiresIn: "30d",
        });
        user.password = "";
        user.salt = "";
        res.status(200).json({
            token,
            user,
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "could not login."));
    }
};
exports.login = login;
