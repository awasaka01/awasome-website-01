// ──────────────────────────────────────────────────────────────────────────────────────────────────
// 
//    Wrapper for the build.js script to allow cleaner restarts
//    Made due to problems encountered when trying to
//      restart build.js fully after config changes whilst dev server active
//    And I was restarting in the first place due to a bug with eleventy,
//      it breaks the --incremental flag when the .eleventy.js config is reloaded
// 
// ──────────────────────────────────────────────────────────────────────────────────────────────────

