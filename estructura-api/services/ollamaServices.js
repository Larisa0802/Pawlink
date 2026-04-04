import { Ollama } from 'ollama'

const ollama = new Ollama()
const response = await ollama.chat({
  model: 'embeddinggemma',
  messages: [{ role: 'user', content: 'Explain quantum computing' }],
  stream: true,
})


for await (const part of response) {
  process.stdout.write(part.message.content)
}