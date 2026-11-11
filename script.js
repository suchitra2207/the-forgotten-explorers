document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. COLLECT THE NINE EXHIBITS
    // ==========================================

    const exhibitCards = Array.from(
        document.querySelectorAll(".exhibit-card")
    );

    const explorers = exhibitCards.map(function (card) {

        const section = card.closest("section");
        const image = card.querySelector(".exhibit-image img");
        const title = card.querySelector("h3");
        const category = card.querySelector(".exhibit-category");
        const description = card.querySelector(
            ".exhibit-info > p:not(.exhibit-category)"
        );
        const status = card.querySelector(".exhibit-status");
        const source = card.querySelector(".source-link");
        const imageLabel = card.querySelector(".image-label");

        let destination = "DEEP SPACE";

        if (section && section.id === "moon") {
            destination = "THE MOON";
        } else if (section && section.id === "mars") {
            destination = "MARS";
        }

        return {
            name: title ? title.textContent.trim() : "",
            category: category ? category.textContent.trim() : "",
            description: description ? description.textContent.trim() : "",
            status: status ? status.textContent.trim() : "",
            image: image ? image.src : "",
            imageAlt: image ? image.alt : "",
            imageLabel: imageLabel ? imageLabel.textContent.trim() : "",
            source: source ? source.href : "",
            destination: destination,
            card: card
        };

    });


    // ==========================================
    // 2. INTERACTIVE EXHIBIT MODAL
    // ==========================================

    const modal = document.createElement("div");
    modal.className = "exhibit-modal";

    modal.innerHTML = `
        <div class="modal-content" role="dialog"
             aria-modal="true" aria-labelledby="modal-title">

            <button class="modal-close" aria-label="Close exhibit">
                &times;
            </button>

            <div class="modal-image-container">
                <img class="modal-image" src="" alt="">
                <span class="modal-image-label"></span>
            </div>

            <div class="modal-details">
                <p class="modal-category"></p>
                <h2 id="modal-title"></h2>
                <p class="modal-description"></p>
                <div class="modal-status"></div>

                <a class="modal-source" href=""
                   target="_blank" rel="noopener noreferrer">
                    EXPLORE NASA SOURCE ↗
                </a>
            </div>

        </div>
    `;

    document.body.appendChild(modal);

    const modalImage = modal.querySelector(".modal-image");
    const modalImageLabel = modal.querySelector(".modal-image-label");
    const modalCategory = modal.querySelector(".modal-category");
    const modalTitle = modal.querySelector("#modal-title");
    const modalDescription = modal.querySelector(".modal-description");
    const modalStatus = modal.querySelector(".modal-status");
    const modalSource = modal.querySelector(".modal-source");
    const closeButton = modal.querySelector(".modal-close");

    function openExhibit(card) {

        const explorer = explorers.find(function (item) {
            return item.card === card;
        });

        if (!explorer) return;

        modalImage.src = explorer.image;
        modalImage.alt = explorer.imageAlt;
        modalImageLabel.textContent = explorer.imageLabel;
        modalCategory.textContent = explorer.category;
        modalTitle.textContent = explorer.name;
        modalDescription.textContent = explorer.description;
        modalStatus.textContent = explorer.status;
        modalSource.href = explorer.source;

        modal.classList.add("active");
        document.body.classList.add("modal-open");

        closeButton.focus();
    }

    function closeExhibit() {
        modal.classList.remove("active");
        document.body.classList.remove("modal-open");
    }

    exhibitCards.forEach(function (card) {

        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");

        card.addEventListener("click", function (event) {

            if (event.target.closest("a")) return;

            openExhibit(card);
        });

        card.addEventListener("keydown", function (event) {

            if (event.target !== card) return;

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openExhibit(card);
            }

        });

    });

    closeButton.addEventListener("click", closeExhibit);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) closeExhibit();
    });

    document.addEventListener("keydown", function (event) {

        if (
            event.key === "Escape" &&
            modal.classList.contains("active")
        ) {
            closeExhibit();
        }

    });


    // ==========================================
    // 3. EXPLORER SEARCH
    // ==========================================

    const searchSection = document.createElement("section");

    searchSection.className = "explorer-search section-padding";
    searchSection.id = "discover";

    searchSection.innerHTML = `
        <div class="search-heading">
            <p class="eyebrow">THE EXPLORER DATABASE</p>
            <h2>Find your explorer.</h2>

            <p class="search-intro">
                Search the collection by explorer, mission or destination.
            </p>
        </div>

        <div class="search-box">
            <span class="search-icon">⌕</span>

            <input
                type="search"
                id="explorer-search-input"
                placeholder="Search an explorer, mission or destination..."
                autocomplete="off"
                aria-label="Search explorers"
            >

            <button id="clear-search" type="button">CLEAR</button>
        </div>

        <div class="search-suggestions">
            <span>TRY:</span>
            <button class="search-suggestion" data-query="Voyager">Voyager</button>
            <button class="search-suggestion" data-query="Apollo">Apollo</button>
            <button class="search-suggestion" data-query="Mars">Mars</button>
            <button class="search-suggestion" data-query="Pluto">Pluto</button>
        </div>

        <div class="search-result-heading">
            <span id="search-result-count"></span>
        </div>

        <div class="search-results" id="search-results"></div>

        <div class="no-search-results" id="no-search-results">
            <span class="no-results-symbol">✦</span>
            <h3>No explorers found.</h3>
            <p>Try another name, mission or destination.</p>
        </div>
    `;

    const collectionsSection = document.querySelector(".collections");

    if (collectionsSection) {
        collectionsSection.after(searchSection);
    }

    const searchInput = searchSection.querySelector("#explorer-search-input");
    const clearSearchButton = searchSection.querySelector("#clear-search");
    const searchResults = searchSection.querySelector("#search-results");
    const searchResultCount = searchSection.querySelector("#search-result-count");
    const noSearchResults = searchSection.querySelector("#no-search-results");

    function renderSearchResults(query) {

        searchResults.innerHTML = "";

        const searchTerm = query.toLowerCase().trim();

        const results = explorers.filter(function (explorer) {

            const searchableText = [
                explorer.name,
                explorer.category,
                explorer.description,
                explorer.destination,
                explorer.imageLabel,
                explorer.status
            ].join(" ").toLowerCase();

            return searchableText.includes(searchTerm);

        });

        searchResultCount.textContent =
            results.length +
            (results.length === 1 ? " EXPLORER FOUND" : " EXPLORERS FOUND");

        noSearchResults.classList.toggle("visible", results.length === 0);

        results.forEach(function (explorer) {

            const result = document.createElement("button");

            result.className = "search-result-card";
            result.type = "button";

            result.innerHTML = `
                <div class="search-result-image">
                    <img src="" alt="">
                </div>

                <div class="search-result-details">
                    <span class="search-result-destination"></span>
                    <h3></h3>
                    <p class="search-result-category"></p>
                    <span class="search-result-action">DISCOVER STORY ↗</span>
                </div>
            `;

            result.querySelector("img").src = explorer.image;
            result.querySelector("img").alt = explorer.imageAlt;

            result.querySelector(".search-result-destination").textContent =
                explorer.destination;

            result.querySelector("h3").textContent = explorer.name;

            result.querySelector(".search-result-category").textContent =
                explorer.category;

            result.addEventListener("click", function () {
                openExhibit(explorer.card);
            });

            searchResults.appendChild(result);

        });

    }

    renderSearchResults("");

    searchInput.addEventListener("input", function () {
        renderSearchResults(searchInput.value);
    });

    clearSearchButton.addEventListener("click", function () {
        searchInput.value = "";
        renderSearchResults("");
        searchInput.focus();
    });

    searchSection.querySelectorAll(".search-suggestion").forEach(
        function (button) {

            button.addEventListener("click", function () {
                searchInput.value = button.dataset.query;
                renderSearchResults(searchInput.value);
                searchInput.focus();
            });

        }
    );


    // ==========================================
    // 4. MISSION TIMELINE
    // ==========================================

    const missions = [

        {
            year: "1969",
            name: "Eagle's Descent Stage",
            mission: "Apollo 11",
            destination: "MOON",
            category: "moon",
            description: "Humanity's first crewed lunar landing."
        },

        {
            year: "1969",
            name: "ALSEP Experiments",
            mission: "Apollo lunar missions",
            destination: "MOON",
            category: "moon",
            description: "Scientific instruments studied the lunar environment."
        },

        {
            year: "1971",
            name: "Lunar Roving Vehicle",
            mission: "Apollo 15",
            destination: "MOON",
            category: "moon",
            description: "Astronauts travelled farther across the lunar surface."
        },

        {
            year: "1977",
            name: "Voyager 1",
            mission: "Voyager programme",
            destination: "DEEP SPACE",
            category: "beyond",
            description: "Launched on a journey that would reach interstellar space."
        },

        {
            year: "1977",
            name: "Voyager 2",
            mission: "Voyager programme",
            destination: "DEEP SPACE",
            category: "beyond",
            description: "Began its remarkable journey to the outer planets."
        },

        {
            year: "1997",
            name: "Sojourner",
            mission: "Mars Pathfinder",
            destination: "MARS",
            category: "mars",
            description: "The first successful wheeled rover to operate on Mars."
        },

        {
            year: "2004",
            name: "Spirit",
            mission: "Mars Exploration Rover",
            destination: "MARS",
            category: "mars",
            description: "Explored Gusev Crater and investigated ancient water activity."
        },

        {
            year: "2004",
            name: "Opportunity",
            mission: "Mars Exploration Rover",
            destination: "MARS",
            category: "mars",
            description: "Found evidence of ancient watery environments on Mars."
        },

        {
            year: "2006",
            name: "New Horizons",
            mission: "New Horizons",
            destination: "DEEP SPACE",
            category: "beyond",
            description: "Set out to explore Pluto and the Kuiper Belt."
        }

    ];

    const timeline = document.createElement("section");

    timeline.className = "mission-timeline section-padding";
    timeline.id = "timeline";

    timeline.innerHTML = `
        <div class="section-heading">
            <div>
                <p class="eyebrow">A JOURNEY THROUGH TIME</p>
                <h2>History in motion.</h2>
            </div>

            <p class="section-note">
                Nine explorers. Decades of discovery.
            </p>
        </div>

        <div class="timeline-intro">
            <p>
                Every date marks a moment when humanity reached farther
                into the unknown. Explore the missions that shaped our
                understanding of the universe.
            </p>
        </div>

        <div class="timeline-filters">
            <button class="timeline-filter active" data-filter="all">
                ALL MISSIONS
            </button>

            <button class="timeline-filter" data-filter="moon">
                THE MOON
            </button>

            <button class="timeline-filter" data-filter="mars">
                MARS
            </button>

            <button class="timeline-filter" data-filter="beyond">
                DEEP SPACE
            </button>
        </div>

        <div class="timeline-list"></div>

        <p class="timeline-footer">THE EXPLORATION CONTINUES.</p>
    `;

    const closingSection = document.querySelector(".closing");

    if (closingSection) {
        closingSection.before(timeline);
    }

    const timelineList = timeline.querySelector(".timeline-list");
    const filterButtons = timeline.querySelectorAll(".timeline-filter");

    function renderTimeline(filter) {

        timelineList.innerHTML = "";

        missions.filter(function (mission) {
            return filter === "all" || mission.category === filter;
        }).forEach(function (mission) {

            const item = document.createElement("button");

            item.className = "timeline-item";
            item.type = "button";

            item.innerHTML = `
                <span class="timeline-year">${mission.year}</span>
                <span class="timeline-marker"></span>

                <span class="timeline-content">
                    <span class="timeline-destination">${mission.destination}</span>
                    <span class="timeline-name"></span>
                    <span class="timeline-mission"></span>
                    <span class="timeline-description"></span>
                </span>

                <span class="timeline-arrow">↗</span>
            `;

            item.querySelector(".timeline-name").textContent = mission.name;

            item.querySelector(".timeline-mission").textContent =
                mission.mission;

            item.querySelector(".timeline-description").textContent =
                mission.description;

            item.addEventListener("click", function () {

                const explorer = explorers.find(function (entry) {
                    return entry.name === mission.name;
                });

                if (explorer) {
                    openExhibit(explorer.card);
                }

            });

            timelineList.appendChild(item);

        });

    }

    renderTimeline("all");

    filterButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            filterButtons.forEach(function (item) {
                item.classList.remove("active");
            });

            button.classList.add("active");

            renderTimeline(button.dataset.filter);

        });

    });


    // ==========================================
    // 5. NASA SOURCES AND IMAGE CREDITS
    // ==========================================

    const sourcesSection = document.createElement("section");

    sourcesSection.className = "sources-section section-padding";
    sourcesSection.id = "sources";

    sourcesSection.innerHTML = `
        <div class="section-heading">
            <div>
                <p class="eyebrow">RESEARCH · REFERENCES · ATTRIBUTION</p>
                <h2>Every story has a source.</h2>
            </div>

            <p class="section-note">
                Explore the original mission information and image resources.
            </p>
        </div>

        <div class="sources-intro">
            <p>
                The Forgotten Explorers is an independent educational
                storytelling project. Mission descriptions and exhibit
                references are linked to NASA's official mission and
                image-resource pages wherever available.
            </p>
        </div>

        <div class="sources-group">
            <p class="sources-group-label">THE MOON</p>
            <div class="sources-list" id="moon-sources"></div>
        </div>

        <div class="sources-group">
            <p class="sources-group-label">MARS</p>
            <div class="sources-list" id="mars-sources"></div>
        </div>

        <div class="sources-group">
            <p class="sources-group-label">DEEP SPACE</p>
            <div class="sources-list" id="space-sources"></div>
        </div>

        <div class="image-credit-note">
            <h3>Image and research acknowledgement</h3>

            <p>
                Images and mission resources are credited through their
                linked NASA pages. Refer to each original resource for
                individual image credits and usage conditions.
            </p>

            <p>
                NASA is not affiliated with or endorsing this independent
                project.
            </p>

            <a href="https://www.nasa.gov/"
               target="_blank" rel="noopener noreferrer">
                VISIT NASA ↗
            </a>
        </div>
    `;

    if (closingSection) {
        closingSection.before(sourcesSection);
    }

    const sourceContainers = {
        "THE MOON": sourcesSection.querySelector("#moon-sources"),
        "MARS": sourcesSection.querySelector("#mars-sources"),
        "DEEP SPACE": sourcesSection.querySelector("#space-sources")
    };

    explorers.forEach(function (explorer) {

        const container = sourceContainers[explorer.destination];

        if (!container || !explorer.source) return;

        const sourceItem = document.createElement("div");
        sourceItem.className = "source-item";

        const details = document.createElement("div");
        details.className = "source-item-details";

        const title = document.createElement("h3");
        title.textContent = explorer.name;

        const category = document.createElement("p");
        category.textContent = explorer.category;

        details.appendChild(title);
        details.appendChild(category);

        const link = document.createElement("a");

        link.href = explorer.source;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "VIEW NASA SOURCE ↗";

        sourceItem.appendChild(details);
        sourceItem.appendChild(link);

        container.appendChild(sourceItem);

    });


    // ==========================================
    // 6. NAVIGATION LINKS
    // ==========================================

    const navigation = document.querySelector(".navigation");

    if (navigation) {

        const navigationItems = [
            { name: "Timeline", href: "#timeline" },
            { name: "Discover", href: "#discover" },
            { name: "Sources", href: "#sources" }
        ];

        navigationItems.forEach(function (item) {

            if (navigation.querySelector('a[href="' + item.href + '"]')) {
                return;
            }

            const link = document.createElement("a");

            link.href = item.href;
            link.textContent = item.name;

            navigation.appendChild(link);

        });

    }


    // ==========================================
    // 7. WELCOME EXPERIENCE
    // ==========================================

    const welcome = document.createElement("div");

    welcome.className = "welcome-screen";

    welcome.innerHTML = `
        <div class="welcome-content">

            <p class="welcome-brand">LONE ORBIT PRESENTS</p>

            <div class="welcome-orbit">
                <span></span>
            </div>

            <p class="welcome-overline">
                AN INTERACTIVE DIGITAL MUSEUM
            </p>

            <h2>
                The Forgotten<br>
                <span>Explorers.</span>
            </h2>

            <p class="welcome-description">
                Nine explorers. Three destinations.
                Countless stories beyond Earth.
            </p>

            <button class="welcome-button" type="button">
                ENTER THE MUSEUM <span>↗</span>
            </button>

            <p class="welcome-footer">
                ONE MIND. INFINITE POSSIBILITIES.
            </p>

        </div>
    `;

    document.body.prepend(welcome);
    document.body.classList.add("welcome-open");

    welcome.querySelector(".welcome-button").addEventListener(
        "click",
        function () {

            welcome.classList.add("welcome-hidden");

            document.body.classList.remove("welcome-open");

            window.setTimeout(function () {
                welcome.remove();
            }, 850);

        }
    );


    // ==========================================
    // 8. SCROLL PROGRESS BAR
    // ==========================================

    const progressBar = document.createElement("div");
    progressBar.className = "scroll-progress";

    const progressFill = document.createElement("div");
    progressFill.className = "scroll-progress-fill";

    progressBar.appendChild(progressFill);
    document.body.appendChild(progressBar);

    function updateScrollProgress() {

        const totalHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress = totalHeight > 0
            ? (window.scrollY / totalHeight) * 100
            : 0;

        progressFill.style.width = progress + "%";

    }

    window.addEventListener("scroll", updateScrollProgress, {
        passive: true
    });

    window.addEventListener("resize", updateScrollProgress);

    updateScrollProgress();


    // ==========================================
    // 9. BACK TO TOP BUTTON
    // ==========================================

    const backToTop = document.createElement("button");

    backToTop.className = "back-to-top";
    backToTop.type = "button";
    backToTop.setAttribute("aria-label", "Back to top");
    backToTop.textContent = "↑";

    document.body.appendChild(backToTop);

    backToTop.addEventListener("click", function () {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

    function updateBackToTop() {

        backToTop.classList.toggle(
            "visible",
            window.scrollY > 500
        );

    }

    window.addEventListener("scroll", updateBackToTop, {
        passive: true
    });

    updateBackToTop();


    // ==========================================
    // 10. SECTION REVEAL ANIMATIONS
    // ==========================================

    const revealElements = document.querySelectorAll(
        ".intro, .collections, .exhibition, .closing, .site-footer"
    );

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            function (entries, observer) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("revealed");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12
            }
        );

        revealElements.forEach(function (element) {

            element.classList.add("reveal-on-scroll");

            revealObserver.observe(element);

        });

    }


    // ==========================================
    // 11. ALL EXPERIENCE STYLES
    // ==========================================

    const styles = document.createElement("style");

    styles.textContent = `

        /* WELCOME SCREEN */

        .welcome-screen {
            position: fixed;
            inset: 0;
            z-index: 20000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 30px;
            background:
                radial-gradient(circle at center, rgba(54,75,91,0.35), transparent 45%),
                #101923;
            opacity: 1;
            visibility: visible;
            transition: opacity 0.8s ease, visibility 0.8s ease;
        }

        .welcome-screen.welcome-hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        body.welcome-open {
            overflow: hidden;
        }

        .welcome-content {
            max-width: 700px;
            text-align: center;
            animation: welcomeAppear 1.2s ease both;
        }

        .welcome-brand,
        .welcome-overline,
        .welcome-footer {
            color: #c5a66b;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 3px;
        }

        .welcome-orbit {
            width: 115px;
            height: 115px;
            margin: 35px auto;
            border: 1px solid rgba(197,166,107,0.65);
            border-radius: 50%;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 0 45px rgba(197,166,107,0.08);
        }

        .welcome-orbit::before,
        .welcome-orbit::after {
            content: "";
            position: absolute;
            border: 1px solid rgba(197,166,107,0.25);
            border-radius: 50%;
        }

        .welcome-orbit::before {
            inset: -13px;
        }

        .welcome-orbit::after {
            inset: 17px;
        }

        .welcome-orbit span {
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background: #c5a66b;
            box-shadow: 0 0 20px #c5a66b;
        }

        .welcome-content h2 {
            margin-top: 18px;
            color: #f1eee6;
            font-family: 'Playfair Display', serif;
            font-size: clamp(48px, 8vw, 82px);
            font-weight: 400;
            line-height: 1.1;
        }

        .welcome-content h2 span {
            color: #c5a66b;
            font-style: italic;
        }

        .welcome-description {
            max-width: 400px;
            margin: 24px auto 30px;
            color: #b8bdc0;
            font-size: 13px;
        }

        .welcome-button {
            padding: 15px 23px;
            border: 1px solid #c5a66b;
            background: transparent;
            color: #f1eee6;
            font-family: 'DM Sans', sans-serif;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 2px;
            cursor: pointer;
            transition: 0.3s ease;
        }

        .welcome-button:hover {
            background: #c5a66b;
            color: #101923;
        }

        .welcome-button span {
            margin-left: 15px;
        }

        .welcome-footer {
            margin-top: 55px;
            color: #858f96;
            font-size: 8px;
        }

        @keyframes welcomeAppear {
            from {
                opacity: 0;
                transform: translateY(20px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }


        /* SCROLL PROGRESS */

        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            z-index: 15000;
            background: transparent;
            pointer-events: none;
        }

        .scroll-progress-fill {
            width: 0;
            height: 100%;
            background: #c5a66b;
            transition: width 0.08s linear;
        }


        /* BACK TO TOP */

        .back-to-top {
            position: fixed;
            right: 25px;
            bottom: 25px;
            z-index: 8000;
            width: 45px;
            height: 45px;
            border: 1px solid rgba(197,166,107,0.7);
            border-radius: 50%;
            background: #192633;
            color: #c5a66b;
            font-size: 22px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transform: translateY(12px);
            transition: 0.3s ease;
        }

        .back-to-top.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .back-to-top:hover {
            background: #c5a66b;
            color: #101923;
        }


        /* SECTION REVEAL */

        .reveal-on-scroll {
            opacity: 0;
            transform: translateY(25px);
            transition:
                opacity 0.8s ease,
                transform 0.8s ease;
        }

        .reveal-on-scroll.revealed {
            opacity: 1;
            transform: translateY(0);
        }


        /* EXHIBIT MODAL */

        .exhibit-card {
            cursor: pointer;
        }

        .exhibit-modal {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 25px;
            background: rgba(3,8,14,0.88);
            backdrop-filter: blur(10px);
            opacity: 0;
            visibility: hidden;
            transition: 0.3s ease;
        }

        .exhibit-modal.active {
            opacity: 1;
            visibility: visible;
        }

        .modal-content {
            position: relative;
            width: 100%;
            max-width: 850px;
            max-height: 90vh;
            overflow-y: auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            background: #192633;
            border: 1px solid rgba(197,166,107,0.45);
            transform: translateY(25px);
            transition: transform 0.3s ease;
        }

        .exhibit-modal.active .modal-content {
            transform: translateY(0);
        }

        .modal-close {
            position: absolute;
            top: 12px;
            right: 15px;
            z-index: 2;
            width: 38px;
            height: 38px;
            border: 1px solid rgba(255,255,255,0.35);
            border-radius: 50%;
            background: rgba(16,25,35,0.8);
            color: #f1eee6;
            font-size: 25px;
            cursor: pointer;
        }

        .modal-image-container {
            position: relative;
            min-height: 420px;
            background: #263746;
        }

        .modal-image {
            width: 100%;
            height: 100%;
            min-height: 420px;
            position: absolute;
            inset: 0;
            object-fit: cover;
        }

        .modal-image-label {
            position: absolute;
            left: 18px;
            bottom: 18px;
            padding: 8px 12px;
            background: rgba(16,25,35,0.9);
            color: #f1eee6;
            font-size: 10px;
            letter-spacing: 2px;
        }

        .modal-details {
            padding: 55px 35px 35px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .modal-category {
            color: #c5a66b;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 2px;
            margin-bottom: 15px;
        }

        .modal-details h2 {
            color: #f1eee6;
            font-family: 'Playfair Display', serif;
            font-size: 38px;
            font-weight: 400;
            margin-bottom: 22px;
        }

        .modal-description {
            color: #c0c4c5;
            font-size: 13px;
            line-height: 1.9;
        }

        .modal-status {
            margin-top: 25px;
            padding-top: 18px;
            border-top: 1px solid rgba(241,238,230,0.15);
            color: #c5a66b;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1.5px;
        }

        .modal-source {
            display: inline-block;
            width: fit-content;
            margin-top: 25px;
            color: #c5a66b;
            font-size: 10px;
            font-weight: 700;
        }

        body.modal-open {
            overflow: hidden;
        }


        /* SEARCH */

        .explorer-search {
            background: #101923;
            border-top: 1px solid rgba(241,238,230,0.15);
        }

        .search-heading {
            max-width: 650px;
        }

        .search-heading h2 {
            font-family: 'Playfair Display', serif;
            font-size: clamp(38px,5vw,58px);
            font-weight: 400;
        }

        .search-intro {
            color: #b8bdc0;
            font-size: 13px;
            margin-top: 20px;
        }

        .search-box {
            max-width: 800px;
            min-height: 65px;
            margin-top: 35px;
            padding: 0 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            border: 1px solid rgba(197,166,107,0.5);
            background: #192633;
        }

        .search-icon {
            color: #c5a66b;
            font-size: 27px;
        }

        .search-box input {
            width: 100%;
            min-width: 0;
            border: none;
            outline: none;
            background: transparent;
            color: #f1eee6;
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
        }

        .search-box input::placeholder {
            color: #8c969e;
        }

        .search-box button {
            border: none;
            background: transparent;
            color: #c5a66b;
            font-size: 9px;
            font-weight: 700;
            cursor: pointer;
        }

        .search-suggestions {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 20px;
        }

        .search-suggestions > span {
            color: #8c969e;
            font-size: 9px;
        }

        .search-suggestion {
            border: 1px solid rgba(241,238,230,0.2);
            border-radius: 20px;
            padding: 6px 12px;
            background: transparent;
            color: #c2c4c3;
            font-size: 10px;
            cursor: pointer;
        }

        .search-result-heading {
            margin: 40px 0 18px;
            color: #c5a66b;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 2px;
        }

        .search-results {
            display: grid;
            grid-template-columns: repeat(3,minmax(0,1fr));
            gap: 18px;
        }

        .search-result-card {
            min-width: 0;
            padding: 0;
            border: 1px solid rgba(241,238,230,0.15);
            background: #192633;
            color: #f1eee6;
            text-align: left;
            cursor: pointer;
            overflow: hidden;
        }

        .search-result-image {
            height: 160px;
            overflow: hidden;
            background: #263746;
        }

        .search-result-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .search-result-details {
            padding: 18px;
        }

        .search-result-destination {
            color: #c5a66b;
            font-size: 8px;
            font-weight: 700;
        }

        .search-result-details h3 {
            margin: 9px 0;
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            font-weight: 400;
        }

        .search-result-category {
            color: #aeb5ba;
            font-size: 10px;
        }

        .search-result-action {
            display: inline-block;
            margin-top: 15px;
            color: #c5a66b;
            font-size: 9px;
            font-weight: 700;
        }

        .no-search-results {
            display: none;
            padding: 45px 20px;
            text-align: center;
            background: #192633;
        }

        .no-search-results.visible {
            display: block;
        }

        .no-search-results h3 {
            margin-top: 12px;
            font-family: 'Playfair Display', serif;
            font-size: 25px;
            font-weight: 400;
        }

        .no-search-results p {
            color: #aeb5ba;
            font-size: 12px;
        }


        /* TIMELINE */

        .mission-timeline {
            background: #131f2a;
            border-top: 1px solid rgba(241,238,230,0.15);
        }

        .timeline-intro {
            max-width: 620px;
            margin-top: -20px;
            margin-bottom: 35px;
            color: #b8bdc0;
            font-size: 13px;
        }

        .timeline-filters {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 45px;
        }

        .timeline-filter {
            padding: 11px 17px;
            border: 1px solid rgba(197,166,107,0.4);
            background: transparent;
            color: #c5a66b;
            font-size: 9px;
            cursor: pointer;
        }

        .timeline-filter.active {
            background: #c5a66b;
            color: #101923;
        }

        .timeline-list {
            position: relative;
            max-width: 850px;
            margin: 0 auto;
        }

        .timeline-list::before {
            content: "";
            position: absolute;
            top: 10px;
            bottom: 10px;
            left: 105px;
            width: 1px;
            background: rgba(197,166,107,0.45);
        }

        .timeline-item {
            width: 100%;
            display: grid;
            grid-template-columns: 75px 60px 1fr 25px;
            align-items: center;
            padding: 22px 12px;
            border: none;
            border-bottom: 1px solid rgba(241,238,230,0.1);
            background: transparent;
            color: inherit;
            text-align: left;
            cursor: pointer;
        }

        .timeline-year {
            color: #c5a66b;
            font-family: 'Playfair Display', serif;
            font-size: 23px;
        }

        .timeline-marker {
            width: 11px;
            height: 11px;
            justify-self: center;
            border: 2px solid #c5a66b;
            border-radius: 50%;
            background: #131f2a;
            z-index: 1;
        }

        .timeline-content {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .timeline-destination {
            color: #c5a66b;
            font-size: 8px;
            font-weight: 700;
        }

        .timeline-name {
            color: #f1eee6;
            font-family: 'Playfair Display', serif;
            font-size: 21px;
        }

        .timeline-mission {
            color: #c3c5c5;
            font-size: 10px;
        }

        .timeline-description {
            color: #929da4;
            font-size: 11px;
            margin-top: 5px;
        }

        .timeline-arrow {
            color: #c5a66b;
            font-size: 18px;
        }

        .timeline-footer {
            margin-top: 40px;
            text-align: center;
            color: #c5a66b;
            font-size: 10px;
            letter-spacing: 3px;
        }


        /* SOURCES */

        .sources-section {
            background: #131d27;
            border-top: 1px solid rgba(241,238,230,0.15);
        }

        .sources-intro {
            max-width: 700px;
            margin-top: -20px;
            margin-bottom: 45px;
            color: #b8bdc0;
            font-size: 13px;
            line-height: 1.9;
        }

        .sources-group {
            margin-bottom: 35px;
        }

        .sources-group-label {
            margin-bottom: 14px;
            color: #c5a66b;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 2px;
        }

        .sources-list {
            border-top: 1px solid rgba(241,238,230,0.15);
        }

        .source-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            padding: 18px 5px;
            border-bottom: 1px solid rgba(241,238,230,0.15);
        }

        .source-item-details h3 {
            color: #f1eee6;
            font-family: 'Playfair Display', serif;
            font-size: 19px;
            font-weight: 400;
        }

        .source-item-details p {
            margin-top: 5px;
            color: #929da4;
            font-size: 9px;
        }

        .source-item a {
            flex-shrink: 0;
            color: #c5a66b;
            font-size: 9px;
            font-weight: 700;
        }

        .image-credit-note {
            margin-top: 50px;
            padding: 30px;
            border: 1px solid rgba(197,166,107,0.3);
            background: #192633;
        }

        .image-credit-note h3 {
            color: #f1eee6;
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            font-weight: 400;
            margin-bottom: 14px;
        }

        .image-credit-note p {
            color: #b8bdc0;
            font-size: 11px;
            line-height: 1.9;
            margin-bottom: 12px;
        }

        .image-credit-note a {
            display: inline-block;
            margin-top: 12px;
            color: #c5a66b;
            font-size: 10px;
            font-weight: 700;
        }


        /* RESPONSIVE DESIGN */

        @media (max-width: 900px) {

            .search-results {
                grid-template-columns: repeat(2,minmax(0,1fr));
            }

        }

        @media (max-width: 650px) {

            .modal-content {
                grid-template-columns: 1fr;
                max-width: 450px;
            }

            .modal-image-container,
            .modal-image {
                min-height: 240px;
                height: 240px;
            }

            .modal-details {
                padding: 28px 24px;
            }

            .modal-details h2 {
                font-size: 30px;
            }

            .search-results {
                grid-template-columns: 1fr;
            }

            .search-box {
                padding: 0 12px;
                gap: 8px;
            }

            .search-box input {
                font-size: 11px;
            }

            .timeline-list::before {
                left: 65px;
            }

            .timeline-item {
                grid-template-columns: 48px 35px 1fr 15px;
                padding: 18px 0;
            }

            .timeline-year {
                font-size: 17px;
            }

            .timeline-name {
                font-size: 17px;
            }

            .timeline-description {
                font-size: 10px;
            }

            .source-item {
                align-items: flex-start;
                flex-direction: column;
                gap: 10px;
            }

            .image-credit-note {
                padding: 22px;
            }

            .back-to-top {
                right: 15px;
                bottom: 15px;
            }

        }

        @media (prefers-reduced-motion: reduce) {

            *,
            *::before,
            *::after {
                scroll-behavior: auto !important;
                animation-duration: 0.01ms !important;
                transition-duration: 0.01ms !important;
            }

            .reveal-on-scroll {
                opacity: 1;
                transform: none;
            }

        }

    `;


    // ==========================================
    // 11A. COSMIC PURPLE VISUAL POLISH
    // ==========================================

    styles.textContent += `
        /* PURPLE COSMIC THEME */

        .welcome-screen {
            background:
                radial-gradient(ellipse at 50% 42%, rgba(112, 75, 151, 0.28), transparent 48%),
                radial-gradient(circle at 85% 15%, rgba(92, 65, 130, 0.18), transparent 32%),
                #171426 !important;
        }

        .welcome-orbit {
            border-color: rgba(197, 166, 210, 0.72);
            box-shadow: 0 0 48px rgba(159, 119, 190, 0.16);
        }

        .welcome-orbit::before,
        .welcome-orbit::after {
            border-color: rgba(197, 166, 210, 0.28);
        }

        .welcome-orbit span {
            background: #c5a6d2;
            box-shadow: 0 0 20px #c5a6d2;
        }

        .welcome-brand,
        .welcome-overline,
        .welcome-content h2 span,
        .welcome-button,
        .welcome-footer {
            color: #c5a6d2;
        }

        .welcome-button {
            border-color: #c5a6d2;
        }

        .welcome-button:hover {
            background: #c5a6d2;
            color: #171426;
        }

        .scroll-progress-fill {
            background: #c5a6d2;
        }

        .back-to-top {
            background: #211b35;
            border-color: rgba(197, 166, 210, 0.7);
            color: #c5a6d2;
        }

        .back-to-top:hover {
            background: #c5a6d2;
            color: #171426;
        }

        .exhibit-modal {
            background: rgba(12, 9, 22, 0.9);
        }

        .modal-content,
        .search-box,
        .search-result-card,
        .no-search-results,
        .image-credit-note {
            background: #211b35;
            border-color: rgba(197, 166, 210, 0.3);
        }

        .modal-category,
        .modal-status,
        .modal-source,
        .search-icon,
        .search-box button,
        .search-result-destination,
        .search-result-action,
        .timeline-year,
        .timeline-destination,
        .timeline-arrow,
        .timeline-footer,
        .sources-group-label,
        .source-item a,
        .image-credit-note a {
            color: #c5a6d2;
        }

        .timeline-filter {
            border-color: rgba(197, 166, 210, 0.4);
            color: #c5a6d2;
        }

        .timeline-filter.active {
            background: #c5a6d2;
            color: #171426;
        }

        .timeline-list::before {
            background: rgba(197, 166, 210, 0.45);
        }

        .timeline-marker {
            border-color: #c5a6d2;
            background: #211b35;
        }


        /* STARFIELD LAYERS — CSS only, lightweight and decorative */

        .hero,
        .hero-section,
        #home {
            position: relative;
            isolation: isolate;
            overflow: hidden;
            background-image:
                radial-gradient(ellipse at 50% 45%, rgba(94, 65, 130, 0.25), transparent 58%),
                radial-gradient(circle at 12% 18%, rgba(197, 166, 210, 0.08), transparent 22%);
        }

        .hero::before,
        .hero-section::before,
        #home::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            opacity: 0.7;
            background-image:
                radial-gradient(1px 1px at 8% 18%, #eee4ff 98%, transparent),
                radial-gradient(1.5px 1.5px at 19% 72%, #c5a6d2 98%, transparent),
                radial-gradient(1px 1px at 31% 34%, #fff 98%, transparent),
                radial-gradient(1.5px 1.5px at 44% 82%, #d9c2e8 98%, transparent),
                radial-gradient(1px 1px at 57% 17%, #fff 98%, transparent),
                radial-gradient(1px 1px at 68% 62%, #c5a6d2 98%, transparent),
                radial-gradient(1.5px 1.5px at 79% 28%, #fff 98%, transparent),
                radial-gradient(1px 1px at 91% 76%, #d9c2e8 98%, transparent);
            background-size: 360px 280px;
            animation: starDrift 38s linear infinite;
        }

        .hero::after,
        .hero-section::after,
        #home::after {
            content: "";
            position: absolute;
            width: min(65vw, 700px);
            height: min(65vw, 700px);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: -1;
            pointer-events: none;
            border-radius: 50%;
            background: radial-gradient(
                circle,
                rgba(117, 78, 157, 0.16),
                rgba(117, 78, 157, 0.04) 42%,
                transparent 70%
            );
            filter: blur(12px);
            animation: violetPulse 7s ease-in-out infinite alternate;
        }

        .hero h1,
        .hero-section h1,
        #home h1 {
            text-shadow: 0 0 34px rgba(197, 166, 210, 0.18);
        }

        .exhibition {
            position: relative;
            isolation: isolate;
        }

        .exhibition::before {
            content: "✦     ·          ✧              ·       ✦";
            position: absolute;
            top: 34px;
            right: 6%;
            z-index: -1;
            color: rgba(197, 166, 210, 0.2);
            font-size: 17px;
            letter-spacing: 18px;
            pointer-events: none;
            animation: starTwinkle 5s ease-in-out infinite alternate;
        }

        @keyframes starDrift {
            from {
                transform: translate3d(0, 0, 0);
            }

            to {
                transform: translate3d(-35px, 22px, 0);
            }
        }

        @keyframes violetPulse {
            from {
                opacity: 0.55;
            }

            to {
                opacity: 1;
            }
        }

        @keyframes starTwinkle {
            from {
                opacity: 0.35;
            }

            to {
                opacity: 0.9;
            }
        }

        @media (max-width: 650px) {

            .exhibition::before {
                right: 2%;
                font-size: 12px;
                letter-spacing: 8px;
            }

        }

        @media (prefers-reduced-motion: reduce) {

            .hero::before,
            .hero::after,
            .hero-section::before,
            .hero-section::after,
            #home::before,
            #home::after,
            .exhibition::before {
                animation: none !important;
            }

        }
    `;

    document.head.appendChild(styles);


    // ==========================================
    // 12. SUCCESS MESSAGE
    // ==========================================

    console.log(
        "THE FORGOTTEN EXPLORERS: All museum features loaded successfully."
    );

});