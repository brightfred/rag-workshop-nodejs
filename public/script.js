// TODO: Fetch from backend using fetch()
// TODO: Display the response
// TODO: Animate it for fun
/**
 * Handles user input and connects to backend API
 * - Sends question to /api/chat
 * - Receives AI response and animates it on the page
 */

async function askQuestion() {
    const input = document.getElementById("user-query");
    const query = input.value.trim();
    if (!query) return;
  
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
  
    const data = await res.json();
    typeWriterEffect(data.answer || "No answer received.");
  }
  
  // Animate the response with a typing effect
  function typeWriterEffect(text) {
    const container = document.getElementById("chat-response");
    container.innerHTML = "";
    let i = 0;
    const speed = 30;
  
    function type() {
      if (i < text.length) {
        container.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
  
    type();
  }