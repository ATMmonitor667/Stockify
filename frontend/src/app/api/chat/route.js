import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert stock market analyst and trading advisor. Your role is to:
1. Provide accurate and insightful stock analysis
2. Explain market trends and their implications
3. Suggest trading strategies based on market conditions
4. Offer risk management advice
5. Help with portfolio optimization

Guidelines:
- Always maintain a professional and confident tone
- Base your advice on data and market fundamentals
- Clearly explain your reasoning
- Include relevant market context
- Emphasize the importance of risk management
- Remind users to do their own research and due diligence

Remember: Your advice should be educational and informative, but not financial advice. Always encourage users to consult with financial professionals for specific investment decisions.`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({ message: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
} 