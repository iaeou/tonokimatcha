import { describe, expect, test } from 'vitest';
import { LIMITS, MIN_REQUEST_LENGTH, TRAP_FIELD } from '../data/request-fields';
import { hasErrors, parseRequestForm } from './request-form';

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const complete = {
  name: 'Mika Horiuchi',
  email: 'mika@tearoom.example',
  phone: '+34 600 000 000',
  business: 'Sakai Tearoom',
  request: 'We serve about two hundred bowls a week and would like the tube.'
};

describe('parseRequestForm', () => {
  test('accepts a complete request', () => {
    const { values, errors, trapped } = parseRequestForm(form(complete));

    expect(hasErrors(errors)).toBe(false);
    expect(trapped).toBe(false);
    expect(values).toEqual(complete);
  });

  test('accepts a request with neither phone nor business', () => {
    const { values, errors } = parseRequestForm(
      form({ name: complete.name, email: complete.email, request: complete.request })
    );

    expect(hasErrors(errors)).toBe(false);
    expect(values.phone).toBe('');
    expect(values.business).toBe('');
  });

  test('requires the three fields a guardian needs to answer', () => {
    const { errors } = parseRequestForm(form({ name: '', email: '', request: '' }));

    expect(Object.keys(errors).sort()).toEqual(['email', 'name', 'request']);
  });

  test('refuses an address that cannot be replied to', () => {
    for (const email of ['mika', 'mika@tearoom', 'mika at tearoom.example', '@tearoom.example']) {
      expect(parseRequestForm(form({ ...complete, email })).errors.email).toBeDefined();
    }
  });

  test('accepts the ordinary shapes a real address takes', () => {
    for (const email of [
      'mika+tonoki@tearoom.example',
      'mika.horiuchi@sub.tearoom.co.jp',
      "o'brien@tearoom.example"
    ]) {
      expect(parseRequestForm(form({ ...complete, email })).errors.email).toBeUndefined();
    }
  });

  test('refuses a request too short to say anything', () => {
    const { errors } = parseRequestForm(form({ ...complete, request: 'tea' }));

    expect(errors.request).toBeDefined();
    expect('tea'.length).toBeLessThan(MIN_REQUEST_LENGTH);
  });

  test('caps every field, because the textarea is a write to our database', () => {
    const { errors } = parseRequestForm(
      form({
        name: 'n'.repeat(LIMITS.name + 1),
        email: `${'e'.repeat(LIMITS.email)}@tearoom.example`,
        phone: 'p'.repeat(LIMITS.phone + 1),
        business: 'b'.repeat(LIMITS.business + 1),
        request: 'r'.repeat(LIMITS.request + 1)
      })
    );

    expect(Object.keys(errors).sort()).toEqual(['business', 'email', 'name', 'phone', 'request']);
  });

  test('tidies pasted whitespace but keeps the lines someone typed', () => {
    const { values } = parseRequestForm(
      form({
        ...complete,
        name: '  Mika   Horiuchi  ',
        request: 'Two tubes a month.\nOne pouch for the counter.'
      })
    );

    expect(values.name).toBe('Mika Horiuchi');
    expect(values.request).toBe('Two tubes a month.\nOne pouch for the counter.');
  });

  test('flags the honeypot without adding an error', () => {
    // The page must be able to answer a bot exactly as it answers a visitor.
    const { errors, trapped } = parseRequestForm(
      form({ ...complete, [TRAP_FIELD]: 'https://spam.example' })
    );

    expect(trapped).toBe(true);
    expect(hasErrors(errors)).toBe(false);
  });
});
