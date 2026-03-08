// Configure Marked.js for Code Highlighting
marked.setOptions({
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
});

const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const workspace = document.getElementById('workspace');
const modelSelect = document.getElementById('model-select');

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight < 120 ? this.scrollHeight : 120) + 'px';
});

// Send on Enter (Shift+Enter for newline)
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Add User Message
    addMessageToChat('User', text);
    userInput.value = '';
    userInput.style.height = 'auto';

    // Show Loading
    const loadingId = addLoading();

    try {
        // Fetch from FastAPI Backend
        const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: text,
                model: modelSelect.value
            })
        });

        const data = await response.json();
        document.getElementById(loadingId).remove();
        
        // Parse and Display Agent Response
        parseAgentResponse(data.reply);

    } catch (error) {
        document.getElementById(loadingId).remove();
        addMessageToChat('System', '<span class="text-red-500">Error: Could not connect to Loagent backend. Make sure Ollama and FastAPI are running.</span>');
    }
}

function addMessageToChat(sender, htmlContent) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex gap-4 fade-in';
    
    const isUser = sender === 'User';
    const icon = isUser ? '<i class="fa-solid fa-user text-xs"></i>' : '<i class="fa-solid fa-robot text-xs"></i>';
    const bgColor = isUser ? 'bg-gray-700' : 'bg-blue-600';

    msgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full ${bgColor} flex items-center justify-center shrink-0 text-white">${icon}</div>
        <div class="w-full">
            <p class="font-semibold ${isUser ? 'text-gray-300' : 'text-blue-400'} mb-1">${sender === 'User' ? 'You' : 'Loagent'}</p>
            <div class="text-gray-300 text-sm leading-relaxed">${htmlContent}</div>
        </div>
    `;
    
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function addLoading() {
    const id = 'loading-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = 'flex gap-4';
    msgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white"><i class="fa-solid fa-robot text-xs"></i></div>
        <div>
            <p class="font-semibold text-blue-400 mb-1">Loagent</p>
            <div class="flex gap-1 mt-2">
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
        </div>
    `;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return id;
}

function parseAgentResponse(reply) {
    // Basic Parsing: Separate thoughts, doubts, and code (Based on Backend Prompt)
    let thoughtProcess = "";
    let mainAction = reply;

    if(reply.includes('[THOUGHT PROCESS]')) {
        const parts = reply.split('[/THOUGHT PROCESS]'); // Assuming backend uses closing tag, or we just split by headings.
        // Let's implement a simpler string extraction based on headings
        const thoughtStart = reply.indexOf('[THOUGHT PROCESS]');
        const codeStart = reply.indexOf('[CODE/ACTION]');
        
        if (thoughtStart !== -1 && codeStart !== -1) {
            thoughtProcess = reply.substring(thoughtStart + 17, codeStart).trim();
            mainAction = reply.substring(codeStart + 13).trim();
        }
    }

    let displayHtml = '';
    
    // Add Thought Process (Collapsible)
    if (thoughtProcess) {
        displayHtml += `
            <details class="thought-box rounded cursor-pointer mb-3">
                <summary class="font-semibold"><i class="fa-solid fa-brain mr-2"></i>Loagent's Thought Process</summary>
                <div class="mt-2 text-gray-400 p-2 border-l-2 border-gray-600">${marked.parse(thoughtProcess)}</div>
            </details>
        `;
    }

    // Add Main Content
    displayHtml += marked.parse(mainAction);
    addMessageToChat('Loagent', displayHtml);

    // If there is code, update the Right Workspace
    extractCodeToWorkspace(mainAction);
}

function extractCodeToWorkspace(markdownText) {
    const codeRegex = /```[\s\S]*?```/g;
    const matches = markdownText.match(codeRegex);
    
    if (matches && matches.length > 0) {
        workspace.innerHTML = ''; // Clear default
        matches.forEach((codeBlock, index) => {
            const blockHtml = marked.parse(codeBlock);
            const wrapper = document.createElement('div');
            wrapper.className = 'mb-6 relative';
            wrapper.innerHTML = `
                <div class="bg-[#21262d] text-xs text-gray-400 px-3 py-1 rounded-t flex justify-between items-center">
                    <span>Generated Code ${index + 1}</span>
                    <button class="hover:text-white" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText); alert('Copied!')"><i class="fa-regular fa-copy"></i> Copy</button>
                </div>
                <div class="code-block m-0 rounded-t-none text-sm">${blockHtml}</div>
            `;
            workspace.appendChild(wrapper);
        });
    }
}

function openGithubModal() {
    alert("GitHub Integration Module: Yahan user apna Personal Access Token (PAT) dalege repository connect karne ke liye. (Future update)");
}
