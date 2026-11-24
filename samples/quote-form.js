/*
 * Shared by all sample sites.
 *  - Fills every [data-year] element with the current year.
 *  - Validates forms marked [data-quote-form] in the browser. Fields are
 *    matched to rules by their `name`. Email is optional unless the input
 *    has the `required` attribute.
 *  - A form with data-success="<element id>" hides itself after a valid
 *    demo submit and shows that element instead of the status line.
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

  function todayISO() {
    var d = new Date();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function chosen(message) {
    return function (v) { return v ? "" : message; };
  }

  // Each rule gets the trimmed value and the field, and returns an error message or "".
  var rules = {
    name: function (v) {
      return v.length >= 2 ? "" : "Please enter your name.";
    },
    phone: function (v) {
      var digits = v.replace(/\D/g, "");
      if (digits.length === 11 && digits.charAt(0) === "1") digits = digits.slice(1);
      return digits.length === 10 ? "" : "Please enter a 10-digit phone number.";
    },
    email: function (v, field) {
      if (!v) return field.required ? "Please enter your email address." : "";
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "That email address doesn't look right.";
    },
    event_type: chosen("Please choose the type of event."),
    budget: chosen("Please choose a budget range."),
    event_date: function (v) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "Please pick your event date.";
      // ISO dates compare correctly as strings.
      return v >= todayISO() ? "" : "The event date can't be in the past.";
    },
    venue: function (v) {
      return v.length >= 2 ? "" : "Please enter the city or venue.";
    },
    guests: function (v) {
      if (!/^\d+$/.test(v)) return "Please enter the number of guests as a whole number.";
      var n = Number(v);
      return n >= 1 && n <= 5000 ? "" : "Guest count should be between 1 and 5000.";
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
    var msg = rule(field.value.trim(), field);
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
    var success = form.dataset.success ? document.getElementById(form.dataset.success) : null;
    form.querySelectorAll('input[type="date"]').forEach(function (d) {
      d.min = todayISO();
    });
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
        if (success) {
          form.reset();
          form.hidden = true;
          success.hidden = false;
          success.focus();
          return;
        }
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
