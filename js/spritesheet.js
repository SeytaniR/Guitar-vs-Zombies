// SpriteSheet Engine with Chroma-Key (Green Screen Removal) and White Silhouette Pre-computation
class SpriteSheet {
    constructor(image, cols, rows) {
        this.image = image;
        this.cols = cols;
        this.rows = rows;
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.totalFrames = cols * rows;
        this.ready = false;
        this.cleanImage = null;
        this.whiteImage = null; // Pre-calculated silhouette for clean hit flashes

        image.onload = () => {
            this.frameWidth = image.width / cols;
            this.frameHeight = image.height / rows;
            this.processImages(image);
            this.ready = true;
        };

        if (image.complete && image.naturalWidth > 0) {
            this.frameWidth = image.width / cols;
            this.frameHeight = image.height / rows;
            this.processImages(image);
            this.ready = true;
        }
    }

    processImages(img) {
        // 1. Transparent Clean Canvas
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const cx = c.getContext('2d', { willReadFrequently: true });
        cx.drawImage(img, 0, 0);
        const imgData = cx.getImageData(0, 0, c.width, c.height);
        const d = imgData.data;

        // 2. White Silhouette Canvas (Fixes the white box bug completely)
        const wc = document.createElement('canvas');
        wc.width = img.width;
        wc.height = img.height;
        const wcx = wc.getContext('2d', { willReadFrequently: true });
        const whiteData = wcx.createImageData(c.width, c.height);
        const wd = whiteData.data;

        for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];

            // Green screen detection with compression tolerance
            const isGreen = g > 130 && g > r * 1.25 && g > b * 1.25;

            if (isGreen) {
                if (g > 158 && g > r * 1.38 && g > b * 1.38) {
                    d[i + 3] = 0; // Transparent
                } else {
                    // Suppress green spill on edge borders
                    d[i + 1] = Math.min(g, Math.max(r, b));
                    const maxRb = Math.max(r, b);
                    const spillDiff = g - maxRb;
                    if (spillDiff > 20) {
                        d[i + 3] = Math.max(0, 255 - spillDiff * 4);
                    }
                }
            }

            // Populate pure white silhouette for hit-flash effects
            if (d[i + 3] > 10) {
                wd[i] = 255;
                wd[i + 1] = 255;
                wd[i + 2] = 255;
                wd[i + 3] = d[i + 3];
            }
        }

        cx.putImageData(imgData, 0, 0);
        wcx.putImageData(whiteData, 0, 0);

        this.cleanImage = c;
        this.whiteImage = wc;
    }

    drawFrame(ctx, frameIndex, x, y, scale = 1, flip = false, flashWhite = false, alpha = 1.0) {
        if (!this.ready || !this.cleanImage) return;

        const f = Math.floor(frameIndex) % this.totalFrames;
        const col = f % this.cols;
        const row = Math.floor(f / this.cols);

        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        if (alpha < 1.0) ctx.globalAlpha = Math.max(0, alpha);
        if (flip) ctx.scale(-1, 1);

        const dw = this.frameWidth * scale;
        const dh = this.frameHeight * scale;
        const dx = -dw / 2;
        const dy = -dh / 2;

        // Draw regular character sprite
        ctx.drawImage(
            this.cleanImage,
            col * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight,
            dx, dy, dw, dh
        );

        // Flash white silhouette overlay
        if (flashWhite && this.whiteImage) {
            ctx.save();
            ctx.globalAlpha = 0.85;
            ctx.drawImage(
                this.whiteImage,
                col * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight,
                dx, dy, dw, dh
            );
            ctx.restore();
        }

        ctx.restore();
    }
}

window.SpriteSheet = SpriteSheet;
