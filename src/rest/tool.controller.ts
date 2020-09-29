import {Request, Response} from "express";
import {UserDocument} from "../model/User";
import {WordDocument, Word} from "../model/word.model";
import logger from "../util/logger";
import {DefaultResponseHandler, DefaultSimpleResponseHandler} from "./default.controller";
import {Image, ImageDocument} from "../model/image.model";
import {Generated, GeneratedDocument} from "../model/generated.model";
import sharp, {OutputInfo} from "sharp";
import * as fs from "fs";
import {js2xml, xml2js} from "xml-js";
import {flattenSVG} from "../util/flattenSvg";
import {IMAGE_FOLDER, RESULTS_FOLDER} from "../util/constants";
import {asyncForEach, mm2pix, parseHrtimeToSeconds} from "../util/helpers";
import hasha from "hasha";
import {Folder} from "../model/folder.model";

export class ToolControllerClass {

    public async add(req: Request, res: Response){
        const stopwatch = process.hrtime();
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
        await asyncForEach(svgElement.elements, async (element: any) => {
            if (element.name === 'image') {

                const filename = element.attributes.href.split('/').last;
                const extension = filename.split('.').last;
                const imageFile = fs.readFileSync(IMAGE_FOLDER + '/' + filename);

                const neededSize = Math.ceil(mm2pix(element.attributes.width, 300));
                const smallerFileBuffer = await sharp(IMAGE_FOLDER + '/' + filename)
                                        .resize({width: neededSize})
                                        .toBuffer()

                // const imageString = new Buffer(imageFile).toString('base64'); // create base64 representation of image
                const imageString = smallerFileBuffer.toString('base64'); // create base64 representation of imageconst

                element.attributes["xlink:href"] = 'data:image/' + extension + ';base64,' + imageString;
                delete element.attributes.href;
            }
        })
        // svgElement.elements.forEach((element: any) => {
        //
        // })
        const serializedSvg = js2xml(obj);
        const hash = hasha(svg, {algorithm: 'md5'});

        const doc = ToolController.convertSvgToPng(serializedSvg, hash, user, stopwatch);

        doc.then((document: GeneratedDocument) => {
            // @ts-ignore
            DefaultResponseHandler(null, document, res);
        }).catch(reason => {
            DefaultSimpleResponseHandler(new Error(reason), res);
        })


    }

    list(req: Request, res: Response){
        let user = (req.user as UserDocument)._id;

        Generated.find({ownerId: user})
            .sort({createdAt: -1})
            .exec( (error, images: GeneratedDocument[]) => DefaultResponseHandler(error, images, res));
    }







    convertSvgToPng(serializedSvg: string, hash: string, user: string, stopwatch: any): Promise<GeneratedDocument> {
        const svgFilename = "/svg/" + hash + ".svg";
        const pngFilename = "/" + hash + ".png";
        const smallPngFilename = "/thumb/" + hash + ".png";


        return new Promise((resolve, reject) => {
            fs.writeFile(RESULTS_FOLDER + svgFilename, serializedSvg, err => {
                if (err) {
                    reject('Cant write file ' + err?.message);
                }

                sharp(RESULTS_FOLDER + svgFilename,{
                    density: 300
                })
                    .png()
                    .toFile(RESULTS_FOLDER + pngFilename)
                    .then((bigPng: OutputInfo) => {

                        // create thumbnail
                        sharp(RESULTS_FOLDER + pngFilename)
                            .resize({width: 300})
                            .toFile(RESULTS_FOLDER + smallPngFilename)
                            .then(smallPng => {
                                const newGenerated = {
                                    id: hash,
                                    title: hash,
                                    previewFilename: "/tool/results" + smallPngFilename,
                                    filename: "/tool/results" + pngFilename,
                                    svgFilename: "/tool/results" + svgFilename,
                                    width: bigPng.width,
                                    height: bigPng.height,
                                    fileSize: bigPng.size,
                                    generationTime: parseHrtimeToSeconds(process.hrtime(stopwatch)),
                                    ownerId: user
                                } as GeneratedDocument;


                                const generated = new Generated(newGenerated);
                                generated.save((err, product: GeneratedDocument) => {
                                    if (err) {
                                        reject('Cant save to mongo ' + err?.message);
                                    } else {
                                        resolve(product);
                                    }
                                });

                            }).catch(reason => {
                                reject('Cant create thumbnail :( ' + reason?.message);
                        });



                    })
                    .catch((err) => {
                        reject('Cant convert file from SVG ' + err?.message);
                    })
            })
        });
    }


}

export var ToolController = new ToolControllerClass();
