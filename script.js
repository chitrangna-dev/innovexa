/* =========================================
   BIJLIBANK
   Main JavaScript
========================================= */


/* =========================================
   BASIC SETTINGS
========================================= */

// Electricity rate used for demo calculation.
// ₹6.08 per unit (kWh)
const ELECTRICITY_RATE = 6.08;

// Demo appliance
const DEMO_DEVICE = {
    name: "Split AC · 1.5 Ton",
    power: 1500
};


/* =========================================
   PAGE NAVIGATION
========================================= */

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const sectionButtons = document.querySelectorAll("[data-section]");


function showPage(sectionId) {

    // Hide all pages
    pages.forEach(page => {
        page.classList.remove("active-page");
    });


    // Show selected page
    const selectedPage = document.getElementById(sectionId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }


    // Update navbar
    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.dataset.section === sectionId) {
            link.classList.add("active");
        }

    });


    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   NAVIGATION CLICK EVENTS
========================================= */

sectionButtons.forEach(button => {

    button.addEventListener("click", () => {

        const sectionId = button.dataset.section;

        if (sectionId) {
            showPage(sectionId);
        }

    });

});


/* =========================================
   NAV LINK CLICK EVENTS
========================================= */

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        const sectionId = link.dataset.section;

        showPage(sectionId);

    });

});


/* =========================================
   BRAND → HOME
========================================= */

const brand = document.querySelector(".brand");

if (brand) {

    brand.addEventListener("click", event => {

        event.preventDefault();

        showPage("dashboard");

    });

}


/* =========================================
   SCAN DEVICE
========================================= */

const devicePhoto = document.getElementById("devicePhoto");
const scanStatus = document.getElementById("scanStatus");
const scanResult = document.getElementById("scanResult");
const demoScan = document.getElementById("demoScan");


/* =========================================
   IMAGE UPLOAD
========================================= */

if (devicePhoto) {

    devicePhoto.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            scanStatus.textContent = "No image selected";
            return;
        }


        // Check image
        if (!file.type.startsWith("image/")) {

            scanStatus.textContent =
                "Please select an image file.";

            return;
        }


        // File size check
        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {

            scanStatus.textContent =
                "Image should be smaller than 5 MB.";

            return;
        }


        // Show selected image name
        scanStatus.textContent =
            `Selected: ${file.name}`;


        // Simulate scanning
        startScanning();

    });

}


/* =========================================
   SCANNING ANIMATION
========================================= */

function startScanning() {

    if (!scanStatus) return;

    scanStatus.textContent =
        "Scanning appliance...";


    setTimeout(() => {

        scanStatus.textContent =
            "Reading power rating...";

    }, 900);


    setTimeout(() => {

        scanStatus.textContent =
            "Device detected ✓";

        showScanResult();

    }, 1800);

}


/* =========================================
   DEMO SCAN
========================================= */

if (demoScan) {

    demoScan.addEventListener("click", () => {

        scanStatus.textContent =
            "Starting demo scan...";


        setTimeout(() => {

            scanStatus.textContent =
                "AI detected appliance ✓";

            showScanResult();

        }, 1200);

    });

}


/* =========================================
   SHOW SCAN RESULT
========================================= */

function showScanResult() {

    if (!scanResult) return;

    scanResult.classList.remove("hidden");

    calculateUsage();

    // Scroll slightly towards result
    setTimeout(() => {

        scanResult.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, 300);

}


/* =========================================
   USAGE CALCULATION
========================================= */

const hoursInput = document.getElementById("hours");
const dailyKwh = document.getElementById("dailyKwh");
const monthlyCost = document.getElementById("monthlyCost");
const extraCost = document.getElementById("extraCost");


function calculateUsage() {

    if (!hoursInput) return;


    let hours = parseFloat(hoursInput.value);


    // Prevent invalid values
    if (isNaN(hours)) {
        hours = 0;
    }


    // Limit between 0 and 24
    hours = Math.max(0, Math.min(24, hours));


    hoursInput.value = hours;


    /*
        Formula:

        Power in kW × hours
        = daily kWh

        Example:

        1500W = 1.5kW

        1.5 × 6
        = 9 kWh/day
    */

    const powerKW = DEMO_DEVICE.power / 1000;

    const dailyConsumption =
        powerKW * hours;


    // Monthly consumption
    const monthlyConsumption =
        dailyConsumption * 30;


    // Monthly cost
    const monthlyAmount =
        monthlyConsumption * ELECTRICITY_RATE;


    // Extra 2 hours
    const extraDailyAmount =
        powerKW * 2 * ELECTRICITY_RATE;


    // Update UI
    if (dailyKwh) {

        dailyKwh.textContent =
            `${dailyConsumption.toFixed(1)} kWh`;

    }


    if (monthlyCost) {

        monthlyCost.textContent =
            `₹${Math.round(monthlyAmount).toLocaleString("en-IN")}`;

    }


    if (extraCost) {

        extraCost.textContent =
            `+ ₹${extraDailyAmount.toFixed(2)}/day`;

    }

}


/* =========================================
   HOURS INPUT
========================================= */

if (hoursInput) {

    hoursInput.addEventListener("input", calculateUsage);

}


/* =========================================
   ADD DEVICE
========================================= */

const addDevice = document.getElementById("addDevice");

if (addDevice) {

    addDevice.addEventListener("click", () => {

        addDevice.textContent =
            "✓ Added to appliances";

        addDevice.style.background =
            "#6d9e2c";


        /*
            Small delay before going
            to appliance page
        */

        setTimeout(() => {

            showPage("appliances");

            addDevice.textContent =
                "Add to my appliances →";

            addDevice.style.background =
                "";

        }, 900);

    });

}


/* =========================================
   ADD CARD
========================================= */

const addCard = document.querySelector(".add-card");

if (addCard) {

    addCard.addEventListener("click", () => {

        showPage("scan");

    });

}


/* =========================================
   SELECT PERIOD BUTTON
========================================= */

const selectButton =
    document.querySelector(".select-btn");

if (selectButton) {

    selectButton.addEventListener("click", () => {

        const periods = [
            "This week ▾",
            "This month ▾",
            "Last 7 days ▾"
        ];


        const current =
            selectButton.textContent.trim();

        let index =
            periods.indexOf(current);


        index++;

        if (index >= periods.length) {
            index = 0;
        }


        selectButton.textContent =
            periods[index];

    });

}


/* =========================================
   NOTIFICATION BUTTON
========================================= */

const notificationButton =
    document.querySelector(".icon-btn");

if (notificationButton) {

    notificationButton.addEventListener("click", () => {

        alert(
            "No new notifications.\n\nYour electricity usage is being monitored."
        );

    });

}


/* =========================================
   PROFILE BUTTON
========================================= */

const profileButton =
    document.querySelector(".profile");

if (profileButton) {

    profileButton.addEventListener("click", () => {

        alert(
            "Profile\n\nUser: Chitrangna\nPlan: Free Demo"
        );

    });

}


/* =========================================
   MENU BUTTON
========================================= */

const menuButton =
    document.querySelector(".menu-btn");

if (menuButton) {

    menuButton.addEventListener("click", () => {

        alert(
            "BijliBank Menu\n\n" +
            "• Dashboard\n" +
            "• Scan Device\n" +
            "• Appliances\n" +
            "• Analytics\n" +
            "• Bill Prediction"
        );

    });

}


/* =========================================
   ANALYTICS BARS ANIMATION
========================================= */

const bars =
    document.querySelectorAll(".bars i");


function animateBars() {

    bars.forEach((bar, index) => {

        const originalHeight =
            bar.style.height;


        bar.style.height = "0";


        setTimeout(() => {

            bar.style.height =
                originalHeight;

        }, index * 80);

    });

}


/* =========================================
   RUN BAR ANIMATION
========================================= */

animateBars();


/* =========================================
   INITIAL CALCULATION
========================================= */

calculateUsage();


/* =========================================
   CONSOLE MESSAGE
========================================= */

console.log(
    "%c⚡ BijliBank",
    "font-size:20px;font-weight:bold;"
);

console.log(
    "Know where your electricity goes before your bill arrives."
);
