/**
 * State representation - can be any serializable type
 */
export type State = string | number | object | any[];

/**
 * Action representation - can be any serializable type
 */
export type Action = string | number;

/**
 * Reward value
 */
export type Reward = number;

/**
 * Action-Reward mapping
 */
export type ActionRewards = Record<string, number>;

/**
 * Policy function type
 */
export type PolicyFunction = (actions: ActionRewards, epsilon: number) => Action;

/**
 * SARSA configuration options
 */
export interface SARSAConfig {
  /** Learning rate (0-1), defaults to 0.2 */
  alpha?: number;
  /** Discount factor (0-1), defaults to 0.8 */
  gamma?: number;
  /** Default reward for uninitialized state-action pairs, defaults to 0 */
  defaultReward?: number;
  /** Exploration parameter, defaults to 0.001 */
  epsilon?: number;
  /** Policy function or policy name, defaults to 'greedy' */
  policy?: PolicyFunction | keyof typeof BUILT_IN_POLICIES;
}

/**
 * Internal weights storage
 */
export type Weights = Record<string, Record<string, number>>;

/**
 * Built-in policy names
 */
export const BUILT_IN_POLICIES = {
  greedy: 'greedy',
  epsilonGreedy: 'epsilonGreedy',
  epsilonSoft: 'epsilonSoft',
  softmax: 'softmax',
  epsilonGreedySoftmax: 'epsilonGreedySoftmax',
  random: 'random',
} as const;

export type BuiltInPolicyName = keyof typeof BUILT_IN_POLICIES;
