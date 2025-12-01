class CaesarCipher {
    constructor() {
        this.russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
        this.englishAlphabet = 'abcdefghijklmnopqrstuvwxyz';
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.querySelector('[data-action="encrypt"]')?.addEventListener('click', () => {
            this.encrypt();
        });

        document.querySelector('[data-action="decrypt"]')?.addEventListener('click', () => {
            this.decrypt();
        });

        document.querySelector('[data-action="crack"]')?.addEventListener('click', () => {
            this.crack();
        });

        document.getElementById('manualShift')?.addEventListener('input', (e) => {
            this.validateShift(e.target);
        });
    }
// шифрование
    encrypt() {
        const text = document.getElementById('text').value;
        const shift = parseInt(document.getElementById('manualShift').value);
        
        if (!text) {
            alert('Введите текст');
            return;
        }

        const result = this.process(text, shift, 'encrypt');
        document.getElementById('result').value = result;
    }
// дешифрование
    decrypt() {
        const text = document.getElementById('text').value;
        const shift = parseInt(document.getElementById('manualShift').value);
        
        if (!text) {
            alert('Введите текст');
            return;
        }

        const result = this.process(text, shift, 'decrypt');
        document.getElementById('result').value = result;
    }
// взлом
    crack() {
        const text = document.getElementById('text').value;
        
        if (!text) {
            alert('Введите текст');
            return;
        }

        const language = this.getLanguage(text);
        const maxShift = language === 'russian' ? 33 : 26;
        
        let allResults = '';
        
        for (let shift = 1; shift <= maxShift; shift++) {
            const result = this.process(text, shift, 'decrypt');
            allResults += `Сдвиг ${shift}: ${result}\n\n`;
        }

        document.getElementById('result').value = allResults;
    }

    getLanguage(text) {
        const Russian = /[а-яё]/i.test(text);
        const English = /[a-z]/i.test(text);
        
        if (Russian && !English) return 'russian';
        if (English && !Russian) return 'english';
        return 'russian'; // по умолчанию
    }
// шифр Цезаря
    process(text, shift, operation) {
        const language = this.getLanguage(text);
        const alphabet = language === 'russian' ? this.russianAlphabet : this.englishAlphabet;
        
        let result = '';

        for (let char of text) {
            const lowerChar = char.toLowerCase();
            const index = alphabet.indexOf(lowerChar);
            
            if (index === -1) {
                result += char;
                continue;
            }

            let newIndex;
            if (operation === 'encrypt') {
                newIndex = (index + shift) % alphabet.length;
            } else {
                newIndex = (index - shift + alphabet.length) % alphabet.length;
            }

            const newChar = alphabet[newIndex];
            result += char === char.toUpperCase() ? newChar.toUpperCase() : newChar;
        }

        return result;
    }

    validateShift(input) {
        let value = parseInt(input.value);
        const text = document.getElementById('text').value;
        const language = this.getLanguage(text);
        const max = language === 'russian' ? 33 : 26;
        
        if (isNaN(value) || value < 1) value = 1;
        if (value > max) value = max;
        
        input.value = value;
    }
}

export default CaesarCipher;