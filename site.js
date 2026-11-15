(() => {
  "use strict";

  // Public GoatCounter endpoint. No credentials or visitor identity are stored here.
  const ANALYTICS_ENDPOINT = "";
  const OPT_OUT_KEY = "ryan-portfolio-analytics-opt-out";
  const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
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
    localHosts.has(location.hostname) || location.protocol === "file:";
  const canCount =
    Boolean(ANALYTICS_ENDPOINT) && !optedOut && !privacySignal && !localPreview;

  // Only fixed, authored labels become click events. Never record form input or query strings.
  document.querySelectorAll("[data-track]").forEach((link) => {
    link.setAttribute("data-goatcounter-click", link.dataset.track);
    link.setAttribute(
      "data-goatcounter-title",
      link.textContent.trim().replace(/\s+/g, " "),
    );
  });

  const status = document.querySelector("[data-analytics-status]");
  const toggle = document.querySelector("[data-analytics-toggle]");
  if (status) {
    status.textContent = !ANALYTICS_ENDPOINT
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
    toggle.hidden = !ANALYTICS_ENDPOINT || privacySignal || localPreview;
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
    // Initialize manually so query strings never leave the page. The upstream
    // tracker includes a separate query field even with a custom page path.
    window.goatcounter = { no_onload: true, path: () => location.pathname };
    const script = document.createElement("script");
    script.src = "https://gc.zgo.at/count.js";
    script.dataset.goatcounter = ANALYTICS_ENDPOINT;
    script.async = true;
    script.addEventListener("load", () => {
      const counter = window.goatcounter;
      if (
        typeof counter.get_data !== "function" ||
        typeof counter.count !== "function" ||
        typeof counter.bind_events !== "function"
      )
        return;
      const getData = counter.get_data;
      counter.get_data = (options) => {
        const data = getData(options);
        delete data.q;
        try {
          data.r = data.r ? new URL(data.r).origin : "";
        } catch {
          data.r = "";
        }
        return data;
      };
      counter.bind_events();
      const countPage = () => {
        if (document.visibilityState === "hidden") return;
        document.removeEventListener("visibilitychange", countPage);
        counter.count();
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
