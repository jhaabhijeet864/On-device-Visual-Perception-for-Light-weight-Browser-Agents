// extension/background/transmitter.js
export async function sendSanitizedPayload(payload) {
  const BACKEND_URL = 'http://localhost:8000/reason';

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Transmission Error:', error);
    throw error;
  }
}
