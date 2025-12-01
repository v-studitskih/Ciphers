class BugFeatureButton {
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
        const button = document.querySelector('.bug-feature-btn');
        if (!button) return;

        this.originalText = button.textContent;
        this.isActive = false;

        button.addEventListener('mouseenter', (e) => {
            this.handleMove(e);
        });

        button.addEventListener('focus', (e) => {
            this.handleMove(e);
        });

        button.addEventListener('click', (e) => {
            this.handleClick(e);
        });
    }

    handleMove(e) {
        if (this.isActive) return;

        const button = e.target;
        
        button.style.transform = 'translate(0, 0)';
        
        requestAnimationFrame(() => {
            if (this.isActive) return;
            
            const maxShift = 100; 
            const shiftX = (Math.random() * maxShift * 2) - maxShift; 
            const shiftY = (Math.random() * maxShift * 2) - maxShift; 
            
            button.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            
            setTimeout(() => {
                if (!this.isActive) {
                    button.style.transform = 'translate(0, 0)';
                }
            }, 500);
        });
    }

    handleClick(e) {
        e.preventDefault();

        const button = e.target;
        if (!this.isActive) {
            this.activateFeatureNotFound(button);
        }
    }

    activateFeatureNotFound(button) {
        this.isActive = true;
        
        button.style.transform = 'translate(0, 0)';
        
        button.textContent = "Ошибка: слишком харизматичный клик";
        button.style.background = '#6c757d';
        button.style.cursor = 'not-allowed';

        setTimeout(() => {
            this.resetButton(button);
        }, 3000);
    }

    resetButton(button) {
        this.isActive = false;
        button.textContent = this.originalText;
        button.style.background = '';
        button.style.cursor = '';
        button.style.transform = 'translate(0, 0)';
    }
}

export default BugFeatureButton;