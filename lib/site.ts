// The public address Google should treat as the "real" home of DisputeNinja's content pages.
// The app (Play Store TWA) keeps working on dispute-ninja.vercel.app; both addresses serve the same site,
// and every page names this address as its canonical so search engines consolidate on it.
//
// DEPLOY ORDER MATTERS: only ship this after help.lowkeyaitech.com loads this site (HTTP 200).
// Otherwise Google is told the "real" copy lives at an address that does not work.
export const SITE_URL = 'https://help.lowkeyaitech.com'
