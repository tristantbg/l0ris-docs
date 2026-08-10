import { env } from '$env/dynamic/private';

export const token = env.SANITY_API_READ_TOKEN ?? '';
