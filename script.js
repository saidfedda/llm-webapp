// ========================================
// 🔑 إعدادات API - Groq Cloud
// ========================================
const API_KEY = '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';  // غير هذا بمفتاحك
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// النماذج المتاحة
const MODELS = {
    powerful: 'llama-3.3-70b-versatile',  // قوي ودقيق
    fast: 'llama-3.1-8b-instant'          // سريع جداً
};

// عناصر الصفحة
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const modelSelect = document.getElementById('modelSelect');
const currentModelBadge = document.getElementById('currentModelBadge');
const responseTimeSpan = document.getElementById('responseTime');

// تغيير اسم النموذج في الشارة عند التبديل
modelSelect.addEventListener('change', () => {
    const selected = modelSelect.value;
    if (selected === MODELS.powerful) {
        currentModelBadge.textContent = '🚀 Llama 70B';
        currentModelBadge.style.background = 'rgba(255,255,255,0.3)';
    } else {
        currentModelBadge.textContent = '⚡ Llama 8B';
        currentModelBadge.style.background = 'rgba(255,255,255,0.2)';
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';

    const typing = showTyping();
    
    // تسجيل وقت البداية لحساب سرعة الاستجابة
    const startTime = Date.now();
    
    // النموذج المختار
    const selectedModel = modelSelect.value;
    const modelName = selectedModel === MODELS.powerful ? 'Llama 70B (قوي)' : 'Llama 8B (سريع)';
    
    responseTimeSpan.textContent = `⏳ جاري الرد باستخدام ${modelName}...`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [
                    { 
                        role: 'system', 
                        content: 'أنت مساعد ذكي ومفيد. أجب باللغة التي يسألك بها المستخدم. كن دقيقاً ومختصراً في الإجابات البسيطة، ومفصلاً في الإجابات المعقدة.'
                    },
                    { 
                        role: 'user', 
                        content: message 
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`خطأ ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        // حساب وقت الاستجابة
        const endTime = Date.now();
        const responseTime = (endTime - startTime) / 1000;
        
        typing.remove();
        addMessage(reply, 'bot');
        
        // عرض وقت الاستجابة
        responseTimeSpan.innerHTML = `⚡ رد في ${responseTime.toFixed(1)} ثانية باستخدام ${modelName}`;
        
        // إخفاء وقت الاستجابة بعد 3 ثواني
        setTimeout(() => {
            if (responseTimeSpan.innerHTML.includes('رد في')) {
                responseTimeSpan.innerHTML = '✨ جاهز';
            }
        }, 3000);
        
    } catch (error) {
        typing.remove();
        addMessage(`❌ خطأ: ${error.message}`, 'bot');
        responseTimeSpan.innerHTML = '⚠️ حدث خطأ';
        console.error(error);
    }
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    
    // معالجة النص (تحويل الروابط والنقاط)
    let formattedText = text;
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    div.innerHTML = `<div class="message-content">${formattedText}</div>`;
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

// إرسال بالضغط على Enter
sendBtn.onclick = sendMessage;
userInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

// رسالة ترحيب عند التحميل
console.log('✅ التطبيق جاهز | النماذج: قوي + سريع');
