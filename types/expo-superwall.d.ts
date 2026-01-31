/**
 * Type declarations for @superwall/react-native-superwall
 * SDK v2.x (wraps native SDK v4) with entitlements support
 */

declare module '@superwall/react-native-superwall' {
  export interface Entitlement {
    id: string;
  }

  export type SubscriptionStatus = 
    | { status: 'ACTIVE'; entitlements: Entitlement[] }
    | { status: 'INACTIVE' }
    | { status: 'UNKNOWN' };

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

  export interface ConfigureOptions {
    /** Your Public API Key from the Superwall dashboard */
    apiKey: string;
    /** Optional configuration options */
    options?: SuperwallOptions;
    /** Optional purchase controller for custom purchase handling */
    purchaseController?: PurchaseController;
    /** Optional completion handler called when configuration is complete */
    completion?: () => void;
  }

  export interface SuperwallOptions {
    toJson(): any;
  }

  export interface PurchaseController {
    purchaseFromAppStore?(productId: string): Promise<any>;
    purchaseFromGooglePlay?(productId: string, basePlanId?: string, offerId?: string): Promise<any>;
    restorePurchases?(): Promise<any>;
  }

  export interface SuperwallSharedInstance {
    /**
     * Register a placement to potentially show a paywall
     * The feature callback is executed based on the paywall's gating mode
     */
    register(options: RegisterOptions): Promise<void>;

    /**
     * Get the current subscription status
     * Returns an object with status property ('ACTIVE', 'INACTIVE', or 'UNKNOWN')
     */
    getSubscriptionStatus(): Promise<SubscriptionStatus>;

    /**
     * Set user attributes for targeting
     */
    setUserAttributes(attributes: Record<string, any>): Promise<void>;

    /**
     * Identify a user with a custom user ID
     */
    identify(options: { userId: string; options?: any }): Promise<void>;

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

  /**
   * The Superwall class - exported as default
   */
  class Superwall {
    /**
     * Configure Superwall with your API key
     * @param options Configuration options including apiKey
     */
    static configure(options: ConfigureOptions): Promise<Superwall>;

    /**
     * The shared Superwall instance
     */
    static readonly shared: SuperwallSharedInstance;

    /**
     * Register a placement
     */
    register(options: RegisterOptions): Promise<void>;

    /**
     * Get subscription status
     */
    getSubscriptionStatus(): Promise<SubscriptionStatus>;

    /**
     * Identify a user
     */
    identify(options: { userId: string; options?: any }): Promise<void>;

    /**
     * Reset the user
     */
    reset(): Promise<void>;

    /**
     * Set user attributes
     */
    setUserAttributes(attributes: Record<string, any>): Promise<void>;

    /**
     * Dismiss any presented paywall
     */
    dismiss(): Promise<void>;
  }

  export default Superwall;
}
