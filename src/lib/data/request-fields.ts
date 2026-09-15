/**
 * The shape of a request, shared by the form and the server that reads it.
 *
 * It lives in `data/` rather than in `server/` for one reason: the component
 * needs the same ceilings the validator enforces, and anything under
 * `$lib/server` cannot be imported by a component — SvelteKit fails the build
 * to keep server secrets out of the browser bundle. Two copies of a number
 * that must agree is how `maxlength` and the validator drift apart.
 */

export const REQUEST_FIELDS = ['name', 'email', 'phone', 'business', 'request'] as const;

export type RequestField = (typeof REQUEST_FIELDS)[number];

export type RequestValues = Record<RequestField, string>;

/** Field-level messages, plus `form` for anything that is not one field's fault. */
export type RequestErrors = Partial<Record<RequestField | 'form', string>>;

/**
 * Field length ceilings. Not UX niceties — an unbounded textarea is a free
 * write to the database, so these are enforced on the server too, where a bot
 * that never read a `maxlength` attribute still meets them.
 */
export const LIMITS = {
  name: 120,
  email: 254, // the longest address RFC 5321 allows
  phone: 40,
  business: 160,
  request: 4000
} as const;

/** The shortest paragraph that can still say what someone needs. */
export const MIN_REQUEST_LENGTH = 10;

/**
 * Name of the hidden field no human ever fills. Kept vague on purpose: a trap
 * called `honeypot` is one a bot can learn to skip.
 */
export const TRAP_FIELD = 'website';
