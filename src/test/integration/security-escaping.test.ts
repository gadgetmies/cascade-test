
import { test } from '../../index.js';

test({
  'Security Escaping Tests': {
    'should escape XML special characters in JUnit reporter: < > & " \'': () => {
      // This test name itself contains special characters
      return null;
    },
    'should fail with special characters in error message: < > & " \'': () => {
      return 'Failure message with < > & " \' characters';
    },
    'should handle TAP delimiter in test name: ---': () => {
      return null;
    },
    'should handle newlines in error message': () => {
      return 'First line\nSecond line';
    }
  }
});
