# Airport Duty Management (ADM) — Simple KT Guide

A simple, easy-to-understand guide for anyone joining or working on this project.

---

## 1. What is this Project?

In simple words:

When VIP guests, dignitaries, and government officials travel through airports, **Protocol Officers** are sent to the airport to receive them or see them off at the terminal.

This project is the **Backend API** that manages this entire operation:
* **Duty Scheduling:** Decides and tracks which officer attends which flight, at which airport and terminal.
* **Flight & Guest Details:** Tracks flight numbers, arrival/departure times, guest names, PNRs, and passenger count.
* **Live Notifications:** Alerts officers on their phones when a duty is assigned to them, and alerts admins when officers accept a duty.
* **Reports:** Generates downloadable PDF reports showing duty history and protocol records.

---

## 2. Who are the Users?

There are only **two types of users** in the system:

### 1. Admin (Supervisor / Manager)
* **Creates Duties:** Enters upcoming flights, passenger names, and schedules.
* **Assigns Officers:** Assigns a duty to an officer (the officer instantly gets a notification).
* **Manages Officers:** Adds new officers to the system and can enable/disable their accounts.
* **Monitors Progress:** Gets an alert when an officer accepts (confirms) a duty.
* **Downloads Reports:** Downloads monthly PDF reports to view duty records and officer activity.

### 2. Subordinate (Protocol Officer)
* **Logs in with OTP:** Enters their phone/employee ID and logs in using an OTP received on SMS.
* **Views Duties:** Checks their upcoming assigned duties or browses open duties.
* **Claims Duties:** Can self-pick (claim) an open duty if no one is assigned.
* **Confirms Duty:** Clicks "Confirm" to accept and acknowledge that they will handle the assigned duty.
* **Completes Duties:** Marks the duty as completed once the guest departs or arrives.
* **Emergency Contacts:** Can view phone numbers of terminal teams directly in the app.

---

## 3. Tech Stack We Used (And Why)

* **Node.js & Express:** The backend server that runs all our APIs.
* **MongoDB & Mongoose:** The database where we save users, duties, and uploaded files directly.
* **JWT (JSON Web Token):** Keeps users logged in securely and checks whether someone is an Admin or an Officer.
* **Twilio:** Sends the 6-digit login OTP to the officer's mobile number via SMS (in local dev mode, the OTP is printed in the terminal console).
* **Firebase (FCM):** Sends instant push notifications to the mobile app when duties are assigned or confirmed.
* **PDFKit:** Builds clean, downloadable PDF reports for duty summaries.
* **pdf-parse:** Reads uploaded boarding pass PDFs so flight details can be filled automatically.

*(Note: We do not use Cloudinary or external cloud buckets. All attached PDF files are saved directly inside MongoDB.)*

---

## 4. Project Structure (Where to find what?)

```
ADM-Backend/
│
├── server.js                 # Starting point of the app (starts the server and connects DB)
│
├── config/
│   └── db.js                 # Connects the app to MongoDB
│
├── models/                   # Database tables (Schemas)
│   ├── User.js               # User accounts (Admin & Officers, passwords, phone numbers)
│   ├── Duty.js               # Duty records (flight info, assigned officer, attached files)
│   ├── Airport.js            # Airports list (Mumbai, Delhi, etc.)
│   ├── Terminal.js           # Airport terminals (T1, T2, T3)
│   ├── City.js               # Cities for flight routes
│   └── Contact.js            # Airport emergency contact numbers
│
├── controllers/              # The actual logic (what happens when an API is called)
│   ├── authController.js     # Login, sending OTP, verifying OTP, password change
│   ├── dutyController.js     # Creating, assigning, claiming, confirming duties & saving PDFs
│   ├── officerController.js  # Adding and managing officers
│   ├── reportController.js   # Generating duty summary PDF reports
│   ├── boardingPassController.js # Reading text from boarding pass PDFs
│   ├── airportController.js  # Managing airports and terminals
│   ├── cityController.js     # Managing the cities list
│   └── contactController.js  # Managing contact directories
│
├── routes/                   # API URLs (links URLs like /api/v1/duties to controllers)
│   ├── auth.js
│   ├── duties.js
│   ├── officers.js
│   ├── reports.js
│   ├── boardingPass.js
│   ├── airports.js
│   ├── cities.js
│   └── contacts.js
│
├── middleware/               # Gatekeepers
│   ├── auth.js               # Checks if user is logged in, and if they are an Admin
│   └── errorHandler.js       # Handles errors cleanly so the server doesn't crash
│
└── utils/                    # Helper tools
    ├── sms.js                # Sends SMS OTP via Twilio
    ├── fcm.js                # Sends push notifications via Firebase
    └── pdfGenerator.js       # Designs and creates the PDF reports
```

---

## 5. How to Run Locally

1. **Install dependencies:** `npm install`
2. **Setup Admin user:** `npm run seed` *(creates username: `admin` / password: `admin123`)*
3. **Setup Airports:** `npm run seed:airports` *(creates Mumbai, ULVE, Delhi airports)*
4. **Start the server:** `npm run dev`
5. **View API documentation:** Open `http://localhost:5000/api-docs` in your browser.

---

## 6. All API Endpoints (Full URLs, What They Accept & Return)

> **Authentication Header:** All protected routes require `Authorization: Bearer <JWT_TOKEN>`.

---

### 6.1 Authentication APIs (`/api/v1/auth`)

#### 🔵 `POST /api/v1/auth/send-otp`
* **Access:** Public (No token needed)
* **What it does:** Checks username/email/phone and password. If correct, generates a 6-digit OTP and sends it via SMS.
* **Accepts (Body):**
  ```json
  {
    "identifier": "admin", // username, email, or phone
    "password": "admin123"
  }
  ```
* **Returns:**
  ```json
  {
    "message": "OTP sent to 90******00",
    "userId": "64f1a2b...",
    "maskedEmail": "ad***@airport.com",
    "otp": "123456" // Included only in development mode
  }
  ```

---

#### 🔵 `POST /api/v1/auth/verify-otp`
* **Access:** Public (No token needed)
* **What it does:** Verifies the 6-digit OTP and logs the user in.
* **Accepts (Body):**
  ```json
  {
    "userId": "64f1a2b...",
    "otp": "123456"
  }
  ```
* **Returns:**
  ```json
  {
    "token": "eyJhbGciOi...",
    "role": "ADMIN", // or "OFFICER"
    "user": {
      "id": "64f1a2b...",
      "name": "Admin User",
      "username": "admin",
      "email": "admin@airport.com",
      "phone": "9000000000",
      "employeeId": "EMP001",
      "role": "ADMIN"
    }
  }
  ```

---

#### 🔵 `POST /api/v1/auth/resend-otp`
* **Access:** Public
* **What it does:** Resends a fresh 6-digit OTP via SMS if expired or not received.
* **Accepts (Body):** `{ "userId": "64f1a2b..." }`
* **Returns:** `{ "message": "OTP resent to 90******00" }`

---

#### 🔵 `POST /api/v1/auth/change-password`
* **Access:** Logged-in Users
* **What it does:** Updates the password for the current logged-in user.
* **Accepts (Body):**
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }
  ```
* **Returns:** `{ "message": "Password changed successfully" }`

---

#### 🔵 `POST /api/v1/auth/fcm-token`
* **Access:** Logged-in Users
* **What it does:** Saves the user's mobile device token so they can receive Firebase push notifications.
* **Accepts (Body):** `{ "fcmToken": "c8D...xyz" }`
* **Returns:** `{ "message": "FCM token saved" }`

---

#### 🔵 `POST /api/v1/auth/logout`
* **Access:** Logged-in Users
* **What it does:** Logs out the user.
* **Accepts:** None
* **Returns:** `{ "message": "Logged out successfully" }`

---

### 6.2 Duty Management APIs (`/api/v1/duties`)

#### 🟢 `GET /api/v1/duties`
* **Access:** Logged-in Users
* **What it does:** Lists all duties with optional filters. Auto-completes any duties whose date has already passed.
* **Accepts (Query Parameters):**
  * `?status=UPCOMING` (or `COMPLETED`, `CANCELLED`)
  * `?dateFrom=2024-07-01&dateTo=2024-07-31`
  * `?airportId=...&terminalId=...`
  * `?mine=true` (Shows only the officer's own assigned duties)
  * `?page=1&limit=20`
* **Returns:**
  ```json
  {
    "duties": [ /* array of duty objects */ ],
    "total": 45,
    "hasMore": true
  }
  ```

---

#### 🔵 `POST /api/v1/duties`
* **Access:** Admin Only
* **What it does:** Schedules a new duty. If an officer is assigned, an instant push notification is sent to them.
* **Accepts (Body):**
  ```json
  {
    "flightNo": "AI 101",
    "date": "2024-08-15",
    "reportingTime": "08:30 AM",
    "flightTime": "10:00 AM",
    "officeType": "REGULAR", // or "BEFORE_OFFICE", "AFTER_OFFICE", "HOLIDAY"
    "from": "Mumbai",
    "to": "Delhi",
    "airportId": "64a...",
    "airportName": "CSMIA",
    "terminalId": "64b...",
    "terminalName": "Terminal 2",
    "arrivalDeparture": "DEPARTURE", // or "ARRIVAL"
    "travellerName": "Hon. Minister",
    "travellerDesignation": "VIP Guest",
    "travellerPhone": "9876543210",
    "officerId": "64c...", // Optional
    "officerName": "Officer Name" // Optional
  }
  ```
* **Returns:** The newly created duty object with status `UPCOMING`.

---

#### 🟢 `GET /api/v1/duties/:id`
* **Access:** Logged-in Users
* **What it does:** Gets full information about a single duty by its ID.
* **Accepts:** Duty ID in the URL.
* **Returns:** The duty object.

---

#### 🟠 `PUT /api/v1/duties/:id`
* **Access:** Admin Only
* **What it does:** Updates any details of an existing duty (timings, flight, passenger, terminal).
* **Accepts (Body):** Any editable duty fields (e.g. `{ "flightTime": "11:00 AM" }`).
* **Returns:** The updated duty object.

---

#### 🔴 `DELETE /api/v1/duties/:id`
* **Access:** Admin Only
* **What it does:** Deletes a duty permanently.
* **Accepts:** Duty ID in the URL.
* **Returns:** `{ "message": "Duty deleted successfully" }`

---

#### 🟣 `PATCH /api/v1/duties/:id/assign`
* **Access:** Admin Only
* **What it does:** Assigns a duty to an officer and dispatches an instant FCM push alert to that officer's phone.
* **Accepts (Body):**
  ```json
  {
    "officerId": "64c...",
    "officerName": "Officer Name" // Optional (auto-resolved if omitted)
  }
  ```
* **Returns:** The updated duty object.

---

#### 🟣 `PATCH /api/v1/duties/:id/claim`
* **Access:** Logged-in Users (Officers)
* **What it does:** Allows an officer to self-claim an open duty that has no officer assigned. Alerts all Admins via push notification.
* **Accepts:** Duty ID in the URL.
* **Returns:** The updated duty object with `officerId` set to the logged-in user.

---

#### 🟣 `PATCH /api/v1/duties/:id/release`
* **Access:** Logged-in Users (Officers)
* **What it does:** Allows an officer to give up/release a duty they previously claimed.
* **Accepts:** Duty ID in the URL.
* **Returns:** The duty object with `officerId` reset to null.

---

#### 🟣 `PATCH /api/v1/duties/:id/confirm`
* **Access:** Logged-in Users (Officers)
* **What it does:** Officer confirms they acknowledge and accept the duty. Sends a notification to all Admins.
* **Accepts:** Duty ID in the URL.
* **Returns:** The duty object with `officerConfirmed: true`.

---

#### 🟣 `PATCH /api/v1/duties/:id/status`
* **Access:** Logged-in Users
* **What it does:** Updates the status of a duty.
* **Accepts (Body):** `{ "status": "COMPLETED" }` (or `"UPCOMING"`, `"CANCELLED"`)
* **Returns:** The updated duty object.

---

#### 🔵 `POST /api/v1/duties/:id/pdf`
* **Access:** Logged-in Users
* **What it does:** Uploads an attached PDF (boarding pass or travel order) as Base64 (max 5 MB) directly into MongoDB. Checks MD5 hash to prevent duplicate writes.
* **Accepts (Body):**
  ```json
  {
    "filename": "BoardingPass.pdf",
    "data": "JVBERi0xLjQKJ...", // Base64 encoded string
    "mimeType": "application/pdf"
  }
  ```
* **Returns:** The duty object with attachment metadata (`{ hasFile: true, filename, size }`).

---

#### 🟢 `GET /api/v1/duties/:id/pdf`
* **Access:** Logged-in Users
* **What it does:** Returns metadata of the attached file without loading the binary file.
* **Returns:** `{ "filename": "BoardingPass.pdf", "size": 104230, "mimeType": "application/pdf" }`

---

#### 🟢 `GET /api/v1/duties/:id/pdf/view`
* **Access:** Logged-in Users (or query token `?token=<JWT>`)
* **What it does:** Streams the binary PDF directly to the browser/mobile view so the user can preview it.
* **Returns:** Raw PDF file with header `Content-Type: application/pdf`.

---

### 6.3 Officer Management APIs (`/api/v1/officers`)

#### 🟢 `GET /api/v1/officers`
* **Access:** Admin Only
* **What it does:** Lists all registered protocol officers sorted alphabetically.
* **Returns:** Array of officer user profiles.

---

#### 🔵 `POST /api/v1/officers`
* **Access:** Admin Only
* **What it does:** Registers a new officer user.
* **Accepts (Body):**
  ```json
  {
    "name": "Rajesh Kumar",
    "email": "rajesh@airport.com",
    "phone": "9876543210",
    "employeeId": "EMP015",
    "password": "temporaryPassword123"
  }
  ```
* **Returns:** The created officer object.

---

#### 🟠 `PUT /api/v1/officers/:id`
* **Access:** Admin Only
* **What it does:** Updates an officer's profile information.
* **Accepts (Body):** `{ "name": "Rajesh K.", "phone": "9876543299" }`
* **Returns:** The updated officer object.

---

#### 🟣 `PATCH /api/v1/officers/:id/access`
* **Access:** Admin Only
* **What it does:** Enables or suspends an officer's account.
* **Accepts (Body):** `{ "isEnabled": false }`
* **Returns:** The updated officer object.

---

### 6.4 Airport & Terminal APIs (`/api/v1/airports`)

#### 🟢 `GET /api/v1/airports`
* **Access:** Logged-in Users
* **What it does:** Lists all airports (Mumbai, Delhi, ULVE, etc.).
* **Returns:** Array of airport objects (`[ { "id": "...", "name": "CSMIA", "code": "BOM", "city": "Mumbai", "isActive": true } ]`).

---

#### 🔵 `POST /api/v1/airports`
* **Access:** Admin Only
* **What it does:** Adds a new airport to the system.
* **Accepts (Body):** `{ "name": "Chhatrapati Shivaji Maharaj International Airport", "code": "BOM", "city": "Mumbai" }`
* **Returns:** The created airport object.

---

#### 🟣 `PATCH /api/v1/airports/:id`
* **Access:** Admin Only
* **What it does:** Edits an airport's name, code, or city.
* **Accepts (Body):** `{ "name": "New Airport Name" }`
* **Returns:** The updated airport object.

---

#### 🟣 `PATCH /api/v1/airports/:id/toggle`
* **Access:** Admin Only
* **What it does:** Activates or deactivates an airport.
* **Accepts (Body):** `{ "isActive": false }`
* **Returns:** The updated airport object.

---

#### 🟢 `GET /api/v1/airports/:airportId/terminals`
* **Access:** Logged-in Users
* **What it does:** Lists all terminals belonging to a specific airport (e.g. T1, T2).
* **Returns:** Array of terminal objects.

---

#### 🔵 `POST /api/v1/airports/:airportId/terminals`
* **Access:** Admin Only
* **What it does:** Adds a new terminal to an airport.
* **Accepts (Body):** `{ "name": "Terminal 1", "code": "T1" }`
* **Returns:** The created terminal object.

---

#### 🟣 `PATCH /api/v1/airports/:airportId/terminals/:terminalId`
* **Access:** Admin Only
* **What it does:** Renames a terminal or changes its code.
* **Accepts (Body):** `{ "name": "Terminal 1A", "code": "T1A" }`
* **Returns:** The updated terminal object.

---

#### 🟣 `PATCH /api/v1/airports/:airportId/terminals/:terminalId/toggle`
* **Access:** Admin Only
* **What it does:** Activates or deactivates a terminal.
* **Accepts (Body):** `{ "isActive": false }`
* **Returns:** The updated terminal object.

---

### 6.5 Reports & PDF Downloads (`/api/v1/reports`)

#### 🟢 `GET /api/v1/reports/duties`
* **Access:** Logged-in Users
* **What it does:** Returns summary counts (total duties, completed, upcoming, cancelled) for the selected date range.
* **Accepts (Query Parameters):** `?dateFrom=2024-07-01&dateTo=2024-07-31&airportId=...`
* **Returns:**
  ```json
  {
    "duties": [ /* array of duties */ ],
    "summary": {
      "total": 50,
      "completed": 40,
      "upcoming": 8,
      "cancelled": 2
    }
  }
  ```

---

#### 🟢 `GET /api/v1/reports/duties/pdf`
* **Access:** Logged-in Users
* **What it does:** Generates and downloads a clean, printable Landscape PDF Duty Report.
* **Accepts (Query Parameters):** Same filters as `/reports/duties`.
* **Returns:** Downloadable binary PDF file (`Content-Type: application/pdf`).

---

#### 🟢 `GET /api/v1/reports/subordinates`
* **Access:** Admin Only
* **What it does:** Returns duty statistics for every officer (how many duties completed, upcoming, etc.).
* **Accepts (Query Parameters):** `?dateFrom=...&dateTo=...`
* **Returns:** Array of officer performance summary objects.

---

#### 🟢 `GET /api/v1/reports/subordinates/pdf`
* **Access:** Admin Only
* **What it does:** Generates and downloads a printable Portrait PDF report summarizing officer duty records.
* **Returns:** Downloadable binary PDF file (`Content-Type: application/pdf`).

---

### 6.6 Boarding Pass Text Reader (`/api/v1/boarding-pass`)

#### 🔵 `POST /api/v1/boarding-pass/extract-text`
* **Access:** Logged-in Users
* **What it does:** Takes a boarding pass PDF in Base64 format and extracts raw text so the app can autofill flight information.
* **Accepts (Body):**
  ```json
  {
    "base64": "JVBERi0xLjQKJ..." // Max 8 MB
  }
  ```
* **Returns:**
  ```json
  {
    "text": "BOARDING PASS\nPASSENGER: JOHN DOE\nFLIGHT: 6E 201\nFROM: BOM TO: DEL\n..."
  }
  ```

---

### 6.7 Cities (`/api/v1/cities`)

#### 🟢 `GET /api/v1/cities`
* **Access:** Logged-in Users
* **What it does:** Lists all available route cities (auto-seeds default Indian cities if empty).
* **Returns:** Array of city objects (`[ { "id": "...", "name": "Mumbai", "isActive": true } ]`).

---

#### 🔵 `POST /api/v1/cities`
* **Access:** Admin Only
* **What it does:** Adds a new city to the list.
* **Accepts (Body):** `{ "name": "Chandigarh" }`
* **Returns:** The created city object.

---

#### 🟣 `PATCH /api/v1/cities/:id`
* **Access:** Admin Only
* **What it does:** Renames an existing city.
* **Accepts (Body):** `{ "name": "New City Name" }`
* **Returns:** The updated city object.

---

#### 🟣 `PATCH /api/v1/cities/:id/toggle`
* **Access:** Admin Only
* **What it does:** Activates or deactivates a city.
* **Accepts:** City ID in URL.
* **Returns:** The updated city object with `isActive` toggled.

---

### 6.8 Terminal Emergency Contacts (`/api/v1/contacts`)

#### 🟢 `GET /api/v1/contacts`
* **Access:** Logged-in Users
* **What it does:** Lists contact phone numbers for airport protocol teams.
* **Accepts (Query Parameter):** Optional `?group=T1` (or `T2`, `Ulve`).
* **Returns:**
  ```json
  [
    {
      "id": "64f...",
      "name": "Rajesh Kumar",
      "phone": "9876543210",
      "group": "T1"
    }
  ]
  ```

---

#### 🔵 `POST /api/v1/contacts`
* **Access:** Admin Only
* **What it does:** Adds a new protocol contact.
* **Accepts (Body):**
  ```json
  {
    "name": "Vikram Singh",
    "phone": "9876543214",
    "group": "T1" // Must be "T1", "T2", or "Ulve"
  }
  ```
* **Returns:** The created contact object.

---

#### 🟠 `PUT /api/v1/contacts/:id`
* **Access:** Admin Only
* **What it does:** Updates an existing contact's details.
* **Accepts (Body):** `{ "name": "Vikram S.", "phone": "9876543200", "group": "T1" }`
* **Returns:** The updated contact object.

---

#### 🔴 `DELETE /api/v1/contacts/:id`
* **Access:** Admin Only
* **What it does:** Deletes a contact number permanently.
* **Accepts:** Contact ID in URL.
* **Returns:** `{ "message": "Contact deleted" }`
