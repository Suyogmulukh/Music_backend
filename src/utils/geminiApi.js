import fetch from "node-fetch";

export const generateAImessage = async ({ date, type, location, guests }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const prompt = `
  Draft a polite, concise (50-70 words) inquiry for booking "Jay Human Beast" for an event.
  Date: ${date}, Event Type: ${type || "unspecified"}, Location: ${
    location || "unspecified"
  }, Guests: ${guests || "unspecified"}.
  `;

  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Draft manually.";
};
