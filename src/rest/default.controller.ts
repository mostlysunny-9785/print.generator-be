import {Response} from "express";
import logger from "../util/logger";

export const DefaultResponseHandler = <T>(error: Error, payload: T, res: Response) => {
    if (error) {
        res.status(400).send(error.message);
    } else {
        res.status(200).json(payload);
    }
}

export const DefaultSimpleResponseHandler = (error: Error, res: Response) => {
    if (error) {
        res.status(400).json(error.message);
        logger.error(error.message);
    } else {
        res.status(200).json({response: "ok"});
    }
}
