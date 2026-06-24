// ==========================================================================
// CONFIGURATION: Google Sheets Integration
// This URL is your deployed Google Apps Script Web App endpoint.
// Follow the instructions in README.md to set this up.
// Example: 'https://script.google.com/macros/s/AKfycbz.../exec'
// ==========================================================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLqeX_mCTlFqE1hSBXPyKOLYYO1WSZZqf2F-fkYdLQHgKJvcPlnZU4T1dxmaFKrHKt/exec';
const isGoogleSheetsConfigured = () => /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(GOOGLE_SCRIPT_URL.trim());

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. Countdown Timer — Opening Date: June 27, 2026
    // ==========================================================================
    const countdownTarget = new Date('2026-06-27T00:00:00+05:30');

    const updateCountdown = () => {
        const now = new Date().getTime();
        const difference = countdownTarget.getTime() - now;

        if (difference <= 0) {
            document.getElementById('countdown').innerHTML = "<p style='font-size: 1.5rem; font-weight: 700; color: var(--brand-cyan);'>WE ARE NOW OPEN!</p>";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);


    // ==========================================================================
    // 2. Form Validation & Google Sheets Submission
    // ==========================================================================
    const leadForm = document.getElementById('leadForm');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');
    
    const inputs = {
        name: {
            el: document.getElementById('fullName'),
            errorEl: document.getElementById('nameError'),
            validate: (val) => val.trim().length >= 2
        },
        email: {
            el: document.getElementById('email'),
            errorEl: document.getElementById('emailError'),
            validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
        },
        phone: {
            el: document.getElementById('phone'),
            errorEl: document.getElementById('phoneError'),
            validate: (val) => /^[6-9]\d{9}$/.test(val.trim())
        },
        goal: {
            el: document.getElementById('goal'),
            errorEl: document.getElementById('goalError'),
            validate: (val) => val !== "" && val !== null
        }
    };

    // Remove error state on user input
    Object.keys(inputs).forEach(key => {
        const input = inputs[key];
        input.el.addEventListener('input', () => {
            input.el.closest('.form-group').classList.remove('error');
        });
        if (input.el.tagName === 'SELECT') {
            input.el.addEventListener('change', () => {
                input.el.closest('.form-group').classList.remove('error');
            });
        }
    });

    const setFormStatus = (message, type = 'error') => {
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.hidden = false;
    };

    const clearFormStatus = () => {
        formStatus.textContent = '';
        formStatus.hidden = true;
    };

    // Form Submission Handler
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormStatus();
        
        let isFormValid = true;

        Object.keys(inputs).forEach(key => {
            const input = inputs[key];
            const value = input.el.value;
            const isValid = input.validate(value);

            if (!isValid) {
                input.el.closest('.form-group').classList.add('error');
                isFormValid = false;
            } else {
                input.el.closest('.form-group').classList.remove('error');
            }
        });

        if (isFormValid) {
            // Show loading state
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span>Processing registration...</span>
                <svg class="icon-loading" viewBox="0 0 50 50" style="width: 20px; height: 20px; animation: rotate 1s linear infinite;">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="80 200" stroke-linecap="round"></circle>
                </svg>
            `;

            const leadData = {
                name: inputs.name.el.value.trim(),
                email: inputs.email.el.value.trim(),
                phone: inputs.phone.el.value.trim(),
                goal: inputs.goal.el.value,
                timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            };

            const handleSuccess = (data) => {
                document.getElementById('modalPhone').textContent = `+91 ${data.phone}`;
                document.getElementById('modalEmail').textContent = data.email;
                leadForm.reset();
                successModal.classList.add('active');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            };

            const saveLocal = (data) => {
                const currentLeads = JSON.parse(localStorage.getItem('bestfit_leads') || '[]');
                currentLeads.push(data);
                localStorage.setItem('bestfit_leads', JSON.stringify(currentLeads));
            };

            // Submit to Google Sheets via Google Apps Script
            if (isGoogleSheetsConfigured()) {
                // Build URL with query parameters (most reliable method for Apps Script)
                const params = new URLSearchParams({
                    name: leadData.name,
                    email: leadData.email,
                    phone: leadData.phone,
                    goal: leadData.goal
                });
                const url = GOOGLE_SCRIPT_URL + '?' + params.toString();

                try {
                    await fetch(url, { method: 'GET', mode: 'no-cors' });
                    saveLocal(leadData);
                    handleSuccess(leadData);
                } catch (err) {
                    console.error('Google Sheet submission error:', err);
                    saveLocal(leadData);
                    setFormStatus('We could not reach Google Sheets. Your details were saved locally as backup. Please try again in a moment.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            } else {
                // No Google Script URL configured — save locally only
                console.error('Google Sheets is not configured. Add your Apps Script Web App URL to GOOGLE_SCRIPT_URL in app.js.');
                saveLocal(leadData);
                setFormStatus('Google Sheets is not connected yet. Add your Apps Script Web App URL in app.js, then submit again.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    });

    // Modal Close Triggers
    const closeModal = () => {
        successModal.classList.remove('active');
    };

    closeModalBtn.addEventListener('click', closeModal);
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            closeModal();
        }
    });


    // ==========================================================================
    // 3. Copy Address to Clipboard
    // ==========================================================================
    const copyBtn = document.getElementById('copyAddressBtn');
    const copyText = document.getElementById('copyText');

    copyBtn.addEventListener('click', () => {
        const addressText = `best.fit powered by cult.fit, 5th Floor, Icon Shoppe, Shilpa Birla Compound, Behind Walmart, Kurnool, Andhra Pradesh - 518002, India`;
        
        navigator.clipboard.writeText(addressText).then(() => {
            copyText.textContent = "Address Copied!";
            copyBtn.style.borderColor = "#10b981";
            copyBtn.style.color = "#10b981";
            
            setTimeout(() => {
                copyText.textContent = "Copy Address";
                copyBtn.style.borderColor = "";
                copyBtn.style.color = "";
            }, 2500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });


    // ==========================================================================
    // 4. Scroll Reveal Animations (Intersection Observer)
    // ==========================================================================
    const totalFounderSlots = 100;
    const baseRemainingSlots = 37;
    const savedLeads = JSON.parse(localStorage.getItem('bestfit_leads') || '[]').length;
    const slotsRemaining = Math.max(12, baseRemainingSlots - savedLeads);
    const slotsRemainingEl = document.getElementById('slotsRemaining');
    const slotsMeter = document.getElementById('slotsMeter');

    if (slotsRemainingEl && slotsMeter) {
        slotsRemainingEl.textContent = slotsRemaining;
        slotsMeter.style.width = `${(slotsRemaining / totalFounderSlots) * 100}%`;
    }

    const revealElements = document.querySelectorAll('.program-card, .offer-panel, .proof-list article, .register-copy, .register-form-wrapper, .location-card, .map-container');
    
    const style = document.createElement('style');
    style.innerHTML = `
        .reveal-hidden {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        el.classList.add('reveal-hidden');
        revealObserver.observe(el);
    });
});

// Loading spinner CSS animation
const spinStyle = document.createElement('style');
spinStyle.innerHTML = `
    @keyframes rotate {
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(spinStyle);
