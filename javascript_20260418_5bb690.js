// Configuration
const API_KEY = 'YOUR_GROQ_API_KEY'; // استبدل بمفتاحك من https://console.groq.com
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChat');
const exportChatBtn = document.getElementById('exportChat');
const themeToggle = document.getElementById('themeToggle');
const fileInput = document.getElementById('fileInput');

// State
let conversationHistory = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    setupEventListeners();
    autoResizeTextarea();
});

function setupEventListeners() {
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    clearChatBtn.addEventListener('click', clearChat);
    exportChatBtn.addEventListener('click', exportChat);
    themeToggle.addEventListener('click', toggleTheme);
    fileInput.addEventListener('change', handleFileUpload);
    
    // Suggestion buttons
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent.replace(/[📝💻🎨📚]/g, '').trim();
            userInput.value = text;
            sendMessage();
        });
    });
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Clear welcome message if exists
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) welcomeMsg.remove();

    // Add user message
    addMessage(message, 'user');
    userInput.value = '';
    autoResizeTextarea();

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    // Disable send button
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [
                    {
                        role: 'system',
                        content: 'أنت مساعد ذكي، ودود، ومحترف. أجب باللغة العربية دائماً، وكن مفيداً ودقيقاً.'
                    },
                    ...conversationHistory,
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 2000,
                top_p: 1
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'خطأ في الاتصال');
        }

        const data = await response.json();
        const botReply = data.choices[0].message.content;

        // Remove typing indicator
        typingIndicator.remove();

        // Add bot message
        addMessage(botReply, 'bot');

        // Save to history
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: botReply }
        );

        // Limit history size
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

    } catch (error) {
        typingIndicator.remove();
        addMessage(`❌ عذراً، حدث خطأ: ${error.message}`, 'bot');
        console.error('Error:', error);
    } finally {
        sendBtn.disabled = false;
        sendBtn.style.opacity = '1';
        userInput.focus();
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    // Format text with markdown-like syntax
    let formattedText = text;
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedText = formattedText.replace(/`(.*?)`/g, '<code>$1</code>');
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    // Handle code blocks
    formattedText = formattedText.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
    });
    
    messageDiv.innerHTML = formattedText;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return messageDiv;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(indicator);
    
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return indicator;
}

function clearChat() {
    if (confirm('هل أنت متأكد من مسح المحادثة؟')) {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">✨</div>
                <h3>تم مسح المحادثة</h3>
                <p>كيف يمكنني مساعدتك الآن؟</p>
                <div class="suggestions">
                    <button class="suggestion-btn">📝 اكتب لي مقالاً</button>
                    <button class="suggestion-btn">💻 ساعدني في كود برمجي</button>
                    <button class="suggestion-btn">🎨 أعطِني أفكاراً إبداعية</button>
                    <button class="suggestion-btn">📚 لخص لي نصاً</button>
                </div>
            </div>
        `;
        conversationHistory = [];
        
        // Reattach suggestion listeners
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.textContent.replace(/[📝💻🎨📚]/g, '').trim();
                userInput.value = text;
                sendMessage();
            });
        });
    }
}

function exportChat() {
    const messages = Array.from(document.querySelectorAll('.message')).map(msg => {
        const sender = msg.classList.contains('user') ? '👤 أنت' : '🤖 المساعد';
        const text = msg.innerText;
        return `${sender}:\n${text}\n`;
    }).join('\n---\n');
    
    const blob = new Blob([messages], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
}

function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
}

userInput.addEventListener('input', autoResizeTextarea);

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const content = event.target.result;
        userInput.value = `قم بتحليل هذا النص:\n\n${content.substring(0, 2000)}`;
        autoResizeTextarea();
        sendMessage();
    };
    reader.readAsText(file);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Voice input (optional)
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    
    const voiceBtn = document.createElement('button');
    voiceBtn.textContent = '🎤';
    voiceBtn.className = 'tool-btn';
    voiceBtn.title = 'إدخال صوتي';
    document.querySelector('.input-tools').appendChild(voiceBtn);
    
    voiceBtn.addEventListener('click', () => {
        recognition.start();
        voiceBtn.style.background = '#ff4444';
    });
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        autoResizeTextarea();
        voiceBtn.style.background = '';
        sendMessage();
    };
    
    recognition.onerror = () => {
        voiceBtn.style.background = '';
    };
}