import {Request, Response} from "express";
import {UserDocument} from "../model/User";
import {WordDocument, Word} from "../model/word.model";
import logger from "../util/logger";
import {DefaultResponseHandler, DefaultSimpleResponseHandler} from "./default.controller";
import {Image, ImageDocument} from "../model/image.model";
import {Generated, GeneratedDocument} from "../model/generated.model";
import sharp from "sharp";
import * as fs from "fs";
import {js2xml, xml2js} from "xml-js";
import {flattenSVG} from "../util/flattenSvg";
import {IMAGE_FOLDER} from "../util/constants";
import {mm2pix} from "../util/helpers";

export class ToolControllerClass {

    add(req: Request, res: Response){
        let user = (req.user as UserDocument)._id;
        let body = req.body;
        let svg = Buffer.from(body.svg, 'base64').toString('UTF-8'); // Ta-da

        // let s = svg.replace(/\/api\/imagefiles\//g, 'images/');
        // s = s.replace(/ href="/g, '\n' + ' xlink:href="');


        // replace image paths with base64 image
        const obj = xml2js(svg);
        const svgElement = obj.elements[0];
        const heightPx = mm2pix(svgElement.attributes.height, 300) * (72/300);
        const widthPx = mm2pix(svgElement.attributes.width, 300) * (72/300);

        svgElement.attributes["xmlns:xlink"] = "http://www.w3.org/1999/xlink"
        svgElement.attributes.viewBox = "0 0 " + svgElement.attributes.width + " " + svgElement.attributes.height;
        svgElement.attributes.width = widthPx;
        svgElement.attributes.height = heightPx;
        svgElement.attributes.x = 0;
        svgElement.attributes.y = 0;



        // for each element prepare for parsing to PNG
        svgElement.elements.forEach((element: any) => {
            if (element.name === 'image') {

                const filename = element.attributes.href.split('/').last;
                const extension = filename.split('.').last;
                const imageFile = fs.readFileSync(IMAGE_FOLDER + '/' + filename);
                const imageString = new Buffer(imageFile).toString('base64'); // create base64 representation of image

                element.attributes["xlink:href"] = 'data:image/' + extension + ';base64,' + imageString;
                delete element.attributes.href;
            }
        })
        const serializedSvg = js2xml(obj);

        fs.writeFile('generated/my.svg', serializedSvg, err => {
            if (err) {logger.error('Cant write file ' + err.message); return;}

            sharp('generated/my.svg',{
                density: 300
            })
                .png()
                .toFile("new-file.png")
                .then(function(info) {
                    console.log(info)
                })
                .catch(function(err) {
                    console.log({err})
                })

        })





        sharp('generated/my_3.svg')
            .png()
            .toFile("new-file2.png")
            .then(function(info) {
                console.log(info)
            })
            .catch(function(err) {
                console.log({err})
            })

        const errr: any = null;
        DefaultResponseHandler(errr, {msg: 'you are fine'}, res);

    }

    list(req: Request, res: Response){
        let user = (req.user as UserDocument)._id;

        Generated.find({ownerId: user})
            .sort({createdAt: -1})
            .exec( (error, images: GeneratedDocument[]) => DefaultResponseHandler(error, images, res));
    }

}

export var ToolController = new ToolControllerClass();
