(() => {
  "use strict";

  // Public Umami Website ID. Never put account credentials or API keys here.
  const UMAMI_WEBSITE_ID = "d5bc1167-e8ba-4327-a104-96c2923a382a";
  const UMAMI_SCRIPT_URL = "https://cloud.umami.is/script.js";
  const SITE_HOSTNAME = "ryanchan339.github.io";
  const OPT_OUT_KEY = "ryan-portfolio-analytics-opt-out";
  let optedOut = false;
  try {
    optedOut = localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    /* Storage can be unavailable. */
  }
  const privacySignal =
    navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1";
  const localPreview =
    location.hostname !== SITE_HOSTNAME || location.protocol === "file:";
  const canCount =
    Boolean(UMAMI_WEBSITE_ID) && !optedOut && !privacySignal && !localPreview;

  const status = document.querySelector("[data-analytics-status]");
  const toggle = document.querySelector("[data-analytics-toggle]");
  if (status) {
    status.textContent = !UMAMI_WEBSITE_ID
      ? "Analytics is not active until a dashboard is connected."
      : privacySignal
        ? "Analytics is off because your browser sends a privacy preference."
        : optedOut
          ? "Analytics is off in this browser."
          : localPreview
            ? "Analytics is off in this local preview."
            : "Anonymous analytics is enabled. You can turn it off in this browser.";
  }
  if (toggle) {
    toggle.hidden = !UMAMI_WEBSITE_ID || privacySignal || localPreview;
    toggle.textContent = optedOut
      ? "Allow analytics in this browser"
      : "Turn off analytics in this browser";
    toggle.addEventListener("click", () => {
      try {
        localStorage.setItem(OPT_OUT_KEY, optedOut ? "0" : "1");
        location.reload();
      } catch {
        if (status)
          status.textContent =
            "Your browser did not allow this preference to be saved. You can block analytics with its privacy settings.";
      }
    });
  }

  if (canCount) {
    // Use Umami's documented before-send hook to allow only traffic statistics.
    // No query strings, user identifiers, form input, replay, or error reporting.
    window.portfolioBeforeSend = (type, payload) => {
      if (type !== "event") return false;
      const eventName = payload.name;
      if (
        eventName !== undefined &&
        !/^[a-z0-9][a-z0-9-]{0,49}$/.test(eventName)
      )
        return false;
      let referrer = "";
      try {
        referrer = document.referrer ? new URL(document.referrer).origin : "";
      } catch {
        /* Invalid or unavailable referrer. */
      }
      return {
        website: UMAMI_WEBSITE_ID,
        hostname: location.hostname,
        url: location.pathname,
        title: document.title,
        referrer,
        language: navigator.language,
        screen: payload.screen,
        ...(eventName === undefined ? {} : { name: eventName }),
      };
    };

    const script = document.createElement("script");
    script.src = UMAMI_SCRIPT_URL;
    script.dataset.websiteId = UMAMI_WEBSITE_ID;
    script.dataset.domains = SITE_HOSTNAME;
    script.dataset.autoTrack = "false";
    script.dataset.doNotTrack = "true";
    script.dataset.excludeSearch = "true";
    script.dataset.excludeHash = "true";
    script.dataset.beforeSend = "portfolioBeforeSend";
    script.dataset.fetchCredentials = "omit";
    script.async = true;
    script.addEventListener("load", () => {
      if (typeof window.umami?.track !== "function") return;
      const track = (name) => {
        Promise.resolve(window.umami.track(name)).catch(() => {
          /* Analytics must not interfere with navigation. */
        });
      };
      const trackLink = (event) => {
        if (event.type === "auxclick" && event.button !== 1) return;
        const link = event.target?.closest?.("[data-track]");
        if (link) track(link.dataset.track);
      };
      document.addEventListener("click", trackLink);
      document.addEventListener("auxclick", trackLink);

      const countPage = () => {
        if (document.visibilityState === "hidden") return;
        document.removeEventListener("visibilitychange", countPage);
        track();
      };
      if (document.visibilityState === "hidden") {
        document.addEventListener("visibilitychange", countPage);
      } else {
        countPage();
      }
    });
    document.head.appendChild(script);
  }
})();
