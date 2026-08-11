// Chef Agent: a food-focused chatbot with a dry, experimental-chef personality.
// Firebase stores the shared chat history, while OpenAI generates each response
// using the latest ten user and assistant messages as conversation memory.

// SECURITY NOTE: The current project calls OpenAI directly from the browser.
// A production version should keep the API key on a secure server.

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
  // OPENAI CONFIGURATION AND CONVERSATION MEMORY
  // ========================================
  // Keep the existing direct API configuration for the current Chef Agent setup.
  const OPENAI_API_KEY = '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';
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  
  // Rate limiting configuration
  let lastApiCall = 0;
  const MIN_CALL_INTERVAL = 1000; // Minimum 1 second between calls
  // Keep only the latest user and assistant messages sent to OpenAI so the bot
  // remembers recent context without allowing the request history to grow forever.
  const MAX_CONVERSATION_MESSAGES = 10;
  const conversationHistory = [];

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
      
      // Ask the Chef Agent for a response.
      updateChatStatus('Getting AI response...');
      const aiResponse = await getChatGPTResponse(messageText);
      
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
  // OPENAI REQUESTS AND MEMORY HELPERS
  // ========================================
  // Send a message to ChatGPT API and get a response
  
  async function getChatGPTResponse(userMessage) {
    // Add the newest user message before building the API request so the model
    // receives the current prompt along with recent conversation context.
    conversationHistory.push({
      role: 'user',
      content: userMessage
    });
    trimConversationHistory();

    // Rate limiting: Ensure minimum time between API calls
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    
    if (timeSinceLastCall < MIN_CALL_INTERVAL) {
      const waitTime = MIN_CALL_INTERVAL - timeSinceLastCall;
      console.log(`Rate limiting: Waiting ${waitTime}ms before next API call`);
      updateChatStatus(`Rate limiting: Waiting ${Math.ceil(waitTime/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastApiCall = Date.now();
    
    // Retry temporary rate-limit failures with an increasing delay. Other
    // errors are passed back to sendMessage for display.
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const aiResponse = await makeApiCall();
        conversationHistory.push({
          role: 'assistant',
          content: aiResponse
        });
        trimConversationHistory();
        return aiResponse;
      } catch (error) {
        retryCount++;
        
        if (error.message.includes('429') && retryCount < maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 1000;
          console.log(`Rate limit hit, retrying in ${waitTime/1000}s (attempt ${retryCount}/${maxRetries})`);
          updateChatStatus(`Rate limited. Retrying in ${waitTime/1000}s... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        throw error;
      }
    }
  }

  function trimConversationHistory() {
    // Remove the oldest entries first and retain the latest ten messages.
    if (conversationHistory.length > MAX_CONVERSATION_MESSAGES) {
      conversationHistory.splice(
        0,
        conversationHistory.length - MAX_CONVERSATION_MESSAGES
      );
    }
  }
  
  // Make the actual API call to ChatGPT
  
  async function makeApiCall() {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      throw new Error('Please set your OpenAI API key. Get one from https://platform.openai.com/api-keys');
    }
    
    // Prepare the request with the chef personality first, followed by the
    // rolling user/assistant conversation history.
    const requestBody = {
      model: "gpt-3.5-turbo", // Using a valid model name
      messages: [
        {
          role: "system",
          content: "You are an experimental chef. Be dry, clever, calm, and slightly opinionated. Keep responses short, natural, conversational, and food-focused. You may suggest unusual combinations and say when something sounds questionable. Do not use food puns, exclamation marks, pet names, forced quirky language, or overly enthusiastic reactions."
        },
        ...conversationHistory
      ],
      max_tokens: 150,
      temperature: 0.7
    };

    try {
      console.log('=== CHATGPT API REQUEST DEBUG ===');
      console.log('API URL:', OPENAI_API_URL);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      };
      
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      console.log('=== CHATGPT API RESPONSE DEBUG ===');
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);

      if (!response.ok) {
        // Preserve the API's response text so the caller receives useful error details.
        let errorText = '';
        try {
          const errorData = await response.text();
          errorText = errorData;
        } catch (e) {
          errorText = 'Could not read error response';
        }
        
        throw new Error(`API request failed: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
      }

      // Validate the expected Chat Completions response before reading its text.
      const data = await response.json();
      console.log('ChatGPT API response:', data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error(`Unexpected API response structure: ${JSON.stringify(data)}`);
      }
      
      const aiResponse = data.choices[0].message.content;
      console.log('ChatGPT response text:', aiResponse);
      return aiResponse;
      
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Could not connect to ChatGPT API. Check your internet connection.');
      } else if (error.message.includes('401')) {
        throw new Error('Authentication error: Invalid API key. Please check your OpenAI API key.');
      } else if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please wait 1-2 minutes before trying again.');
      } else if (error.message.includes('500')) {
        throw new Error('Server error: ChatGPT API is experiencing issues. Please try again later.');
      } else {
        throw new Error(`ChatGPT API error: ${error.message}`);
      }
    }
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

  console.log('ChatGPT Chat Bot initialized successfully!');
  
  // Add a test function to the global scope for debugging
  // It can be run manually from the browser console and is not part of normal chat flow.
  window.testOpenAI = async function() {
    console.log('=== TESTING OPENAI API ===');
    try {
      const testMessage = 'Hello, this is a test message.';
      const response = await getChatGPTResponse(testMessage);
      console.log('✅ API Test Successful!');
      console.log('Response:', response);
      alert('API Test Successful! Check console for details.');
    } catch (error) {
      console.error('❌ API Test Failed:', error);
      alert('API Test Failed! Check console for details.');
    }
  };
  
  console.log('💡 To test your API setup, run: testOpenAI() in the console');
}); 
