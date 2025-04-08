/**
 * Handles user input and connects to backend API
 * - Sends question to /api/chat
 * - Receives AI response and animates it on the page
 */

// Add the typeWriterEffect function
function typeWriterEffect(text) {
    const container = document.getElementById("chat-response");
    container.innerHTML = "";

    let i = 0;
    const speed = 20; // typing speed in milliseconds

    function type() {
        if (i < text.length) {
            container.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Updated script.js
async function askQuestion() {
    const input = document.getElementById("user-query");
    const query = input.value.trim();
    if (!query) return;

    // Show loading state
    const container = document.getElementById("chat-response");
    container.innerHTML = "Thinking...";

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
        });

        const data = await res.json();
        if (data.success) {
            let response = data.answer;

            // Add source information if available
            if (data.source) {
                response += `\n\n(Source: "${data.source}")`;
            }

            // Add fallback notice if applicable
            if (data.isFromFallback) {
                response += "\n\n⚠️ Response from fallback system due to API connection issues.";
            }

            typeWriterEffect(response);
        } else {
            typeWriterEffect("Error: " + (data.error || "Unknown error occurred"));
        }
    } catch (error) {
        typeWriterEffect("Failed to connect to the server. Please try again.");
    }
}