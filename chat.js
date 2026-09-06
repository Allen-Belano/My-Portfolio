const chatForm = document.querySelector('.chat-form');
const chatInput = document.querySelector('#chat-input');
const chatMessages = document.querySelector('.chat-messages');
const chatPrompts = document.querySelectorAll('.chat-prompts button');

function getChatReply(message) {
	const question = message.toLowerCase();
	if (question.includes('skill') || question.includes('tech') || question.includes('stack')) {
		return 'Allen works across React, Next.js, Node.js, Express, PostgreSQL, Firebase, Supabase, Tailwind CSS, and Flutter. He also brings experience in testing, debugging, and UI/UX design.';
	}
	if (question.includes('project') || question.includes('work')) {
		return 'His featured projects include VeriFi-PH, an AI-assisted credibility checker that placed Top 5 at the CodeKada Hackathon, and SA/AN Commuter Guide, a route finder with the Navvia AI assistant.';
	}
	if (question.includes('experience') || question.includes('job') || question.includes('intern')) {
		return 'Allen is a Full Stack Developer at DevKada and previously worked as a Software Engineer and IT Support Intern at Viva International, supporting systems used by 4,000-5,000 employees and 500+ daily tickets.';
	}
	if (question.includes('contact') || question.includes('email') || question.includes('hire')) {
		return 'You can reach Allen at belanoallen@gmail.com or connect with him on LinkedIn at linkedin.com/in/allen-belano.';
	}
	return 'I can tell you about Allen\'s skills, projects, experience, or how to contact him. Try one of those topics.';
}

function addChatMessage(message, sender) {
	const messageElement = document.createElement('p');
	messageElement.className = `chat-message chat-message-${sender}`;
	messageElement.textContent = message;
	chatMessages.append(messageElement);
	chatMessages.scrollTop = chatMessages.scrollHeight;
	return messageElement;
}

function sendChatMessage(message) {
	const cleanMessage = message.trim();
	if (!cleanMessage || chatForm.classList.contains('is-typing')) return;
	addChatMessage(cleanMessage, 'user');
	chatInput.value = '';
	chatForm.classList.add('is-typing');
	chatInput.disabled = true;
	chatForm.querySelector('button').disabled = true;
	const typingMessage = addChatMessage('Allen is typing...', 'typing');
	window.setTimeout(() => {
		typingMessage.remove();
		addChatMessage(getChatReply(cleanMessage), 'bot');
		chatForm.classList.remove('is-typing');
		chatInput.disabled = false;
		chatForm.querySelector('button').disabled = false;
		chatInput.focus();
	}, 450);
}

chatForm.addEventListener('submit', (event) => {
	event.preventDefault();
	sendChatMessage(chatInput.value);
});

chatPrompts.forEach((prompt) => {
	prompt.addEventListener('click', () => sendChatMessage(prompt.textContent));
});
