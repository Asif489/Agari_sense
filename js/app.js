document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuButton = document.getElementById("menuButton");
    const navigation = document.querySelector(".navigation");

    if (menuButton && navigation) {

        menuButton.addEventListener("click", () => {

            navigation.classList.toggle("mobile-open");

            const icon = menuButton.querySelector("i");

            if (navigation.classList.contains("mobile-open")) {

                icon.classList.remove("fa-bars");
                icon.classList.add("fa-xmark");

                menuButton.setAttribute(
                    "aria-label",
                    "Close menu"
                );

            } else {

                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");

                menuButton.setAttribute(
                    "aria-label",
                    "Open menu"
                );

            }

        });


        navigation.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                navigation.classList.remove(
                    "mobile-open"
                );

                const icon =
                    menuButton.querySelector("i");

                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");

            });

        });

    }


    /* =====================================================
       TEAM CAROUSEL
       
       5 ORIGINAL MEMBERS
       2 CLONES
       2 MEMBERS VISIBLE
       AUTO SLIDE = 1.8 SEC
    ===================================================== */

    const teamTrack =
        document.getElementById("teamTrack");

    const teamNext =
        document.getElementById("teamNext");

    const teamPrev =
        document.getElementById("teamPrev");

    const teamDots =
        document.getElementById("teamDots");

    const teamCarousel =
        document.querySelector(".team-carousel");


    if (teamTrack) {

        const originalMembers =
            Array.from(
                teamTrack.querySelectorAll(
                    ".team-member:not(.team-clone)"
                )
            );

        const clones =
            Array.from(
                teamTrack.querySelectorAll(
                    ".team-member.team-clone"
                )
            );

        const totalMembers =
            originalMembers.length;

        const visibleMembers = 2;

        let currentIndex = 0;

        let isAnimating = false;

        let autoSlide = null;

        let hovering = false;


        /* =================================================
           CARD WIDTH
        ================================================= */

        function getCardWidth() {

            const card =
                teamTrack.querySelector(
                    ".team-member"
                );

            if (!card) {
                return 0;
            }

            const cardWidth =
                card.getBoundingClientRect().width;

            const styles =
                window.getComputedStyle(
                    teamTrack
                );

            const gap =
                parseFloat(styles.gap) ||
                parseFloat(styles.columnGap) ||
                0;

            return cardWidth + gap;

        }


        /* =================================================
           DOTS
        ================================================= */

        function createDots() {

            if (!teamDots) {
                return;
            }

            teamDots.innerHTML = "";

            for (
                let i = 0;
                i < totalMembers;
                i++
            ) {

                const dot =
                    document.createElement("button");

                dot.type = "button";

                dot.className =
                    "team-dot";

                dot.setAttribute(
                    "aria-label",
                    `Show team member group ${i + 1}`
                );

                if (i === 0) {

                    dot.classList.add("active");

                }

                dot.addEventListener(
                    "click",
                    () => {

                        if (isAnimating) {
                            return;
                        }

                        currentIndex = i;

                        moveTeam(
                            currentIndex,
                            true
                        );

                        restartAutoSlide();

                    }
                );

                teamDots.appendChild(dot);

            }

        }


        /* =================================================
           UPDATE DOTS
        ================================================= */

        function updateDots() {

            if (!teamDots) {
                return;
            }

            const dots =
                teamDots.querySelectorAll(
                    ".team-dot"
                );

            let activeIndex =
                currentIndex % totalMembers;

            dots.forEach(
                (dot, index) => {

                    dot.classList.toggle(
                        "active",
                        index === activeIndex
                    );

                }
            );

        }


        /* =================================================
           MOVE
        ================================================= */

        function moveTeam(
            index,
            animate = true
        ) {

            const width =
                getCardWidth();

            if (!width) {
                return;
            }

            if (animate) {

                teamTrack.style.transition =
                    "transform .45s cubic-bezier(.22,.61,.36,1)";

            } else {

                teamTrack.style.transition =
                    "none";

            }

            teamTrack.style.transform =
                `translate3d(-${index * width}px, 0, 0)`;

            updateDots();

        }


        /* =================================================
           NEXT
           
           0 = 1 + 2
           1 = 2 + 3
           2 = 3 + 4
           3 = 4 + 5
           4 = 5 + 1 CLONE
           5 = 1 CLONE + 2 CLONE

           Then reset to 0.
        ================================================= */

        function nextSlide() {

            if (
                isAnimating ||
                totalMembers < 2
            ) {
                return;
            }

            isAnimating = true;

            currentIndex++;

            moveTeam(
                currentIndex,
                true
            );


            /*
                Position 5 means both visible
                cards are clones.

                After animation completes,
                silently jump back to position 0.
            */

            if (
                currentIndex ===
                totalMembers + 0
            ) {

                setTimeout(
                    () => {

                        currentIndex = 0;

                        moveTeam(
                            0,
                            false
                        );

                        requestAnimationFrame(
                            () => {

                                teamTrack.style.transition =
                                    "transform .45s cubic-bezier(.22,.61,.36,1)";

                            }
                        );

                        isAnimating = false;

                    },
                    480
                );

            } else {

                setTimeout(
                    () => {

                        isAnimating = false;

                    },
                    480
                );

            }

        }


        /* =================================================
           PREVIOUS
        ================================================= */

        function previousSlide() {

            if (
                isAnimating ||
                totalMembers < 2
            ) {
                return;
            }

            isAnimating = true;


            if (currentIndex === 0) {

                /*
                    Move silently to the last clone position.
                */

                currentIndex =
                    totalMembers;

                moveTeam(
                    currentIndex,
                    false
                );


                /*
                    Then animate backward.
                */

                requestAnimationFrame(
                    () => {

                        requestAnimationFrame(
                            () => {

                                currentIndex =
                                    totalMembers - 1;

                                moveTeam(
                                    currentIndex,
                                    true
                                );

                            }
                        );

                    }
                );

            } else {

                currentIndex--;

                moveTeam(
                    currentIndex,
                    true
                );

            }


            setTimeout(
                () => {

                    isAnimating = false;

                },
                480
            );

        }


        /* =================================================
           AUTOPLAY
        ================================================= */

        function startAutoSlide() {

            stopAutoSlide();

            autoSlide =
                setInterval(
                    () => {

                        if (!hovering) {

                            nextSlide();

                        }

                    },
                    1800
                );

        }


        function stopAutoSlide() {

            if (autoSlide) {

                clearInterval(
                    autoSlide
                );

                autoSlide = null;

            }

        }


        function restartAutoSlide() {

            stopAutoSlide();

            startAutoSlide();

        }


        /* =================================================
           NEXT BUTTON
        ================================================= */

        if (teamNext) {

            teamNext.addEventListener(
                "click",
                () => {

                    nextSlide();

                    restartAutoSlide();

                }
            );

        }


        /* =================================================
           PREVIOUS BUTTON
        ================================================= */

        if (teamPrev) {

            teamPrev.addEventListener(
                "click",
                () => {

                    previousSlide();

                    restartAutoSlide();

                }
            );

        }


        /* =================================================
           HOVER PAUSE
        ================================================= */

        if (teamCarousel) {

            teamCarousel.addEventListener(
                "mouseenter",
                () => {

                    hovering = true;

                    stopAutoSlide();

                }
            );


            teamCarousel.addEventListener(
                "mouseleave",
                () => {

                    hovering = false;

                    startAutoSlide();

                }
            );

        }


        /* =================================================
           TOUCH SWIPE
        ================================================= */

        let touchStartX = 0;

        let touchEndX = 0;


        if (teamCarousel) {

            teamCarousel.addEventListener(
                "touchstart",
                event => {

                    touchStartX =
                        event.changedTouches[0]
                            .screenX;

                    stopAutoSlide();

                },
                {
                    passive: true
                }
            );


            teamCarousel.addEventListener(
                "touchend",
                event => {

                    touchEndX =
                        event.changedTouches[0]
                            .screenX;

                    const distance =
                        touchStartX -
                        touchEndX;


                    if (
                        Math.abs(distance) > 45
                    ) {

                        if (distance > 0) {

                            nextSlide();

                        } else {

                            previousSlide();

                        }

                    }


                    startAutoSlide();

                },
                {
                    passive: true
                }
            );

        }


        /* =================================================
           RESIZE
        ================================================= */

        window.addEventListener(
            "resize",
            () => {

                moveTeam(
                    currentIndex,
                    false
                );

            }
        );


        /* =================================================
           INITIALIZE
        ================================================= */

        createDots();

        moveTeam(
            0,
            false
        );

        startAutoSlide();

    }


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".about-card, " +
            ".platform-card, " +
            ".method-step, " +
            ".contact-form-box, " +
            ".contact-info"
        );


    if (
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(
            element => {

                element.classList.add(
                    "reveal"
                );

                observer.observe(
                    element
                );

            }
        );


        const revealStyle =
            document.createElement("style");


        revealStyle.textContent = `

            .reveal {

                opacity: 0;

                transform:
                    translateY(18px);

                transition:
                    opacity .6s ease,
                    transform .6s ease;

            }

            .reveal.visible {

                opacity: 1;

                transform:
                    translateY(0);

            }

        `;


        document.head.appendChild(
            revealStyle
        );

    }


    /* =====================================================
       CONTACT FORM
    ===================================================== */

    const contactForm =
        document.getElementById(
            "contactForm"
        );


    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const button =
                    contactForm.querySelector(
                        ".form-submit"
                    );


                if (!button) {
                    return;
                }


                const originalHTML =
                    button.innerHTML;


                button.disabled = true;


                button.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Sending...
                `;


                setTimeout(
                    () => {

                        button.innerHTML = `
                            <i class="fa-solid fa-check"></i>
                            Message Prepared
                        `;


                        setTimeout(
                            () => {

                                contactForm.reset();

                                button.disabled =
                                    false;

                                button.innerHTML =
                                    originalHTML;

                            },
                            1500
                        );

                    },
                    900
                );

            }
        );

    }


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


    const navLinks =
        document.querySelectorAll(
            ".navigation a"
        );


    if (
        sections.length &&
        navLinks.length &&
        "IntersectionObserver" in window
    ) {

        const sectionObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                const id =
                                    entry.target.id;


                                navLinks.forEach(
                                    link => {

                                        link.classList.remove(
                                            "active"
                                        );


                                        if (
                                            link.getAttribute(
                                                "href"
                                            ) ===
                                            `#${id}`
                                        ) {

                                            link.classList.add(
                                                "active"
                                            );

                                        }

                                    }
                                );

                            }

                        }
                    );

                },
                {
                    rootMargin:
                        "-30% 0px -60% 0px"
                }
            );


        sections.forEach(
            section => {

                sectionObserver.observe(
                    section
                );

            }
        );

    }


    /* =====================================================
       HEADER SHADOW
    ===================================================== */

    const header =
        document.querySelector(
            ".site-header"
        );


    if (header) {

        window.addEventListener(
            "scroll",
            () => {

                if (
                    window.scrollY > 10
                ) {

                    header.style.boxShadow =
                        "0 6px 22px rgba(20,55,42,.06)";

                } else {

                    header.style.boxShadow =
                        "none";

                }

            },
            {
                passive: true
            }
        );

    }

});