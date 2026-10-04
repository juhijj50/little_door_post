/*  What the landing page shows, kept in the site's own files.
 *
 *  The admin panel rewrites prices.js, envelope.js, images.js and design.js
 *  through the GitHub API, and writes the photographs they point at into
 *  public/media. The host rebuilds the site from that commit, so none of this
 *  waits on the API or its database waking up.
 *
 *  Each file says `published: false` until the panel has written it once. Until
 *  then the page falls back to reading that part from /api/config, as it did
 *  before — so nothing is lost by shipping this ahead of the first publish.
 */
import prices from "./prices.js";
import envelope from "./envelope.js";
import images from "./images.js";
import design from "./design.js";

export { prices, envelope, images, design };
