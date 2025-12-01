class VigenereCipher {
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
        document.querySelector('[data-action="vigenere-encrypt"]')?.addEventListener('click', () => {
            this.encrypt();
        });

        document.querySelector('[data-action="vigenere-decrypt"]')?.addEventListener('click', () => {
            this.decrypt();
        });

        document.getElementById('vigenere-key')?.addEventListener('input', (e) => {
            this.validateKey(e.target);
        });
    }

    // шифрование
    encrypt() {
        const text = document.getElementById('vigenere-text').value;
        const key = document.getElementById('vigenere-key').value;
        
        if (!text) {
            alert('Введите текст');
            return;
        }

        if (!key) {
            alert('Введите ключ');
            return;
        }

        const result = this.process(text, key, 'encrypt');
        document.getElementById('vigenere-result').value = result;
    }

    // дешифрование
    decrypt() {
        const text = document.getElementById('vigenere-text').value;
        const key = document.getElementById('vigenere-key').value;
        
        if (!text) {
            alert('Введите текст');
            return;
        }

        if (!key) {
            alert('Введите ключ');
            return;
        }

        const result = this.process(text, key, 'decrypt');
        document.getElementById('vigenere-result').value = result;
    }

    getLanguage(text) {
        const hasRussian = /[а-яё]/i.test(text);
        const hasEnglish = /[a-z]/i.test(text);
        
        if (hasRussian && !hasEnglish) return 'russian';
        if (hasEnglish && !hasRussian) return 'english';
        return 'russian'; 
    }

    // шифр Виженера
    process(text, key, operation) {
        const language = this.getLanguage(text);
        const alphabet = language === 'russian' ? this.russianAlphabet : this.englishAlphabet;
        
        let result = '';
        let keyIndex = 0;

        for (let char of text) {
            const lowerChar = char.toLowerCase();
            const index = alphabet.indexOf(lowerChar);
            
            if (index === -1) {
                result += char;
                continue;
            }

            let keyChar;
            do {
                keyChar = key[keyIndex % key.length].toLowerCase();
                keyIndex++;
            } while (alphabet.indexOf(keyChar) === -1 && keyIndex < key.length * 2); 

            const keyShift = alphabet.indexOf(keyChar);
            
            let newIndex;
            if (operation === 'encrypt') {
                newIndex = (index + keyShift) % alphabet.length;
            } else {
                newIndex = (index - keyShift + alphabet.length) % alphabet.length;
            }

            const newChar = alphabet[newIndex];
            result += char === char.toUpperCase() ? newChar.toUpperCase() : newChar;
        }

        return result;
    }

    validateKey(input) {
        if (!input.value.trim()) {
            input.style.borderColor = 'red';
        } else {
            input.style.borderColor = '';
        }
    }
}

export default VigenereCipher;