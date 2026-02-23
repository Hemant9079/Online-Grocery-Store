/**
 * One-time script to create an admin account via the admin-register API.
 * Usage: node scripts/makeAdmin.js
 *
 * Make sure the server is running first (npm run dev)
 */

const API_URL = 'http://127.0.0.1:5000';

// ── EDIT THESE ────────────────────────────────────────────
const ADMIN_USERNAME = 'hemant_admin';
const ADMIN_EMAIL = 'hkumar954995@gmail.com';
const ADMIN_PASSWORD = 'admin1234';
const ADMIN_SECRET = 'fastmart_admin_2024';   // must match ADMIN_SECRET in .env
// ─────────────────────────────────────────────────────────

async function createAdmin() {
    try {
        const res = await fetch(`${API_URL}/api/admin/admin-register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: ADMIN_USERNAME,
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                adminSecret: ADMIN_SECRET,
            }),
        });
        const data = await res.json();
        if (res.ok) {
            console.log('✅ Admin account created!');
            console.log(`   Email:    ${ADMIN_EMAIL}`);
            console.log(`   Password: ${ADMIN_PASSWORD}`);
            console.log('\nNow log in at http://localhost:5173/login using the 🛡️ Admin Login toggle.');
        } else {
            console.error('❌ Failed:', data.message);
        }
    } catch (err) {
        console.error('❌ Network error. Is the server running?', err.message);
    }
}

createAdmin();
