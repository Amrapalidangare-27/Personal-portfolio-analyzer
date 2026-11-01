/* =========================================================
   SKILL PROGRESS TRACKER (compact)   ->  public/js/skillTracker.js
   - Summary: total / average / strong / needs work
   - Filter tabs: All, Needs work, Growing, Strong
   - Har skill ek chhoti row; click karo to slider + Update Progress khulta hai
   - GET /auth/skills, POST /auth/skills (backend pehle se bana hai)
   ========================================================= */

(function () {
    let skills = [];
    let filter = "all";
    let openId = null;

    function esc(text) {
        return String(text).replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    function level(p) {
        if (p < 40) return { key: "low", name: "Beginner" };
        if (p < 70) return { key: "mid", name: "Intermediate" };
        return { key: "high", name: "Advanced" };
    }

    function showToast(message, isError) {
        const old = document.querySelector(".toast");
        if (old) old.remove();
        const t = document.createElement("div");
        t.className = "toast" + (isError ? " error" : "");
        t.textContent = message;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2500);
    }

    function box() {
        return document.getElementById("skillProgressContainer");
    }

    function rowHTML(s) {
        const p = Number(s.progress) || 0;
        const lv = level(p);
        const open = String(s.id) === String(openId);

        return `
        <div class="sk-row ${lv.key} ${open ? "open" : ""}" data-id="${s.id}">
            <div class="sk-head" data-act="toggle">
                <span class="sk-name">${esc(s.skill_name)}</span>
                <div class="sk-bar"><div class="sk-fill" style="width:${p}%"></div></div>
                <span class="sk-pct">${p}%</span>
            </div>
            <div class="sk-edit">
                <span class="sk-level">${lv.name}</span>
                <button type="button" class="sk-step" data-act="minus">−</button>
                <input type="range" min="0" max="100" value="${p}" data-act="slider">
                <button type="button" class="sk-step" data-act="plus">+</button>
                <span class="sk-target">Target ${Number(s.target_level) || 100}%</span>
                <button type="button" class="update-btn" data-act="save">Update Progress</button>
            </div>
        </div>`;
    }

    function chartHTML() {
        const top = skills.slice().sort((a, b) => (Number(b.progress) || 0) - (Number(a.progress) || 0)).slice(0, 6);
        if (!top.length) return "";

        const cols = top.map(s => {
            const p = Math.max(0, Math.min(100, Number(s.progress) || 0));
            return `<div class="sk-col">
                <div class="sk-colwrap"><div class="sk-colbar" style="height:${p}%"><em>${p}%</em></div></div>
                <span title="${esc(s.skill_name)}">${esc(s.skill_name)}</span>
            </div>`;
        }).join("");

        return `
            <div class="sk-chart">
                <h3>Skill Progress Overview</h3>
                <p>Your top ${top.length} skills by progress</p>
                <div class="sk-plot">
                    <div class="sk-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
                    <div class="sk-area"><div class="sk-grid"></div><div class="sk-cols">${cols}</div></div>
                </div>
            </div>`;
    }

    function render() {
        const c = box();
        if (!c) return;

        if (skills.length === 0) {
            c.innerHTML = `
                <div class="no-skills">
                    <div class="no-skills-icon">🎯</div>
                    <h3>No skills added yet</h3>
                    <p>Upload and analyze your resume to start tracking your skills.</p>
                </div>`;
            return;
        }

        const prev = c.querySelector(".sk-list");
        const scroll = prev ? prev.scrollTop : 0;

        const total = skills.length;
        const avg = Math.round(skills.reduce((a, s) => a + (Number(s.progress) || 0), 0) / total);
        const low = skills.filter(s => s.progress < 40).length;
        const mid = skills.filter(s => s.progress >= 40 && s.progress < 70).length;
        const high = skills.filter(s => s.progress >= 70).length;

        const shown = skills.filter(s => {
            if (filter === "low") return s.progress < 40;
            if (filter === "mid") return s.progress >= 40 && s.progress < 70;
            if (filter === "high") return s.progress >= 70;
            return true;
        });

        const tab = (key, label, n) =>
            `<button type="button" class="sk-tab ${filter === key ? "active" : ""}" data-filter="${key}">${label} (${n})</button>`;

        c.innerHTML = `
            ${chartHTML()}
            <div class="sk-summary">
                <div class="sk-stat"><strong>${total}</strong><span>Total skills</span></div>
                <div class="sk-stat"><strong>${avg}%</strong><span>Average progress</span></div>
                <div class="sk-stat"><strong>${high}</strong><span>Strong (70%+)</span></div>
                <div class="sk-stat"><strong>${low}</strong><span>Needs work (&lt;40%)</span></div>
            </div>

            <div class="sk-tabs">
                ${tab("all", "All", total)}
                ${tab("low", "Needs work", low)}
                ${tab("mid", "Growing", mid)}
                ${tab("high", "Strong", high)}
            </div>

            <div class="sk-list">
                ${shown.length ? shown.map(rowHTML).join("") : '<p class="skill-loading">No skills in this group.</p>'}
            </div>`;

        const list = c.querySelector(".sk-list");
        if (list) list.scrollTop = scroll;
    }

    async function load() {
        const c = box();
        if (!c) return;

        try {
            const res = await fetch("/auth/skills");
            const data = await res.json();
            skills = Array.isArray(data.skills) ? data.skills : [];
            render();
        } catch (error) {
            console.error("loadSkillProgress error:", error);
            c.innerHTML = '<p class="skill-error">Could not load skills. Please refresh the page.</p>';
        }
    }

    async function save(row) {
        const skill = skills.find(s => String(s.id) === row.dataset.id);
        if (!skill) return;

        const value = Number(row.querySelector('[data-act="slider"]').value);

        try {
            const res = await fetch("/auth/skills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    skillName: skill.skill_name,
                    progress: value,
                    targetLevel: Number(skill.target_level) || 100
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Save failed");

            skill.progress = value;
            openId = null;
            render();
            showToast(`${skill.skill_name} updated to ${value}%`);

        } catch (error) {
            console.error("saveProgress error:", error);
            showToast("Could not save progress.", true);
        }
    }

    // Slider/+/- ke time sirf us row ko live update karo (poora list redraw nahi)
    function setLive(row, value) {
        value = Math.max(0, Math.min(100, value));
        row.querySelector('[data-act="slider"]').value = value;
        row.querySelector(".sk-fill").style.width = value + "%";
        row.querySelector(".sk-pct").textContent = value + "%";
        row.querySelector(".sk-level").textContent = level(value).name;
        row.classList.remove("low", "mid", "high");
        row.classList.add(level(value).key);
    }

    document.addEventListener("click", e => {
        const c = box();
        if (!c || !c.contains(e.target)) return;

        const tabBtn = e.target.closest("[data-filter]");
        if (tabBtn) {
            filter = tabBtn.dataset.filter;
            openId = null;
            render();
            return;
        }

        const row = e.target.closest(".sk-row");
        const act = e.target.closest("[data-act]");
        if (!row || !act) return;

        const slider = row.querySelector('[data-act="slider"]');

        if (act.dataset.act === "toggle") {
            openId = String(row.dataset.id) === String(openId) ? null : row.dataset.id;
            render();
        } else if (act.dataset.act === "minus") {
            setLive(row, Number(slider.value) - 10);
        } else if (act.dataset.act === "plus") {
            setLive(row, Number(slider.value) + 10);
        } else if (act.dataset.act === "save") {
            save(row);
        }
    });

    document.addEventListener("input", e => {
        if (e.target.dataset.act !== "slider") return;
        setLive(e.target.closest(".sk-row"), Number(e.target.value));
    });

    // Resume upload ke baad refresh (sirf tab jab user kuch edit nahi kar raha)
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);
        const url = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url) || "";
        if (url.includes("/auth/upload")) {
            setTimeout(() => { if (openId === null) load(); }, 800);
        }
        return response;
    };

    window.loadSkillProgress = load;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", load);
    } else {
        load();
    }
})();