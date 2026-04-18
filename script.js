// ========================================
// إعدادات API - Groq Cloud
// ========================================
const API_KEY = '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';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'mixtral-8x7b-32768';

// عناصر الصفحة
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// ========================================
// إرسال الرسالة
// ========================================
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // إضافة رسالة المستخدم
    addMessage(message, 'user');
    userInput.value = '';
    userInput.focus();

    // إظهار مؤشر الكتابة
    const typingIndicator = showTypingIndicator();

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
                    { 
                        role: 'system', 
                        content: 'أنت مساعد ذكي ومفيد. أجب باللغة التي يسألك بها المستخدم (عربية أو إنجليزية). كن دقيقاً ومختصراً.'
                    },
                    { 
                        role: 'user', 
                        content: message 
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'فشل في الاتصال');
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        // إزالة مؤشر الكتابة وإضافة الرد
        typingIndicator.remove();
        addMessage(reply, 'bot');

    } catch (error) {
        typingIndicator.remove();
        addMessage(`❌ عذراً! ${error.message}`, 'bot');
        console.error('Error:', error);
    }
}

// ========================================
// عرض الرسالة في واجهة الدردشة
// ========================================
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.innerHTML = text.replace(/\n/g, '<br>');
    
    messageDiv.appendChild(contentDiv);
    chatBox.appendChild(messageDiv);
    
    // التمرير للأسفل
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ========================================
// مؤشر الكتابة المتحرك
// ========================================
function showTypingIndicator() {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.classList.add('message', 'bot');
    
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing');
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    
    indicatorDiv.appendChild(typingDiv);
    chatBox.appendChild(indicatorDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return indicatorDiv;
}

// ========================================
// الأحداث (Event Listeners)
// ========================================
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// رسالة ترحيب إضافية بعد التحميل
console.log('✅ التطبيق جاهز | Groq API | Model: ' + MODEL);
