// Highlight.js config
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
let currentGeneratedCode = ""; // Store code for GitHub

// 1. AUTO-FETCH MODELS FROM OLLAMA
async function fetchModels() {
    try {
        const response = await fetch('/api/models');
        const data = await response.json();
        
        modelSelect.innerHTML = ''; // Clear loading text
        
        if (data.models.length === 0) {
            modelSelect.innerHTML = '<option value="">No models found</option>';
            addMessageToChat('System', '<span class="text-yellow-500">Warning: No Ollama models found. Please run `ollama pull llama3` in Termux.</span>');
            return;
        }

        data.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    } catch (error) {
        modelSelect.innerHTML = '<option value="">Ollama Offline</option>';
    }
}

// Fetch models when page loads
window.onload = fetchModels;

// 2. CHAT LOGIC
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessageToChat('User', text);
    userInput.value = '';

    const loadingId = addLoading();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, model: modelSelect.value })
        });

        const data = await response.json();
        document.getElementById(loadingId).remove();
        parseAgentResponse(data.reply);
    } catch (error) {
        document.getElementById(loadingId).remove();
        addMessageToChat('System', '<span class="text-red-500">Error connecting to backend!</span>');
    }
}

function addMessageToChat(sender, htmlContent) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex gap-3 md:gap-4';
    const isUser = sender === 'User';
    const icon = isUser ? '<i class="fa-solid fa-user text-xs"></i>' : '<i class="fa-solid fa-robot text-xs"></i>';
    const bgColor = isUser ? 'bg-gray-700' : 'bg-blue-600';

    msgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full ${bgColor} flex items-center justify-center shrink-0 text-white">${icon}</div>
        <div class="w-full overflow-hidden">
            <p class="font-semibold ${isUser ? 'text-gray-300' : 'text-blue-400'} mb-1">${sender === 'User' ? 'You' : 'Loagent'}</p>
            <div class="text-gray-300 text-sm leading-relaxed overflow-x-auto">${htmlContent}</div>
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
    msgDiv.innerHTML = `<div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white"><i class="fa-solid fa-robot text-xs"></i></div><p class="text-blue-400 text-sm mt-1">Thinking...</p>`;
    chatHistory.appendChild(msgDiv);
    return id;
}

function parseAgentResponse(reply) {
    let thoughtProcess = "";
    let mainAction = reply;

    if(reply.includes('[THOUGHT PROCESS]')) {
        const thoughtStart = reply.indexOf('[THOUGHT PROCESS]');
        const codeStart = reply.indexOf('[CODE/ACTION]');
        if (thoughtStart !== -1 && codeStart !== -1) {
            thoughtProcess = reply.substring(thoughtStart + 17, codeStart).trim();
            mainAction = reply.substring(codeStart + 13).trim();
        }
    }

    let displayHtml = '';
    if (thoughtProcess) {
        displayHtml += `<details class="thought-box rounded cursor-pointer mb-3"><summary class="font-semibold"><i class="fa-solid fa-brain mr-2"></i>Thought Process</summary><div class="mt-2 text-gray-400 p-2">${marked.parse(thoughtProcess)}</div></details>`;
    }

    displayHtml += marked.parse(mainAction);
    addMessageToChat('Loagent', displayHtml);
    extractCodeToWorkspace(mainAction);
}

function extractCodeToWorkspace(markdownText) {
    const codeRegex = /```[\s\S]*?```/g;
    const matches = markdownText.match(codeRegex);
    
    if (matches && matches.length > 0) {
        workspace.innerHTML = ''; 
        matches.forEach((codeBlock, index) => {
            // Clean the code block for saving
            currentGeneratedCode = codeBlock.replace(/```[a-z]*\n/i, '').replace(/```$/, '').trim();
            
            const blockHtml = marked.parse(codeBlock);
            const wrapper = document.createElement('div');
            wrapper.className = 'mb-6 relative w-full';
            wrapper.innerHTML = `
                <div class="bg-[#21262d] text-xs text-gray-400 px-3 py-2 rounded-t flex justify-between items-center">
                    <span>Code Segment</span>
                    <div class="flex gap-3">
                        <button class="hover:text-green-400 text-green-500 font-bold" onclick="openGithubModal()"><i class="fa-brands fa-github"></i> Deploy</button>
                        <button class="hover:text-white" onclick="navigator.clipboard.writeText(currentGeneratedCode); alert('Copied!')"><i class="fa-regular fa-copy"></i> Copy</button>
                    </div>
                </div>
                <div class="code-block m-0 rounded-t-none text-sm w-full overflow-x-auto">${blockHtml}</div>
            `;
            workspace.appendChild(wrapper);
        });
    }
}

// 3. GITHUB DEPLOYMENT LOGIC
function openGithubModal() {
    document.getElementById('github-modal').classList.remove('hidden');
}

function closeGithubModal() {
    document.getElementById('github-modal').classList.add('hidden');
    document.getElementById('gh-status').classList.add('hidden');
}

async function pushCodeToGithub() {
    const token = document.getElementById('gh-token').value;
    const repo = document.getElementById('gh-repo').value;
    const filepath = document.getElementById('gh-filepath').value;
    const statusText = document.getElementById('gh-status');

    if (!token || !repo || !filepath) {
        alert("Please fill all fields!");
        return;
    }

    statusText.classList.remove('hidden');
    statusText.className = "text-xs text-center mt-2 text-yellow-500";
    statusText.innerText = "Pushing to GitHub...";

    try {
        const res = await fetch('/api/github/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, repo_name: repo, file_path: filepath, content: currentGeneratedCode })
        });
        const data = await res.json();
        
        if(data.status.includes("Success")) {
            statusText.className = "text-xs text-center mt-2 text-green-500 font-bold";
            statusText.innerText = "✅ " + data.status;
            setTimeout(closeGithubModal, 3000);
        } else {
            statusText.className = "text-xs text-center mt-2 text-red-500";
            statusText.innerText = "❌ " + data.status;
        }
    } catch (e) {
        statusText.innerText = "❌ Failed to connect to backend.";
    }
}
