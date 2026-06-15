# DirectDine Deployment Guide (Vercel & Render)

This document provides a comprehensive, step-by-step guide to deploying the DirectDine workspace. 

The application is structured as a monorepo:
1. **Database**: Managed on **Supabase** (Cloud PostgreSQL).
2. **Backend API**: Node.js Express server, to be deployed on **Render**.
3. **Customer PWA Frontend**: React/Vite SPA, to be deployed on **Vercel**.
4. **Admin Dashboard Frontend**: React/Vite SPA, to be deployed on **Vercel**.

---

## Prerequisites
Before you start, ensure you have:
1. A **GitHub**, **GitLab**, or **Bitbucket** repository with your code pushed.
2. A **Supabase** account (already created and configured with the schema/seeds).
3. A **Render** account (for backend hosting).
4. A **Vercel** account (for frontend hosting).

---

## 1. Deploy the Backend to Render

Render is ideal for hosting Node.js Express APIs. Since our backend is located in a subfolder (`/backend`), we will configure Render to target that directory.

### Step-by-Step Instructions:
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your Git repository.
4. Configure the Web Service settings:
   - **Name**: `directdine-backend` (or any custom name)
   - **Region**: Select the region closest to your database/users
   - **Branch**: `main` (or your active branch)
   - **Root Directory**: `backend` *(This tells Render to run commands inside the `/backend` folder)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Select the **Free Instance Type** (or upgrade as needed).
6. Click **Advanced** to add environment variables. Add the following keys (matching your local `backend/.env` file):
   
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `PORT` | `10000` | Render will override this automatically, but you can set it manually. |
   | `SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL. |
   | `SUPABASE_ANON_KEY` | `your_anon_key` | Your Supabase public anonymous key. |
   | `SUPABASE_SERVICE_ROLE_KEY`| `your_service_role_key` | Secure key required for database triggers/SSE. |
   | `JWT_SECRET` | `your-secure-jwt-secret-string` | A long random string to encrypt user session tokens. |

7. Click **Create Web Service**. 
8. Once built and running, copy the live URL of your backend (e.g. `https://directdine-backend.onrender.com`). **You will need this for the frontends!**

---

## 2. Deploy Frontends to Vercel

Vercel is built for static single-page applications like our Vite frontends. We will deploy the **Customer App** and the **Admin App** as two separate Vercel projects pointing to the same Git repository.

To support client-side routing (routing handled by `react-router-dom`), a [vercel.json](file:///d:/Projects/restaurant-pwa/frontend/customer-app/vercel.json) file has been configured in each frontend folder redirecting all request paths to `/index.html`.

### A. Deploy Customer App (`frontend/customer-app`)
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** and select **Project**.
3. Import your Git repository.
4. Configure the Project Settings:
   - **Project Name**: `directdine-customer`
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click *Edit* and select **`frontend/customer-app`**.
   - **Build and Output Settings**:
     - *Build Command*: `npm run build` or `vite build`
     - *Output Directory*: `dist`
     - *Install Command*: `npm install`
5. Expand **Environment Variables** and add the API endpoint key:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-name.onrender.com/api` *(Replace with your actual Render API URL, ending in `/api`)*
6. Click **Deploy**.
7. Once deployment is complete, Vercel will provide your live Customer PWA URL (e.g., `https://directdine-customer.vercel.app`).

### B. Deploy Admin App (`frontend/admin-app`)
1. In your Vercel Dashboard, click **Add New...** and select **Project**.
2. Import the same Git repository again.
3. Configure the Project Settings:
   - **Project Name**: `directdine-admin`
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click *Edit* and select **`frontend/admin-app`**.
   - **Build and Output Settings**:
     - *Build Command*: `npm run build` or `vite build`
     - *Output Directory*: `dist`
     - *Install Command*: `npm install`
4. Expand **Environment Variables** and add the API endpoint key:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-name.onrender.com/api` *(Ensure it matches the exact Render backend URL + `/api`)*
5. Click **Deploy**.
6. Once deployment is complete, Vercel will provide your live Admin Portal URL (e.g., `https://directdine-admin.vercel.app`).

---

## 3. (Optional) Restrict CORS on Render Backend
Currently, the Express backend has open CORS permissions (`app.use(cors())`). For security in a production environment, you may want to restrict CORS to only allow requests from your deployed Vercel domains.

To restrict CORS:
1. Open [backend/src/app.js](file:///d:/Projects/restaurant-pwa/backend/src/app.js).
2. Replace `app.use(cors());` with:
   ```javascript
   const allowedOrigins = [
     'https://your-customer-app.vercel.app',
     'https://your-admin-app.vercel.app',
     'http://localhost:5173', // For local customer development
     'http://localhost:5174'  // For local admin development
   ];

   app.use(cors({
     origin: (origin, callback) => {
       // Allow requests with no origin (like mobile apps or curl requests)
       if (!origin) return callback(null, true);
       if (allowedOrigins.indexOf(origin) === -1) {
         const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
         return callback(new Error(msg), false);
       }
       return callback(null, true);
     },
     credentials: true
   }));
   ```
3. Commit and push these changes to GitHub. Render will automatically redeploy the backend!

---

## 4. Verification Check
After deploying, verify the setup:
1. Open your deployed Vercel Customer URL.
2. Sign up or log in.
3. Check the browser Console network tab to ensure API calls are successfully directed to the Render URL (not localhost or local IP).
4. Perform an action (e.g., creating a support ticket) and check if the database updates and notifications broadcast properly.
