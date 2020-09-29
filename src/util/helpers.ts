

export const pix2mm = (pixels: number, dpi: number): number => {
    return (pixels/0.0393701)/dpi;
}

export const mm2pix = (mm: number, dpi: number): number => {
    return mm * (dpi/25.4);
}


if (!Array.prototype.hasOwnProperty("last")) {
    Object.defineProperty(Array.prototype, "last", {
        get() {
            return this[this.length - 1];
        }
    });
}

export async function asyncForEach(array: [], callback: any) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

export const parseHrtimeToSeconds = (hrtime: [number, number]): number => {
    return (hrtime[0] + (hrtime[1] / 1e9));
}
