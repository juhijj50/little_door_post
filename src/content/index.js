/*  What the landing page shows, kept in the site's own files.
 *
 *  The admin panel rewrites prices.js and inside.js through the GitHub API,
 *  and writes the photograph inside.js points at into public/media. The host
 *  rebuilds the site from that commit, so neither waits on the API or its
 *  database waking up.
 *
 *  Each file says `published: false` until the panel has written it once.
 *  Until then the page reads that part from /api/config instead.
 */
import prices from "./prices.js";
import inside from "./inside.js";

export { prices, inside };
