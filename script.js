(() => {
    "use strict";

    // =========================================================================
    // 1. Theme Persistence (Dark / Light)
    // =========================================================================
    const root = document.documentElement;
    const themeToggle = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("portfolio-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
        root.setAttribute("data-theme", savedTheme);
    }

    themeToggle?.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("portfolio-theme", next);
    });

    // =========================================================================
    // 2. Mobile Navigation Drawer
    // =========================================================================
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    menuToggle?.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            menuToggle?.setAttribute("aria-expanded", "false");
        });
    });

    // =========================================================================
    // 3. Interactive PHP Code Showcase Tabs & Simulated Run
    // =========================================================================
    const snippets = {
        laravel: {
            status: "Laravel • Eloquent ORM, Form Validation & Authorization",
            raw: `<?php

namespace App\\Http\\Controllers;

use App\\Models\\StudentProject;
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Http\\Request;

class StudentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'     => ['required', 'string', 'max:120'],
            'framework' => ['required', 'in:core-php,laravel,codeigniter'],
        ]);

        StudentProject::create([
            ...$validated,
            'student_id' => $request->user()->id,
        ]);

        return redirect()->route('projects.index')
            ->with('status', 'Project submitted for review.');
    }
}`,
            output: "$ php artisan route:list --path=projects\nPOST  projects ........ StudentController@store [auth, verified]\n[OK] FormRequest validated & saved via Eloquent ORM"
        },
        oop: {
            status: "Core PHP • OOP, MVC Architecture & MySQL PDO CRUD",
            raw: `<?php

declare(strict_types=1);

class ProjectRepository
{
    public function __construct(private PDO $db) {}

    public function findByTrack(string $track): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, title, status FROM projects WHERE track = :track ORDER BY id DESC'
        );
        $stmt->execute(['track' => $track]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}`,
            output: "$ php -l ProjectRepository.php\nNo syntax errors detected in ProjectRepository.php\n[OK] Prepared statement executed safely against MySQL"
        },
        api: {
            status: "REST API • JSON Response & CodeIgniter / PHP Integration",
            raw: `<?php

declare(strict_types=1);

class ApiResponse
{
    public static function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        echo json_encode([
            'success' => $status < 400,
            'data'    => $payload,
        ], JSON_THROW_ON_ERROR);
    }
}`,
            output: "$ curl -s http://localhost:8000/api/modules\nHTTP/1.1 200 OK\n{\"success\":true,\"data\":[\"Core PHP\",\"Laravel\",\"CodeIgniter\",\"MySQL\"]}"
        }
    };

    const codeDisplay = document.getElementById("code-display");
    const codeStatus = document.getElementById("code-status");
    const terminalOutput = document.getElementById("terminal-output");
    const runDemoBtn = document.getElementById("run-demo-btn");
    const copyCodeBtn = document.getElementById("copy-code-btn");
    let currentTab = "laravel";

    function highlightPhp(source) {
        const escaped = source
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\$[a-zA-Z_]\w*|\b(?:declare|strict_types|namespace|use|class|public|private|static|function|return|echo|array|string|int|void)\b)/g;

        return escaped.replace(tokenRegex, (match) => {
            if (match.startsWith("//") || match.startsWith("/*")) {
                return `<span class="tok-cmt">${match}</span>`;
            }
            if (match.startsWith("'") || match.startsWith('"')) {
                return `<span class="tok-str">${match}</span>`;
            }
            if (match.startsWith("$")) {
                return `<span class="tok-var">${match}</span>`;
            }
            if (["string", "array", "int", "void"].includes(match)) {
                return `<span class="tok-type">${match}</span>`;
            }
            return `<span class="tok-kw">${match}</span>`;
        });
    }

    function renderCodeTab(tabKey) {
        currentTab = tabKey;
        const item = snippets[tabKey];
        if (!item || !codeDisplay) return;
        codeDisplay.innerHTML = highlightPhp(item.raw);
        if (codeStatus) codeStatus.textContent = item.status;
        if (terminalOutput) {
            terminalOutput.hidden = true;
            terminalOutput.textContent = "";
        }
    }

    document.querySelectorAll(".code-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".code-tab").forEach((t) => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");
            renderCodeTab(btn.dataset.tab);
        });
    });

    runDemoBtn?.addEventListener("click", () => {
        const item = snippets[currentTab];
        if (!item || !terminalOutput) return;
        terminalOutput.textContent = item.output;
        terminalOutput.hidden = false;
    });

    copyCodeBtn?.addEventListener("click", async () => {
        const raw = snippets[currentTab]?.raw || "";
        try {
            await navigator.clipboard.writeText(raw);
            copyCodeBtn.textContent = "Copied!";
            setTimeout(() => {
                copyCodeBtn.textContent = "Copy";
            }, 1500);
        } catch {
            copyCodeBtn.textContent = "Copy failed";
        }
    });

    renderCodeTab("laravel");

    // =========================================================================
    // 4. Skills Filtering
    // =========================================================================
    const skillButtons = document.querySelectorAll("[data-skill-filter]");
    const skillCards = document.querySelectorAll(".skill-card");

    skillButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const filter = btn.dataset.skillFilter;
            skillButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            skillCards.forEach((card) => {
                const match = filter === "all" || card.dataset.category === filter;
                card.classList.toggle("is-hidden", !match);
            });
        });
    });

    // =========================================================================
    // 5. Training Modules Accordion
    // =========================================================================
    document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const item = trigger.closest(".accordion-item");
            const isOpen = item.classList.toggle("open");
            trigger.setAttribute("aria-expanded", String(isOpen));
        });
    });

    // =========================================================================
    // 6. Training Inquiry Prefill + Copy Email + Contact Form
    // =========================================================================
    const inquirySelect = document.getElementById("inquiry-type");
    const messageInput = document.getElementById("message");

    document.querySelectorAll(".request-syllabus").forEach((btn) => {
        btn.addEventListener("click", () => {
            const course = btn.dataset.course || "PHP Training";
            if (inquirySelect) {
                inquirySelect.value = "PHP / Laravel Training & Mentorship";
            }
            if (messageInput) {
                messageInput.value = `Hi Deepa, I would like more details regarding "${course}".`;
            }
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            messageInput?.focus();
        });
    });

    const copyEmailBtn = document.getElementById("copy-email-btn");
    const emailText = document.getElementById("email-text");
    copyEmailBtn?.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(emailText?.textContent.trim() || "");
            copyEmailBtn.textContent = "Copied!";
            setTimeout(() => {
                copyEmailBtn.textContent = "Copy";
            }, 1500);
        } catch {
            copyEmailBtn.textContent = "Error";
        }
    });

    const contactForm = document.getElementById("contact-form");
    const formFeedback = document.getElementById("form-feedback");

    contactForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("name")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const message = messageInput?.value.trim();
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

        if (!name || !emailValid || !message) {
            formFeedback.textContent = "Please enter your name, a valid email address, and your message.";
            formFeedback.className = "form-feedback error";
            return;
        }

        formFeedback.textContent = `Thank you, ${name}! Please reach out directly at deepa.vp3@gmail.com or +91 8943060738 if you need an immediate response.`;
        formFeedback.className = "form-feedback success";
        contactForm.reset();
    });

    // =========================================================================
    // 7. Footer Year & Active Nav Link Highlight
    // =========================================================================
    const yearEl = document.getElementById("current-year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const sections = document.querySelectorAll("main section[id]");
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.getAttribute("id");
                navLinks?.querySelectorAll("a").forEach((a) => {
                    a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
                });
            });
        },
        { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((sec) => observer.observe(sec));
})();
