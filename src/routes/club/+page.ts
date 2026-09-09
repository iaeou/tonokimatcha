import { redirect } from '@sveltejs/kit';

/**
 * The hall moved and was renamed: /club is now /request. Kept as a permanent
 * redirect because the old path is printed on nothing but is linked from
 * anywhere a visitor bookmarked it, and from the landing page's history.
 */
export function load() {
  redirect(308, '/request');
}
