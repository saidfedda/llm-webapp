// ========================================
// 🔑 هنا تضع مفتاح API الخاص بك
// ========================================
const API_KEY = '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';  // غير هذا بالمفتاح الحقيقي

// 🌐 رابط API - هذا هو الرابط الصحيح لا تغيره
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// 🤖 اسم النموذج - اختر واحد من الجدول تحت
const MODEL = 'llama-3.3-70b-versatile';  // الأقوى حالياً

// ========================================
// النماذج المتاحة (انسخ الاسم واستخدمه)
// ========================================
// llama3-70b-8192      ← الأقوى، يدعم العربية
// llama3-8b-8192       ← أسرع لكن أقل دقة
// gemma2-9b-it         ← من Google، جيد
// mixtral-8x7b-32768   ← تم إيقافه ❌ لا تستخدمه

// ========================================
// الكود الرئيسي (لا تغيره)
// ========================================
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';

    const typing = showTyping();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: 'أنت مساعد ذكي. أجب باللغة التي يسألك بها المستخدم.' },
                    { role: 'user', content: message }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`خطأ ${response.status}: ${error.substring(0, 100)}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        typing.remove();
        addMessage(reply, 'bot');
        
    } catch (error) {
        typing.remove();
        addMessage(`❌ خطأ: ${error.message}`, 'bot');
        console.error(error);
    }
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerHTML = `<div class="message-content">${text.replace(/\n/g, '<br>')}</div>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
    const div = document.createElement('div');
    div.className = 'message bot';
    div.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
}

sendBtn.onclick = sendMessage;
userInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
