/**
 * OpenRouter AI Provider for FinSync
 * Handles all OpenRouter API interactions with proper error handling and response formatting
 */

export interface OpenRouterRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: {
    type: 'json_object' | 'text';
  };
}

export interface OpenRouterResponse {
  success: boolean;
  data?: {
    content: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}

class OpenRouterProvider {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY not found in environment variables');
    }
  }

  async executeRequest(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'FinSync',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model || 'z-ai/glm-4.5-air:free',
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.max_tokens || 2000,
          response_format: request.response_format || { type: 'text' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        return {
          success: false,
          error: {
            message: errorData.error?.message || `HTTP ${response.status}`,
            type: 'api_error',
            code: response.status.toString(),
          },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          content: data.choices[0].message.content,
          usage: data.usage,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'network_error',
        },
      };
    }
  }
}

// Export singleton instance
export const openRouterProvider = new OpenRouterProvider();