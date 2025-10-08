import { test } from '../../index.js';

test({
  'Skip Examples': {
    skip: () => {
      return {
        reason: 'Feature not implemented yet',
        until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };
    },

    'should be skipped': (): string | null => {
      return 'This test should be skipped';
    },

    'Skipped Expired Skip': {
      skip: () => {
        return {
          reason: 'Test nested expired skip',
          until: '2024-01-01'
        };
      },

      'expired skip should be skipped because of the skip at the higher level': (): string | null => {
        return 'This should be skipped because of the skip at the higher level';
      }
    }
  },

  'Expired Skip': {
    skip: () => {
      return {
        reason: 'This skip has expired',
        until: '2024-01-01'
      };
    },

    'should fail due to expired skip': (): string | null => {
      return 'This test should fail due to expired skip';
    }
  }
});
