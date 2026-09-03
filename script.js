/* =========================================================
   BIJLIBANK — SCRIPT.JS
   ========================================================= */

/*
    IMPORTANT
    ----------
    Firebase configuration hum next step mein add karenge.

    Expected Firebase setup:
    - Firebase Authentication
    - Cloud Firestore
    - Firebase Storage (later, for appliance images)

    This file handles:
    - Login / Signup UI
    - Navigation
    - Appliance calculations
    - Dashboard
    - Scan result
    - Appliance rendering
    - Analytics
    - Bill prediction
*/


/* =========================================================
   GLOBAL DATA
========================================================= */

let currentUser = null;

let appliances = [];

let isSignupMode = false;

const ELECTRICITY_RATE = 6.08;

const FIXED_CHARGE = 100;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const authScreen = document.getElementById("authScreen");
const app = document.getElementById("app");

const authForm = document.getElementById("authForm");

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const nameField = document.getElementById("nameField");
const authName = document.getElementById("authName");

const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");

const authSubmit = document.getElementById("authSubmit");
const authMessage = document.getElementById("authMessage");

const userName = document.getElementById("userName");

const devicePhoto = document.getElementById("devicePhoto");
const cameraBtn = document.getElementById("cameraBtn");
const demoScan = document.getElementById("demoScan");

const scanStatus = document.getElementById("scanStatus");

const scanResult = document.getElementById("scanResult");

const deviceName = document.getElementById("deviceName");
const powerInput = document.getElementById("powerInput");
const hoursInput = document.getElementById("hours");

const detectedDevice = document.getElementById("detectedDevice");

const dailyKwh = document.getElementById("dailyKwh");
const monthlyKwh = document.getElementById("monthlyKwh");

const monthlyCost = document.getElementById("monthlyCost");
const extraCost = document.getElementById("extraCost");

const addDevice = document.getElementById("addDevice");

const deviceGrid = document.getElementById("deviceGrid");

const topAppliances = document.getElementById("topAppliances");

const todayUsage = document.getElementById("todayUsage");
const todayCost = document.getElementById("todayCost");

const monthUsage = document.getElementById("monthUsage");
const estimatedBill = document.getElementById("estimatedBill");

const potentialSaving = document.getElementById("potentialSaving");

const analyticsTotal = document.getElementById("analyticsTotal");
const analyticsAverage = document.getElementById("analyticsAverage");
const analyticsHighest = document.getElementById("analyticsHighest");

const donutTotal = document.getElementById("donutTotal");
const consumptionLegend = document.getElementById("consumptionLegend");

const predictionAmount = document.getElementById("predictionAmount");
const predictionRange = document.getElementById("predictionRange");

const predictionMiddle = document.getElementById("predictionMiddle");

const predictionMeter = document.getElementById("predictionMeter");

const energyCharges = document.getElementById("energyCharges");
const fixedCharges = document.getElementById("fixedCharges");
const taxCharges = document.getElementById("taxCharges");
const predictionTotal = document.getElementById("predictionTotal");

const savingTip = document.getElementById("savingTip");
const savingTipTitle = document.getElementById("savingTipTitle");

const insightTitle = document.getElementById("insightTitle");
const insightText = document.getElementById("insightText");

const usageProgress = document.getElementById("usageProgress");
const usageComparison = document.getElementById("usageComparison");

const logoutBtn = document.getElementById("logoutBtn");


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function formatMoney(value) {
    return `₹${Math.round(value).toLocaleString("en-IN")}`;
}


function formatKwh(value) {
    return `${Number(value).toFixed(1)} kWh`;
}


function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


function getApplianceIcon(name) {

    const value = name.toLowerCase();

    if (
        value.includes("ac") ||
        value.includes("air conditioner")
    ) {
        return "❄";
    }

    if (
        value.includes("fridge") ||
        value.includes("refrigerator")
    ) {
        return "▣";
    }

    if (
        value.includes("fan")
    ) {
        return "◌";
    }

    if (
        value.includes("tv") ||
        value.includes("television")
    ) {
        return "▱";
    }

    if (
        value.includes("geyser") ||
        value.includes("heater")
    ) {
        return "♨";
    }

    if (
        value.includes("washing")
    ) {
        return "◎";
    }

    if (
        value.includes("computer") ||
        value.includes("laptop")
    ) {
        return "⌘";
    }

    if (
        value.includes("light") ||
        value.includes("bulb")
    ) {
        return "◉";
    }

    return "ϟ";
}


/* =========================================================
   AUTH UI
========================================================= */

function setAuthMode(mode) {

    isSignupMode = mode === "signup";

    if (isSignupMode) {

        signupTab.classList.add("active");
        loginTab.classList.remove("active");

        nameField.classList.remove("hidden");

        authSubmit.textContent = "Create account →";

        authPassword.setAttribute(
            "autocomplete",
            "new-password"
        );

    } else {

        loginTab.classList.add("active");
        signupTab.classList.remove("active");

        nameField.classList.add("hidden");

        authSubmit.textContent = "Login →";

        authPassword.setAttribute(
            "autocomplete",
            "current-password"
        );
    }

    authMessage.textContent = "";
}


loginTab.addEventListener("click", () => {
    setAuthMode("login");
});


signupTab.addEventListener("click", () => {
    setAuthMode("signup");
});


/* =========================================================
   LOCAL DEMO AUTH
========================================================= */

/*
    Until Firebase is connected,
    this lets you test the complete UI.

    Later:
    Firebase Authentication will replace this section.
*/

function localSignup(name, email, password) {

    if (!name || !email || !password) {

        throw new Error(
            "Please fill all fields."
        );
    }

    if (password.length < 6) {

        throw new Error(
            "Password must contain at least 6 characters."
        );
    }


    const users =
        JSON.parse(
            localStorage.getItem("bijliBankUsers") || "{}"
        );


    if (users[email]) {

        throw new Error(
            "An account with this email already exists."
        );
    }


    users[email] = {

        name: name,

        email: email,

        password: password,

        createdAt: new Date().toISOString()

    };


    localStorage.setItem(
        "bijliBankUsers",
        JSON.stringify(users)
    );


    localStorage.setItem(
        "bijliBankCurrentUser",
        email
    );


    return users[email];
}


function localLogin(email, password) {

    const users =
        JSON.parse(
            localStorage.getItem("bijliBankUsers") || "{}"
        );


    const user = users[email];


    if (!user) {

        throw new Error(
            "No account found with this email."
        );
    }


    if (user.password !== password) {

        throw new Error(
            "Incorrect password."
        );
    }


    localStorage.setItem(
        "bijliBankCurrentUser",
        email
    );


    return user;
}


/* =========================================================
   AUTH SUBMIT
========================================================= */

authForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    authMessage.textContent = "";

    authSubmit.disabled = true;

    authSubmit.textContent =
        isSignupMode
            ? "Creating..."
            : "Logging in...";


    try {

        let user;


        if (isSignupMode) {

            user = localSignup(
                authName.value.trim(),
                authEmail.value.trim().toLowerCase(),
                authPassword.value
            );

        } else {

            user = localLogin(
                authEmail.value.trim().toLowerCase(),
                authPassword.value
            );
        }


        currentUser = user;


        await initializeUser();


        showApp();


    } catch (error) {

        authMessage.textContent =
            error.message;

    } finally {

        authSubmit.disabled = false;

        authSubmit.textContent =
            isSignupMode
                ? "Create account →"
                : "Login →";
    }

});


/* =========================================================
   SHOW APP
========================================================= */

function showApp() {

    authScreen.classList.add("hidden");

    app.classList.remove("hidden");


    const name =
        currentUser?.name ||
        currentUser?.email?.split("@")[0] ||
        "there";


    userName.textContent = name;


    updateProfileInitial(name);

    updateDashboard();

    updateAnalytics();

    updatePrediction();
}


/* =========================================================
   PROFILE INITIAL
========================================================= */

function updateProfileInitial(name) {

    const profile =
        document.querySelector(".profile");

    if (!profile) return;


    profile.textContent =
        name.charAt(0).toUpperCase();
}


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn.addEventListener("click", () => {

    localStorage.removeItem(
        "bijliBankCurrentUser"
    );


    currentUser = null;

    appliances = [];


    app.classList.add("hidden");

    authScreen.classList.remove("hidden");


    authForm.reset();

    setAuthMode("login");
});


/* =========================================================
   USER DATA
========================================================= */

function getUserStorageKey() {

    if (!currentUser) {
        return "bijliBankGuest";
    }


    return `bijliBankAppliances_${currentUser.email}`;
}


function loadUserAppliances() {

    const key = getUserStorageKey();


    appliances =
        JSON.parse(
            localStorage.getItem(key) || "[]"
        );


    if (!Array.isArray(appliances)) {
        appliances = [];
    }
}


function saveUserAppliances() {

    const key = getUserStorageKey();


    localStorage.setItem(
        key,
        JSON.stringify(appliances)
    );
}


async function initializeUser() {

    loadUserAppliances();

    renderAppliances();

    updateDashboard();

    updateAnalytics();

    updatePrediction();
}


/* =========================================================
   NAVIGATION
========================================================= */

const navigationButtons =
    document.querySelectorAll(
        "[data-section]"
    );


navigationButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const sectionId =
                button.dataset.section;

            navigateTo(sectionId);

        }
    );

});


function navigateTo(sectionId) {

    const pages =
        document.querySelectorAll(".page");


    pages.forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });


    const target =
        document.getElementById(sectionId);


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );


    navLinks.forEach(link => {

        link.classList.toggle(
            "active",
            link.dataset.section === sectionId
        );

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   SCAN IMAGE
========================================================= */

devicePhoto.addEventListener(
    "change",
    handleImageUpload
);


function handleImageUpload(event) {

    const file =
        event.target.files?.[0];


    if (!file) return;


    if (!file.type.startsWith("image/")) {

        scanStatus.textContent =
            "Please choose an image.";

        return;
    }


    scanStatus.textContent =
        `Selected: ${file.name}`;


    /*
        IMPORTANT:

        Real AI image recognition will be
        connected later through a secure backend.

        We don't put AI API keys inside frontend JS.
    */

    setTimeout(() => {

        showDemoScanResult();

        scanStatus.textContent =
            "Image ready for analysis.";

    }, 700);
}


/* =========================================================
   CAMERA
========================================================= */

cameraBtn.addEventListener(
    "click",
    () => {

        devicePhoto.setAttribute(
            "capture",
            "environment"
        );

        devicePhoto.click();

    }
);


/* =========================================================
   DEMO SCAN
========================================================= */

demoScan.addEventListener(
    "click",
    showDemoScanResult
);


function showDemoScanResult() {

    scanResult.classList.remove(
        "hidden"
    );


    detectedDevice.textContent =
        "Split AC · 1.5 Ton";


    deviceName.value =
        "Air Conditioner";


    powerInput.value =
        1500;


    hoursInput.value =
        6;


    calculateScanResult();


    scanResult.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   SCAN CALCULATION
========================================================= */

powerInput.addEventListener(
    "input",
    calculateScanResult
);


hoursInput.addEventListener(
    "input",
    calculateScanResult
);


deviceName.addEventListener(
    "input",
    calculateScanResult
);


function calculateScanResult() {

    const power =
        Number(powerInput.value) || 0;


    const hours =
        Number(hoursInput.value) || 0;


    const daily =
        (power * hours) / 1000;


    const monthly =
        daily * 30;


    const cost =
        monthly * ELECTRICITY_RATE;


    const extra =
        (power * 2) / 1000 *
        ELECTRICITY_RATE;


    dailyKwh.textContent =
        `${daily.toFixed(2)} kWh`;


    monthlyKwh.textContent =
        `${monthly.toFixed(1)} kWh`;


    monthlyCost.textContent =
        formatMoney(cost);


    extraCost.textContent =
        `+ ${formatMoney(extra)}/day`;
}


/* =========================================================
   ADD DEVICE
========================================================= */

addDevice.addEventListener(
    "click",
    () => {

        const name =
            deviceName.value.trim();


        const power =
            Number(powerInput.value);


        const hours =
            Number(hoursInput.value);


        if (!name) {

            alert(
                "Please enter appliance name."
            );

            return;
        }


        if (!power || power <= 0) {

            alert(
                "Please enter a valid power rating."
            );

            return;
        }


        if (
            hours < 0 ||
            hours > 24
        ) {

            alert(
                "Usage hours must be between 0 and 24."
            );

            return;
        }


        const appliance = {

            id:
                Date.now().toString(),

            name:

                name,

            power:

                power,

            hoursPerDay:

                hours,

            createdAt:

                new Date().toISOString()

        };


        appliances.push(
            appliance
        );


        saveUserAppliances();


        renderAppliances();

        updateDashboard();

        updateAnalytics();

        updatePrediction();


        scanStatus.textContent =
            "Appliance successfully added.";


        addDevice.textContent =
            "Added ✓";


        setTimeout(() => {

            addDevice.textContent =
                "Add to my appliances →";

        }, 1500);

    }
);


/* =========================================================
   APPLIANCE CALCULATIONS
========================================================= */

function getDailyKwh(appliance) {

    return (
        appliance.power *
        appliance.hoursPerDay
    ) / 1000;
}


function getMonthlyKwh(appliance) {

    return getDailyKwh(appliance) * 30;
}


function getMonthlyCost(appliance) {

    return (
        getMonthlyKwh(appliance) *
        ELECTRICITY_RATE
    );
}


function getTotalMonthlyKwh() {

    return appliances.reduce(
        (total, appliance) => {

            return total +
                getMonthlyKwh(appliance);

        },
        0
    );
}


function getTotalDailyKwh() {

    return appliances.reduce(
        (total, appliance) => {

            return total +
                getDailyKwh(appliance);

        },
        0
    );
}


/* =========================================================
   RENDER APPLIANCES
========================================================= */

function renderAppliances() {

    if (!deviceGrid) return;


    deviceGrid.innerHTML = "";


    if (appliances.length === 0) {

        deviceGrid.innerHTML = `

            <article
                class="device-card add-card"
                data-section="scan"
            >

                <div class="plus">
                    +
                </div>

                <h3>
                    Add appliance
                </h3>

                <p>
                    Scan a new device
                </p>

            </article>

        `;


        const addCard =
            deviceGrid.querySelector(
                ".add-card"
            );


        addCard.addEventListener(
            "click",
            () => navigateTo("scan")
        );


        return;
    }


    appliances.forEach(
        appliance => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "device-card";


            card.innerHTML = `

                <div class="device-icon">
                    ${getApplianceIcon(
                        escapeHTML(appliance.name)
                    )}
                </div>

                <h3>
                    ${escapeHTML(
                        appliance.name
                    )}
                </h3>

                <p>
                    ${appliance.power}W ·
                    ${appliance.hoursPerDay} hrs/day
                </p>

                <div class="device-cost">

                    <strong>
                        ${formatMoney(
                            getMonthlyCost(appliance)
                        )}
                    </strong>

                    <small>
                        estimated / month
                    </small>

                </div>

            `;


            deviceGrid.appendChild(card);

        }
    );


    const addCard =
        document.createElement(
            "article"
        );


    addCard.className =
        "device-card add-card";


    addCard.innerHTML = `

        <div class="plus">
            +
        </div>

        <h3>
            Add appliance
        </h3>

        <p>
            Scan a new device
        </p>

    `;


    addCard.addEventListener(
        "click",
        () => navigateTo("scan")
    );


    deviceGrid.appendChild(
        addCard
    );
}


/* =========================================================
   TOP APPLIANCES
========================================================= */

function renderTopAppliances() {

    if (!topAppliances) return;


    if (appliances.length === 0) {

        topAppliances.innerHTML = `

            <div class="empty-state">
                No appliances added yet.
            </div>

        `;

        return;
    }


    const sorted =
        [...appliances]
            .sort(
                (a, b) =>
                    getMonthlyKwh(b) -
                    getMonthlyKwh(a)
            )
            .slice(0, 5);


    const highest =
        Math.max(
            ...sorted.map(
                appliance =>
                    getMonthlyKwh(appliance)
            )
        );


    topAppliances.innerHTML = "";


    sorted.forEach(appliance => {

        const value =
            getMonthlyKwh(appliance);


        const percentage =
            highest > 0
                ? (value / highest) * 100
                : 0;


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "appliance-bar";


        row.innerHTML = `

            <span class="appliance-bar-name">
                ${escapeHTML(
                    appliance.name
                )}
            </span>

            <div class="bar-track">

                <div
                    class="bar-fill"
                    style="width:${percentage}%"
                ></div>

            </div>

            <span class="appliance-bar-value">
                ${value.toFixed(1)}
            </span>

        `;


        topAppliances.appendChild(row);

    });
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const daily =
        getTotalDailyKwh();


    const monthly =
        getTotalMonthlyKwh();


    const dailyCost =
        daily * ELECTRICITY_RATE;


    const estimated =
        monthly * ELECTRICITY_RATE;


    const saving =
        estimated * 0.12;


    todayUsage.textContent =
        daily.toFixed(1);


    todayCost.textContent =
        formatMoney(dailyCost);


    monthUsage.textContent =
        monthly.toFixed(1);


    estimatedBill.textContent =
        formatMoney(estimated);


    potentialSaving.textContent =
        formatMoney(saving);


    const progress =
        Math.min(
            (daily / 20) * 100,
            100
        );


    usageProgress.style.width =
        `${progress}%`;


    if (appliances.length === 0) {

        usageComparison.textContent =
            "Add appliances to start tracking.";

        insightTitle.textContent =
            "Start by scanning your first appliance.";

        insightText.textContent =
            "We'll analyse its power rating and estimate how much electricity it uses.";

    } else {

        usageComparison.textContent =
            `${appliances.length} appliance${appliances.length > 1 ? "s" : ""} tracked.`;

        updateInsight();

    }


    renderTopAppliances();

    updateUsageChart();
}


/* =========================================================
   INSIGHT
========================================================= */

function updateInsight() {

    if (appliances.length === 0) return;


    const highest =
        [...appliances]
            .sort(
                (a, b) =>
                    getMonthlyKwh(b) -
                    getMonthlyKwh(a)
            )[0];


    if (!highest) return;


    const cost =
        getMonthlyCost(highest);


    insightTitle.textContent =
        `${highest.name} is your highest consumer.`;


    insightText.textContent =
        `It may cost around ${formatMoney(
            cost
        )} per month at your current usage.`;
}


/* =========================================================
   USAGE CHART
========================================================= */

function updateUsageChart() {

    const path =
        document.getElementById(
            "usagePath"
        );


    if (!path) return;


    if (appliances.length === 0) {

        path.setAttribute(
            "d",
            "M0,175 L700,175"
        );

        return;
    }


    const daily =
        getTotalDailyKwh();


    const values = [

        daily * 0.78,

        daily * 0.92,

        daily * 1.05,

        daily * 0.88,

        daily * 1.15,

        daily * 1.03,

        daily * 1.20

    ];


    const max =
        Math.max(...values, 1);


    const points =
        values.map(
            (value, index) => {

                const x =
                    index * 116.6;


                const y =
                    175 -
                    (value / max) * 130;


                return `${x},${y}`;

            }
        );


    path.setAttribute(
        "d",
        `M${points.join(" L")}`
    );
}


/* =========================================================
   ANALYTICS
========================================================= */

function updateAnalytics() {

    const total =
        getTotalMonthlyKwh();


    const average =
        total / 30;


    analyticsTotal.textContent =
        `${total.toFixed(1)} kWh`;


    analyticsAverage.textContent =
        `${average.toFixed(1)} kWh`;


    if (appliances.length === 0) {

        analyticsHighest.textContent =
            "—";

    } else {

        const highest =
            [...appliances]
                .sort(
                    (a, b) =>
                        getMonthlyKwh(b) -
                        getMonthlyKwh(a)
                )[0];


        analyticsHighest.textContent =
            highest.name;
    }


    updateDonut();

    updateAnalyticsBars();
}


/* =========================================================
   DONUT
========================================================= */

function updateDonut() {

    if (appliances.length === 0) {

        donutTotal.textContent =
            "0";


        consumptionLegend.innerHTML = `

            <li>
                <i></i>
                No data
                <b>0%</b>
            </li>

        `;

        return;
    }


    const total =
        getTotalMonthlyKwh();


    donutTotal.textContent =
        total.toFixed(0);


    const colors = [

        "var(--green)",
        "#8caf59",
        "#a7bd82",
        "#c2d1aa",
        "#d9e1ca"

    ];


    const sorted =
        [...appliances]
            .sort(
                (a, b) =>
                    getMonthlyKwh(b) -
                    getMonthlyKwh(a)
            )
            .slice(0, 5);


    let currentDegree = 0;


    const segments =
        sorted.map(
            (appliance, index) => {

                const percentage =
                    getMonthlyKwh(appliance) /
                    total *
                    100;


                const degrees =
                    percentage * 3.6;


                const start =
                    currentDegree;


                currentDegree += degrees;


                return `
                    ${colors[index % colors.length]}
                    ${start}deg
                    ${currentDegree}deg
                `;

            }
        );


    const donut =
        document.querySelector(
            ".donut"
        );


    donut.style.background =
        `conic-gradient(
            ${segments.join(",")}
        )`;


    consumptionLegend.innerHTML = "";


    sorted.forEach(
        (appliance, index) => {

            const percentage =
                getMonthlyKwh(appliance) /
                total *
                100;


            const li =
                document.createElement(
                    "li"
                );


            li.innerHTML = `

                <i
                    style="
                        background:
                        ${colors[
                            index % colors.length
                        ]}
                    "
                ></i>

                ${escapeHTML(
                    appliance.name
                )}

                <b>
                    ${percentage.toFixed(0)}%
                </b>

            `;


            consumptionLegend.appendChild(
                li
            );

        }
    );
}


/* =========================================================
   ANALYTICS BARS
========================================================= */

function updateAnalyticsBars() {

    const bars =
        document.querySelectorAll(
            "#analyticsBars i"
        );


    if (appliances.length === 0) {

        bars.forEach(
            bar =>
                bar.style.height = "5%"
        );

        return;
    }


    const daily =
        getTotalDailyKwh();


    bars.forEach(
        (bar, index) => {

            const variation =
                0.75 +
                (
                    Math.sin(index * 1.7) +
                    1
                ) * 0.15;


            const value =
                daily *
                variation;


            const height =
                Math.min(
                    value /
                    Math.max(daily * 1.2, 1) *
                    100,
                    100
                );


            bar.style.height =
                `${Math.max(height, 5)}%`;

        }
    );
}


/* =========================================================
   BILL PREDICTION
========================================================= */

function updatePrediction() {

    const monthlyUsage =
        getTotalMonthlyKwh();


    const energy =
        monthlyUsage *
        ELECTRICITY_RATE;


    const fixed =
        appliances.length > 0
            ? FIXED_CHARGE
            : 0;


    const tax =
        (energy + fixed) * 0.05;


    const total =
        energy +
        fixed +
        tax;


    const low =
        total * 0.92;


    const high =
        total * 1.12;


    predictionAmount.textContent =
        formatMoney(total);


    predictionRange.textContent =
        `– ${formatMoney(high)}`;


    predictionMiddle.textContent =
        formatMoney(total);


    energyCharges.textContent =
        formatMoney(energy);


    fixedCharges.textContent =
        formatMoney(fixed);


    taxCharges.textContent =
        formatMoney(tax);


    predictionTotal.textContent =
        formatMoney(total);


    const meter =
        Math.min(
            (total / 5000) * 100,
            100
        );


    predictionMeter.style.width =
        `${meter}%`;


    if (appliances.length === 0) {

        savingTipTitle.textContent =
            "Your personalised saving tip";


        savingTip.textContent =
            "Add appliances and usage data to receive personalised suggestions.";

        return;
    }


    generateSavingTip();
}


/* =========================================================
   PERSONALIZED SAVING TIP
========================================================= */

function generateSavingTip() {

    const highest =
        [...appliances]
            .sort(
                (a, b) =>
                    getMonthlyKwh(b) -
                    getMonthlyKwh(a)
            )[0];


    if (!highest) return;


    const name =
        highest.name.toLowerCase();


    let title =
        "Reduce your highest-consuming appliance";


    let message =
        `Try reducing ${highest.name}'s usage by 1 hour per day. `;


    if (
        name.includes("ac") ||
        name.includes("air conditioner")
    ) {

        title =
            "Your AC is a major saving opportunity";


        message =
            "Increasing the AC temperature slightly and reducing unnecessary runtime can lower its electricity consumption.";

    } else if (
        name.includes("geyser") ||
        name.includes("heater")
    ) {

        title =
            "Watch your geyser usage";


        message =
            "Geysers are high-power appliances. Try limiting unnecessary heating time and switch them off after use.";

    } else if (
        name.includes("fan")
    ) {

        title =
            "Small fan savings add up";


        message =
            "Use the appropriate speed and switch fans off when rooms are unoccupied.";

    } else {

        const saving =
            getMonthlyCost(highest) /
            highest.hoursPerDay;


        message =
            `Reducing ${highest.name}'s runtime by 1 hour daily could save roughly ${formatMoney(
                saving
            )} per month.`;

    }


    savingTipTitle.textContent =
        title;


    savingTip.textContent =
        message;
}


/* =========================================================
   PERIOD BUTTON
========================================================= */

const periodButton =
    document.getElementById(
        "periodButton"
    );


if (periodButton) {

    periodButton.addEventListener(
        "click",
        () => {

            const periods = [

                "This week ▾",

                "This month ▾",

                "Last 30 days ▾"

            ];


            const current =
                periods.indexOf(
                    periodButton.textContent
                );


            periodButton.textContent =
                periods[
                    (current + 1) %
                    periods.length
                ];

        }
    );
}


/* =========================================================
   NOTIFICATION
========================================================= */

const notificationBtn =
    document.getElementById(
        "notificationBtn"
    );


if (notificationBtn) {

    notificationBtn.addEventListener(
        "click",
        () => {

            if (appliances.length === 0) {

                alert(
                    "No electricity alerts yet. Add appliances to start monitoring."
                );

                return;
            }


            const highest =
                [...appliances]
                    .sort(
                        (a, b) =>
                            getMonthlyKwh(b) -
                            getMonthlyKwh(a)
                    )[0];


            alert(
                `BijliBank Insight:\n\n${highest.name} is currently your highest-consuming appliance.`
            );

        }
    );
}


/* =========================================================
   PROFILE BUTTON
========================================================= */

const profileBtn =
    document.getElementById(
        "profileBtn"
    );


if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        () => {

            if (!currentUser) return;


            alert(
                `BijliBank Account\n\nName: ${
                    currentUser.name || "User"
                }\nEmail: ${
                    currentUser.email
                }\n\nYour appliance data is stored separately for this account.`
            );

        }
    );
}


/* =========================================================
   MENU BUTTON
========================================================= */

const menuBtn =
    document.getElementById(
        "menuBtn"
    );


if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        () => {

            navigateTo("appliances");

        }
    );
}


/* =========================================================
   STARTUP
========================================================= */

function checkExistingLogin() {

    const email =
        localStorage.getItem(
            "bijliBankCurrentUser"
        );


    if (!email) {

        setAuthMode("login");

        return;
    }


    const users =
        JSON.parse(
            localStorage.getItem(
                "bijliBankUsers"
            ) || "{}"
        );


    if (!users[email]) {

        localStorage.removeItem(
            "bijliBankCurrentUser"
        );

        return;
    }


    currentUser =
        users[email];


    initializeUser();

    showApp();
}


checkExistingLogin();


/* =========================================================
   INITIAL CALCULATION
========================================================= */

calculateScanResult();

window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("electric-loader")
            ?.classList.add("hide");
    }, 2300);
});
