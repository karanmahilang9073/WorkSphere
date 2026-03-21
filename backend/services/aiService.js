import {InferenceClient} from '@huggingface/inference'

const hf = new InferenceClient(process.env.HF_API_KEY)

export const aiResponse = async(prompt) => {
    const res = await hf.textGeneration({
        model : "mistralai/Mistral-7B-Instruct-v0.1",
        inputs : prompt,
        parameters : {
            max_new_tokens : 500,
            temperature : 0.7
        },
    })
    return res.generated_text;
}

export default {aiResponse}