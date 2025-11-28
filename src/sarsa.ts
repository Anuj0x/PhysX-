import { cloneJSON, setReward, getRewards, sarsaEquation } from './utils';
import { policies } from './policies';
import type {
  State,
  Action,
  Reward,
  SARSAConfig,
  Weights,
  PolicyFunction,
  BuiltInPolicyName,
} from './types';

/**
 * Default SARSA configuration values
 */
const DEFAULTS = {
  alpha: 0.2, // Learning rate
  gamma: 0.8, // Discount factor
  defaultReward: 0, // Default reward for uninitialized state-action pairs
  epsilon: 0.001, // Exploration parameter
  policy: 'greedy' as BuiltInPolicyName,
} as const;

/**
 * Configuration with defaults applied
 */
interface ResolvedConfig {
  alpha: number;
  gamma: number;
  defaultReward: number;
  epsilon: number;
  policy: PolicyFunction;
}

/**
 * Modern SARSA reinforcement learning implementation
 *
 * SARSA is an on-policy temporal difference learning algorithm that learns
 * to predict the expected return from taking actions in states.
 */
export class SARSA {
  private _config: ResolvedConfig;
  private _weights: Weights;

  /**
   * Create a new SARSA instance
   * @param config Configuration options
   */
  constructor(config?: SARSAConfig) {
    this._config = this.resolveConfig(config);
    this._weights = {};
  }

  /**
   * Resolve configuration with defaults and validate policy
   * @param config User-provided configuration
   * @returns Resolved configuration
   * @private
   */
  private resolveConfig(config: SARSAConfig = {}): ResolvedConfig {
    const result = { ...DEFAULTS, ...config };

    // Resolve policy function
    if (typeof result.policy === 'string') {
      const policyName = result.policy as BuiltInPolicyName;
      if (!(policyName in policies)) {
        console.error(`Policy '${policyName}' not found. Available policies: ${Object.keys(policies).join(', ')}. Using 'greedy'.`);
        result.policy = policies.greedy;
      } else {
        result.policy = policies[policyName];
      }
    } else if (typeof result.policy !== 'function') {
      console.error('Policy must be a function or valid policy name. Using greedy policy.');
      result.policy = policies.greedy;
    }

    return result as ResolvedConfig;
  }

  /**
   * Get current configuration
   * @returns Copy of current configuration
   */
  getConfig(): ResolvedConfig {
    return cloneJSON(this._config);
  }

  /**
   * Update configuration
   * @param config New configuration values
   * @returns This instance for chaining
   */
  setConfig(config: SARSAConfig): this {
    this._config = this.resolveConfig({ ...this._config, ...config });
    return this;
  }

  /**
   * Manually set a reward for a state-action pair (for debugging/testing)
   * @param state State
   * @param action Action
   * @param reward Reward value
   * @returns This instance for chaining
   */
  setReward(state: State, action: Action, reward: Reward): this {
    setReward(this._weights, state, action, reward);
    return this;
  }

  /**
   * Get rewards for a state and list of actions
   * @param state State
   * @param actionList List of actions to get rewards for
   * @returns Action-reward mapping
   */
  getRewards(state: State, actionList: Action[]): Record<string, number> {
    return cloneJSON(getRewards(this._weights, state, actionList, this._config.defaultReward));
  }

  /**
   * Perform SARSA update: Q(s,a) ← (1-α)Q(s,a) + α(r + γQ(s',a'))
   * @param state0 State at time t
   * @param action0 Action at time t
   * @param reward1 Reward at time t+1
   * @param state1 State at time t+1
   * @param action1 Action at time t+1
   * @returns Updated Q-value
   */
  update(
    state0: State,
    action0: Action,
    reward1: Reward,
    state1: State,
    action1: Action
  ): number {
    return sarsaEquation(
      state0,
      action0,
      reward1,
      state1,
      action1,
      this._config.alpha,
      this._config.gamma,
      this._weights,
      this._config.defaultReward,
      getRewards,
      setReward
    );
  }

  /**
   * Choose an action for a given state using the current policy
   * @param state Current state
   * @param actionList Available actions
   * @returns Selected action
   */
  chooseAction(state: State, actionList: Action[]): Action {
    const actions = getRewards(this._weights, state, actionList, this._config.defaultReward);
    return this._config.policy(actions, this._config.epsilon);
  }

  /**
   * Create a deep clone of this SARSA instance
   * @returns New SARSA instance with copied weights and configuration
   */
  clone(): SARSA {
    const cloned = new SARSA(this._config);
    cloned._weights = cloneJSON(this._weights);
    return cloned;
  }

  /**
   * Get access to internal weights (for debugging/advanced use)
   * @returns Reference to internal weights table
   * @deprecated Use getRewards() for normal operation
   */
  get weights(): Weights {
    return this._weights;
  }
}

/**
 * Factory function to create SARSA instances (maintains backward compatibility)
 * @param config Configuration options
 * @returns New SARSA instance
 */
export function createSARSA(config?: SARSAConfig): SARSA {
  return new SARSA(config);
}
