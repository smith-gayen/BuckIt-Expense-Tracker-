
const baseUrl = 'http://localhost:3001/api';

async function testChat() {
    console.log('Testing Chat API...');

    // Test with dummy context
    const payload = {
        messages: [{ role: 'user', content: 'Hello, who are you?' }],
        context: { totals: { thisMonthExpenses: 5000 } },
        stream: false
    };

    const res = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
        console.error('Chat API failed:', res.status, await res.text());
        return;
    }

    const json = await res.json();
    console.log('Chat Response:', json);

    if (json.error) {
        console.error('API returned error:', json.error);
    } else if (json.content) {
        console.log('SUCCESS: Received content:', json.content);
    } else {
        console.warn('Received unexpected format:', json);
    }
}

testChat().catch(console.error);
