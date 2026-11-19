/*
 * Shared by both sample sites.
 *  - Fills every [data-year] element with the current year.
 *  - Validates forms marked [data-quote-form] in the browser.
 *
 * To connect a real form service, replace the form's `action` URL, remove the
 * "Demo form" note and the `disabled` attribute on the submit button.
 * While the action still contains PLACEHOLDER_ACTION_MARKER, nothing is sent
 * and the visitor sees a "demo form" message instead. The submit button starts
 * disabled and this script enables it, so without JavaScript nothing can be sent.
 */
(function () {
  "use strict";

  var PLACEHOLDER_ACTION_MARKER = "REPLACE-WITH-FORM-ENDPOINT";

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  var rules = {
    name: function (v) {
      return v.length >= 2 ? "" : "Please enter your name.";
    },
    phone: function (v) {
      var digits = v.replace(/\D/g, "");
      if (digits.length === 11 && digits.charAt(0) === "1") digits = digits.slice(1);
      return digits.length === 10 ? "" : "Please enter a 10-digit phone number.";
    },
    email: function (v) {
      if (!v) return "";
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "That email address doesn't look right.";
    },
    zip: function (v) {
      return /^\d{5}$/.test(v) ? "" : "Please enter a 5-digit ZIP code.";
    },
    service: function (v) {
      return v ? "" : "Please choose a service.";
    },
    message: function (v) {
      return v.length <= 1000 ? "" : "Please keep the message under 1000 characters.";
    }
  };

  function errorEl(field) {
    return document.getElementById(field.id + "-error");
  }

  function check(field) {
    var rule = rules[field.name];
    if (!rule) return true;
    var msg = rule(field.value.trim());
    var out = errorEl(field);
    if (out) out.textContent = msg;
    if (msg) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
    return !msg;
  }

  document.querySelectorAll("form[data-quote-form]").forEach(function (form) {
    form.setAttribute("novalidate", "");
    var submit = form.querySelector("[data-demo-submit]");
    if (submit) submit.disabled = false;
    var status = form.querySelector("[data-form-status]");
    var fields = Array.prototype.filter.call(form.elements, function (f) {
      return f.name && rules[f.name];
    });

    fields.forEach(function (f) {
      f.addEventListener("blur", function () {
        if (f.value) check(f);
      });
      f.addEventListener("input", function () {
        if (f.getAttribute("aria-invalid")) check(f);
      });
    });

    form.addEventListener("submit", function (e) {
      var firstBad = null;
      fields.forEach(function (f) {
        if (!check(f) && !firstBad) firstBad = f;
      });
      if (firstBad) {
        e.preventDefault();
        firstBad.focus();
        if (status) status.textContent = "Please fix the highlighted fields.";
        return;
      }
      // Spam trap: real visitors never see or fill this field.
      var trap = form.querySelector("[data-trap]");
      if (trap && trap.value) {
        e.preventDefault();
        return;
      }
      if (form.getAttribute("action").indexOf(PLACEHOLDER_ACTION_MARKER) !== -1) {
        e.preventDefault();
        if (status) {
          status.textContent =
            "Thanks! This is a demo form on a sample site, so nothing was sent. " +
            "On a real site this request would go straight to the owner's inbox.";
        }
        form.reset();
      }
    });
  });
})();
