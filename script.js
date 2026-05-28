const plans = {
  arcade: { label: "Arcade", monthly: 9, yearly: 90 },
  advanced: { label: "Advanced", monthly: 12, yearly: 120 },
  pro: { label: "Pro", monthly: 15, yearly: 150 },
};

const addons = {
  online: { label: "Online service", monthly: 1, yearly: 10 },
  storage: { label: "Larger storage", monthly: 2, yearly: 20 },
  profile: { label: "Customizable Profile", monthly: 2, yearly: 20 },
};

const form = document.querySelector(".form-card");
const panels = Array.from(document.querySelectorAll("[data-step-panel]"));
const stepItems = Array.from(document.querySelectorAll("[data-step-item]"));
const nextButton = document.querySelector('[data-action="next"]');
const backButton = document.querySelector('[data-action="back"]');
const confirmButton = document.querySelector('[data-action="confirm"]');
const billingToggle = document.querySelector("#billing-cycle");
const summaryPlan = document.querySelector("#summary-plan");
const summaryAddons = document.querySelector("#summary-addons");
const totalLabel = document.querySelector("#total-label");
const totalPrice = document.querySelector("#total-price");

const state = {
  step: 1,
  billing: "monthly",
  plan: "arcade",
  addons: [],
};

const priceSuffix = () => (state.billing === "monthly" ? "mo" : "yr");
const pricePeriod = () => (state.billing === "monthly" ? "month" : "year");
const formatPrice = (amount) => `$${amount}/${priceSuffix()}`;

function setStep(step) {
  state.step = step;

  panels.forEach((panel) => {
    panel.classList.toggle("is-active", Number(panel.dataset.stepPanel) === state.step);
  });

  stepItems.forEach((item) => {
    const itemStep = Number(item.dataset.stepItem);
    item.classList.toggle("is-active", itemStep === Math.min(state.step, 4));
  });

  form.classList.toggle("is-first-step", state.step === 1);
  form.classList.toggle("is-summary-step", state.step === 4);
  form.classList.toggle("is-thanks-step", state.step === 5);

  if (state.step === 4) {
    renderSummary();
  }
}

function updatePrices() {
  document.body.classList.toggle("is-yearly", state.billing === "yearly");

  document.querySelectorAll("[data-billing-label]").forEach((label) => {
    label.classList.toggle("is-active", label.dataset.billingLabel === state.billing);
  });

  Object.entries(plans).forEach(([key, plan]) => {
    document.querySelector(`[data-plan-price="${key}"]`).textContent = formatPrice(plan[state.billing]);
  });

  Object.entries(addons).forEach(([key, addon]) => {
    document.querySelector(`[data-addon-price="${key}"]`).textContent = `+${formatPrice(addon[state.billing])}`;
  });
}

function setError(fieldName, message) {
  const field = document.querySelector(`[data-field="${fieldName}"]`);
  const messageElement = document.querySelector(`#${fieldName}-error`);

  field.classList.toggle("has-error", Boolean(message));
  messageElement.textContent = message;
}

function validatePersonalInfo() {
  const name = document.querySelector("#name").value.trim();
  const email = document.querySelector("#email").value.trim();
  const phone = document.querySelector("#phone").value.trim();
  let isValid = true;

  setError("name", "");
  setError("email", "");
  setError("phone", "");

  if (!name) {
    setError("name", "This field is required");
    isValid = false;
  }

  if (!email) {
    setError("email", "This field is required");
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("email", "Enter a valid email");
    isValid = false;
  }

  if (!phone) {
    setError("phone", "This field is required");
    isValid = false;
  }

  return isValid;
}

function renderSummary() {
  const selectedPlan = plans[state.plan];
  const selectedAddons = state.addons.map((key) => addons[key]);
  const planCost = selectedPlan[state.billing];
  const addonTotal = selectedAddons.reduce((sum, addon) => sum + addon[state.billing], 0);
  const total = planCost + addonTotal;

  summaryPlan.innerHTML = `
    <div>
      <strong>${selectedPlan.label} (${state.billing})</strong>
      <button class="change-plan" type="button">Change</button>
    </div>
    <span class="summary-price">${formatPrice(planCost)}</span>
  `;

  summaryAddons.innerHTML = selectedAddons.length
    ? selectedAddons
        .map(
          (addon) => `
            <div class="summary-row">
              <span>${addon.label}</span>
              <span>+${formatPrice(addon[state.billing])}</span>
            </div>
          `
        )
        .join("")
    : '<div class="summary-row"><span>No add-ons selected</span><span>$0</span></div>';

  totalLabel.textContent = `Total (per ${pricePeriod()})`;
  totalPrice.textContent = formatPrice(total);
}

nextButton.addEventListener("click", () => {
  if (state.step === 1 && !validatePersonalInfo()) {
    return;
  }

  setStep(Math.min(state.step + 1, 4));
});

backButton.addEventListener("click", () => {
  setStep(Math.max(state.step - 1, 1));
});

confirmButton.addEventListener("click", () => {
  setStep(5);
});

billingToggle.addEventListener("change", () => {
  state.billing = billingToggle.checked ? "yearly" : "monthly";
  updatePrices();
});

document.querySelectorAll('input[name="plan"]').forEach((input) => {
  input.addEventListener("change", () => {
    state.plan = input.value;
  });
});

document.querySelectorAll('input[name="addons"]').forEach((input) => {
  input.addEventListener("change", () => {
    state.addons = Array.from(document.querySelectorAll('input[name="addons"]:checked')).map((addon) => addon.value);
  });
});

summaryPlan.addEventListener("click", (event) => {
  if (event.target.matches(".change-plan")) {
    setStep(2);
  }
});

document.querySelectorAll(".field input").forEach((input) => {
  input.addEventListener("input", () => {
    setError(input.name, "");
  });
});

updatePrices();
setStep(1);