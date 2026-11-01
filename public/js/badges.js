/* =========================================================
   PORTFOLIO BADGES  ->  public/js/badges.js
   Badges live data se nikalte hain (naya database table nahi chahiye):
   - ATS score + detected skills + role match  -> localStorage "analysisData"
   - Skill tracker progress                    -> GET /auth/skills
   - Learning planner tasks                    -> GET /feature/planner
   - Portfolio shared flag                     -> localStorage "portfolioShared"
   Public: window.refreshBadges(), window.getEarnedBadges()
   ========================================================= */

(function () {
    const data = {
        hasResume: false, ats: 0, skillCount: 0, roleMatch: 0,
        maxProgress: 0, avgProgress: 0, planDone: 0, shared: false
    };

    const pct = (value, goal) => Math.max(0, Math.min(100, Math.round(((Number(value) || 0) / goal) * 100)));

    const BADGES = [
        { id: "resume",   icon: "📄", name: "Resume Uploaded",  desc: "Upload and analyze your resume.",           p: d => d.hasResume ? 100 : 0 },
        { id: "ats60",    icon: "📊", name: "ATS Ready",        desc: "Reach an ATS score of 60%.",               p: d => pct(d.ats, 60) },
        { id: "ats80",    icon: "🏅", name: "ATS Champion",     desc: "Reach an ATS score of 80%.",               p: d => pct(d.ats, 80) },
        { id: "skills5",  icon: "🧰", name: "Skill Collector",  desc: "Have 5 skills detected on your resume.",   p: d => pct(d.skillCount, 5) },
        { id: "skills12", icon: "🧠", name: "Skill Stack",      desc: "Have 12 skills detected on your resume.",  p: d => pct(d.skillCount, 12) },
        { id: "role70",   icon: "🎯", name: "Role Ready",       desc: "Reach a 70% match with your best-fit role.", p: d => pct(d.roleMatch, 70) },
        { id: "adv",      icon: "🚀", name: "Advanced Skill",   desc: "Take one tracked skill to 70% or more.",   p: d => pct(d.maxProgress, 70) },
        { id: "allround", icon: "⚖️", name: "All-Rounder",      desc: "Average 60% across your tracked skills.",  p: d => pct(d.avgProgress, 60) },
        { id: "plan1",    icon: "📅", name: "Plan Starter",     desc: "Complete your first learning task.",       p: d => pct(d.planDone, 1) },
        { id: "plan5",    icon: "🔥", name: "Plan Finisher",    desc: "Complete 5 learning tasks.",               p: d => pct(d.planDone, 5) },
        { id: "shared",   icon: "🔗", name: "Portfolio Live",   desc: "Share your portfolio link.",               p: d => d.shared ? 100 : 0 }
    ];

    const LEVELS = [
        { min: 9, name: "Recruiter ready" },
        { min: 6, name: "Standing out" },
        { min: 3, name: "Building momentum" },
        { min: 0, name: "Just getting started" }
    ];

    function readAnalysis() {
        try { return JSON.parse(localStorage.getItem(uKey("analysisData")) || "{}"); }
        catch (e) { return {}; }
    }

    async function getJSON(url) {
        try {
            const res = await fetch(url);
            return await res.json();
        } catch (e) {
            return {};
        }
    }

    async function collect() {
        const analysis = readAnalysis();
        const gap = analysis.skillGap || {};

        data.ats = Number(analysis.atsScore) || 0;
        data.hasResume = !!analysis.skillGap || data.ats > 0;
        data.skillCount = Array.isArray(gap.detectedSkills) ? gap.detectedSkills.length : 0;
        data.roleMatch = Number(gap.roleMatchPercentage) || 0;
        data.shared = localStorage.getItem(uKey("portfolioShared")) === "1";

        const [skillsRes, planRes] = await Promise.all([getJSON("/auth/skills"), getJSON("/feature/planner")]);

        const skills = Array.isArray(skillsRes.skills) ? skillsRes.skills : [];
        const values = skills.map(s => Number(s.progress) || 0);
        data.maxProgress = values.length ? Math.max(...values) : 0;
        data.avgProgress = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

        const plan = Array.isArray(planRes.plan) ? planRes.plan : [];
        data.planDone = plan.filter(t => t.completed === true || Number(t.completed) === 1).length;
    }

    function compute() {
        return BADGES.map(b => {
            const progress = b.p(data);
            return { id: b.id, icon: b.icon, name: b.name, desc: b.desc, progress, earned: progress >= 100 };
        });
    }

    function render(list) {
        const grid = document.getElementById("badgeGrid");
        const summary = document.getElementById("badgeSummary");
        if (!grid || !summary) return;

        const earned = list.filter(b => b.earned).length;
        const level = LEVELS.find(l => earned >= l.min).name;

        summary.innerHTML = `
            <div class="bd-count"><strong>${earned}/${list.length}</strong><span>badges earned</span></div>
            <div class="bd-meter">
                <b>${level}</b>
                <div class="bd-track"><div style="width:${Math.round((earned / list.length) * 100)}%"></div></div>
            </div>`;

        // earned badges first, then closest-to-earning
        const sorted = list.slice().sort((a, b) => (b.earned - a.earned) || (b.progress - a.progress));

        grid.innerHTML = sorted.map(b => `
            <div class="bd ${b.earned ? "earned" : ""}" style="--p:${b.progress}">
                <div class="bd-ring"><div class="bd-icon"><span>${b.icon}</span></div></div>
                <strong>${b.name}</strong>
                <small>${b.desc}</small>
                <span class="bd-state">${b.earned ? "Earned" : b.progress + "%"}</span>
            </div>`).join("");
    }

    function notify(list) {
        const ids = list.filter(b => b.earned).map(b => b.id);
        const raw = localStorage.getItem(uKey("earnedBadges"));
        localStorage.setItem(uKey("earnedBadges"), JSON.stringify(ids));
        if (raw === null) return;                       // first visit: no popup

        let before = [];
        try { before = JSON.parse(raw) || []; } catch (e) {}
        const fresh = list.filter(b => b.earned && !before.includes(b.id));
        if (!fresh.length) return;

        const old = document.querySelector(".toast");
        if (old) old.remove();
        const t = document.createElement("div");
        t.className = "toast";
        t.textContent = "🏆 New badge: " + fresh.map(b => b.name).join(", ");
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3500);
    }

    async function refresh() {
        await collect();
        const list = compute();
        render(list);
        notify(list);
        return list;
    }

    window.refreshBadges = refresh;

    // Used by sharePortfolio(): earned badges to show on the public page
    window.getEarnedBadges = async function (opts) {
        await collect();
        if (opts && opts.assumeShared) data.shared = true;
        return compute().filter(b => b.earned).map(b => ({ icon: b.icon, name: b.name }));
    };

    // Refresh after anything that changes badge data (writes only, so no loop)
    let timer = null;
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);
        try {
            const first = args[0];
            const url = typeof first === "string" ? first : (first && first.url) || "";
            const method = String((args[1] && args[1].method) || (first && first.method) || "GET").toUpperCase();
            if (method !== "GET" && /\/(auth\/upload|auth\/skills|feature\/planner|auth\/portfolio\/share)/.test(url)) {
                clearTimeout(timer);
                timer = setTimeout(refresh, 900);
            }
        } catch (e) { /* ignore */ }
        return response;
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", refresh);
    } else {
        refresh();
    }
})();
