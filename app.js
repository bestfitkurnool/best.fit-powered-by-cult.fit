// ==========================================================================
// CONFIGURATION: Google Sheets Spreadsheet API URL (via Google Apps Script Web App)
// Paste your deployed Google Apps Script Web App URL here to save leads directly
// to an Excel-like Spreadsheet in your Google Drive folder.
// Example: 'https://script.google.com/macros/s/AKfycbz...-xyz/exec'
// ==========================================================================
const GOOGLE_SCRIPT_URL = '';

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. Countdown Timer (Sets target to 45 days from current date)
    // ==========================================================================
    const countdownTarget = new Date();
    countdownTarget.setDate(countdownTarget.getDate() + 45); // 45 days countdown

    const updateCountdown = () => {
        const now = new Date().getTime();
        const difference = countdownTarget.getTime() - now;

        if (difference <= 0) {
            document.getElementById('countdown').innerHTML = "<p style='font-size: 1.5rem; font-weight: 700; color: var(--accent-orange);'>WE ARE NOW OPEN!</p>";
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

    // Run immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);


    // ==========================================================================
    // 2. Form Validation & Local Storage Persistence
    // ==========================================================================
    const leadForm = document.getElementById('leadForm');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Inputs & Errors
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
            validate: (val) => /^[6-9]\d{9}$/.test(val.trim()) // Indian mobile number pattern
        },
        goal: {
            el: document.getElementById('goal'),
            errorEl: document.getElementById('goalError'),
            validate: (val) => val !== "" && val !== null
        }
    };

    // Remove error class on input
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

    // Form Submission
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isFormValid = true;

        // Perform validation
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

            // Collect data
            const leadData = {
                id: 'lead_' + Date.now(),
                name: inputs.name.el.value.trim(),
                email: inputs.email.el.value.trim(),
                phone: inputs.phone.el.value.trim(),
                goal: inputs.goal.el.value,
                timestamp: new Date().toISOString()
            };

            // Success handler helper
            const handleSuccess = (data) => {
                // Populate Modal Data
                document.getElementById('modalPhone').textContent = `+91 ${data.phone}`;
                document.getElementById('modalEmail').textContent = data.email;

                // Reset Form
                leadForm.reset();

                // Show Success Modal
                successModal.classList.add('active');

                // Reset Button State
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            };

            // Local storage fallback helper
            const saveLocal = (data) => {
                const currentLeads = JSON.parse(localStorage.getItem('bestfit_leads') || '[]');
                currentLeads.push(data);
                localStorage.setItem('bestfit_leads', JSON.stringify(currentLeads));
            };

            // If Google Apps Script Web App URL is configured, send the data there
            if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL.trim() !== "") {
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // standard way to avoid CORS failures on redirect
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(leadData)
                })
                .then(() => {
                    saveLocal(leadData); // Keep local backup as well
                    handleSuccess(leadData);
                })
                .catch(err => {
                    console.error('Error submitting to Google Sheet:', err);
                    // Fallback to local storage on error
                    saveLocal(leadData);
                    handleSuccess(leadData);
                });
            } else {
                // If not configured, default to local storage saving with a short visual delay
                setTimeout(() => {
                    saveLocal(leadData);
                    handleSuccess(leadData);
                }, 1200);
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
    // 3. Copy Address Clipboard functionality
    // ==========================================================================
    const copyBtn = document.getElementById('copyAddressBtn');
    const copyText = document.getElementById('copyText');

    copyBtn.addEventListener('click', () => {
        const addressText = `best.fit powered by cult.fit, 5th Floor, Icon Shoppe, Shilpa Birla Compound, Behind Walmart, Kurnool, Andhra Pradesh - 518002, India`;
        
        navigator.clipboard.writeText(addressText).then(() => {
            // Visual success feedback
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
    const revealElements = document.querySelectorAll('.feature-card, .hero-card, .register-info, .register-form-wrapper, .location-info-card, .hours-card, .map-container');
    
    // Add CSS initial state for scroll reveal
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

// Loading spinner CSS animation helper
const spinStyle = document.createElement('style');
spinStyle.innerHTML = `
    @keyframes rotate {
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(spinStyle);
