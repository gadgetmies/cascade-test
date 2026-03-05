
import { test } from '../../index.js';

test({
  'Security Escaping Tests': {
    'should escape XML special characters in JUnit reporter: < > & " \'': () => {
      // This test name itself contains special characters
      return null;
    },
    'should escape special characters in error message: < > & " \'': () => {
      // This is expected to fail, but we use it to verify the reporter's escaping
      return 'Failure message with < > & " \' characters';
    },
    'should handle TAP delimiter in test name: ---': () => {
      return null;
    },
    'should handle newlines in error message': () => {
      // This is expected to fail, but we use it to verify the reporter's newline handling
      return 'First line\nSecond line';
    }
  }
});
