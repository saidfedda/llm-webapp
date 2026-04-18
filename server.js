const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// خدمة الملفات الثابتة
app.use(express.static(__dirname));

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// صفحة معلومات API (اختياري)
app.get('/api-info', (req, res) => {
    res.json({
        provider: 'Groq Cloud',
        model: 'mixtral-8x7b-32768',
        context_length: 32768,
        features: ['Arabic', 'English', 'Fast responses', 'Free'],
        documentation: 'https://console.groq.com/docs'
    });
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
    console.log(`🤖 نموذج Groq API: mixtral-8x7b-32768`);
});
