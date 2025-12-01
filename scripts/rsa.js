class RSA {
    constructor() {
        this.currentKeys = null;
        
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
        document.querySelector('[data-action="rsa-generate-keys"]')?.addEventListener('click', () => {
            this.generateKeys();
        });

        document.querySelector('[data-action="rsa-encrypt"]')?.addEventListener('click', () => {
            this.encrypt();
        });

        document.querySelector('[data-action="rsa-decrypt"]')?.addEventListener('click', () => {
            this.decrypt();
        });
    }

    generatePrime(min = 100, max = 1000) {
        while (true) {
            const candidate = Math.floor(Math.random() * (max - min)) + min;
            const oddCandidate = candidate % 2 === 0 ? candidate + 1 : candidate;
            
            if (this.isPrime(oddCandidate)) {
                return oddCandidate;
            }
        }
    }

    isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        return true;
    }

    generateKeys() {
        const p = this.generatePrime(100, 500);
        let q;
        do {
            q = this.generatePrime(100, 500);
        } while (q === p);
        
        const N = p * q;
        const phi = (p - 1) * (q - 1);
        
        let E = 17;
        while (this.gcd(E, phi) !== 1) {
            E = this.generatePrime(3, 50);
        }
        
        const D = this.modInverse(E, phi);
        
        this.currentKeys = {
            publicKey: { E, N },
            privateKey: { D, N }
        };
        
        document.getElementById('public-key').textContent = `E=${E}, N=${N}`;
        document.getElementById('private-key').textContent = `D=${D}, N=${N}`;
        document.getElementById('keys-container').style.display = 'block';
    }

    encrypt() {
        if (!this.currentKeys) {
            alert('Сначала сгенерируйте ключи');
            return;
        }

        const text = document.getElementById('rsa-text').value.trim();
        
        if (!text) {
            alert('Введите текст для шифрования');
            return;
        }

        const result = this.encryptText(text, this.currentKeys.publicKey);
        document.getElementById('rsa-result').value = result;
    }

    decrypt() {
        if (!this.currentKeys) {
            alert('Сначала сгенерируйте ключи');
            return;
        }

        const text = document.getElementById('rsa-text').value.trim();
        
        if (!text) {
            alert('Введите зашифрованный текст');
            return;
        }

        const result = this.decryptText(text, this.currentKeys.privateKey);
        document.getElementById('rsa-result').value = result;
    }

    encryptText(message, publicKey) {
        const { E, N } = publicKey;
        const encrypted = [];
        
        for (let i = 0; i < message.length; i++) {
            const charCode = message.charCodeAt(i);
            const encryptedChar = this.modPow(charCode, E, N);
            encrypted.push(encryptedChar);
        }
        
        return encrypted.join(' ');
    }

    decryptText(encryptedText, privateKey) {
        const { D, N } = privateKey;
        const encryptedChars = encryptedText.split(' ').filter(x => x !== '');
        
        let decrypted = '';
        
        for (const char of encryptedChars) {
            const encryptedChar = parseInt(char, 10);
            const decryptedChar = this.modPow(encryptedChar, D, N);
            decrypted += String.fromCharCode(decryptedChar);
        }
        
        return decrypted;
    }

    gcd(a, b) {
        while (b !== 0) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    modInverse(e, phi) {
        let [a, b] = [e, phi];
        let [x0, x1] = [1, 0];
        
        while (b > 0) {
            const quotient = Math.floor(a / b);
            [a, b] = [b, a % b];
            [x0, x1] = [x1, x0 - quotient * x1];
        }
        
        return x0 < 0 ? x0 + phi : x0;
    }

    modPow(base, exponent, modulus) {
        let result = 1n;
        let baseBig = BigInt(base);
        let exponentBig = BigInt(exponent);
        let modulusBig = BigInt(modulus);
        
        baseBig = baseBig % modulusBig;
        
        while (exponentBig > 0) {
            if (exponentBig % 2n === 1n) {
                result = (result * baseBig) % modulusBig;
            }
            exponentBig = exponentBig / 2n;
            baseBig = (baseBig * baseBig) % modulusBig;
        }
        
        return Number(result);
    }
}

export default RSA;