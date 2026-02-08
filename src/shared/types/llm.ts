// ═══════════════════════════════════════════════════════════
// VoxFlow — LLM Types
// ═══════════════════════════════════════════════════════════

export interface EnhancementContext {
  userProfile: {
    name: string;
    role: string;
    industry: string;
    tone: string;
    permanentInstructions: string;
  };
  activeApp: string;            // Name of the app where text will be inserted
  writingStyle?: string;        // Extracted style summary from user's samples
  knowledgeContext?: string;     // Relevant context from RAG (v2.0)
  language: string;
}

export interface LinkedInReplyContext extends EnhancementContext {
  clipboardContent: string;     // The original post/comment
  userIntention: string;        // What the user dictated as their intention
}

export interface LLMResponse {
  text: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  latencyMs: number;
}

export interface LLMProviderInterface {
  /** Initialize the provider */
  initialize(): Promise<void>;

  /** Enhance transcribed text with AI */
  enhance(rawText: string, context: EnhancementContext): Promise<LLMResponse>;

  /** Generate a LinkedIn reply */
  generateLinkedInReply(context: LinkedInReplyContext): Promise<LLMResponse>;

  /** Check if the provider is available and configured */
  isAvailable(): Promise<boolean>;

  /** Get the provider name */
  getName(): string;

  /** Get available models for this provider */
  getModels(): Promise<string[]>;
}

export interface LLMProviderConfig {
  apiKey: string;
  model: string;
  endpoint?: string;          // For custom/Ollama endpoints
  temperature: number;
  maxTokens: number;
  timeout: number;            // milliseconds
}

// Default configs per provider
export const LLM_DEFAULTS: Record<string, Partial<LLMProviderConfig>> = {
  openai: {
    model: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1',
    temperature: 0.3,
    maxTokens: 2048,
    timeout: 10000,
  },
  anthropic: {
    model: 'claude-3-5-haiku-20241022',
    endpoint: 'https://api.anthropic.com',
    temperature: 0.3,
    maxTokens: 2048,
    timeout: 10000,
  },
  groq: {
    model: 'llama-3.1-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1',
    temperature: 0.3,
    maxTokens: 2048,
    timeout: 10000,
  },
  ollama: {
    model: 'llama3.1:8b',
    endpoint: 'http://localhost:11434/v1',
    temperature: 0.3,
    maxTokens: 2048,
    timeout: 30000,           // local models can be slower
  },
};
