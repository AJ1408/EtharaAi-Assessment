# EtharaPM - Project Management System

![EtharaPM Banner](https://via.placeholder.com/1200x400/0f172a/6366f1?text=EtharaPM)

EtharaPM is a full-stack MERN application designed to help teams manage their projects, track tasks, and collaborate effectively. It features a modern, dark-themed UI built with React and Tailwind CSS, backed by a robust Express API and MongoDB database.

## 🚀 Features

- **Role-Based Access Control (RBAC):** Distinct permissions for Admins and standard Members.
- **Project Management:** Create, track, and manage complex projects (Admin only).
- **Task Tracking:** Assign tasks to specific project members with varying priorities and due dates.
- **Dynamic Dashboard:** Get real-time statistics on active projects, overdue tasks, and task distribution.
- **Secure Authentication:** JWT-based authentication system with encrypted passwords using bcrypt.
- **Modern UI:** Responsive, highly polished dark mode interface using Tailwind CSS and Lucide React icons.

---

## 💻 Tech Stack

### Frontend
- React 18 (Vite)
- Tailwind CSS 3
- React Query (Data fetching & caching)
- React Router v6
- Axios

### Backend
- Node.js & Express
- MongoDB Atlas & Mongoose 7
- JSON Web Token (JWT)
- bcryptjs

---

## 🛠️ Installation & Setup

### Prerequisites
Make sure you have the following installed on your local machine:
- Node.js (v16.x or higher)
- npm (Node Package Manager)
- A MongoDB cluster (Atlas or local)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ethara-pm.git
cd ethara-pm
```

### 2. Setup the Backend
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add the following variables:
```env
PORT=5000
MONGO_URI=mongodb+srv://<your_username>:<your_password>@cluster0.mongodb.net/ethara_pm
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```

---

## 🎯 Usage

1. Open your browser and navigate to `http://localhost:5173/`.
2. Click **Create Account** and register a new user. You can choose to be an **Admin** or a **Member** via the dropdown for demo purposes.
3. If you register as an Admin, navigate to the **Projects** tab to create your first project.
4. Go to the **Tasks** tab to create tasks and assign them to project members.
5. Head to the **Team** tab to view all registered users and manage their roles.

---

## 🔒 Security
- All passwords are asynchronously hashed before saving to MongoDB.
- Every protected API route verifies a JWT Bearer token.
- Admin-only routes are safeguarded by a secondary role-check middleware.
- Environment variables securely manage sensitive connection strings.

---

## 📝 License
This project is licensed under the MIT License.
