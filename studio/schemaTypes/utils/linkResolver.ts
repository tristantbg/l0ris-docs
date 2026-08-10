/**
 * Re-export of the web app's link resolver so the Studio and the site can
 * never drift apart. The web app owns the route map.
 */
export { linkResolver } from '../../../web/src/lib/utils/linkResolver'
