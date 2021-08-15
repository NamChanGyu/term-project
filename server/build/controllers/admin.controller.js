"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCoin = exports.createCoin = void 0;
const typeorm_1 = require("typeorm");
const coin_entity_1 = require("../entities/coin.entity");
const upbit_util_1 = require("../utils/upbit.util");
const createCoin = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                code: 400,
                error: "form field something wrong.",
            });
        }
        const { location, key } = req.file;
        const { name, symbol, description, supplyLimit, homepage, author, github, whitepaper, initialRelease, market, } = req.body;
        const [coinPrice] = await upbit_util_1.getUpbitCoinPrice(market);
        const { opening_price, high_price, low_price, trade_price, prev_closing_price, change, acc_trade_price, acc_trade_price_24h, acc_trade_volume, acc_trade_volume_24h, highest_52_week_price, highest_52_week_date, lowest_52_week_price, lowest_52_week_date, } = coinPrice;
        const coin = new coin_entity_1.Coin();
        coin.name = name;
        coin.symbol = symbol;
        coin.description = description;
        coin.market = market;
        coin.openingPrice = opening_price;
        coin.highPrice = high_price;
        coin.lowPrice = low_price;
        coin.tradePrice = trade_price;
        coin.prevClosingPrice = prev_closing_price;
        coin.change = change;
        coin.accTradePrice = acc_trade_price;
        coin.accTradePrice24h = acc_trade_price_24h;
        coin.accTradeVolume = acc_trade_volume;
        coin.accTradeVolume24h = acc_trade_volume_24h;
        coin.highest52WeekPrice = highest_52_week_price;
        coin.highest52WeekDate = highest_52_week_date;
        coin.lowest52WeekPrice = lowest_52_week_price;
        coin.lowest52WeekDate = lowest_52_week_date;
        coin.supplyLimit = supplyLimit;
        coin.homepage = homepage;
        coin.author = author;
        coin.github = github;
        coin.whitepaper = whitepaper;
        coin.initialRelease = initialRelease;
        coin.image = location;
        coin.imageKey = key;
        await typeorm_1.getRepository(coin_entity_1.Coin).insert(coin);
        res.status(201).json({
            message: "succeed.",
        });
    }
    catch (error) {
        res.status(400).json({
            code: 400,
            error: "coin already exist.",
        });
    }
};
exports.createCoin = createCoin;
const updateCoin = async (req, res) => {
    try {
        const { id } = req.coin;
        await typeorm_1.getRepository(coin_entity_1.Coin).update(id, {
            ...req.body,
        });
        res.status(200).json({
            message: "succeed.",
        });
    }
    catch (error) {
        res.status(400).json({
            code: 400,
            error: "could not update coin.",
        });
    }
};
exports.updateCoin = updateCoin;
