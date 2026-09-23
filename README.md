# 🔐 OmniEntry — Employee Face Authentication System

> **AI-powered employee identity verification and entry tracking system built with React and AWS.**

OmniEntry is a cloud-based employee authentication system that uses **facial recognition, geolocation, and AWS serverless services** to securely verify employees and maintain accurate entry logs.

The system captures an employee's face through the browser camera, verifies the identity using **Amazon Rekognition**, records the exact **entry date and time**, captures the employee's **location**, and stores the verification history in **Amazon DynamoDB**.

---

## ✨ Features

* 📷 **Real-time Face Capture**
* 🧠 **AI-powered Facial Recognition**
* 🔐 **Employee Identity Verification**
* 📍 **GPS-based Entry Location**
* 🕐 **Exact Entry Date & Time**
* 📊 **Employee Entry History**
* 🎯 **Face Match Similarity Score**
* 🗺️ **Google Maps Location Links**
* ☁️ **Fully AWS-powered Backend**
* ⚡ **Serverless API Architecture**
* 🌐 **Cloud-hosted React Frontend**
* 📱 **Responsive Interface**
* 🛡️ **Failed Verification Logging**

---

# 🖼️ Screenshots

## 🏠 Employee Verification Dashboard

<img width="1366" height="768" alt="Screenshot (107)" src="https://github.com/user-attachments/assets/6a89b914-4601-4b31-95a1-aba6eb7b20ca" />

The main dashboard provides access to the camera, employee verification, and entry logs.

---

## 📷 Face Verification

<img width="1366" height="768" alt="Screenshot (108)" src="https://github.com/user-attachments/assets/1084b49f-6978-4915-8616-fac25b5aef36" />

Employees can start their camera and perform facial verification directly from the browser.

---

## ✅ Successful Authentication and Location Tracking

<img width="1366" height="768" alt="Screenshot (109)" src="https://github.com/user-attachments/assets/59fae617-e4da-483e-9ac3-a938b56f7694" />

After a successful match, the system displays:

* Employee Name
* Employee ID
* Match Similarity
* Verification Status
* Entry Date
* Entry Time
* Entry Location
* Location Accuracy

Each successful verification can contain the employee's:

* Latitude
* Longitude
* Location name
* Location accuracy
* Google Maps link

---

## 📊 Entry Logs

![Entry Logs](screenshots/entry-logs.png)

The system maintains an employee verification history containing:

| Field      | Description           |
| ---------- | --------------------- |
| Employee   | Employee name         |
| ID         | Employee identifier   |
| Date       | Entry date            |
| Entry Time | Exact entry time      |
| Similarity | Face match percentage |
| Location   | Verification location |
| Status     | Verification status   |

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │      Employee       │
                         │      Browser        │
                         └──────────┬──────────┘
                                    │
                           Camera + GPS
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   React Frontend    │
                         │      OmniEntry      │
                         └──────────┬──────────┘
                                    │
                              HTTPS POST
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    API Gateway      │
                         │  employee-face-api  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    AWS Lambda       │
                         │  Authentication API │
                         └──────┬──────┬───────┘
                                │      │
              ┌─────────────────┘      └─────────────────┐
              ▼                                          ▼
     ┌──────────────────┐                       ┌──────────────────┐
     │ Amazon           │                       │ Amazon DynamoDB  │
     │ Rekognition      │                       │                  │
     │                  │                       │ Employees        │
     │ Face Matching    │                       │ EntryLogs        │
     └────────┬─────────┘                       └──────────────────┘
              │
              ▼
     ┌──────────────────┐
     │ Amazon S3        │
     │                  │
     │ Employee Images  │
     └──────────────────┘

                    ┌──────────────────────┐
                    │ Amazon Location      │
                    │ Service / GeoPlaces  │
                    │                      │
                    │ Reverse Geocoding    │
                    └──────────────────────┘
```

---

# ☁️ AWS Services Used

| AWS Service                 | Purpose                                        |
| --------------------------- | ---------------------------------------------- |
| **Amazon API Gateway**      | Exposes the authentication API                 |
| **AWS Lambda**              | Runs backend authentication logic              |
| **Amazon Rekognition**      | Facial recognition and face matching           |
| **Amazon S3**               | Stores employee face images                    |
| **Amazon DynamoDB**         | Stores employees and entry logs                |
| **Amazon Location Service** | Converts coordinates into location information |
| **AWS Amplify**             | Hosts the React frontend                       |

---

# 🔄 Authentication Flow

### 1. Start Camera

The browser requests camera permission using the Web Media API.

```text
Browser
   ↓
Camera Permission
   ↓
Live Video Stream
```

### 2. Capture Face

A frame is captured from the live camera using an HTML `<canvas>`.

```text
Video Stream
     ↓
Canvas
     ↓
JPEG
     ↓
Base64 Image
```

### 3. Capture Location

The browser requests the user's current GPS coordinates.

```text
Latitude
Longitude
Accuracy
```

### 4. Send Request

The frontend sends the image and location to API Gateway.

```json
{
  "action": "verify",
  "imageBytes": "...",
  "latitude": 26.2183,
  "longitude": 78.1828,
  "accuracy": 15
}
```

### 5. Face Matching

AWS Lambda sends the image to Amazon Rekognition.

Rekognition searches the configured face collection and returns the closest matching face.

### 6. Employee Lookup

The matched face ID is associated with an employee record in DynamoDB.

### 7. Entry Logging

A successful verification creates an entry log containing:

```text
Employee ID
Employee Name
Date
Time
Timestamp
Similarity
Status
Latitude
Longitude
Location Accuracy
Location Name
```

### 8. Display Result

The frontend displays the verified employee information and location.

---

# 🧠 Facial Recognition

OmniEntry uses an Amazon Rekognition collection:

```text
employee-face-collection
```

The system performs face matching against registered employee faces.

The verification process uses a configured similarity threshold before accepting a match.

---

# 🗄️ Database Design

## Employees

The `Employees` DynamoDB table stores employee identity information associated with their Rekognition face.

Example conceptual record:

```json
{
  "employeeId": "EMP001",
  "name": "Employee Name",
  "faceId": "rekognition-face-id"
}
```

---

## EntryLogs

The `EntryLogs` table stores authentication attempts and entry information.

Example:

```json
{
  "logId": "unique-log-id",
  "employeeId": "EMP001",
  "name": "Employee Name",
  "date": "2026-09-23",
  "time": "07:30:42",
  "timestamp": "2026-09-23T02:00:42.000Z",
  "similarity": 98.72,
  "status": "VERIFIED",
  "latitude": 26.2183,
  "longitude": 78.1828,
  "locationAccuracy": 12,
  "locationName": "Gwalior"
}
```

---

# 🔌 API

The application communicates with the backend through:

```text
POST
https://c2kgkuctfi.execute-api.us-east-1.amazonaws.com/prod
```

## Verify Employee

Request:

```json
{
  "action": "verify",
  "imageBytes": "BASE64_IMAGE",
  "latitude": 26.2183,
  "longitude": 78.1828,
  "accuracy": 10
}
```

---

## Retrieve Logs

Request:

```json
{
  "action": "logs"
}
```

---

## Register Employee

The backend also supports employee face registration:

```json
{
  "action": "register"
}
```

Registration requires the corresponding employee image data and employee information.

---

# 🛠️ Tech Stack

## Frontend

* React
* JavaScript
* HTML5
* CSS3
* Browser MediaDevices API
* Browser Geolocation API

## Backend

* AWS Lambda
* Node.js
* API Gateway

## AI / Computer Vision

* Amazon Rekognition

## Storage

* Amazon S3
* Amazon DynamoDB

## Location

* Amazon Location Service

## Deployment

* AWS Amplify

---

# 📁 Project Structure

```text
employee-face-frontend/
│
├── public/
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

---

# 🚀 Running Locally

## Prerequisites

Make sure you have:

* Node.js
* npm
* AWS backend already configured
* Camera-enabled device/browser
* Location permission

---

## Clone Repository

```bash
git clone https://github.com/omeshnigam/employee-face-frontend.git
```

```bash
cd employee-face-frontend
```

---

## Install Dependencies

```bash
npm install
```

---

## Start Development Server

```bash
npm run dev
```

The application will be available on the local development URL provided by Vite.

---

# 🌐 Deployment

The frontend is deployed using **AWS Amplify**.

### Production Application

```text
https://main.d2g155g9sxcm2z.amplifyapp.com/
```

Deployment pipeline:

```text
GitHub
   ↓
AWS Amplify
   ↓
React Build
   ↓
Production Hosting
```

---

# 🔐 Security Considerations

The application handles biometric authentication data, therefore production deployments should consider:

* Restricting API access
* Proper AWS IAM permissions
* Authentication and authorization
* Secure employee registration
* Encryption at rest
* Encryption in transit
* Controlled S3 bucket permissions
* DynamoDB access policies
* Protection of biometric information
* Appropriate data retention policies
* HTTPS-only communication

> **Important:** The current demonstration architecture is intended as a project implementation. Production deployment should add appropriate authentication, authorization, IAM least-privilege policies, and organizational privacy controls.

---

# 📊 Verification States

The system handles multiple verification outcomes.

### Successful Verification

```text
Face Match
    ↓
Employee Found
    ↓
Entry Recorded
    ↓
VERIFIED
```

### Unknown Employee

```text
Face Detected
    ↓
No Matching Employee
    ↓
Verification Failed
```

### Location Failure

```text
GPS Permission Denied
        ↓
Verification Stopped
        ↓
Location Required
```

---

# 🎯 Key Highlights

### 🤖 AI-Powered

Uses Amazon Rekognition for automated facial recognition.

### 📍 Location-Aware

Every successful verification can record the geographical location of the entry.

### 🕐 Time-Aware

The system records both the **entry date and exact entry time**, enabling accurate attendance and entry tracking.

### ☁️ Serverless

The backend uses AWS Lambda and API Gateway without requiring a traditional always-running server.

### 📊 Auditable

Verification history is stored in DynamoDB and can be displayed through the entry-log interface.

---

# 🔮 Future Improvements

Potential future enhancements include:

* 👤 Admin authentication
* 🔑 Role-based access control
* 📱 Dedicated employee mobile application
* 📈 Attendance analytics dashboard
* 📧 Automated email notifications
* 🚨 Suspicious verification alerts
* 📅 Attendance reports
* 📥 CSV/PDF report generation
* 🏢 Multi-office support
* 🔒 Advanced IAM security
* 🧹 Automated biometric data retention policies

---

# 🏆 Project Highlights

**Project:** OmniEntry
**Category:** Employee Authentication / Computer Vision / Cloud Computing
**Frontend:** React
**Backend:** AWS Lambda
**AI:** Amazon Rekognition
**Database:** DynamoDB
**Storage:** Amazon S3
**API:** Amazon API Gateway
**Hosting:** AWS Amplify

---

# 👨‍💻 Author

## Omesh Nigam

B.Tech Information Technology Student

**GitHub:** [github.com/omeshnigam](https://github.com/omeshnigam)

**LinkedIn:** [linkedin.com/in/omesh-nigam](https://linkedin.com/in/omesh-nigam)

---

<p align="center">

### 🔐 OmniEntry

**Secure • Intelligent • Cloud Powered**

Built with ❤️ using React & AWS

</p>
