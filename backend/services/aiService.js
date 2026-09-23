import Groq from "groq-sdk";
import dotenv from 'dotenv'
dotenv.config()

const groq = new Groq({
    apiKey : process.env.GROQ_API_KEY
})


const DEFAULT_MODEL = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b'

export const aiResponse = async(prompt, systemPrompt = null) => {
    try {
        if(!process.env.GROQ_API_KEY){
            throw new Error('GROQ_API_KEY not configured')
        }
        
        const messages = []
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt })
        }
        messages.push({ role: 'user', content: prompt })

        const res = await groq.chat.completions.create({
            model : DEFAULT_MODEL,
            messages
        })

        if(!res.choices || !res.choices[0]) {
            throw new Error('Invalid response from GROQ API')
        }
        return res.choices[0].message.content
    } catch (error) {
        console.log('AI service error', error)
        throw error
    }
}