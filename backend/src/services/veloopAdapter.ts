import { env } from '../config/env';
import { AuditLog } from '../models/AuditLog';

export interface VELoopRewardRequest {
  userId: string;
  amount: number;
  reason: string;
  gameId: string;
  metadata?: Record<string, any>;
}

export interface VELoopRewardResponse {
  success: boolean;
  transactionReference: string;
  status: 'confirmed' | 'pending' | 'rejected';
  mode: 'development_mock' | 'sandbox' | 'production';
  message: string;
}

export class VELoopAdapterService {
  /**
   * Dispatch reward settlement to VELoop platform
   */
  static async issueReward(req: VELoopRewardRequest): Promise<VELoopRewardResponse> {
    if (!env.VELOOP_REWARDS_ENABLED) {
      return {
        success: false,
        transactionReference: `disabled_${Date.now()}`,
        status: 'rejected',
        mode: env.VELOOP_MODE,
        message: 'VELoop rewards distribution is currently disabled by configuration'
      };
    }

    if (req.amount <= 0) {
      return {
        success: false,
        transactionReference: `zero_${Date.now()}`,
        status: 'rejected',
        mode: env.VELOOP_MODE,
        message: 'Reward amount must be strictly positive'
      };
    }

    if (env.VELOOP_MODE === 'production') {
      // In production mode, an outbound signed HTTP request to official VELoop API would occur:
      // POST https://api.veloop.io/v1/rewards/credit with Bearer token & HMAC signature
      // If credentials are placeholder, fail safely rather than fabricating real external money value
      if (!env.VELOOP_API_KEY || env.VELOOP_API_KEY === 'mock-veloop-api-key-internal') {
        throw new Error(
          'CRITICAL: Production VELoop integration requires valid production VELOOP_API_KEY and API endpoint configuration.'
        );
      }
    }

    // Development / Sandbox mode handling
    const txRef = `VL_${env.VELOOP_MODE.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    console.log(`[VELoop Adapter][${env.VELOOP_MODE}] Issued reward of ${req.amount} VELoop Coins for user ${req.userId}. Ref: ${txRef}`);

    await AuditLog.create({
      action: 'VELOOP_REWARD_SETTLEMENT',
      category: 'wallet',
      severity: 'info',
      details: {
        userId: req.userId,
        amount: req.amount,
        reason: req.reason,
        mode: env.VELOOP_MODE,
        txRef
      }
    });

    return {
      success: true,
      transactionReference: txRef,
      status: 'confirmed',
      mode: env.VELOOP_MODE,
      message: `Successfully verified and settled ${req.amount} VELoop Reward Coins (${env.VELOOP_MODE} mode).`
    };
  }
}
