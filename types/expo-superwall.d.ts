/**
 * Type declarations for @superwall/react-native-superwall
 * SDK v2.x (wraps native SDK v4) with entitlements support
 */

declare module '@superwall/react-native-superwall' {
  export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';

  export interface RegisterOptions {
    /** The placement identifier that triggers the paywall */
    placement: string;
    /** Optional parameters to pass with the placement */
    params?: Record<string, any>;
    /** Callback executed when user has access (subscribed or paywall dismissed based on gating) */
    feature?: () => void | Promise<void>;
  }

  export interface PaywallInfo {
    name: string;
    identifier: string;
    experiment?: {
      id: string;
      groupId: string;
      variant: {
        id: string;
        type: string;
      };
    };
  }

  export interface SuperwallSharedInstance {
    /**
     * Register a placement to potentially show a paywall
     * The feature callback is executed based on the paywall's gating mode
     */
    register(options: RegisterOptions): Promise<void>;

    /**
     * Get the current subscription status
     * Returns 'ACTIVE' if user has active entitlements
     */
    getSubscriptionStatus(): Promise<SubscriptionStatus>;

    /**
     * Set user attributes for targeting
     */
    setUserAttributes(attributes: Record<string, any>): Promise<void>;

    /**
     * Identify a user with a custom user ID
     */
    identify(userId: string): Promise<void>;

    /**
     * Reset the user (for logout)
     */
    reset(): Promise<void>;

    /**
     * Check if the paywall is being presented
     */
    isPaywallPresented(): Promise<boolean>;

    /**
     * Dismiss any presented paywall
     */
    dismiss(): Promise<void>;
  }

  export interface SuperwallStatic {
    /**
     * Configure Superwall with your API key
     */
    configure(apiKey: string): Promise<void>;

    /**
     * The shared Superwall instance
     */
    shared: SuperwallSharedInstance;
  }

  export const Superwall: SuperwallStatic;
}
