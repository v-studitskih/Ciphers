class RC4Cipher {
    constructor() {
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
        document.querySelector('[data-action="rc4-encrypt"]')?.addEventListener('click', () => {
            this.encrypt();
        });

        document.querySelector('[data-action="rc4-decrypt"]')?.addEventListener('click', () => {
            this.decrypt();
        });

        document.getElementById('rc4-key')?.addEventListener('input', (e) => {
            this.validateKey(e.target);
        });
    }

    encrypt() {
        const text = document.getElementById('rc4-text').value;
        const key = document.getElementById('rc4-key').value;

        if (!text) {
            alert('Введите текст');
            return;
        }

        if (!key) {
            alert('Введите ключ');
            return;
        }


        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const encryptedBytes = this.rc4(data, key);
        const base64 = this.bytesToBase64(encryptedBytes);

        document.getElementById('rc4-result').value = base64;
    }

    decrypt() {
        const text = document.getElementById('rc4-text').value;
        const key = document.getElementById('rc4-key').value;

        if (!text) {
            alert('Введите текст');
            return;
        }

        if (!key) {
            alert('Введите ключ');
            return;
        }


        const encryptedBytes = this.base64ToBytes(text);
        const decryptedBytes = this.rc4(encryptedBytes, key);
        const decoder = new TextDecoder();
        const result = decoder.decode(decryptedBytes);

        document.getElementById('rc4-result').value = result;
    }

    rc4(data, key) {
        const s = this.initSBlock(key);
        let i = 0;
        let j = 0;
        const result = new Uint8Array(data.length);

        for (let n = 0; n < data.length; n++) {
            i = (i + 1) % 256;
            j = (j + s[i]) % 256;
            [s[i], s[j]] = [s[j], s[i]];
            const t = (s[i] + s[j]) % 256;
            const k = s[t];
            result[n] = data[n] ^ k;
        }

        return result;
    }

    initSBlock(key) {
        const s = new Uint8Array(256);

        for (let i = 0; i < 256; i++) {
            s[i] = i;
        }

        let j = 0;
        for (let i = 0; i < 256; i++) {
            j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
            [s[i], s[j]] = [s[j], s[i]];
        }

        return s;
    }

    bytesToBase64(bytes) {
        return btoa(String.fromCharCode(...bytes));
    }

    base64ToBytes(base64) {
        return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    }

    validateKey(input) {
        if (!input.value.trim()) {
            input.style.borderColor = 'red';
        } else {
            input.style.borderColor = '';
        }
    }
}

export default RC4Cipher;