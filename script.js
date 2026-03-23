const STORAGE_KEY = "moodEntries";
let entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const moodPicker = document.getElementById("moodPicker");
const moodButtons = document.querySelectorAll(".mood-picker button");
const activitiesInput = document.getElementById("activities");
const saveBtn = document.getElementById("save-btn");
const filterBar = document.getElementById("filter");
const entriesList = document.getElementById("entries-list");
const statsDiv = document.getElementById("stats");

let selectedMood = "";
let activeFilter = "";

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function setActiveFilterButton() {
  const buttons = filterBar.querySelectorAll("button");
  buttons.forEach((btn) => {
    const mood = btn.dataset.filter;
    btn.classList.toggle("active", mood === activeFilter);
  });
}

moodPicker.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;
  moodButtons.forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedMood = btn.dataset.mood;
});

saveBtn.addEventListener("click", () => {
  const rawText = activitiesInput.value;
  const activities = rawText.trim().split(/\r?\n/).map(line => line.trim()).filter(Boolean).slice(0, 3);

  if (!selectedMood) return alert("Please select a mood!");
  if (activities.length === 0) return alert("Write at least one activity!");

  const entry = {
    id: Date.now(),
    date: new Date().toLocaleDateString(),
    mood: selectedMood,
    activities: activities,
  };

  entries.push(entry);
  saveToStorage();
  activitiesInput.value = "";
  moodButtons.forEach((b) => b.classList.remove("selected"));
  selectedMood = "";
  renderEntries(activeFilter);
  updateStats();
});

filterBar.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;
  activeFilter = btn.dataset.filter;
  setActiveFilterButton();
  renderEntries(activeFilter);
});

entriesList.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action='delete']");
  if (!btn) return;
  if (!confirm("Delete this entry?")) return;
  const id = Number(btn.dataset.id);
  entries = entries.filter((e) => e.id !== id);
  saveToStorage();
  renderEntries(activeFilter);
  updateStats();
});

function renderEntries(filterMood) {
  entriesList.innerHTML = "";
  const filtered = filterMood ? entries.filter((e) => e.mood === filterMood) : entries;
  const sorted = [...filtered].sort((a, b) => b.id - a.id);

  if (sorted.length === 0) {
    entriesList.innerHTML = "<p style='text-align:center; opacity:0.6;'>No stories here yet...</p>";
    return;
  }

  sorted.forEach((entry) => {
    const div = document.createElement("div");
    div.className = "entry";
    const activityHtml = entry.activities.map((a) => `• ${a}`).join("<br>");
    div.innerHTML = `
      <div class="entry-text">
        <b>${entry.date} · ${entry.mood}</b><br>
        <span style="color:#666; font-size:0.95rem;">${activityHtml}</span>
      </div>
      <button type="button" class="delete-btn-ui" data-action="delete" data-id="${entry.id}">Delete</button>
    `;
    entriesList.appendChild(div);
  });
}

function updateStats() {
  if (entries.length === 0) {
    statsDiv.innerHTML = "<div class='stat-item' style='grid-column: span 2;'>No entries yet</div>";
    return;
  }
  const moodCount = {};
  entries.forEach((e) => { moodCount[e.mood] = (moodCount[e.mood] || 0) + 1; });
  let mostCommon = "", highest = 0;
  for (const mood in moodCount) {
    if (moodCount[mood] > highest) { highest = moodCount[mood]; mostCommon = mood; }
  }

  statsDiv.innerHTML = `
    <div class="stat-item"><b>Total</b><br>${entries.length}</div>
    <div class="stat-item"><b>Top Mood</b><br>${mostCommon}</div>
  `;
}

setActiveFilterButton();
renderEntries(activeFilter);
updateStats();