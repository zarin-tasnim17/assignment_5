const loginView = document.getElementById("login_view");
const appView = document.getElementById("app_view");
const loginForm = document.getElementById("login-form");
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

