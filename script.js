const API_KEY = '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';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

let currentModel = 'llama-3.3-70b-versatile';
let messageCount = 0;

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearChat');
const currentModelSpan = document.getElementById('currentModel');
const responseSpeedSpan = document.getElementById('responseSpeed');

document.querySelectorAll('.model-option').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.model-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        currentModel = opt.dataset.model;
        
        if (currentModel === 'llama-3.3-70b-versatile') {
            currentModelSpan.textContent = 'Llama 70B';
            responseSpeedSpan.textContent = '🚀 قوي';
        } else {
            currentModelSpan.textContent = 'Llama 8B';
            responseSpeedSpan.textContent = '⚡ سريع';
        }
    });
});

document.querySelectorAll('.model-option')[0].classList.add('active');

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';

    const typing = showTyping();
    const startTime = Date.now();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: currentModel,
                messages: [{ role: 'user', content: message }],
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error('خطأ في الاتصال');

        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        const endTime = Date.now();
        const timeSec = ((endTime - startTime) / 1000).toFixed(1);
        
        typing.remove();
        addMessage(reply, 'bot');
        
        responseSpeedSpan.textContent = `${timeSec} ثانية`;
        messageCount++;
        
        setTimeout(() => {
            if (!responseSpeedSpan.textContent.includes('ثانية')) {
                responseSpeedSpan.textContent = 'جاهز';
            }
        }, 2000);
        
    } catch (error) {
        typing.remove();
        addMessage('❌ خطأ: تأكد من مفتاح API', 'bot');
        responseSpeedSpan.textContent = 'خطأ';
    }
}

function addMessage(text, sender) {
    const welcome = document.querySelector('.welcome');
    if (welcome) welcome.remove();
    
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerHTML = `<div class="message-content">${text.replace(/\n/g, '<br>')}</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    const div = document.createElement('div');
    div.className = 'message bot';
    div.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

clearBtn.onclick = () => {
    chatMessages.innerHTML = '<div class="welcome">✨ تم مسح المحادثة</div>';
    messageCount = 0;
    responseSpeedSpan.textContent = 'جاهز';
};

sendBtn.onclick = sendMessage;
userInput.onkeypress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// ========================================
// إظهار وإخفاء القائمة للجوال
// ========================================
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// إغلاق القائمة عند الضغط على أي خيار (للهواتف)
document.querySelectorAll('.model-option, #clearChat').forEach(el => {
    el.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    });
});
