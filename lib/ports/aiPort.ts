/**
 * Ports & Adapters (Hexagonal Architecture) - AI Communication Port
 * Decouples domain logic from specific transport protocols or AI SDKs.
 */

export interface AiChatRequest {
  prompt: string;
  systemInstruction?: string;
  context?: Record<string, any>;
}

export interface AiChatResponse {
  content: string;
  metadata?: Record<string, any>;
}

export interface IAiChatPort {
  sendMessage(request: AiChatRequest): Promise<AiChatResponse>;
}

export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio: string;
  docId: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface IImageGenerationPort {
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
}

/**
 * Default HTTP Next.js API Adapter
 */
export class NextApiChatAdapter implements IAiChatPort {
  private endpoint: string;

  constructor(endpoint: string = '/api/ai') {
    this.endpoint = endpoint;
  }

  async sendMessage(request: AiChatRequest): Promise<AiChatResponse> {
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: request.prompt,
        systemInstruction: request.systemInstruction,
      }),
    });

    if (!res.ok) {
      throw new Error(`AI Request failed with status ${res.status}`);
    }

    const data = await res.json();
    return {
      content: data.text || data.content || '',
      metadata: data.metadata,
    };
  }
}
