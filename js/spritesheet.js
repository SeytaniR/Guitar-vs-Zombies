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
        // 1. Reuse static software scratch canvases ONLY for the one-time chroma-key pass
        const w = img.width, h = img.height;
        const sc = SpriteSheet._scratchCanvas || (SpriteSheet._scratchCanvas = document.createElement('canvas'));
        sc.width = w; sc.height = h;
        const cx = sc.getContext('2d', { willReadFrequently: true });
        cx.clearRect(0, 0, w, h);
        cx.drawImage(img, 0, 0);
        const imgData = cx.getImageData(0, 0, w, h);
        const d = imgData.data;

        const wsc = SpriteSheet._whiteScratchCanvas || (SpriteSheet._whiteScratchCanvas = document.createElement('canvas'));
        wsc.width = w; wsc.height = h;
        const wcx = wsc.getContext('2d', { willReadFrequently: true });
        const whiteData = wcx.createImageData(w, h);
        const wd = whiteData.data;

        for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], b = d[i + 2];

            // Green screen detection with compression tolerance
            const isGreen = g > 130 && g > r * 1.25 && g > b * 1.25;

            if (isGreen) {
                if (g > 158 && g > r * 1.38 && g > b * 1.38) {
                    d[i + 3] = 0; // Transparent
                } else {
                    d[i + 1] = Math.min(g, Math.max(r, b));
                    const maxRb = Math.max(r, b);
                    const spillDiff = g - maxRb;
                    if (spillDiff > 20) d[i + 3] = Math.max(0, 255 - spillDiff * 4);
                }
            }

            if (d[i + 3] > 10) {
                wd[i] = 255; wd[i + 1] = 255; wd[i + 2] = 255; wd[i + 3] = d[i + 3];
            }
        }

        cx.putImageData(imgData, 0, 0);
        wcx.putImageData(whiteData, 0, 0);

        // 2. Blit onto pure GPU-backed canvases (no willReadFrequently) to prevent per-frame CPU->GPU re-uploads
        const gpuClean = document.createElement('canvas');
        gpuClean.width = w; gpuClean.height = h;
        gpuClean.getContext('2d').drawImage(sc, 0, 0);

        const gpuWhite = document.createElement('canvas');
        gpuWhite.width = w; gpuWhite.height = h;
        gpuWhite.getContext('2d').drawImage(wsc, 0, 0);

        this.cleanImage = gpuClean;
        this.whiteImage = gpuWhite;

        // 3. Promote to immutable GPU ImageBitmap textures asynchronously when available
        if (typeof createImageBitmap === 'function') {
            createImageBitmap(gpuClean).then(bmp => { this.cleanImage = bmp; }).catch(() => {});
            createImageBitmap(gpuWhite).then(bmp => { this.whiteImage = bmp; }).catch(() => {});
        }
    }

    drawFrame(ctx, frameIndex, x, y, scale = 1, flip = false, flashWhite = false, alpha = 1.0) {
        if (!this.ready || !this.cleanImage) return;

        const f = Math.floor(frameIndex) % this.totalFrames;
        const col = f % this.cols;
        const row = Math.floor(f / this.cols);

        const dw = this.frameWidth * scale;
        const dh = this.frameHeight * scale;
        const dx = -dw / 2;
        const dy = -dh / 2;

        if (!flip && alpha >= 1.0) {
            // Fast direct hardware draw (Zero save/restore, zero matrix translation)
            const rx = Math.round(x + dx);
            const ry = Math.round(y + dy);
            ctx.drawImage(
                this.cleanImage,
                col * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight,
                rx, ry, dw, dh
            );

            if (flashWhite && this.whiteImage) {
                const prevAlpha = ctx.globalAlpha;
                ctx.globalAlpha = 0.85;
                ctx.drawImage(
                    this.whiteImage,
                    col * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight,
                    rx, ry, dw, dh
                );
                ctx.globalAlpha = prevAlpha;
            }
            return;
        }

        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        if (alpha < 1.0) ctx.globalAlpha = Math.max(0, alpha);
        if (flip) ctx.scale(-1, 1);

        // Draw regular character sprite
        ctx.drawImage(
            this.cleanImage,
            col * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight,
            dx, dy, dw, dh
        );

        // Flash white silhouette overlay
        if (flashWhite && this.whiteImage) {
            ctx.globalAlpha = 0.85;
            ctx.drawImage(
                this.whiteImage,
                col * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight,
                dx, dy, dw, dh
            );
        }

        ctx.restore();
    }
}

window.SpriteSheet = SpriteSheet;
