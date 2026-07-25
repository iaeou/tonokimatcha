import type { Vessel } from '$lib/data/vessels';

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    interface PageState {
      /** Set when a vessel is opened over the landing page (shallow routing). */
      vessel?: Vessel;
    }
    // interface Platform {}
  }
}

export {};
