export interface LLMResult {
  text: string;
  model: string;
  tokensUsed: number;
}

export interface LLMProvider {
  name: string;
  enhance: (text: string, context: EnhancementContext) => Promise<LLMResult>;
}

export interface EnhancementContext {
  userName?: string;
  userRole?: string;
  userIndustry?: string;
  userTone?: string;
  userInstructions?: string;
  activeApp?: string;
  language?: string;
  customPrompt?: string;
}

export type LLMProviderType = 'openai' | 'anthropic' | 'groq' | 'ollama' | 'custom';
