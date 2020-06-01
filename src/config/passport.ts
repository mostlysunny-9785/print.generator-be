import {AppClass} from "../App";
import passport from "passport";
import passportLocal from "passport-local";
import {NextFunction, Request, Response} from "express";
import logger from "../util/logger";
import {User, UserDocument} from "../model/User";



export class PassportClass {
    constructor() {
    }

    private LocalStrategy = passportLocal.Strategy;


    public init(): void {


        passport.serializeUser<any, any>((user, done) => {
            if (user){
                done(undefined, user.id);
            }
        });

        passport.deserializeUser((id, done) => {
            User.findById(id, (err, user) => {
                done(err, user);
            });
        });

        passport.use(new this.LocalStrategy({ usernameField: "email" },
            (email, password, done) => {


                User.findOne({email: email.toLowerCase()}, (err, user: UserDocument) => {
                    if (err) {
                        logger.info("Login error", {email, password});
                        return done(err);
                    }
                    if (!user) {
                        logger.info("Unsuccessful login", {email, password});
                        return done(undefined, false, { message: `Email ${email} not found.` });
                    }
                    user.comparePassword(password, (err: Error, isMatch: boolean) => {
                        if (err) { return done(err); }
                        if (isMatch) {
                            return done(undefined, user);
                        }
                        logger.info("Wrong password", {email, password});
                        return done(undefined, false, { message: "Invalid email or password." });
                    });
                });

            }
        ));


    }

    /**
     * Login Required middleware.
     */
    public isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.status(401).send("NOPE");
    };

    /**
     * Authorization Required middleware.
     */
    public isAuthorized = (req: Request, res: Response, next: NextFunction) => {
        const provider = req.path.split("/").slice(-1)[0];

        // const user = req.user as UserDocument;
        // if (_.find(user.tokens, { kind: provider })) {
        //     next();
        // } else {
        //     res.redirect(`/auth/${provider}`);
        // }
    };
}

export var Passport = new PassportClass();
