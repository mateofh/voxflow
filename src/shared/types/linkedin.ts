// ═══════════════════════════════════════════════════════════
// VoxFlow — LinkedIn Types
// ═══════════════════════════════════════════════════════════

export interface LinkedInCapturedContext {
  content: string;              // The post/comment text from clipboard
  capturedAt: Date;
  wordCount: number;
}

export interface LinkedInReplyRequest {
  originalContent: string;      // Post/comment from clipboard
  userIntention: string;        // Dictated intention
  regenerate?: boolean;         // Whether this is a regeneration request
}

export interface LinkedInReplyResult {
  reply: string;                // Generated reply text
  originalContent: string;      // For reference
  generatedAt: Date;
  provider: string;
  model: string;
}

export type LinkedInPopupAction = 'accept' | 'edit' | 'regenerate' | 'cancel';

export interface LinkedInPopupState {
  isOpen: boolean;
  isLoading: boolean;
  originalContent: string;
  userIntention: string;
  generatedReply: string;
  error?: string;
}
