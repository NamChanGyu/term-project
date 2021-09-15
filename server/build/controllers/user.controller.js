"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFollow = exports.addFollow = exports.updateUserImage = exports.deleteUser = exports.updateUser = exports.getUser = exports.getUserByUserId = exports.getUsers = exports.userByUserId = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const typeorm_1 = require("typeorm");
const post_entity_1 = require("../entities/post.entity");
const user_entity_1 = require("../entities/user.entity");
const s3_util_1 = require("../utils/s3.util");
const userByUserId = async (req, res, next, id) => {
    try {
        const user = await (0, typeorm_1.getRepository)(user_entity_1.User).findOne({
            userId: id,
        }, {
            relations: ["following", "followers", "posts", "interests"],
        });
        if (!user) {
            return next((0, http_errors_1.default)(404, "user not found."));
        }
        req.userByUserId = user;
        next();
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "user's id don't match."));
    }
};
exports.userByUserId = userByUserId;
const getUsers = async (req, res, next) => {
    try {
        const users = await (0, typeorm_1.getRepository)(user_entity_1.User).find({
            userId: (0, typeorm_1.Not)("admin"),
        });
        if (!users) {
            return next((0, http_errors_1.default)(404, "users not found."));
        }
        users.forEach((user) => {
            user.password = "";
            user.salt = "";
        });
        res.status(200).json(users);
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "could not get users."));
    }
};
exports.getUsers = getUsers;
const getUserByUserId = async (req, res, next) => {
    try {
        const posts = [];
        for (const post of req.userByUserId.posts) {
            const matchedPost = await (0, typeorm_1.getRepository)(post_entity_1.Post).findOne(post.id, {
                relations: ["coin"],
            });
            if (!matchedPost) {
                return next((0, http_errors_1.default)(404, "post not found."));
            }
            posts.push(matchedPost);
        }
        req.userByUserId.password = "";
        req.userByUserId.salt = "";
        req.userByUserId.posts = posts;
        if (req.userByUserId.followers.length > 0) {
            req.userByUserId.followers.forEach((user) => {
                user.password = "";
                user.salt = "";
            });
        }
        if (req.userByUserId.following.length > 0) {
            req.userByUserId.following.forEach((user) => {
                user.password = "";
                user.salt = "";
            });
        }
        res.status(200).json(req.userByUserId);
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "could not get user."));
    }
};
exports.getUserByUserId = getUserByUserId;
const getUser = async (req, res, next) => {
    try {
        const posts = [];
        for (const post of req.user.posts) {
            const matchedPost = await (0, typeorm_1.getRepository)(post_entity_1.Post).findOne(post.id, {
                relations: ["coin"],
            });
            if (!matchedPost) {
                return next((0, http_errors_1.default)(404, "post not found."));
            }
            posts.push(matchedPost);
        }
        req.user.password = "";
        req.user.salt = "";
        req.user.posts = posts;
        if (req.user.followers.length > 0) {
            req.user.followers.forEach((user) => {
                user.password = "";
                user.salt = "";
            });
        }
        if (req.user.following.length > 0) {
            req.user.following.forEach((user) => {
                user.password = "";
                user.salt = "";
            });
        }
        res.status(200).json(req.user);
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "could not get user."));
    }
};
exports.getUser = getUser;
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.user;
        await (0, typeorm_1.getRepository)(user_entity_1.User).update(id, {
            ...req.body,
        });
        res.status(200).json({
            message: "succeed.",
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "could not update user."));
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        const { imageKey } = req.user;
        if (imageKey && imageKey !== "userdefault.png") {
            await (0, s3_util_1.deleteUserImage)(imageKey);
        }
        await (0, typeorm_1.getRepository)(user_entity_1.User).delete(req.user.id);
        res.status(200).json({
            message: "succeed.",
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "could not delete user."));
    }
};
exports.deleteUser = deleteUser;
const updateUserImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next((0, http_errors_1.default)(400, "could not upload file."));
        }
        const { location, key } = req.file;
        const { id, imageKey } = req.user;
        if (imageKey !== "userdefault.png") {
            (0, s3_util_1.deleteUserImage)(imageKey);
        }
        await (0, typeorm_1.getRepository)(user_entity_1.User).update(id, {
            image: location,
            imageKey: key,
        });
        res.status(200).json(location);
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "could not upload image."));
    }
};
exports.updateUserImage = updateUserImage;
const addFollow = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { followingId } = req.body;
        const userRepository = (0, typeorm_1.getRepository)(user_entity_1.User);
        const currentUser = await userRepository.findOne(id, {
            relations: ["following"],
        });
        if (!currentUser) {
            return next((0, http_errors_1.default)(404, "current user not found."));
        }
        const followingUser = await userRepository.findOne(followingId, {
            relations: ["followers"],
        });
        if (!followingUser) {
            return next((0, http_errors_1.default)(404, "following user not found."));
        }
        const checkFollowingAndFollowers = currentUser.following.some((user) => user.id === followingId) &&
            followingUser.followers.some((user) => user.id === id);
        if (!checkFollowingAndFollowers) {
            currentUser.following.push(followingUser);
            await userRepository.save(currentUser);
            followingUser.followers.push(currentUser);
            await userRepository.save(followingUser);
        }
        res.status(200).json({
            message: "succeed.",
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "could not follow user."));
    }
};
exports.addFollow = addFollow;
const deleteFollow = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { followingId } = req.body;
        const userRepository = (0, typeorm_1.getRepository)(user_entity_1.User);
        const currentUser = await userRepository.findOne(id, {
            relations: ["following"],
        });
        if (!currentUser) {
            return next((0, http_errors_1.default)(404, "current user not found."));
        }
        const followingUser = await userRepository.findOne(followingId, {
            relations: ["followers"],
        });
        if (!followingUser) {
            return next((0, http_errors_1.default)(404, "following user not found."));
        }
        const checkFollowingAndFollowers = currentUser.following.some((user) => user.id === followingId) &&
            followingUser.followers.some((user) => user.id === id);
        if (checkFollowingAndFollowers) {
            currentUser.following.splice(currentUser.following.findIndex((user) => user.id === followingId), 1);
            await userRepository.save(currentUser);
            followingUser.followers.splice(followingUser.followers.findIndex((user) => user.id === id), 1);
            await userRepository.save(followingUser);
        }
        res.status(200).json({
            message: "succeed.",
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "could not unfollow user."));
    }
};
exports.deleteFollow = deleteFollow;
