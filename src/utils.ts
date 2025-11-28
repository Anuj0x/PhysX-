import type { State, Weights, Action, Reward, ActionRewards } from './types';

/**
 * Deep clone an object using JSON serialization
 * @param obj Object to clone
 * @returns Deep cloned object
 */
export function cloneJSON<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Set a reward for a state-action pair in the weights table
 * @param weights Weights table to modify
 * @param state Current state
 * @param action Action taken
 * @param reward Reward value to set
 */
export function setReward(weights: Weights, state: State, action: Action, reward: Reward): void {
  const stateKey = JSON.stringify(state);
  weights[stateKey] = weights[stateKey] || {};
  weights[stateKey][String(action)] = reward;
}

/**
 * Get rewards for a state and list of actions
 * @param weights Weights table
 * @param state Current state
 * @param actionList List of possible actions
 * @param defaultReward Default reward for uninitialized pairs
 * @returns Action-reward mapping
 */
export function getRewards(
  weights: Weights,
  state: State,
  actionList: Action[],
  defaultReward: Reward
): ActionRewards {
  const stateKey = JSON.stringify(state);
  const actions = weights[stateKey] || {};
  const result: ActionRewards = {};

  actionList.forEach((action) => {
    const actionKey = String(action);
    result[actionKey] = actions[actionKey] ?? defaultReward;
  });

  return result;
}

/**
 * Compute the SARSA update equation: Q(t) ← (1-α)Q(t) + α(r + γQ(t+1))
 * @param state0 State at time t
 * @param action0 Action at time t
 * @param reward1 Reward at time t+1
 * @param state1 State at time t+1
 * @param action1 Action at time t+1
 * @param alpha Learning rate
 * @param gamma Discount factor
 * @param weights Weights table to update
 * @param defaultReward Default reward
 * @param getRewardsFn Function to get rewards
 * @param setRewardFn Function to set rewards
 * @returns Updated Q-value
 */
export function sarsaEquation(
  state0: State,
  action0: Action,
  reward1: Reward,
  state1: State,
  action1: Action,
  alpha: number,
  gamma: number,
  weights: Weights,
  defaultReward: Reward,
  getRewardsFn: typeof getRewards,
  setRewardFn: typeof setReward
): number {
  const Qt0 = getRewardsFn(weights, state0, [action0], defaultReward)[String(action0)];
  const Qt1 = getRewardsFn(weights, state1, [action1], defaultReward)[String(action1)];

  const result = (1 - alpha) * Qt0 + alpha * (reward1 + gamma * Qt1);

  setRewardFn(weights, state0, action0, result);
  return result;
}
