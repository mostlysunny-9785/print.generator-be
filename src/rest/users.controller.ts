import {NextFunction, Request, Response} from "express";
import {DB} from "../db/db";
import { check, sanitize, validationResult } from "express-validator";
import passport from "passport";
import {IVerifyOptions} from "passport-local";
import {UserDocument} from "../model/User";

export class UsersControllerClass {
    public async session(req: Request, res: Response, next: NextFunction) {
        if (req.isAuthenticated()){
            res.status(200).send(req.user);
        } else {
            res.status(401).send("NOPE");
        }
    };

    public async postLogin(req: Request, res: Response, next: NextFunction) {
        await check("email", "Email cannot be blank").isLength({min: 1}).run(req);
        await check("password", "Password cannot be blank").isLength({min: 1}).run(req);

        const errors = validationResult(req);
        let body = req.body;

        if (!errors.isEmpty()) {
            let s = JSON.stringify(errors.array());
            res.status(401).send(s);
            return;
        }

        passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                res.status(401).send("NOPE");
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                res.status(200).send(user);
                // @ts-ignore
                // res.redirect(req.session.returnTo || "/");
            });
        })(req, res, next);
    };

    public logout(req: Request, res: Response) {
        req.logout();
        res.redirect("/");
    };

    public getSignup(req: Request, res: Response) {
        if (req.user) {
            return res.redirect("/");
        }
        res.render("account/signup", {
            title: "Create Account"
        });
    };

    public async postSignup(req: Request, res: Response, next: NextFunction) {
        await check("email", "Email is not valid").isEmail().run(req);
        await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req);
        await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
        // eslint-disable-next-line @typescript-eslint/camelcase
        await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash("errors", JSON.stringify(errors.array()));
            return res.redirect("/signup");
        }

        // TODO: register user
    };

    public getAccount(req: Request, res: Response) {
        res.render("account/profile", {
            title: "Account Management"
        });
    };


    list(req: Request, res: Response){
        res.status(501).send("Unimplemented");
    }

    get(req: Request, res: Response){
        res.status(501).send("Unimplemented");
    }

    create(req: Request, res: Response){
        res.status(501).send("Unimplemented");
    }

    update(req: Request, res: Response){
        res.status(501).send("Unimplemented");
    }
}

export var UsersController = new UsersControllerClass();
