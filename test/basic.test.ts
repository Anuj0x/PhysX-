import { createSARSA } from '../src';

describe('SARSA', () => {
  describe('Basic functionality', () => {
    test('createSARSA returns a function that creates SARSA instances', () => {
      expect(typeof createSARSA).toBe('function');
      const sarsa = createSARSA();
      expect(sarsa).toBeDefined();
      expect(typeof sarsa).toBe('object');
    });

    test('SARSA instance has expected methods', () => {
      const sarsa = createSARSA();

      expect(typeof sarsa.getConfig).toBe('function');
      expect(typeof sarsa.setConfig).toBe('function');
      expect(typeof sarsa.setReward).toBe('function');
      expect(typeof sarsa.getRewards).toBe('function');
      expect(typeof sarsa.update).toBe('function');
      expect(typeof sarsa.chooseAction).toBe('function');
      expect(typeof sarsa.clone).toBe('function');
    });
  });

  describe('Configuration', () => {
    test('creates basic config with defaults', () => {
      const sarsa = createSARSA();
      const config = sarsa.getConfig();

      expect(typeof config).toBe('object');
      expect(config.alpha).toBe(0.2);
      expect(config.gamma).toBe(0.8);
      expect(config.defaultReward).toBe(0);
      expect(config.epsilon).toBe(0.001);
      expect(typeof config.policy).toBe('function');
    });

    test('able to set and reset options', () => {
      const sarsa = createSARSA({ alpha: 0.9, gamma: 0.1 });
      let config = sarsa.getConfig();

      expect(config.alpha).toBe(0.9);
      expect(config.gamma).toBe(0.1);
      expect(config.defaultReward).toBe(0);

      sarsa.setConfig({ alpha: 0.3 });
      config = sarsa.getConfig();

      expect(config.alpha).toBe(0.3);
      expect(config.gamma).toBe(0.1);
      expect(config.defaultReward).toBe(0);
    });
  });

  describe('Reward management', () => {
    test('set and get rewards', () => {
      const sarsa = createSARSA({ alpha: 0.9, gamma: 0.1, defaultReward: -100 });

      sarsa.setReward(5, 'up', 1);
      const actions = sarsa.getRewards(5, ['up', 'down']);

      expect(actions.up).toBe(1);
      expect(actions.down).toBe(-100);
    });
  });

  describe('SARSA update algorithm', () => {
    test('update function works correctly', () => {
      const sarsa = createSARSA({ alpha: 0.9, gamma: 0.1, defaultReward: -1 });

      // Initial state: all actions have default reward of -1
      let actions = sarsa.getRewards(5, ['up', 'down']);
      expect(actions.up).toBe(-1);
      expect(actions.down).toBe(-1);

      // First update
      const result = sarsa.update(5, 'up', 10, 6, 'down');
      // Q(t) + a(r + yQ(t+1) - Q(t)) = -1 + 0.9*(10 + 0.1*-1 - (-1)) = -1 + 0.9*(10 + 0.1*-1 + 1) = -1 + 0.9*11.1 = -1 + 9.99 = 8.99
      expect(Math.round(result * 100)).toBe(Math.round(8.99 * 100));

      actions = sarsa.getRewards(5, ['up', 'down']);
      expect(Math.round(actions.up * 100)).toBe(Math.round(8.99 * 100));
      expect(actions.down).toBe(-1);

      // Second update
      const result2 = sarsa.update(6, 'down', 10, 7, 'down');
      // Same calculation: -1 + 0.9*(10 + 0.1*-1 - (-1)) = 8.99
      expect(Math.round(result2 * 100)).toBe(Math.round(8.99 * 100));

      actions = sarsa.getRewards(6, ['up', 'down']);
      expect(Math.round(actions.down * 100)).toBe(Math.round(8.99 * 100));
      expect(actions.up).toBe(-1);

      // Third update
      const result3 = sarsa.update(5, 'up', 10, 6, 'down');
      // Q(t) + a(r + yQ(t+1) - Q(t)) = 8.99 + 0.9*(10 + 0.1*8.99 - 8.99) = 8.99 + 0.9*(10 + 0.899 - 8.99) = 8.99 + 0.9*1.909 = 8.99 + 1.7181 = 10.7081
      expect(Math.round(result3 * 100)).toBe(Math.round(10.7081 * 100));

      actions = sarsa.getRewards(5, ['up', 'down']);
      expect(Math.round(actions.up * 100)).toBe(Math.round(10.7081 * 100));
      expect(actions.down).toBe(-1);
    });
  });

  describe('Cloning', () => {
    test('basic clone', () => {
      const sarsa = createSARSA();
      const config = sarsa.getConfig();

      expect(config.alpha).toBe(0.2);
      expect(config.gamma).toBe(0.8);
      expect(config.defaultReward).toBe(0);

      sarsa.setReward('state', 'action', 4);
      expect(sarsa.getRewards('state', ['action']).action).toBe(4);

      const clone = sarsa.clone();

      const cloneConfig = clone.getConfig();
      expect(cloneConfig.alpha).toBe(0.2);
      expect(cloneConfig.gamma).toBe(0.8);
      expect(cloneConfig.defaultReward).toBe(0);
      expect(clone.getRewards('state', ['action']).action).toBe(4);

      // Test independence
      clone.setReward('state', 'action', 5);
      expect(clone.getRewards('state', ['action']).action).toBe(5);
      expect(sarsa.getRewards('state', ['action']).action).toBe(4);
    });
  });

  describe('Action selection', () => {
    test('chooseAction works with greedy policy', () => {
      const sarsa = createSARSA({ policy: 'greedy', defaultReward: -1 });

      // Set different rewards
      sarsa.setReward('state', 'up', 10);
      sarsa.setReward('state', 'down', 5);
      sarsa.setReward('state', 'left', 1);
      sarsa.setReward('state', 'right', 0);

      // Greedy should always choose 'up'
      for (let i = 0; i < 10; i++) {
        expect(sarsa.chooseAction('state', ['up', 'down', 'left', 'right'])).toBe('up');
      }
    });

    test('chooseAction works with random policy', () => {
      const sarsa = createSARSA({ policy: 'random', defaultReward: -1 });

      sarsa.setReward('state', 'up', 10);
      sarsa.setReward('state', 'down', 5);

      // Random should sometimes choose different actions
      const actions = new Set<string>();
      for (let i = 0; i < 100; i++) {
        actions.add(String(sarsa.chooseAction('state', ['up', 'down'])));
      }
      expect(actions.size).toBeGreaterThan(1); // Should have selected both actions
    });
  });
});
