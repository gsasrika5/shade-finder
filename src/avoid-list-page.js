// The "My ingredients to avoid" panel on the Skincare tab: add your own
// ingredients and choose which kinds of flags you care about.
import { loadAvoidList, saveAvoidList, validateCustom } from "./avoid-list.js";
import { skincareFlagGroups } from "./ingredient-flags.js";

const summaryText = document.getElementById("avoid-summary");
const form = document.getElementById("avoid-form");
const input = document.getElementById("avoid-input");
const problemText = document.getElementById("avoid-problem");
const customList = document.getElementById("avoid-custom-list");
const groupList = document.getElementById("avoid-group-list");

let avoidList = loadAvoidList();

function update(changedList) {
  avoidList = changedList;
  saveAvoidList(avoidList);
  render();
}

// "2 added · 1 flag off", so the folded panel still says what's in effect.
function summary() {
  const parts = [];
  if (avoidList.custom.length > 0) {
    parts.push(`${avoidList.custom.length} added`);
  }
  if (avoidList.okGroups.length > 0) {
    parts.push(`${avoidList.okGroups.length} ${avoidList.okGroups.length === 1 ? "flag" : "flags"} off`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Nothing added yet";
}

function customItem(entry) {
  const item = document.createElement("li");
  const name = document.createElement("span");
  name.textContent = `⛔ ${entry}`;
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "secondary avoid-remove";
  remove.textContent = "Remove";
  remove.setAttribute("aria-label", `Remove ${entry}`);
  remove.addEventListener("click", () => {
    update({ ...avoidList, custom: avoidList.custom.filter((other) => other !== entry) });
    problemText.textContent = `Removed ${entry}.`;
  });
  item.append(name, remove);
  return item;
}

function groupCheckbox(group) {
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = group.id;
  checkbox.checked = !avoidList.okGroups.includes(group.id);
  checkbox.addEventListener("change", () => {
    const okGroups = checkbox.checked
      ? avoidList.okGroups.filter((id) => id !== group.id)
      : [...avoidList.okGroups, group.id];
    update({ ...avoidList, okGroups });
  });
  label.append(checkbox, ` ${group.label}`);
  return label;
}

function render() {
  summaryText.textContent = summary();
  customList.replaceChildren(...avoidList.custom.map(customItem));
  groupList.replaceChildren(...skincareFlagGroups.map(groupCheckbox));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const { entry, problem } = validateCustom(input.value, avoidList);
  if (problem) {
    problemText.textContent = problem;
    return;
  }
  update({ ...avoidList, custom: [...avoidList.custom, entry] });
  input.value = "";
  problemText.textContent = `Added ${entry}. Products with it are marked ⛔.`;
});
input.addEventListener("input", () => {
  problemText.textContent = "";
});

render();
