TPMS is a full-stack clinical management platform designed to streamline the workflow of healthcare professionals in the screening, diagnosis, and treatment of Tuberculosis. This project was developed as a Final Year Project to demonstrate the application of the MERN stack in a high-stakes, real-world healthcare context.

🚀 Key Features
Comprehensive Patient Profiles: Centralized records for medical history, demographics, and contact information.

Radiology & Lab Integration: Specialized modules for uploading findings, interpretations (X-Ray, CT, etc.), and managing lab test results.

Role-Based Access Control (RBAC): Secure access levels for Admins, Doctors, Nurses, and Lab Staff using JWT authentication.

Data Visualization: Interactive dashboards utilizing React visualization tools to track patient trends and treatment outcomes.

Clinical Screening: Standardized screening workflows to ensure no patient falls through the cracks.

Responsive Design: Fully optimized for both desktop and tablet use in clinical environments.

🛠️ Tech Stack
Frontend:

React.js: Component-based UI architecture.

Redux Toolkit: Centralized state management for complex clinical workflows.

Tailwind CSS: Utility-first styling for a clean, modern, and accessible interface.

Lucide React: Consistent iconography.

Backend:

Node.js & Express: Scalable API development using ES Modules.

MongoDB & Mongoose: Flexible NoSQL schema design for medical data.

JWT: Secure authentication and session management.

🏗️ System Architecture
The system is built on a modular architecture to ensure scalability and ease of maintenance.

Client Layer: React application managing state via Redux to reduce unnecessary API calls and provide a snappy UI.

API Layer: RESTful endpoints protected by custom authentication and authorization middleware.

Service Layer: Business logic separation to keep controllers lean and testable.

Data Layer: MongoDB with Mongoose ODM for structured data validation.

⚙️ Installation & Setup
Prerequisites
Node.js (v18 or higher)

MongoDB Atlas account or local MongoDB instance

1. Clone the Repository
Bash

git clone https://github.com/yourusername/tpms_clone.git
cd tpms_clone
2. Backend Setup
Bash

cd server
npm install
Create a .env file in the server folder:

Code snippet

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
Start the server:

Bash

npm run dev
3. Frontend Setup
Bash

cd client
npm install
Start the application:

Bash

npm run dev
📊 Visuals & Screenshots
    ### Secure Authentication
![Login Page](./screenshots/login.png)