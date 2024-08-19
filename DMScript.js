TS.realtime.onSyncMessage((message, source) => {
    // Check if the message is from the PlayerScript
    if (source === "PlayerScript") {
        // Process the message, e.g., extract the roll result and update the UI
        const rollResult = extractRollResult(message);
        // Update the DMScript UI with the roll result
    }
});

function extractRollResult(message) {
    console.log(message)
    // Implement a function to extract the roll result from the message
    // You might need to parse the message to get the roll result.
    // For example, you can use regular expressions or string manipulation.
    // The message might be something like "Player rolled a 4 on the dice".
    // Extract the number (4) and return it as the roll result.
    // This will depend on the format of your messages.
}