const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const run = async () => {
    const token = jwt.sign({ userId: 'dummy', role: 'hr' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    try {
        const res = await axios.get('http://localhost:5000/api/challenges', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Got ${res.data.length} challenges`);
        console.log(res.data[0]);
    } catch (e) {
        console.error('Error:', e.response ? e.response.data : e.message);
    }
};

run();
