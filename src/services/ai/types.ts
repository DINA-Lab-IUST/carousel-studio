import type { CarouselOutline } from '../../lib/outline'
import type { Slide } from '../../lib/types'

export type TextTweakMode = 'rewrite' | 'shorten' | 'expand'

/**
 * The only surface the UI knows about. Swapping in a real provider (OpenAI,
 * Anthropic, a backend proxy) means implementing this interface — nothing in
 * the editor changes because every method returns structured document data.
 */
export interface AIService {
  generateOutline(input: { idea: string; slideCount: number }): Promise<CarouselOutline>
  splitContent(input: { text: string }): Promise<CarouselOutline>
  tweakText(input: { text: string; mode: TextTweakMode }): Promise<string>
  generateHooks(input: { topic: string }): Promise<string[]>
  improveCta(input: { text: string }): Promise<string[]>
  regenerateSlide(input: { slide: Slide; projectTitle: string }): Promise<Slide>
}

export interface AIProviderConfig {
  provider: 'mock' | 'openai'
  apiKey?: string
  model?: string
}
