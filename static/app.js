document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesArea = document.getElementById('messages-area');
    const welcomeScreen = document.getElementById('welcome-screen');
    const template = document.getElementById('message-template');
    const newChatBtn = document.querySelector('.new-chat-btn');
    
    // Generate a simple session ID
    let sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    
    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // Enable/disable send button
        if (this.value.trim() === '') {
            sendBtn.disabled = true;
        } else {
            sendBtn.disabled = false;
        }
    });

    // Handle Enter key (Shift+Enter for new line)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.value.trim() !== '') {
                sendMessage();
            }
        }
    });

    sendBtn.addEventListener('click', sendMessage);
    
    newChatBtn.addEventListener('click', () => {
        // Reset UI
        messagesArea.innerHTML = '';
        messagesArea.appendChild(welcomeScreen);
        welcomeScreen.style.display = 'flex';
        
        // Reset Session
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    });

    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        // Hide welcome screen
        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
        }

        // Add user message
        addMessage(text, 'user');
        
        // Reset input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        sendBtn.disabled = true;

        // Add loading indicator
        const loadingId = addLoadingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text,
                    session_id: sessionId
                })
            });

            const data = await response.json();
            
            // Remove loading
            document.getElementById(loadingId).remove();

            if (response.ok) {
                addMessage(data.response, 'ai');
            } else {
                addMessage(`Error: ${data.error || 'Something went wrong'}`, 'ai');
            }
        } catch (error) {
            // Remove loading
            document.getElementById(loadingId).remove();
            addMessage(`Error: Could not connect to the server. ${error.message}`, 'ai');
        }
    }

    function addMessage(text, sender) {
        const clone = template.content.cloneNode(true);
        const wrapper = clone.querySelector('.message-wrapper');
        const contentDiv = clone.querySelector('.text');
        const senderName = clone.querySelector('.sender-name');
        const avatar = clone.querySelector('.avatar');

        wrapper.classList.add(sender);

        if (sender === 'user') {
            senderName.textContent = 'You';
            avatar.innerHTML = '<i class="fas fa-user"></i>';
            contentDiv.textContent = text; // Plain text for user
        } else {
            senderName.textContent = 'Nexus AI';
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
            // Render markdown for AI
            contentDiv.innerHTML = marked.parse(text);
        }

        messagesArea.appendChild(wrapper);
        scrollToBottom();
    }

    function addLoadingIndicator() {
        const id = 'loading-' + Date.now();
        const clone = template.content.cloneNode(true);
        const wrapper = clone.querySelector('.message-wrapper');
        const contentDiv = clone.querySelector('.text');
        const senderName = clone.querySelector('.sender-name');
        const avatar = clone.querySelector('.avatar');

        wrapper.classList.add('ai');
        wrapper.id = id;
        
        senderName.textContent = 'Nexus AI';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        contentDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;

        messagesArea.appendChild(wrapper);
        scrollToBottom();
        
        return id;
    }

    function scrollToBottom() {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
});
