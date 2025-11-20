import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"


const openai = createOpenAI({ apiKey: "ddc-a4f-5c322dd2aac84fd387f391fffd122d58", baseURL: "https://api.a4f.co/v1" });

const { text } = await generateText({
model: openai("provider-2/gemini-2.5-flash-nothinking"),
prompt: "What is love?"
})

console.log(text)