const API_KEY = 'YOUR_GROQ_API_KEY';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';

    const loading = addMessage('🤔 جاري التفكير...', 'bot');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [{ role: 'user', content: message }]
            })
        });

        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        loading.remove();
        addMessage(reply, 'bot');
    } catch (error) {
        loading.remove();
        addMessage('❌ حدث خطأ، تأكد من المفتاح', 'bot');
    }
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
