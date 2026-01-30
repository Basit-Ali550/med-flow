import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { patient } = await request.json();
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API Key missing' }, { status: 500 });
        }

        const prompt = `
      You are an expert Triage Nurse Assistant. Analyze the following patient data and provide a triage assessment.
      
      Patient Data:
      - Age: ${patient.age || "Unknown"}
      - Gender: ${patient.gender || "Unknown"}
      - Symptoms: ${patient.symptoms}
      - Pain Level: ${patient.painLevel}/10
      - Vitals: ${patient.vitalSigns ? JSON.stringify(patient.vitalSigns) : "Not provided"}
      
      Return a VALID JSON object with the following fields:
      1. "score": A number between 0-100 indicating urgency (100 = Critical/Immediate).
      2. "reasoning": A concise, professional clinical explanation (3-4 sentences) justifying the score based on symptoms and vitals.
      3. "recommendedActions": A numbered list of 3-5 immediate actions (string, new line separated).
      4. "triageLevel": One of ["Critical", "Urgent", "Semi-Urgent", "Non-Urgent"].
      5. "priority": One of [1, 2, 3, 4, 5] corresponding to triage level (1 is critical).
      
      Respond ONLY with the JSON.
    `;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // or gpt-3.5-turbo
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful medical assistant. Output JSON only."
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to contact OpenAI");
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Clean code blocks if present
        content = content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const result = JSON.parse(content);

        return NextResponse.json(result);
    } catch (error) {
        console.error("AI API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate analysis" },
            { status: 500 }
        );
    }
}
