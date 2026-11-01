/* =========================================================
   LEARNING PLANNER + PROJECT RECOMMENDATIONS
   public/js/features.js   (dashboard.js ke baad load hota hai)
   Backend: /feature/planner/*  aur  /feature/projects
   ========================================================= */

(function () {

    const ROLES = [
        "Frontend Developer", "Backend Developer", "Full Stack Developer", "Python Developer",
        "Data Analyst", "Accountant", "Teacher / Educator", "Diamond Quality Checker",
        "Quality Control Executive", "Jewellery Quality Executive", "Sales Executive",
        "Customer Service Executive", "HR Executive", "Digital Marketing Executive", "Graphic Designer"
    ];

    function esc(v) {
        const d = document.createElement("div");
        d.textContent = v == null ? "" : v;
        return d.innerHTML;
    }

    function analysis() {
        try { return JSON.parse(localStorage.getItem(uKey("analysisData")) || "{}"); }
        catch (e) { return {}; }
    }

    function headers() {
        const h = { "Content-Type": "application/json" };
        const id = localStorage.getItem("userId");
        if (id) h["x-user-id"] = id;
        return h;
    }

    function toast(msg, isError) {
        const old = document.querySelector(".toast");
        if (old) old.remove();
        const t = document.createElement("div");
        t.className = "toast" + (isError ? " error" : "");
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2500);
    }

    function roleMissing(role) {
        const gap = analysis().skillGap || {};
        if (gap.recommendedRole === role) return gap.missingSkills || [];
        const found = (gap.careerSuggestions || []).find(c => c.role === role);
        return found ? (found.missingSkills || []) : [];
    }

    // ---------------------------------------------------------
    // PLANNER
    // ---------------------------------------------------------
    let plan = [];

    function setupRoleSelect() {
        const sel = document.getElementById("plannerRole");
        if (!sel) return;
        const rec = (analysis().skillGap || {}).recommendedRole;
        sel.innerHTML = ROLES.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join("");
        if (rec && ROLES.includes(rec)) sel.value = rec;
        showMissing();
    }

    function showMissing() {
        const sel = document.getElementById("plannerRole");
        const box = document.getElementById("plannerMissing");
        if (!sel || !box) return;
        const miss = roleMissing(sel.value);
        box.innerHTML = miss.length
            ? '<span class="pl-label">Missing skills:</span> ' + miss.map(s => `<span class="skill-tag">${esc(s)}</span>`).join("")
            : '<span class="pl-label">Click "Generate Plan" and we will find the missing skills for this role.</span>';
    }

    function renderPlan() {
        const box = document.getElementById("plannerList");
        const bar = document.getElementById("plannerProgress");
        if (!box) return;

        if (plan.length === 0) {
            box.innerHTML = `<div class="no-skills"><div class="no-skills-icon">📅</div>
                <h3>No learning plan yet</h3>
                <p>Choose a target career and click Generate Plan.</p></div>`;
            if (bar) bar.innerHTML = "";
            return;
        }

        const done = plan.filter(t => t.completed).length;
        const pct = Math.round((done / plan.length) * 100);

        if (bar) {
            bar.innerHTML = `
                <div class="pl-bar-top"><span>Plan progress</span><strong>${done}/${plan.length} tasks · ${pct}%</strong></div>
                <div class="pl-bar"><div class="pl-bar-fill" style="width:${pct}%"></div></div>`;
        }

        box.innerHTML = plan.map(t => `
            <label class="pl-task ${t.completed ? "done" : ""}">
                <input type="checkbox" data-task="${t.id}" ${t.completed ? "checked" : ""}>
                <span class="pl-day">DAY ${t.day_number}</span>
                <span class="pl-body">
                    <strong>${esc(t.skill_name)}</strong>
                    <span>${esc(t.task)}</span>
                </span>
            </label>`).join("");
    }

    async function loadPlan() {
        try {
            const res = await fetch("/feature/planner", { headers: headers() });
            const data = await res.json();
            plan = Array.isArray(data.plan) ? data.plan : [];
            if (plan[0] && plan[0].target_role) {
                const sel = document.getElementById("plannerRole");
                if (sel && ROLES.includes(plan[0].target_role)) sel.value = plan[0].target_role;
                showMissing();
            }
            renderPlan();
        } catch (e) {
            console.error("Planner load error:", e);
            const box = document.getElementById("plannerList");
            if (box) box.innerHTML = '<p class="skill-error">Could not load plan. Is the server running?</p>';
        }
    }

    async function generatePlan() {
        const sel = document.getElementById("plannerRole");
        const btn = document.getElementById("plannerGenerate");
        if (!sel) return;

        const gap = analysis().skillGap || {};
        if (btn) { btn.disabled = true; btn.textContent = "Generating..."; }

        try {
            const res = await fetch("/feature/planner/generate", {
                method: "POST",
                headers: headers(),
                body: JSON.stringify({
                    role: sel.value,
                    detectedSkills: gap.detectedSkills || [],
                    missingSkills: roleMissing(sel.value)
                })
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || "Could not generate plan.");

            plan = data.plan;
            const box = document.getElementById("plannerMissing");
            if (box) {
                box.innerHTML = data.revisionMode
                    ? '<span class="pl-label">You already match this role. Revision plan created.</span>'
                    : '<span class="pl-label">Missing skills:</span> ' + data.missingSkills.slice(0, 8).map(s => `<span class="skill-tag">${esc(s)}</span>`).join("");
            }
            renderPlan();
            toast("Learning plan created!");
        } catch (e) {
            toast(e.message, true);
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = "⚡ Generate Plan"; }
        }
    }

    async function toggleTask(id, completed) {
        try {
            const res = await fetch("/feature/planner/toggle", {
                method: "POST",
                headers: headers(),
                body: JSON.stringify({ id, completed })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            const t = plan.find(x => x.id === id);
            if (t) t.completed = completed ? 1 : 0;
            renderPlan();
        } catch (e) {
            toast("Could not save task.", true);
            renderPlan();
        }
    }

    async function resetPlan() {
        if (!confirm("Delete the current learning plan?")) return;
        try {
            await fetch("/feature/planner", { method: "DELETE", headers: headers() });
            plan = [];
            renderPlan();
            toast("Plan deleted.");
        } catch (e) {
            toast("Could not reset plan.", true);
        }
    }

    // ---------------------------------------------------------
    // PROJECTS
    // ---------------------------------------------------------
    function renderProjects(list) {
        const box = document.getElementById("projectList");
        if (!box) return;

        if (!list || list.length === 0) {
            box.innerHTML = `<div class="no-skills"><div class="no-skills-icon">💡</div>
                <h3>No project ideas yet</h3>
                <p>Upload your resume, then click Get Project Ideas.</p></div>`;
            return;
        }

        box.innerHTML = list.map(p => `
            <div class="pj-card">
                <div class="pj-top">
                    <h3>${esc(p.title)}</h3>
                    <span class="pj-match">${p.matchPercentage}% fit</span>
                </div>
                <span class="pj-level ${esc((p.difficulty || "").toLowerCase())}">${esc(p.difficulty)}</span>
                <p>${esc(p.description)}</p>
                <p class="pj-why"><b>Why useful:</b> ${esc(p.why)}</p>
                <div class="pj-row"><b>You have:</b> ${(p.skillsYouHave || []).length ? p.skillsYouHave.map(s => `<span class="skill-tag">${esc(s)}</span>`).join("") : "<em>none yet</em>"}</div>
                <div class="pj-row"><b>To learn:</b> ${(p.skillsToLearn || []).length ? p.skillsToLearn.map(s => `<span class="skill-tag learn">${esc(s)}</span>`).join("") : "<em>nothing, you are ready!</em>"}</div>
                <div class="pj-row"><b>Technologies:</b> ${(p.technologies || []).map(esc).join(", ")}</div>
            </div>`).join("");
    }

    async function loadProjects() {
        try {
            const res = await fetch("/feature/projects", { headers: headers() });
            const data = await res.json();
            renderProjects(data.projects || []);
        } catch (e) {
            console.error("Project load error:", e);
        }
    }

    async function generateProjects() {
        const gap = analysis().skillGap;
        const btn = document.getElementById("projectGenerate");

        if (!gap) {
            toast("Please upload and analyze your resume first.", true);
            return;
        }

        if (btn) { btn.disabled = true; btn.textContent = "Finding..."; }

        try {
            const res = await fetch("/feature/projects", {
                method: "POST",
                headers: headers(),
                body: JSON.stringify({
                    role: gap.recommendedRole,
                    detectedSkills: gap.detectedSkills || [],
                    missingSkills: gap.missingSkills || []
                })
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || "Could not get projects.");
            renderProjects(data.projects);
            toast("Project ideas ready!");
        } catch (e) {
            toast(e.message, true);
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = "💡 Get Project Ideas"; }
        }
    }

    // ---------------------------------------------------------
    // EVENTS
    // ---------------------------------------------------------
    document.addEventListener("click", e => {
        if (e.target.closest("#plannerGenerate")) generatePlan();
        else if (e.target.closest("#plannerReset")) resetPlan();
        else if (e.target.closest("#projectGenerate")) generateProjects();
    });

    document.addEventListener("change", e => {
        if (e.target.id === "plannerRole") showMissing();
        if (e.target.dataset && e.target.dataset.task) {
            toggleTask(Number(e.target.dataset.task), e.target.checked);
        }
    });

    function init() {
        setupRoleSelect();
        loadPlan();
        loadProjects();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();

    // Naya resume upload hone par role/missing refresh
    const prevFetch = window.fetch;
    window.fetch = async function (...args) {
        const r = await prevFetch.apply(this, args);
        const url = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url) || "";
        if (url.includes("/auth/upload")) setTimeout(setupRoleSelect, 900);
        return r;
    };
})();