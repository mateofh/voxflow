import OpenAI from 'openai';
import { LLMProvider, LLMResult, EnhancementContext } from './types';
import fs from 'fs';
import path from 'path';

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI GPT-4o-mini';
  private client: OpenAI | null = null;
  private model: string;
  private temperature: number;
  private systemPromptTemplate: string;

  constructor(model = 'gpt-4o-mini', temperature = 0.3) {
    this.model = model;
    this.temperature = temperature;

    // Load enhancement prompt template
    try {
      this.systemPromptTemplate = fs.readFileSync(
        path.join(__dirname, '../../prompts/enhancement.md'),
        'utf-8'
      );
    } catch {
      this.systemPromptTemplate = 'You are a text enhancement assistant. Clean up the dictated text, fix grammar and punctuation. Output ONLY the improved text.';
    }
  }

  /**
   * Initialize the OpenAI client with API key
   */
  init(apiKey: string): void {
    this.client = new OpenAI({ apiKey });
    console.log('✓ OpenAI client initialized');
  }

  /**
   * Enhance transcribed text using GPT-4o-mini
   */
  async enhance(text: string, context: EnhancementContext): Promise<LLMResult> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Call init() first.');
    }

    // Build system prompt from template
    const systemPrompt = context.customPrompt || this.buildSystemPrompt(context);

    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: this.temperature,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
    });

    const enhancedText = response.choices[0]?.message?.content?.trim() || text;
    const tokensUsed = response.usage?.total_tokens || 0;

    return {
      text: enhancedText,
      model: this.model,
      tokensUsed,
    };
  }

  /**
   * Build system prompt from template with context variables
   */
  private buildSystemPrompt(context: EnhancementContext): string {
    return this.systemPromptTemplate
      .replace('{{user_name}}', context.userName || 'Unknown')
      .replace('{{user_role}}', context.userRole || 'Unknown')
      .replace('{{user_industry}}', context.userIndustry || 'Unknown')
      .replace('{{user_tone}}', context.userTone || 'professional')
      .replace('{{user_instructions}}', context.userInstructions || 'None')
      .replace('{{active_app}}', context.activeApp || 'Unknown')
      .replace('{{language}}', context.language || 'es')
      .replace('{{transcribed_text}}', '');
  }
}
