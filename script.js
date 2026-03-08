const loginView = document.getElementById("login_view");
const appView = document.getElementById("app_view");
const loginForm = document.getElementById("login_form");
const loginError = document.getElementById("login_error");

const loader = document.getElementById("loader");
const issuesGrid = document.getElementById("issues_grid");
const issueCountEl = document.getElementById("issue_count");

const tabBtns = document.querySelectorAll(".tab_btn");
const searchInput = document.getElementById("search_input");
const btnSearch = document.getElementById("btn_search");

const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("close_modal");


let allIssuesData = [];
let currentTab = "all"; 


const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab";


loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "admin" && pass === "admin123") {
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");
    fetchIssues();
  } else {
    loginError.classList.remove("hidden");
  }
});
async function fetchIssues() {
  showLoader(true);
  try {
    const response = await fetch(`${API_BASE}/issues`);
    const data = await response.json();


    allIssuesData = Array.isArray(data) ? data : data.data || [];
    renderIssues();
  } catch (error) {
    console.error("Error fetching issues:", error);
    issuesGrid.innerHTML = `<p style="color:red">Failed to load issues.</p>`;
  } finally {
    showLoader(false);
  }
}


async function searchIssues(query) {
  if (!query.trim()) {
    fetchIssues(); 
    return;
  }
  showLoader(true);
  try {
    const response = await fetch(
      `${API_BASE}/issues/search?q=${encodeURIComponent(query)}`,
    );
    const data = await response.json();
    allIssuesData = Array.isArray(data) ? data : data.data || [];
    renderIssues();
  } catch (error) {
    console.error("Error searching:", error);
  } finally {
    showLoader(false);
  }
}


async function fetchSingleIssue(id) {
  try {
    const response = await fetch(`${API_BASE}/issue/${id}`);
    const issue = await response.json();
    return issue.data || issue;
  } catch (error) {
    console.error("Error fetching single issue", error);
    return null;
  }
}

function renderIssues() {
  issuesGrid.innerHTML = "";

 
  const filteredIssues = allIssuesData.filter((issue) => {
    if (currentTab === "all") return true;
    return issue.status?.toLowerCase() === currentTab;
  });

  issueCountEl.innerText = filteredIssues.length;

  if (filteredIssues.length === 0) {
    issuesGrid.innerHTML = `<p>No issues found.</p>`;
    return;
  }

  filteredIssues.forEach((issue) => {
    
    const isOp = issue.status?.toLowerCase() === "open";
    const borderClass = isOp ? "card_top_open" : "card_top_closed";

    
    const id = issue.id || issue._id || "#";
    const title = issue.title || "No Title";
    const desc = issue.description || "No description provided...";
    const author = issue.author?.name || issue.author || "Unknown";
    const priority = issue.priority || "MEDIUM";
    const date = issue.createdAt
      ? new Date(issue.createdAt).toLocaleDateString()
      : "Unknown Date";

   
    let labelsHtml = "";
    if (Array.isArray(issue.labels)) {
      labelsHtml = issue.labels
        .map((lbl) => {
          const lblText = typeof lbl === "string" ? lbl : lbl.name || "";
          const classModifier =
            lblText.toLowerCase() === "bug" ? "bug" : "help";
          return `<span class="label ${classModifier}">${lblText}</span>`;
        })
        .join("");
    }

   
    const statusIcon = isOp
      ? "assets/Open-Status.png"
      : "assets/Closed-Status.png";
    const card = document.createElement("div");
    card.className = `issue_card ${borderClass}`;
    card.innerHTML = `
                    <div class="card_header">
                        <span>
                    <img src="${statusIcon}" alt="status" class="status_icon" />
                           
                        </span>
                        <span class="priority_badge">${priority.toUpperCase()}</span>
                    </div>
                    <h3 class="card_title">${title}</h3>
                    <p class="card_desc">${desc.substring(0, 75)}...</p>
                    <div class="labels">${labelsHtml}</div>
                    <div class="card_footer">
                        #${id} by ${author}<br>
                        ${date}
                    </div>
                `;

   
    card.addEventListener("click", async () => {
     
      let fullIssueData = await fetchSingleIssue(id);
      if (!fullIssueData || Object.keys(fullIssueData).length === 0) {
        fullIssueData = issue; 
      }
      openModal(fullIssueData);
    });

    issuesGrid.appendChild(card);
  });
}
tabBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
   
    tabBtns.forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");

  
    currentTab = e.target.getAttribute("data-tab");
    renderIssues();
  });
});


btnSearch.addEventListener("click", () => {
  searchIssues(searchInput.value);
});
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchIssues(searchInput.value);
  }
});


function openModal(issue) {
  const isOp = issue.status?.toLowerCase() === "open";

  document.getElementById("modal_title").innerText =
    issue.title || "Issue Details";

  const statusEl = document.getElementById("modal_status");
  statusEl.innerText = isOp ? "Opened" : "Closed";
  statusEl.className = `status_badge ${isOp ? "open" : "closed"}`;

  const author = issue.author?.name || issue.author || "Unknown";
  const date = issue.createdAt
    ? new Date(issue.createdAt).toLocaleDateString()
    : "Unknown Date";
  document.getElementById("modal_author_date").innerText =
    `Opened by ${author} • ${date}`;

  
  const labelsContainer = document.getElementById("modal_labels");
  labelsContainer.innerHTML = "";
  if (Array.isArray(issue.labels)) {
    issue.labels.forEach((lbl) => {
      const lblText = typeof lbl === "string" ? lbl : lbl.name || "";
      const classModifier = lblText.toLowerCase() === "bug" ? "bug" : "help";
      labelsContainer.innerHTML += `<span class="label ${classModifier}">${lblText}</span>`;
    });
  }

  document.getElementById("modal_desc").innerText =
    issue.description || "No description provided.";
  document.getElementById("modal_assignee").innerText =
    issue.assignee?.name || issue.assignee || author;
  document.getElementById("modal_priority").innerText =
    issue.priority || "MEDIUM";

  modal.classList.remove("hidden");
}

closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});


modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});


function showLoader(show) {
  if (show) {
    loader.classList.remove("hidden");
    issuesGrid.innerHTML = "";
  } else {
    loader.classList.add("hidden");
  }
}

