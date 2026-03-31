function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `invitee-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const inviteForm = document.getElementById("invite-form");
const nameInput = document.getElementById("name-input");
const emailInput = document.getElementById("email-input");
const inviteeList = document.getElementById("invitee-list");
const inviteeCount = document.getElementById("invitee-count");

const invitees = [
  { id: createId(), name: "Jordan Lee", email: "jordan.lee@example.com" },
  { id: createId(), name: "Mia Patel", email: "mia.patel@example.com" },
];

function renderInvitees() {
  inviteeList.innerHTML = "";
  inviteeCount.textContent = `${invitees.length} invitee${invitees.length === 1 ? "" : "s"}`;

  if (invitees.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "invitee-item";
    emptyState.textContent = "No invitees yet. Add someone using the form above.";
    inviteeList.append(emptyState);
    return;
  }

  for (const invitee of invitees) {
    const item = document.createElement("li");
    item.className = "invitee-item";

    const meta = document.createElement("div");
    meta.className = "invitee-meta";

    const name = document.createElement("span");
    name.className = "invitee-name";
    name.textContent = invitee.name;

    const email = document.createElement("span");
    email.className = "invitee-email";
    email.textContent = invitee.email;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-btn";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      const index = invitees.findIndex((entry) => entry.id === invitee.id);
      if (index !== -1) {
        invitees.splice(index, 1);
        renderInvitees();
      }
    });

    meta.append(name, email);
    item.append(meta, removeButton);
    inviteeList.append(item);
  }
}

inviteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !email) {
    return;
  }

  invitees.unshift({
    id: createId(),
    name,
    email,
  });

  inviteForm.reset();
  nameInput.focus();
  renderInvitees();
});

renderInvitees();
