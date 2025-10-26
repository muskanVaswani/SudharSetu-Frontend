# 🏆 SudharSetu - Civic Issue Reporting Platform

SudharSetu is a modern web application designed to empower citizens by providing a seamless platform to report, track, and view resolutions of civic issues in their neighborhoods. This project was developed for the Hackarena hackathon.

### ✨ Key Features

*   **Citizen Complaint Submission:** A multi-step form allows users to report new issues with a title, description, and photo.
*   **Accurate Geolocation:** Utilizes OpenStreetMap Nominatim API for both fetching the user's current location (reverse geocoding) and verifying manually entered addresses (geocoding).
*   **AI-Powered Image Verification:** Employs the Gemini API to verify that uploaded photos match the selected complaint type, ensuring data quality.
*   **Public & Private Dashboards:**
    *   **My Complaints:** A personalized view for users to track the status of their own reports.
    *   **Public Dashboard:** A transparent, filterable view of all issues reported across the city.
*   **Admin Dashboard:** A secure portal for municipal authorities to view all complaints, filter them, and update their status (Pending, In Progress, Resolved).
*   **AI Chatbot Assistant:** A floating chatbot powered by the Gemini API that can instantly provide the status of any complaint when given its ID.

### 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **AI/ML:** Google Gemini API for chatbot intelligence and image analysis.
*   **Location Services:** OpenStreetMap Nominatim API for geocoding and reverse geocoding.

### 👤 User Flow

1.  The user lands on the **"My Complaints"** dashboard.
2.  They can switch to the **"Public View"** to see all issues.
3.  To report a new issue, they click **"Report a New Issue"**.
4.  **Step 1 (Location):** The user provides the issue's location, either automatically via "Use My Current Location" or by manually typing and verifying their address.
5.  **Step 2 (Review):** The app shows if similar issues have already been reported nearby. The user can mark "This affects me too!" to upvote an existing report or proceed to file a new one.
6.  **Step 3 (Details):** The user fills in the complaint details (type, impact, title, description) and uploads a photo, which is verified by AI.
7.  Upon submission, the new complaint appears on the dashboards.
8.  At any time, the user can open the **Chatbot** to ask for the status of a complaint by its ID.

### 🔑 Admin Flow

1.  The admin navigates to the site and clicks the "Admin Login" link in the footer.
2.  After logging in, they are taken to the **Admin Dashboard**.
3.  They can see and filter all complaints.
4.  They can click **"Update Status"** on any complaint card to change its status and add resolution notes.