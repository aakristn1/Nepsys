/**
 * ==========================================================================
 *  NEPSYS SITE CONFIG — paste your real GoHighLevel details here.
 *  This is the ONLY file you need to edit to switch on the embeds.
 *  Leave a value as '' and the site shows a sensible fallback instead.
 * ==========================================================================
 */
window.NEPSYS_CONFIG = {

  /* --------------------------------------------------------------------
   * 1. GHL CALENDAR (15-minute call booking) — shown on /book
   * In GHL: Calendars > your calendar > Share > Embed code.
   * Copy ONLY the iframe's src URL, e.g.
   *   'https://api.leadconnectorhq.com/widget/booking/AbC123xyz'
   * While empty, /book shows the callback request form instead.
   * ------------------------------------------------------------------ */
  calendarEmbedUrl: '',

  /* --------------------------------------------------------------------
   * 2. GHL FORM (callback / missed-call audit request) — shown on /book
   * In GHL: Sites > Forms > your form > Integrate > Embed.
   * Copy ONLY the iframe's src URL, e.g.
   *   'https://api.leadconnectorhq.com/widget/form/AbC123xyz'
   * IMPORTANT: your GHL form must include an UNTICKED consent checkbox
   * for phone/SMS/email contact, with a link to /privacy (Spam Act).
   * While empty, the built-in form below (sent via Web3Forms) is used.
   * ------------------------------------------------------------------ */
  formEmbedUrl: '',

  /* --------------------------------------------------------------------
   * 3. GHL CHAT WIDGET — loads on every page when set.
   * In GHL: Sites > Chat Widget > Get code. From the snippet copy the
   * data-widget-id value. Make sure the widget's greeting says it's an
   * AI assistant if AI replies are switched on.
   * ------------------------------------------------------------------ */
  chatWidgetId: '',

  /* --------------------------------------------------------------------
   * 4. LIVE DEMO PHONE NUMBER — shown on /demo
   * The number that rings your demo AI receptionist / missed-call flow.
   * display: how it's written on the page, e.g. '02 1234 5678'
   * tel: international format for the link, e.g. '+61212345678'
   * ------------------------------------------------------------------ */
  demoPhone: { display: '', tel: '' },

  /* --------------------------------------------------------------------
   * 5. ANALYTICS — placeholder only. Nothing is loaded.
   * No tracking scripts are installed on this site. If you decide to add
   * one (e.g. GA4), add it deliberately and update /privacy to match.
   * ------------------------------------------------------------------ */
};
