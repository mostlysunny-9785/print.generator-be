import express = require("express");
import {Routes} from "./rest/routes";
import {Passport} from "./config/passport";
import passport from "passport";
import {MONGODB_URI, SESSION_SECRET} from "./util/secrets";
import logger from "./util/logger";
import session from "express-session";
import {mongo} from "mongoose";
import bluebird from "bluebird";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import {DbInitialized} from "./db/initialize";
import bcrypt from "bcrypt";
const MongoStore = require('connect-mongo')(session);

const cors = require('cors')

export class AppClass {
    public app: express.Application;
    private mongoUrl = MONGODB_URI ?? "mongodb://localhost:27018/yacyag";


    constructor() {
        this.app = express();
        // Express configuration
        this.app.set("port", process.env.PORT || 3000);


        this.initMongo();
        DbInitialized.initDbWhenEmpty();
        this.initExpress();
        this.initPassport();


        Routes.routes(this.app);

    }

    initExpress() {
        this.app.use(cors());
        this.app.use(express.json()) // for parsing application/json
        this.app.use(cookieParser());
        this.app.use(session({
            resave: true,
            saveUninitialized: true,
            secret: SESSION_SECRET ?? 'SECRET_DUMMY',
            store: new MongoStore({
                url: this.mongoUrl,
                autoReconnect: true
            })
        }));
    }

    initPassport() {
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        this.app.use((req, res, next) => {
            res.locals.user = req.user;
            next();
        });
        this.app.use((req, res, next) => {
            // After successful login, redirect back to the intended page
            if (!req.user &&
                req.path !== "/login" &&
                req.path !== "/signup" &&
                !req.path.match(/^\/auth/) &&
                !req.path.match(/\./)) {
                // @ts-ignore
                req.session.returnTo = req.path;
            } else if (req.user &&
                req.path == "/account") {
                // @ts-ignore
                req.session.returnTo = req.path;
            }
            next();
        });


        // rest is handled in passport.ts
        Passport.init();

    }

    initMongo() {
        mongoose.connect(this.mongoUrl, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        } ).then(
            () => {
                logger.info("MongoDB connected");
                /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
        ).catch((err: any) => {
            logger.error("MongoDB connection error. Please make sure MongoDB is running. " + err);
            // process.exit();
        });
        (mongoose as any).Promise = bluebird;
    }
}

export default new AppClass().app;

// bcrypt.genSalt(10, (err, salt) => {
//
//     bcrypt.hash('test', salt, (err: Error, hash: any) => {
//         logger.info("passport " + hash);
//     });
// });
