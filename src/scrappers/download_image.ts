import * as fs from "fs";

const axios = require('axios').default;

export const download_image = (url: string, image_path: string) =>
    axios({
        url,
        responseType: 'stream',
    }).then(
        (response: any) =>
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(image_path))
                    .on('finish', () => resolve())
                    .on('error', (e: any) => reject(e));
            }),
    );
