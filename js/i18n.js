class I18n {
    constructor() {
        this.currentLang = 'pt';
        this.translations = {
            'pt': {
                'combatZone': 'Zona de Combate',
                'rhythmZone': 'Solo de Guitarra',
                'scoreLabel': 'PONTOS',
                'killsLabel': 'ZUMBIS',
                'rockLabel': 'ROCK'
            },
            'en': {
                'combatZone': 'Combat Zone',
                'rhythmZone': 'Guitar Solo',
                'scoreLabel': 'SCORE',
                'killsLabel': 'KILLS',
                'rockLabel': 'ROCK'
            }
        };
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            this.updateDOM();
        }
    }

    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[this.currentLang][key]) {
                el.innerText = this.translations[this.currentLang][key];
            }
        });
    }

    t(key) {
        return this.translations[this.currentLang][key] || key;
    }
}

const i18n = new I18n();
window.addEventListener('DOMContentLoaded', () => i18n.updateDOM());
