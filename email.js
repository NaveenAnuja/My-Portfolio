/* ==========================================================================
   Contact form - EmailJS integration
   ========================================================================== */
(function () {
    'use strict';

    const EMAILJS_PUBLIC_KEY = 'VXDYkXXG4qMZYPC4U';
    const EMAILJS_SERVICE_ID = 'service_72ic4yf';
    const EMAILJS_TEMPLATE_ID = 'template_xvxuq3o';
    const DIRECT_EMAIL = 'naveenanuja996@gmail.com';

    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    const form = document.getElementById('contact-form');
    const sendBtn = document.getElementById('send-btn');
    if (!form) return;

    const fields = {
        name: document.getElementById('nameInput'),
        email: document.getElementById('emailInput'),
        subject: document.getElementById('subjectInput'),
        message: document.getElementById('massageInput')
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function notify(type, title, message) {
        if (typeof window.showToast === 'function') {
            window.showToast({ type, title, message });
            return;
        }
        console.warn(title, message);
    }

    function markError(input) {
        if (!input) return;
        input.classList.add('has-error');
        input.addEventListener('input', () => input.classList.remove('has-error'), { once: true });
    }

    function setLoading(isLoading) {
        if (!sendBtn) return;
        sendBtn.disabled = isLoading;
        sendBtn.innerHTML = isLoading
            ? '<i class="fa-solid fa-circle-notch fa-spin"></i><span>Sending...</span>'
            : '<i class="fa-solid fa-paper-plane"></i><span>Send Message</span>';
    }

    function getSendErrorMessage(error) {
        const detail = (error && (error.text || error.message)) ? String(error.text || error.message) : '';

        if (/invalid grant|gmail_api|reconnect your gmail/i.test(detail)) {
            return {
                title: 'Delivery service unavailable',
                message: `The email service needs to be reconnected. Please write to ${DIRECT_EMAIL} directly — I read every message.`
            };
        }

        if (/quota|limit exceeded/i.test(detail)) {
            return {
                title: 'Message limit reached',
                message: `The contact service is temporarily at capacity. Please email ${DIRECT_EMAIL} and I will respond promptly.`
            };
        }

        if (/template|variables/i.test(detail)) {
            return {
                title: 'Configuration issue',
                message: `Something went wrong on our side. Please reach out via ${DIRECT_EMAIL} for now.`
            };
        }

        return {
            title: 'Message not delivered',
            message: `Your message could not be sent right now. Please email ${DIRECT_EMAIL} directly and include your subject line.`
        };
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const values = {
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            subject: fields.subject.value.trim(),
            message: fields.message.value.trim()
        };

        const empty = Object.keys(values).filter(key => !values[key]);
        if (empty.length) {
            empty.forEach(key => markError(fields[key]));
            notify(
                'warning',
                'Almost there',
                'Please complete all fields — name, email, subject, and message — so I can get back to you properly.'
            );
            return;
        }

        if (!emailRegex.test(values.email)) {
            markError(fields.email);
            notify(
                'error',
                'Check your email address',
                'That email format does not look valid. Use something like name@example.com and try again.'
            );
            return;
        }

        setLoading(true);

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            from_name: values.name,
            from_email: values.email,
            subject: values.subject,
            message: values.message,
            reply_to: values.email
        }).then(function () {
            setLoading(false);
            form.reset();
            notify(
                'success',
                'Message sent successfully',
                `Thanks, ${values.name.split(' ')[0] || 'there'}! Your message is on its way — I typically reply within 24–48 hours.`
            );
        }).catch(function (error) {
            setLoading(false);
            const { title, message } = getSendErrorMessage(error);
            notify('error', title, message);
            console.error('Email send error:', error);
        });
    });
})();
