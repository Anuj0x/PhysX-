// Main exports
export { SARSA, createSARSA } from './sarsa';

// Policy exports
export * from './policies';

// Type exports
export type {
  State,
  Action,
  Reward,
  ActionRewards,
  PolicyFunction,
  SARSAConfig,
  Weights,
  BuiltInPolicyName,
} from './types';

// Utility exports (for advanced users)
export { cloneJSON, setReward, getRewards, sarsaEquation } from './utils';

// Backward compatibility
import { createSARSA } from './sarsa';

/**
 * Default export for backward compatibility with CommonJS require
 * @param config SARSA configuration
 * @returns SARSA instance
 */
export default createSARSA;
