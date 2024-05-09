document.addEventListener('DOMContentLoaded', function () {
  fetch('header.html')
  .then(response => response.text())
  .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;
  });
  
  const chatContainer = document.getElementById('chat-container');
  const chatInputField = document.getElementById('chat-input-field');
  const sendButton = document.getElementById('send-button');
  const chatMessagesContainer = document.querySelector('.chat-messages');

  // 서버 엔드포인트로 메시지 전송
  async function sendMessage() {
      const message = chatInputField.value.trim();
      if (message) {
          try {
              const response = await fetch('/sendMessage', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ message })
              });
              const result = await response.json();
              const messageId = result.id;
              renderMessage(messageId, message);
              chatInputField.value = '';
          } catch (error) {
              console.error('Failed to send message:', error);
          }
      }
  }

  // 서버로부터 메시지 로딩
  async function loadMessages() {
      try {
          const response = await fetch('/loadMessages');
          const messages = await response.json();
          messages.forEach((message) => {
              renderMessage(message.id, message.text);
          });
      } catch (error) {
          console.error('Failed to load messages:', error);
      }
  }

  // 메시지를 채팅 인터페이스에 렌더링
  function renderMessage(messageId, message) {
      const messageElement = document.createElement('div');
      messageElement.textContent = message;
      messageElement.className = 'chat-message';
      chatMessagesContainer.appendChild(messageElement);
  }

  // 전송 버튼에 이벤트 리스너 추가
  sendButton.addEventListener('click', sendMessage);

  // 페이지 로드 시 메시지 로딩
  loadMessages();
});
