/**
 * What makes a request answerable.
 *
 * The form on /request used to collect a name, an institution and a paragraph
 * — and no way to reply to any of it. The three fields that survive as
 * *required* are the three a guardian needs to answer: who is asking, where to
 * write back, and what they want. Phone and business are kept because a
 * tearoom usually volunteers both, but a request is not worth refusing for
 * the want of them.
 *
 * This module is deliberately free of environment, network and SvelteKit: it
 * is the half of the submission that can be tested, and it is tested.
 */

import {
  LIMITS,
  MIN_REQUEST_LENGTH,
  TRAP_FIELD,
  type RequestErrors,
  type RequestValues
} from '$lib/data/request-fields';

export type ParsedRequest = {
  values: RequestValues;
  errors: RequestErrors;
  /** The honeypot was filled: a bot, not a visitor. */
  trapped: boolean;
};

/**
 * Deliberately loose. Address syntax is far wilder than any regular expression
 * that fits on one line, and every strict pattern eventually rejects a real
 * customer. This catches the typo — a missing @, a missing dot, a stray space
 * — and leaves the rest to the reply bouncing.
 */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Collapses the runs of spaces a paste from a word processor leaves behind.
 * Line breaks survive on purpose: someone listing three products by line
 * means the three lines.
 */
function tidy(value: FormDataEntryValue | null | undefined): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
}

export function parseRequestForm(data: FormData): ParsedRequest {
  const values: RequestValues = {
    name: tidy(data.get('name')),
    email: tidy(data.get('email')),
    phone: tidy(data.get('phone')),
    business: tidy(data.get('business')),
    request: tidy(data.get('request'))
  };

  const errors: RequestErrors = {};

  if (!values.name) {
    errors.name = 'Tell us who is asking.';
  } else if (values.name.length > LIMITS.name) {
    errors.name = `Please keep the name under ${LIMITS.name} characters.`;
  }

  if (!values.email) {
    errors.email = 'We need an address to answer you.';
  } else if (values.email.length > LIMITS.email || !EMAIL_SHAPE.test(values.email)) {
    errors.email = 'That address does not look complete.';
  }

  if (values.phone.length > LIMITS.phone) {
    errors.phone = `Please keep the number under ${LIMITS.phone} characters.`;
  }

  if (values.business.length > LIMITS.business) {
    errors.business = `Please keep the name under ${LIMITS.business} characters.`;
  }

  if (values.request.length < MIN_REQUEST_LENGTH) {
    errors.request = 'Tell us a little more about what you need.';
  } else if (values.request.length > LIMITS.request) {
    errors.request = `Please keep the request under ${LIMITS.request} characters.`;
  }

  return { values, errors, trapped: tidy(data.get(TRAP_FIELD)).length > 0 };
}

export function hasErrors(errors: RequestErrors): boolean {
  return Object.keys(errors).length > 0;
}
