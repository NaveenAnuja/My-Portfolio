/* ==========================================================================
   Contact form - EmailJS integration
   ========================================================================== */
(function () {
    'use strict';

    const EMAILJS_PUBLIC_KEY = 'VXDYkXXG4qMZYPC4U';
    const EMAILJS_SERVICE_ID = 'service_72ic4yf';
    const EMAILJS_TEMPLATE_ID = 'template_xvxuq3o';

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

    const alertTheme = {
        background: '#0b1020',
        color: '#e8eef7',
        confirmButtonColor: '#6366f1'
    };

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
            Swal.fire(Object.assign({
                icon: 'warning',
                title: 'Missing details',
                text: 'Please fill in all fields before sending.'
            }, alertTheme));
            return;
        }

        if (!emailRegex.test(values.email)) {
            markError(fields.email);
            Swal.fire(Object.assign({
                icon: 'error',
                title: 'Invalid email',
                text: 'Please enter a valid email address so I can reply.'
            }, alertTheme));
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
            Swal.fire(Object.assign({
                icon: 'success',
                title: 'Message sent!',
                text: 'Thanks for reaching out. I will get back to you shortly.'
            }, alertTheme));
        }).catch(function (error) {
            setLoading(false);
            Swal.fire(Object.assign({
                icon: 'error',
                title: 'Something went wrong',
                text: 'The message could not be sent. Please email naveenanuja996@gmail.com directly.'
            }, alertTheme));
            console.error('Email send error:', error);
        });
    });
})();
