// Shared Zero-Loss Mobile Performance Utilities (Deferred Save Batching & GPU Text Badge Cache)
(function () {
    const _pendingSaves = new Map();
    const _badgeCache = new Map();
    let _lastFlush = 0;

    const PerfUtils = {
        isInActiveBattle() {
            return typeof window !== 'undefined' &&
                window.game &&
                window.game.currentScreen === 'battle' &&
                window.game.combat &&
                window.game.combat.matchActive &&
                !window.game.isBattlePaused;
        },

        deferSave(key, fn) {
            if (typeof fn !== 'function') return;
            if (!this.isInActiveBattle()) {
                try { fn(); } catch (e) {}
                return;
            }
            _pendingSaves.set(key, fn);
        },

        tickSaves(now = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
            if (_pendingSaves.size > 0 && (now - _lastFlush) >= 2500) {
                this.flushSaves(now);
            }
        },

        flushSaves(now = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
            _lastFlush = now;
            if (_pendingSaves.size === 0) return;
            const entries = Array.from(_pendingSaves.values());
            _pendingSaves.clear();
            for (let i = 0; i < entries.length; i++) {
                try { entries[i](); } catch (e) {}
            }
        },

        getPendingSaveCount() {
            return _pendingSaves.size;
        },

        getTextBadge(key, text, font, fill, stroke = null, lineWidth = 2.5) {
            if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
            const cached = _badgeCache.get(key);
            if (cached) return cached;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            ctx.font = font;
            const metrics = ctx.measureText(text);
            const sizeMatch = /(\d+(?:\.\d+)?)px/.exec(font);
            const fontPx = sizeMatch ? parseFloat(sizeMatch[1]) : 10;
            const padX = Math.ceil(lineWidth + 5);
            const padY = Math.ceil(lineWidth + 4);
            const w = Math.max(4, Math.ceil(metrics.width + padX * 2));
            const h = Math.max(4, Math.ceil(fontPx * 1.6 + padY * 2));

            canvas.width = w;
            canvas.height = h;
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (stroke) {
                ctx.lineJoin = 'round';
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = stroke;
                ctx.strokeText(text, w / 2, h / 2);
            }
            ctx.fillStyle = fill;
            ctx.fillText(text, w / 2, h / 2);

            const entry = { canvas, w, h, halfW: Math.round(w / 2), halfH: Math.round(h / 2) };
            if (_badgeCache.size >= 64) {
                const oldestKey = _badgeCache.keys().next().value;
                _badgeCache.delete(oldestKey);
            }
            _badgeCache.set(key, entry);
            return entry;
        },

        clearBadgeCache() {
            _badgeCache.clear();
        }
    };

    if (typeof window !== 'undefined') {
        window.PerfUtils = PerfUtils;
        if (typeof window.addEventListener === 'function') {
            window.addEventListener('pagehide', () => PerfUtils.flushSaves());
        }
    }
    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) PerfUtils.flushSaves();
        });
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = PerfUtils;
    }
})();
