# best.fit powered by cult.fit - Kurnool

A premium, high-converting "Coming Soon" teaser and pre-registration website for the upcoming **best.fit** gym (powered by cult.fit) in Kurnool, Andhra Pradesh.

## Features
- **Modern Premium Design**: Dark mode aesthetic with glassmorphism, responsive grids, and high-impact gradients representing the dynamic energy of Cult.fit.
- **Countdown Timer**: Automatically calculates and runs a relative countdown timer showing the time remaining for the pre-launch discount offer.
- **Interactive Lead Capture Form**: Features full input validation (checks for name, email, select interest, and 10-digit Indian phone number formatting). Submissions are mock-saved to local storage and display a beautiful checkmark success modal.
- **Location Address Card**: Contains the full venue details with a "Copy Address" utility and a responsive, dark-styled Google Maps embed of Shilpa Birla Compound.
- **Flawless Responsiveness**: Perfectly optimized for mobiles, tablets, and desktop computers.
- **Dynamic Scroll Animations**: Elements fade and slide smoothly into place as the user scrolls.

## How to View and Test Locally
1. Clone or download this folder onto your computer.
2. Double-click the `index.html` file to open it in any web browser.
3. Scroll through the page, check the responsive layout (by resizing your browser window or using developer tools), and try submitting the pre-registration form to see the success pop-up.

---

## How to Host this Website on GitHub Pages (Free)

Hosting this website on GitHub is simple and completely free. Follow these steps:

### Step 1: Initialize Git and Commit
Open your command terminal (Command Prompt, PowerShell, or Git Bash) inside this project directory (`c:\Users\ABC\Desktop\best-fit`) and run:
```bash
git init
git add .
git commit -m "Initial commit of best.fit website"
```

### Step 2: Create a New Repository on GitHub
1. Log in to your GitHub account at [github.com](https://github.com).
2. Click the **"+"** icon in the top-right corner and select **New repository**.
3. Name your repository (e.g., `best-fit-kurnool`).
4. Keep it **Public** (GitHub Pages requires a public repository for the free tier).
5. **Do not** check any boxes under "Initialize this repository with" (leave README, .gitignore, and License unchecked).
6. Click **Create repository**.

### Step 3: Link Your Local Folder to GitHub & Push
Copy the commands under **"or push an existing repository from the command line"** from the repository setup page on GitHub. They will look similar to this:
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/best-fit-kurnool.git
git branch -M main
git push -u origin main
```
*(Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username).*

### Step 4: Enable GitHub Pages
1. Go to your repository on GitHub.com.
2. Click on the **Settings** tab in the top navigation bar of the repository.
3. In the left-hand sidebar under the **Code and automation** section, click on **Pages**.
4. Under **Build and deployment**:
   - For **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` (instead of None).
   - Keep the folder selected as `/ (root)`.
5. Click **Save**.

Within 1–2 minutes, GitHub will build the site, and you'll see a message at the top of the Pages settings page showing:
> **Your site is live at `https://YOUR_GITHUB_USERNAME.github.io/best-fit-kurnool/`**

Click the link to visit your live gym website!

---

## How to Save Registrations to Your Google Drive Folder

Since this is a static website hosted on GitHub Pages, we cannot write directly to a file in Google Drive from the browser. Instead, we use a free **Google Apps Script Web App** to securely transfer form entries into a Google Sheets spreadsheet inside your Google Drive folder.

Follow these 5 simple steps to set it up:

### Step 1: Create a Google Sheet
1. Open your Google Drive folder: [Google Drive Folder](https://drive.google.com/drive/folders/1YMaDgwqNZsPSZdVInf5E00TPsBeZqEA7?usp=sharing).
2. Click **New** -> **Google Sheets**.
3. Name the spreadsheet (e.g., `best-fit-registrations`).
4. Rename the first row of columns to:
   - Column A: `Timestamp`
   - Column B: `Name`
   - Column C: `Email`
   - Column D: `Phone`
   - Column E: `Goal`

### Step 2: Open Extensions -> Apps Script
1. In your new Google Sheet, click **Extensions** in the top menu and select **Apps Script**.
2. Delete any default code in the editor.
3. Copy and paste the following Google Apps Script code into the script editor:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var name = "";
  var email = "";
  var phone = "";
  var goal = "";
  
  try {
    if (e.postData && e.postData.contents) {
      var data = JSON.parse(e.postData.contents);
      name = data.name;
      email = data.email;
      phone = data.phone;
      goal = data.goal;
    } else {
      name = e.parameter.name;
      email = e.parameter.email;
      phone = e.parameter.phone;
      goal = e.parameter.goal;
    }
  } catch(err) {
    name = e.parameter.name || "";
    email = e.parameter.email || "";
    phone = e.parameter.phone || "";
    goal = e.parameter.goal || "";
  }
  
  // Append new registration details
  sheet.appendRow([new Date(), name, email, phone, goal]);
  
  // Respond to the request and enable CORS header
  return ContentService.createTextOutput(JSON.stringify({status: "success"}))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
```

### Step 3: Deploy the Script as a Web App
1. Click the blue **Deploy** button in the top right and select **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set the configuration details:
   - **Description**: `best-fit leads API`
   - **Execute as**: **Me** (your-email@gmail.com)
   - **Who has access**: **Anyone** (this is critical so the website form can submit data without prompting the user to log in).
4. Click **Deploy**.
5. Google will ask you to authorize access. Click **Authorize access**, choose your account, click **Advanced** at the bottom of the prompt, and select **Go to Untitled project (unsafe)** to approve the permissions.
6. Once deployed, copy the **Web app URL** (it will end in `/exec`).

### Step 4: Add the URL to `app.js`
1. Open the [app.js](file:///c:/Users/ABC/Desktop/best-fit/app.js) file in your editor.
2. Locate the `GOOGLE_SCRIPT_URL` variable at the very top (line 7):
   ```javascript
   const GOOGLE_SCRIPT_URL = '';
   ```
3. Paste your Web App URL between the single quotes. For example:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzEXAMPLE-URL-xyz/exec';
   ```
4. Save the file.

### Step 5: Test the Integration!
Open [index.html](file:///c:/Users/ABC/Desktop/best-fit/index.html) in your browser, fill in the form, and submit it. Open your Google Sheet—the new registration details will automatically appear as a new row in real time!

---

## Technical Details
- **Frontend Core**: Pure Semantic HTML5 & Modern CSS3.
- **Typography**: Google Fonts - Outfit & Inter.
- **Icons**: Hand-drawn inline SVGs for performance and compatibility.
- **Deployment target**: GitHub Pages.
- **Dependencies**: None (completely standalone code).
