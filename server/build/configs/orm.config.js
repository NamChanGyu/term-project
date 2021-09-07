"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const root = process.env.NODE_ENV === "production" ? "build" : "src";
exports.default = {
    type: process.env.TYPEORM_TYPE,
    host: process.env.TYPEORM_HOST,
    port: process.env.TYPEORM_PORT,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
    synchronize: true,
    logging: false,
    dropSchema: false,
    entities: [root + "/entities/**/*.{js,ts}"],
    migrations: [root + "/migration/**/*.{js,ts}"],
    subscribers: [root + "/subscriber/**/*.{js,ts}"],
};
