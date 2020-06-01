import {Response} from "express";

export const DefaultResponseHandler = <T>(error: Error, payload: T, res: Response) => {
    if (error) {
        res.status(400).send(error);
    } else {
        res.status(200).json(payload);
    }
}

export const DefaultSimpleResponseHandler = (error: Error, res: Response) => {
    if (error) {
        res.status(400).send(error);
    } else {
        res.status(200).json({response: "ok"});
    }
}
