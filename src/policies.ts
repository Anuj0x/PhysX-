import type { ActionRewards, Action, PolicyFunction } from './types';

/**
 * Greedy policy - always chooses the action with highest estimated reward
 * @param actions Action-reward mapping
 * @param _epsilon Not used in greedy policy
 * @returns Best action
 */
export function greedyPolicy(actions: ActionRewards, _epsilon: number): Action {
  const actionKeys = Object.keys(actions);
  if (actionKeys.length === 0) {
    throw new Error('No actions available');
  }

  let bestScore = -Infinity;
  let bestAction: Action = actionKeys[0];

  actionKeys.forEach((action) => {
    const score = actions[action];
    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  });

  return bestAction;
}

/**
 * Random policy - chooses an action randomly
 * @param actions Action-reward mapping
 * @param _epsilon Not used in random policy
 * @returns Random action
 */
export function randomPolicy(actions: ActionRewards, _epsilon: number): Action {
  const actionKeys = Object.keys(actions);
  if (actionKeys.length === 0) {
    throw new Error('No actions available');
  }

  return actionKeys[Math.floor(Math.random() * actionKeys.length)];
}

/**
 * Epsilon-greedy policy - greedy with probability (1-epsilon), random with probability epsilon
 * @param actions Action-reward mapping
 * @param epsilon Exploration probability
 * @returns Selected action
 */
export function epsilonGreedyPolicy(actions: ActionRewards, epsilon: number): Action {
  if (Math.random() <= epsilon) {
    return randomPolicy(actions, epsilon);
  }
  return greedyPolicy(actions, epsilon);
}

/**
 * Epsilon-soft policy - greedy with probability (1-epsilon + epsilon/|A|), random with probability (epsilon - epsilon/|A|)
 * @param actions Action-reward mapping
 * @param epsilon Exploration parameter
 * @returns Selected action
 */
export function epsilonSoftPolicy(actions: ActionRewards, epsilon: number): Action {
  const actionKeys = Object.keys(actions);
  const numActions = actionKeys.length;

  if (numActions === 0) {
    throw new Error('No actions available');
  }

  const greedyProb = 1 - epsilon + epsilon / numActions;
  if (Math.random() <= greedyProb) {
    return greedyPolicy(actions, epsilon);
  }
  return randomPolicy(actions, epsilon);
}

/**
 * Softmax policy - selects actions probabilistically based on their relative values
 * @param actions Action-reward mapping
 * @param _epsilon Not used in softmax policy
 * @returns Selected action
 */
export function softmaxPolicy(actions: ActionRewards, _epsilon: number): Action {
  const actionKeys = Object.keys(actions);
  if (actionKeys.length === 0) {
    throw new Error('No actions available');
  }

  // Compute softmax probabilities
  const values = actionKeys.map(key => Math.exp(actions[key]));
  const denominator = values.reduce((sum, val) => sum + val, 0);
  const probabilities = values.map(val => val / denominator);

  // Sample from the distribution
  const random = Math.random();
  let cumulativeProb = 0;

  for (let i = 0; i < actionKeys.length; i++) {
    cumulativeProb += probabilities[i];
    if (random <= cumulativeProb) {
      return actionKeys[i];
    }
  }

  // Fallback (should not happen due to floating point precision)
  return randomPolicy(actions, _epsilon);
}

/**
 * Epsilon-greedy-softmax policy - greedy with probability (1-epsilon), softmax with probability epsilon
 * @param actions Action-reward mapping
 * @param epsilon Exploration probability
 * @returns Selected action
 */
export function epsilonGreedySoftmaxPolicy(actions: ActionRewards, epsilon: number): Action {
  if (Math.random() >= epsilon) {
    return greedyPolicy(actions, epsilon);
  }
  return softmaxPolicy(actions, epsilon);
}

/**
 * Registry of built-in policies
 */
export const policies: Record<string, PolicyFunction> = {
  greedy: greedyPolicy,
  epsilonGreedy: epsilonGreedyPolicy,
  epsilonSoft: epsilonSoftPolicy,
  softmax: softmaxPolicy,
  epsilonGreedySoftmax: epsilonGreedySoftmaxPolicy,
  random: randomPolicy,
};
