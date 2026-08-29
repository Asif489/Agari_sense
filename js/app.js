/* =========================================================
   AGRISENSE AI
   LIVE RESEARCH DEMO
   app.js

   DEMO MODE
   Backend will be connected later.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       DOM ELEMENTS
       ===================================================== */

    const form =
        document.getElementById("predictionForm");

    const clearBtn =
        document.getElementById("clearForm");

    const predictBtn =
        document.getElementById("predictBtn");

    const newAnalysisBtn =
        document.getElementById("newAnalysis");

    const emptyResult =
        document.getElementById("emptyResult");

    const loadingState =
        document.getElementById("loadingState");

    const resultContent =
        document.getElementById("resultContent");


    /* =====================================================
       DEMO CROP DATA
       
       Later these values will come from the ML model.
       ===================================================== */

    const BASE_CROPS = [

        {
            crop: "Rice",

            yieldPotential: 88,

            climate: 92,

            soil: 91,

            asi: 78,

            expectedYield: 4.8,

            reason:
                "Strong compatibility with the submitted soil, rainfall and temperature conditions."
        },


        {
            crop: "Maize",

            yieldPotential: 84,

            climate: 86,

            soil: 82,

            asi: 75,

            expectedYield: 6.2,

            reason:
                "Good potential under the current climate and soil profile."
        },


        {
            crop: "Wheat",

            yieldPotential: 76,

            climate: 79,

            soil: 81,

            asi: 73,

            expectedYield: 3.7,

            reason:
                "A suitable alternative considering climate and sustainability indicators."
        }

    ];


    /* =====================================================
       FORM SUBMIT
       ===================================================== */

    if (form) {

        form.addEventListener("submit", (event) => {

            event.preventDefault();


            /* Validate inputs */

            if (!validateForm()) {
                return;
            }


            /* Show loading */

            showLoading();


            /*
             * Simulate AI processing.
             *
             * No backend request is made here.
             */

            setTimeout(() => {

                const result =
                    generateDemoPrediction();

                showResult(result);

            }, 1600);

        });

    }


    /* =====================================================
       GENERATE DEMO PREDICTION
       
       Input values slightly influence the demo scores.
       This makes the UI feel dynamic before backend
       integration.
       ===================================================== */

    function generateDemoPrediction() {

        const data =
            collectInput();


        /*
         * Calculate general input quality.
         */

        const soilQuality =
            calculateSoilQuality(data);


        const climateQuality =
            calculateClimateQuality(data);


        /*
         * Generate crop-specific results.
         */

        const crops =
            BASE_CROPS.map((base, index) => {

                let yieldPotential =
                    base.yieldPotential;

                let climate =
                    base.climate;

                let soil =
                    base.soil;

                let asi =
                    base.asi;

                let expectedYield =
                    base.expectedYield;


                /*
                 * Adjust according to soil.
                 */

                soil +=
                    (soilQuality - 70) * 0.22;


                /*
                 * Adjust according to climate.
                 */

                climate +=
                    (climateQuality - 70) * 0.20;


                /*
                 * Yield depends on both.
                 */

                yieldPotential +=
                    (
                        (soilQuality - 70) * 0.12
                    ) +
                    (
                        (climateQuality - 70) * 0.13
                    );


                /*
                 * ASI is generated from several
                 * integrated factors.
                 */

                asi =
                    (
                        soil * 0.30
                    ) +
                    (
                        climate * 0.25
                    ) +
                    (
                        yieldPotential * 0.25
                    ) +
                    (
                        base.asi * 0.20
                    );


                /*
                 * Expected yield changes with
                 * yield potential.
                 */

                expectedYield =
                    base.expectedYield *
                    (
                        0.85 +
                        (yieldPotential / 100) * 0.30
                    );


                /*
                 * Slight crop-specific adjustment.
                 */

                if (index === 0) {

                    expectedYield +=
                        data.rainfall >= 900
                            ? 0.25
                            : -0.10;

                }


                if (index === 1) {

                    expectedYield +=
                        data.temperature >= 24 &&
                        data.temperature <= 32
                            ? 0.20
                            : -0.10;

                }


                if (index === 2) {

                    expectedYield +=
                        data.temperature <= 28
                            ? 0.15
                            : -0.12;

                }


                return {

                    ...base,

                    yieldPotential:
                        roundScore(yieldPotential),

                    climate:
                        roundScore(climate),

                    soil:
                        roundScore(soil),

                    asi:
                        roundScore(asi),

                    expectedYield:
                        roundYield(expectedYield)

                };

            });


        /*
         * Sort by integrated decision score.
         *
         * ASI + Yield + Climate + Soil
         */

        crops.sort((a, b) => {

            const scoreA =
                integratedScore(a);

            const scoreB =
                integratedScore(b);

            return scoreB - scoreA;

        });


        return {

            crops: crops.slice(0, 3)

        };

    }


    /* =====================================================
       COLLECT INPUT
       ===================================================== */

    function collectInput() {

        return {

            location:
                getValue("location"),

            season:
                getValue("season"),

            nitrogen:
                getNumber("nitrogen"),

            phosphorus:
                getNumber("phosphorus"),

            potassium:
                getNumber("potassium"),

            ph:
                getNumber("ph"),

            soilMoisture:
                getNumber("soilMoisture"),

            organicMatter:
                getNumber("organicMatter"),

            temperature:
                getNumber("temperature"),

            humidity:
                getNumber("humidity"),

            rainfall:
                getNumber("rainfall")

        };

    }


    /* =====================================================
       SOIL QUALITY
       ===================================================== */

    function calculateSoilQuality(data) {

        let score = 70;


        /*
         * Nitrogen
         */

        if (data.nitrogen >= 60 &&
            data.nitrogen <= 120) {

            score += 5;

        }


        /*
         * Phosphorus
         */

        if (data.phosphorus >= 30 &&
            data.phosphorus <= 70) {

            score += 5;

        }


        /*
         * Potassium
         */

        if (data.potassium >= 30 &&
            data.potassium <= 80) {

            score += 5;

        }


        /*
         * Soil pH
         */

        if (data.ph >= 5.5 &&
            data.ph <= 7.5) {

            score += 7;

        }


        /*
         * Soil moisture
         */

        if (data.soilMoisture >= 30 &&
            data.soilMoisture <= 70) {

            score += 4;

        }


        /*
         * Organic matter
         */

        if (data.organicMatter >= 2 &&
            data.organicMatter <= 5) {

            score += 4;

        }


        return clamp(
            score,
            50,
            98
        );

    }


    /* =====================================================
       CLIMATE QUALITY
       ===================================================== */

    function calculateClimateQuality(data) {

        let score = 70;


        /*
         * Temperature
         */

        if (
            data.temperature >= 20 &&
            data.temperature <= 32
        ) {

            score += 8;

        }


        /*
         * Humidity
         */

        if (
            data.humidity >= 50 &&
            data.humidity <= 85
        ) {

            score += 5;

        }


        /*
         * Rainfall
         */

        if (
            data.rainfall >= 700 &&
            data.rainfall <= 1800
        ) {

            score += 8;

        }


        return clamp(
            score,
            50,
            98
        );

    }


    /* =====================================================
       INTEGRATED DECISION SCORE
       
       Used internally for ranking.
       NOT displayed as Match Score.
       ===================================================== */

    function integratedScore(crop) {

        return (

            crop.yieldPotential * 0.30 +

            crop.climate * 0.25 +

            crop.soil * 0.25 +

            crop.asi * 0.20

        );

    }


    /* =====================================================
       SHOW LOADING
       ===================================================== */

    function showLoading() {

        if (emptyResult) {

            emptyResult.style.display =
                "none";

        }


        if (resultContent) {

            resultContent.style.display =
                "none";

        }


        if (loadingState) {

            loadingState.style.display =
                "flex";

        }


        if (predictBtn) {

            predictBtn.disabled = true;


            const text =
                predictBtn.querySelector("span");


            if (text) {

                text.textContent =
                    "Analyzing...";

            }

        }

    }


    /* =====================================================
       SHOW RESULT
       ===================================================== */

    function showResult(result) {

        const crops =
            result.crops;


        /*
         * ---------------------------------------------
         * CROP 1
         * ---------------------------------------------
         */

        renderCrop(
            1,
            crops[0]
        );


        /*
         * ---------------------------------------------
         * CROP 2
         * ---------------------------------------------
         */

        renderCrop(
            2,
            crops[1]
        );


        /*
         * ---------------------------------------------
         * CROP 3
         * ---------------------------------------------
         */

        renderCrop(
            3,
            crops[2]
        );


        /*
         * ---------------------------------------------
         * ASI
         *
         * Overall ASI shown as average of
         * recommended crop ASI values.
         * ---------------------------------------------
         */

        const overallASI =
            Math.round(
                (
                    crops[0].asi +
                    crops[1].asi +
                    crops[2].asi
                ) / 3
            );


        setText(
            "asiValue",
            overallASI
        );


        /*
         * ---------------------------------------------
         * EXPLANATION
         * ---------------------------------------------
         */

        setText(
            "explanationText",

            "The recommendation evaluates each crop using " +
            "yield potential, climate suitability, soil suitability " +
            "and the system-generated Agri Sustainability Index. " +
            "These integrated indicators are used to rank the final Top 3 crops."
        );


        /*
         * ---------------------------------------------
         * HIDE LOADING
         * ---------------------------------------------
         */

        if (loadingState) {

            loadingState.style.display =
                "none";

        }


        /*
         * ---------------------------------------------
         * SHOW RESULT
         * ---------------------------------------------
         */

        if (emptyResult) {

            emptyResult.style.display =
                "none";

        }


        if (resultContent) {

            resultContent.style.display =
                "block";


            resultContent.classList.remove(
                "result-visible"
            );


            requestAnimationFrame(() => {

                resultContent.classList.add(
                    "result-visible"
                );

            });

        }


        /*
         * ---------------------------------------------
         * RESET BUTTON
         * ---------------------------------------------
         */

        if (predictBtn) {

            predictBtn.disabled =
                false;


            const text =
                predictBtn.querySelector("span");


            if (text) {

                text.textContent =
                    "Analyze Farm";

            }

        }


        /*
         * Mobile scroll
         */

        if (
            window.innerWidth <= 900 &&
            resultContent
        ) {

            setTimeout(() => {

                resultContent.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }, 150);

        }

    }


    /* =====================================================
       RENDER ONE CROP
       ===================================================== */

    function renderCrop(
        number,
        crop
    ) {

        if (!crop) {
            return;
        }


        /*
         * Crop name
         */

        setText(
            `crop${number}`,
            crop.crop
        );


        /*
         * Expected yield
         */

        setText(
            `yield${number}`,
            formatYield(
                crop.expectedYield
            )
        );


        /*
         * Reason
         */

        setText(
            `crop${number}Reason`,
            crop.reason
        );


        /*
         * ---------------------------------------------
         * YIELD POTENTIAL
         * ---------------------------------------------
         */

        setText(
            `crop${number}YieldPotential`,
            `${crop.yieldPotential}%`
        );


        setBar(
            `crop${number}YieldBar`,
            crop.yieldPotential
        );


        /*
         * ---------------------------------------------
         * CLIMATE
         * ---------------------------------------------
         */

        setText(
            `crop${number}Climate`,
            `${crop.climate}%`
        );


        setBar(
            `crop${number}ClimateBar`,
            crop.climate
        );


        /*
         * ---------------------------------------------
         * SOIL
         * ---------------------------------------------
         */

        setText(
            `crop${number}Soil`,
            `${crop.soil}%`
        );


        setBar(
            `crop${number}SoilBar`,
            crop.soil
        );


        /*
         * ---------------------------------------------
         * ASI
         * ---------------------------------------------
         */

        setText(
            `crop${number}ASI`,
            `${crop.asi}%`
        );


        setBar(
            `crop${number}ASIBar`,
            crop.asi
        );

    }


    /* =====================================================
       BAR ANIMATION
       ===================================================== */

    function setBar(
        id,
        value
    ) {

        const bar =
            document.getElementById(id);


        if (!bar) {
            return;
        }


        const safeValue =
            clamp(
                Number(value),
                0,
                100
            );


        /*
         * Reset first.
         */

        bar.style.width =
            "0%";


        /*
         * Animate.
         */

        setTimeout(() => {

            bar.style.width =
                `${safeValue}%`;

        }, 100);

    }


    /* =====================================================
       CLEAR
       ===================================================== */

    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            () => {

                if (form) {
                    form.reset();
                }


                resetResult();

            }
        );

    }


    /* =====================================================
       NEW ANALYSIS
       ===================================================== */

    if (newAnalysisBtn) {

        newAnalysisBtn.addEventListener(
            "click",
            () => {

                resetResult();


                const location =
                    document.getElementById(
                        "location"
                    );


                if (location) {

                    location.focus();

                }


                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );

    }


    /* =====================================================
       RESET RESULT
       ===================================================== */

    function resetResult() {

        if (loadingState) {

            loadingState.style.display =
                "none";

        }


        if (resultContent) {

            resultContent.style.display =
                "none";

        }


        if (emptyResult) {

            emptyResult.style.display =
                "flex";

        }


        /*
         * Reset all bars.
         */

        const barIds = [

            "crop1YieldBar",
            "crop1ClimateBar",
            "crop1SoilBar",
            "crop1ASIBar",

            "crop2YieldBar",
            "crop2ClimateBar",
            "crop2SoilBar",
            "crop2ASIBar",

            "crop3YieldBar",
            "crop3ClimateBar",
            "crop3SoilBar",
            "crop3ASIBar"

        ];


        barIds.forEach(id => {

            const bar =
                document.getElementById(id);


            if (bar) {

                bar.style.width =
                    "0%";

            }

        });


        /*
         * Reset button.
         */

        if (predictBtn) {

            predictBtn.disabled =
                false;


            const text =
                predictBtn.querySelector("span");


            if (text) {

                text.textContent =
                    "Analyze Farm";

            }

        }

    }


    /* =====================================================
       HELPERS
       ===================================================== */

    function getValue(id) {

        const element =
            document.getElementById(id);


        if (!element) {
            return "";
        }


        return element.value.trim();

    }


    function getNumber(id) {

        const value =
            getValue(id);


        const number =
            Number.parseFloat(value);


        return Number.isFinite(number)
            ? number
            : 0;

    }


    function setText(
        id,
        value
    ) {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value;

        }

    }


    function clamp(
        value,
        min,
        max
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );

    }


    function roundScore(value) {

        return Math.round(
            clamp(
                value,
                50,
                98
            )
        );

    }


    function roundYield(value) {

        return Number(
            Math.max(
                0.1,
                value
            ).toFixed(1)
        );

    }


    function formatYield(value) {

        return Number(value)
            .toFixed(1);

    }


    /* =====================================================
       VALIDATION
       ===================================================== */

    function validateForm() {

        if (!form) {
            return false;
        }


        const requiredFields = [

            "location",
            "season",
            "nitrogen",
            "phosphorus",
            "potassium",
            "ph",
            "soilMoisture",
            "organicMatter",
            "temperature",
            "humidity",
            "rainfall"

        ];


        for (
            const id of requiredFields
        ) {

            const element =
                document.getElementById(id);


            if (!element) {
                continue;
            }


            if (
                element.value.trim() === ""
            ) {

                showMessage(
                    "Please complete all farm conditions."
                );


                element.focus();


                return false;

            }

        }


        /*
         * pH validation
         */

        const ph =
            getNumber("ph");


        if (
            ph < 0 ||
            ph > 14
        ) {

            showMessage(
                "Soil pH must be between 0 and 14."
            );


            document
                .getElementById("ph")
                ?.focus();


            return false;

        }


        /*
         * Humidity
         */

        const humidity =
            getNumber("humidity");


        if (
            humidity < 0 ||
            humidity > 100
        ) {

            showMessage(
                "Humidity must be between 0 and 100%."
            );


            document
                .getElementById("humidity")
                ?.focus();


            return false;

        }


        /*
         * Soil moisture
         */

        const moisture =
            getNumber("soilMoisture");


        if (
            moisture < 0 ||
            moisture > 100
        ) {

            showMessage(
                "Soil moisture must be between 0 and 100%."
            );


            document
                .getElementById("soilMoisture")
                ?.focus();


            return false;

        }


        return true;

    }


    /* =====================================================
       MESSAGE
       ===================================================== */

    function showMessage(message) {

        let box =
            document.getElementById(
                "agrisenseMessage"
            );


        if (!box) {

            box =
                document.createElement("div");


            box.id =
                "agrisenseMessage";


            Object.assign(
                box.style,
                {

                    position: "fixed",

                    left: "50%",

                    bottom: "25px",

                    transform:
                        "translateX(-50%)",

                    zIndex: "99999",

                    padding:
                        "14px 20px",

                    borderRadius:
                        "11px",

                    background:
                        "#073b27",

                    color:
                        "#ffffff",

                    fontSize:
                        "14px",

                    fontWeight:
                        "700",

                    boxShadow:
                        "0 12px 35px rgba(0,0,0,.2)",

                    maxWidth:
                        "90%",

                    textAlign:
                        "center"

                }
            );


            document.body.appendChild(box);

        }


        box.textContent =
            message;


        box.style.display =
            "block";


        clearTimeout(
            box._timer
        );


        box._timer =
            setTimeout(() => {

                box.style.display =
                    "none";

            }, 3000);

    }


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    resetResult();


    console.log(
        "AgriSense AI — Demo Mode Ready"
    );

});