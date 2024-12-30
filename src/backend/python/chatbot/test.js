const fetchOpenAIResponse = async () => {
    const apiKey = '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'; // Replace with your OpenAI API key
    const url = 'https://api.openai.com/v1/chat/completions';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
    };

    const body = JSON.stringify({
        model: 'o1-2024-12-17',
        messages: [
            { role: 'user', content: 'write a haiku about ai' },
        ],
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body,
        });

        const data = await response.json();

        // Handle response
        console.log(data);

    } catch (error) {
        console.error('Error fetching from OpenAI:', error);
    }
};

fetchOpenAIResponse();
