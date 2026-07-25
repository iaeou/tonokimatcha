import { error } from '@sveltejs/kit';
import { findVessel } from '$lib/data/vessels';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  const vessel = findVessel(params.slug);
  if (!vessel) throw error(404, 'No such vessel');

  return { vessel };
};
