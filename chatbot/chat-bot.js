// Chef Agent: a food-focused chatbot interface.
// Firebase stores the shared chat history while the agent is offline.

// Wait for the DOM to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', function() {
  
  // ========================================
  // FIREBASE CONFIGURATION
  // ========================================
  // Connect the agent to the same Firebase project used by the portfolio.
  
  const firebaseConfig = {
    apiKey: "AIzaSyDMe_hgk7nSMfyIHRS5rJ6uDb4yeJC2ASQ",
    authDomain: "comp-design-46068.firebaseapp.com",
    databaseURL: "https://comp-design-46068-default-rtdb.firebaseio.com",
    projectId: "comp-design-46068",
    storageBucket: "comp-design-46068.firebasestorage.app",
    messagingSenderId: "915582893208",
    appId: "1:915582893208:web:8f2ce17c15285d941ae4ed",
  };

  // Initialize Firebase - connects your app to Firebase services
  firebase.initializeApp(firebaseConfig);

  // Get a reference to the Firebase Realtime Database
  const database = firebase.database();

  // ========================================
  // PAGE ELEMENTS
  // ========================================
  // Get references to the HTML elements we want to interact with
  
  const chatMessages = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const chatStatus = document.getElementById('chat-status');
  const connectionStatus = document.getElementById('connection-status');

  // ========================================
  // REAL-TIME CHAT HISTORY
  // ========================================
  // Listen for changes to the chat messages in the database
  // This function runs every time a new message is added to Firebase
  
  database.ref('chat/messages').on('value', function(snapshot) {
    const messages = snapshot.val() || {};
    
    // Clear the current chat display
    chatMessages.innerHTML = '';
    
    // Rebuild the interface from Firebase's current message history. This lets
    // the same conversation appear for every client connected to this database path.
    Object.keys(messages).forEach(function(messageId) {
      const message = messages[messageId];
      addMessageToDisplay(message.text, message.sender, message.timestamp);
    });
    
    // Scroll to the bottom to show the latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    console.log('Chat messages updated:', messages);
  });

  // ========================================
  // INPUT INTERACTIONS
  // ========================================
  // Handle Enter key press in the input field
  messageInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  // Handle Send button clicks
  sendButton.addEventListener('click', function() {
    sendMessage();
  });
  
  // Disable send button during processing to prevent multiple rapid requests
  function setSendButtonState(disabled) {
    sendButton.disabled = disabled;
    if (disabled) {
      sendButton.textContent = 'Sending...';
      sendButton.style.opacity = '0.6';
    } else {
      sendButton.textContent = 'Send';
      sendButton.style.opacity = '1';
    }
  }

  // ========================================
  // MESSAGE SUBMISSION
  // ========================================
  // This function handles the entire process of sending a message and getting an AI response
  
  async function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (!messageText) {
      return; // Don't send empty messages
    }
    
    setSendButtonState(true);
    updateChatStatus('Sending message...');
    
    try {
      // The user message and AI response are both saved in Firebase. The
      // realtime listener above is responsible for rendering them in the UI.
      // Save the user message to Firebase.
      await saveMessageToFirebase(messageText, 'user');
      
      // Clear the input field
      messageInput.value = '';
      
      // The live agent is offline, so return the same short status response.
      const aiResponse = 'Chef Agent is currently offline.';
      
      // Save the response so the real-time listener can display it.
      await saveMessageToFirebase(aiResponse, 'bot');
      
      updateChatStatus('Ready to chat');
      
    } catch (error) {
      console.error('Error sending message:', error);
      updateChatStatus('Error: ' + error.message);
      
      let errorDetails = 'Failed to send message.\n\n';
      errorDetails += 'Error Type: ' + error.name + '\n';
      errorDetails += 'Error Message: ' + error.message + '\n';
      
      if (error.stack) {
        errorDetails += '\nStack Trace:\n' + error.stack;
      }
      
      showError(errorDetails);
    } finally {
      setSendButtonState(false);
    }
  }

  // ========================================
  // FIREBASE HELPERS
  // ========================================
  // Save a message to the Firebase database
  
  async function saveMessageToFirebase(text, sender) {
    const message = {
      text: text,
      sender: sender,
      timestamp: Date.now()
    };
    
    await database.ref('chat/messages').push(message);
    console.log('Message saved to Firebase:', message);
  }

  // ========================================
  // CHAT INTERFACE HELPERS
  // ========================================
  // Add a message to the chat display
  
  function addMessageToDisplay(text, sender, timestamp) {
    // Use the sender value to choose the user or bot card style.
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const timeString = formatTimestamp(timestamp);
    
    messageDiv.innerHTML = `
      <div class="message-content">
        <strong>${sender === 'user' ? 'You:' : 'AI Assistant:'}</strong> ${text}
      </div>
      <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
  }

  // Convert a timestamp to a readable time string
  
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  // Update the chat status display
  
  function updateChatStatus(status) {
    chatStatus.textContent = status;
  }

  // Show an error message if something goes wrong
  
  function showError(message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    
    error.innerHTML = `<pre style="margin: 0; white-space: pre-wrap; font-family: monospace; font-size: 12px;">${message}</pre>`;
    
    error.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 1000;
      max-width: 500px;
      max-height: 400px;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 2px solid #d32f2f;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    closeButton.onclick = function() {
      if (error.parentNode) {
        error.parentNode.removeChild(error);
      }
    };
    
    error.appendChild(closeButton);
    document.body.appendChild(error);
    
    setTimeout(function() {
      if (error.parentNode) {
        error.parentNode.removeChild(error);
      }
    }, 15000);
  }

  // ========================================
  // FIREBASE CONNECTION STATUS
  // ========================================
  // Listen for connection state changes
  
  database.ref('.info/connected').on('value', function(snapshot) {
    // Firebase exposes this special path for live connection-state updates.
    const connected = snapshot.val();
    
    if (connected) {
      connectionStatus.innerHTML = '<p style="color: #4CAF50;">✅ Connected to Firebase</p>';
      console.log('Connected to Firebase');
    } else {
      connectionStatus.innerHTML = '<p style="color: #f44336;">❌ Disconnected from Firebase</p>';
      console.log('Disconnected from Firebase');
    }
  });

  // ========================================
  // INITIAL PAGE STATE
  // ========================================
  // Set up initial state when the page loads
  
  messageInput.focus();
  updateChatStatus('Ready to chat');

  console.log('Chef Agent interface initialized successfully.');
}); 
