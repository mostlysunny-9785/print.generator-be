export const flattenSVG = (svg: any) => {
    const images = svg.match(/<image [^>]+>/g);
    if (!images || images.length < 1) {
        return svg;
    }

    var result = svg;
    images.forEach((image: any) => {
        const [,data] = image.match(/ href="data:image\/png;base64,([^"]+)"/) || [];
        if (!data) {
            return;
        }

        const innerSVG = Buffer.from(data, 'base64').toString();
        const [,width] = image.match(/ width="([^"]+)"/) || [];
        const [,height] = image.match(/ height="([^"]+)"/) || [];
        const [,opacity] = image.match(/ opacity="([^"]+)"/) || [];
        const [,x] = image.match(/ x="([^"]+)"/) || [];
        const [,y] = image.match(/ y="([^"]+)"/) || [];
        const [header] = innerSVG && innerSVG.match(/<svg[^>]+>/) || [];
        const fixedHeader = header
            .replace(/ (x|y|width|height)="([^"]+)"/g, '')
            .replace('<svg', `<svg x="${x}" y="${y}" width="${width}" height="${height}" opacity="${opacity || 1.0}"`);
        const replacement = innerSVG && innerSVG.replace(header, fixedHeader);
        result = result.replace(image, replacement);
    });

    return result;
}
