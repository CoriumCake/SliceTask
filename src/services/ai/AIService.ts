import { SYSTEM_PROMPT, buildUserPrompt } from './prompts'

export interface TaskSuggestion {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimatedMinutes: number
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface AIProvider {
  name: string
  generateTasks: (prompt: string, apiKey: string, context: Message[]) => Promise<TaskSuggestion[]>
  testKey: (apiKey: string) => Promise<boolean>
}

export const GeminiProvider: AIProvider = {
  name: 'gemini',
  generateTasks: async (prompt, apiKey, context) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
    
    const contents = [
      // Format context for Gemini's multi-turn format
      ...context.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: buildUserPrompt(prompt) }] }
    ]

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Gemini API request failed')
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return parseAIResponse(text)
  },
  testKey: async (apiKey) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'say hi' }] }]
      })
    })
    return response.ok
  }
}

export const GroqProvider: AIProvider = {
  name: 'groq',
  generateTasks: async (prompt, apiKey, context) => {
    const url = 'https://api.groq.com/openai/v1/chat/completions'
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...context.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: buildUserPrompt(prompt) }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Groq API request failed')
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''
    return parseAIResponse(text)
  },
  testKey: async (apiKey) => {
    const url = 'https://api.groq.com/openai/v1/chat/completions'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1
      })
    })
    return response.ok
  }
}

function parseAIResponse(text: string): TaskSuggestion[] {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const jsonStr = jsonMatch ? jsonMatch[0] : text
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error('Failed to parse AI response:', text)
    throw new Error('AI returned an invalid response format. Please try again.')
  }
}

export class AIService {
  static async getTasks(
    providerName: 'gemini' | 'groq', 
    prompt: string, 
    apiKey: string, 
    context: Message[]
  ): Promise<TaskSuggestion[]> {
    const provider = providerName === 'gemini' ? GeminiProvider : GroqProvider
    return provider.generateTasks(prompt, apiKey, context)
  }

  static async testKey(providerName: 'gemini' | 'groq', apiKey: string): Promise<boolean> {
    const provider = providerName === 'gemini' ? GeminiProvider : GroqProvider
    return provider.testKey(apiKey)
  }
}
