class RC5 {
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
        document.querySelector('[data-action="rc5-encrypt"]')?.addEventListener('click', () => this.encrypt());
        document.querySelector('[data-action="rc5-decrypt"]')?.addEventListener('click', () => this.decrypt());
    }

    mod32(x) {
        return x >>> 0;
    }

    rotl(x, shift) {
        shift = shift & 31;
        return this.mod32((x << shift) | (x >>> (32 - shift)));
    }

    rotr(x, shift) {
        shift = shift & 31;
        return this.mod32((x >>> shift) | (x << (32 - shift)));
    }

    generateKeys(keyByte, rounds = 12) {
        const P = 0xB7E15163;
        const Q = 0x9E3779B9;
        const t = 2 * (rounds + 1);

        const keyBytes = new Uint8Array(16);
        for (let i = 0; i < 16; i++) {
            keyBytes[i] = (keyByte + i) & 0xFF;
        }

        const c = 4;
        let L = new Array(c).fill(0);
        
        for (let i = 0; i < 16; i++) {
            const wordIndex = Math.floor(i / 4);
            const byteIndex = i % 4;
            L[wordIndex] = this.mod32(L[wordIndex] | (keyBytes[i] << (8 * byteIndex)));
        }

        let S = new Array(t);
        S[0] = P;
        for (let i = 1; i < t; i++) {
            S[i] = this.mod32(S[i - 1] + Q);
        }

        let i = 0, j = 0;
        let A = 0, B = 0;
        const maxCount = 3 * Math.max(t, c);

        for (let k = 0; k < maxCount; k++) {
            A = S[i] = this.rotl(this.mod32(S[i] + A + B), 3);
            B = L[j] = this.rotl(this.mod32(L[j] + A + B), this.mod32(A + B));
            i = (i + 1) % t;
            j = (j + 1) % c;
        }

        return S;
    }

    encryptBlock(block, S, rounds) {
        let [A, B] = block;
        
        A = this.mod32(A + S[0]);
        B = this.mod32(B + S[1]);

        for (let i = 1; i <= rounds; i++) {
            A = this.mod32(this.rotl(A ^ B, B) + S[2 * i]);
            B = this.mod32(this.rotl(B ^ A, A) + S[2 * i + 1]);
        }

        return [A, B];
    }

    decryptBlock(block, S, rounds) {
        let [A, B] = block;

        for (let i = rounds; i >= 1; i--) {
            B = this.rotr(this.mod32(B - S[2 * i + 1]), A) ^ A;
            A = this.rotr(this.mod32(A - S[2 * i]), B) ^ B;
        }

        B = this.mod32(B - S[1]);
        A = this.mod32(A - S[0]);

        return [A, B];
    }

    addPadding(data) {
        const blockSize = 8;
        const paddingLength = blockSize - (data.length % blockSize);
        const padded = new Uint8Array(data.length + paddingLength);
        padded.set(data);
        for (let i = data.length; i < padded.length; i++) {
            padded[i] = paddingLength;
        }
        return padded;
    }

    removePadding(data) {
        const paddingLength = data[data.length - 1];
        return data.subarray(0, data.length - paddingLength);
    }

    bytesToBlocks(bytes) {
        const blocks = [];
        for (let i = 0; i < bytes.length; i += 8) {
            let A = 0, B = 0;
            
            for (let j = 0; j < 4; j++) {
                if (i + j < bytes.length) {
                    A = this.mod32(A | (bytes[i + j] << (8 * j)));
                }
            }
            
            for (let j = 0; j < 4; j++) {
                if (i + 4 + j < bytes.length) {
                    B = this.mod32(B | (bytes[i + 4 + j] << (8 * j)));
                }
            }
            
            blocks.push([A, B]);
        }
        return blocks;
    }

    blocksToBytes(blocks) {
        const totalBytes = blocks.length * 8;
        const bytes = new Uint8Array(totalBytes);
        
        for (let i = 0; i < blocks.length; i++) {
            const [A, B] = blocks[i];
            const offset = i * 8;
            
            for (let j = 0; j < 4; j++) {
                bytes[offset + j] = (A >>> (8 * j)) & 0xFF;
            }
            
            for (let j = 0; j < 4; j++) {
                bytes[offset + 4 + j] = (B >>> (8 * j)) & 0xFF;
            }
        }
        
        return bytes;
    }

    toBase64(bytes) {
        return btoa(String.fromCharCode(...bytes));
    }

    fromBase64(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    encrypt() {
        const text = document.getElementById('rc5-text').value;
        const rounds = parseInt(document.getElementById('rc5-rounds').value) || 12;
        const key = parseInt(document.getElementById('rc5-key').value);

        if (!text.trim()) {
            alert('Введите текст для шифрования');
            return;
        }

        if (isNaN(key)) {
            alert('Введите числовой ключ');
            return;
        }

        if (rounds === 0) {
            alert('Количество раундов не может быть 0');
            return;
        }

        try {
            const S = this.generateKeys(key, rounds);
            const textBytes = new TextEncoder().encode(text);
            const paddedBytes = this.addPadding(textBytes);
            const blocks = this.bytesToBlocks(paddedBytes);
            const encryptedBlocks = blocks.map(block => this.encryptBlock(block, S, rounds));
            const encryptedBytes = this.blocksToBytes(encryptedBlocks);
            const result = this.toBase64(encryptedBytes);
            
            document.getElementById('rc5-result').value = result;
        } catch (error) {
            alert('Ошибка при шифровании: ' + error.message);
        }
    }

    decrypt() {
        const encryptedText = document.getElementById('rc5-text').value.trim();
        const rounds = parseInt(document.getElementById('rc5-rounds').value) || 12;
        const key = parseInt(document.getElementById('rc5-key').value);

        if (!encryptedText) {
            alert('Введите зашифрованный текст');
            return;
        }

        if (isNaN(key)) {
            alert('Введите числовой ключ');
            return;
        }

        if (rounds === 0) {
            alert('Количество раундов не может быть 0');
            return;
        }

        try {
            const S = this.generateKeys(key, rounds);
            const encryptedBytes = this.fromBase64(encryptedText);
            const blocks = this.bytesToBlocks(encryptedBytes);
            const decryptedBlocks = blocks.map(block => this.decryptBlock(block, S, rounds));
            const decryptedBytes = this.blocksToBytes(decryptedBlocks);
            const unpaddedBytes = this.removePadding(decryptedBytes);
            const result = new TextDecoder().decode(unpaddedBytes);
            
            document.getElementById('rc5-result').value = result;
        } catch (error) {
            alert('Ошибка при дешифровании: ' + error.message);
        }
    }
}

export default RC5;