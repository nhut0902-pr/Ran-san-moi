// script.js
document.addEventListener('DOMContentLoaded', () => {
    const waitlistForm = document.getElementById('waitlistForm');
    const statusMessage = document.getElementById('statusMessage');
    const submitBtn = waitlistForm.querySelector('button[type="submit"]');

    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;

        // Reset status message
        statusMessage.classList.add('d-none');
        statusMessage.className = 'mt-3';

        // Disable button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...';

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullname, email }),
            });

            const data = await response.json();

            if (data.success) {
                // Success
                statusMessage.textContent = data.message;
                statusMessage.classList.add('alert', 'alert-success');
                statusMessage.classList.remove('d-none');
                waitlistForm.reset();
            } else {
                // Error from server
                statusMessage.textContent = data.message;
                statusMessage.classList.add('alert', 'alert-danger');
                statusMessage.classList.remove('d-none');
            }
        } catch (error) {
            // Network error
            statusMessage.textContent = 'Không thể kết nối với máy chủ. Vui lòng thử lại sau.';
            statusMessage.classList.add('alert', 'alert-danger');
            statusMessage.classList.remove('d-none');
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Tham gia ngay';
        }
    });

    // Simple tab switching mock
    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Simple bottom nav mock
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
});
