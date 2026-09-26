import { MockAIService } from './mock'
import type { AIService, AIProviderConfig } from './types'

/**
 * Single place that decides which AI implementation the app uses.
 *
 * To connect a real provider later, implement `AIService` (calling your own
 * backend so API keys never reach the browser) and return it here — the editor
 * only ever talks to this factory.
 */
export function createAIService(config: AIProviderConfig = { provider: 'mock' }): AIService {
  switch (config.provider) {
    // case 'openai':
    //   return new OpenAIService(config)
    default:
      return new MockAIService()
  }
}

const envProvider = (import.meta.env.VITE_AI_PROVIDER as AIProviderConfig['provider'] | undefined) ?? 'mock'

export const ai: AIService = createAIService({ provider: envProvider })

export type { AIService, AIProviderConfig, TextTweakMode } from './types'
