import { LLMProvider, LLMResult, EnhancementContext, LLMProviderType } from './types';
import { OpenAIProvider } from './openai';
import { EventEmitter } from 'events';

export const llmEmitter = new EventEmitter();

let currentProvider: LLMProvider | null = null;
let currentProviderType: LLMProviderType = 'openai';
let enhancementEnabled = true;

/**
 * Initialize the LLM system
 */
export const initLLM = (apiKey: string, providerType: LLMProviderType = 'openai'): void => {
  currentProviderType = providerType;

  switch (providerType) {
    case 'openai': {
      const provider = new OpenAIProvider();
      provider.init(apiKey);
      currentProvider = provider;
      break;
    }
    default:
      console.warn(`LLM provider ${providerType} not yet implemented, falling back to OpenAI`);
      const fallback = new OpenAIProvider();
      fallback.init(apiKey);
      currentProvider = fallback;
  }

  console.log(`✓ LLM initialized with ${currentProviderType}`);
};

/**
 * Enhance text using the current LLM provider
 * Returns original text if enhancement is disabled or fails
 */
export const enhanceText = async (
  text: string,
  context: EnhancementContext = {}
): Promise<string> => {
  if (!enhancementEnabled) {
    return text;
  }

  if (!currentProvider) {
    console.warn('LLM not initialized, returning original text');
    return text;
  }

  try {
    console.log(`🧠 Enhancing text (${text.length} chars)...`);
    const result: LLMResult = await currentProvider.enhance(text, context);
    console.log(`✓ Text enhanced (${result.tokensUsed} tokens used)`);
    llmEmitter.emit('enhanced', result);
    return result.text;
  } catch (error) {
    console.error('LLM enhancement failed:', error);
    llmEmitter.emit('error', error);
    // Return original text if enhancement fails (never lose user's work)
    return text;
  }
};

/**
 * Set enhancement enabled/disabled
 */
export const setEnhancementEnabled = (enabled: boolean): void => {
  enhancementEnabled = enabled;
  console.log(`Enhancement ${enabled ? 'enabled' : 'disabled'}`);
};

/**
 * Get enhancement status
 */
export const isEnhancementEnabled = (): boolean => enhancementEnabled;

export type { LLMResult, EnhancementContext, LLMProviderType } from './types';
