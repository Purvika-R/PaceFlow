# Setup and Run Instructions

## Configuration Summary

### Backend (Port 5000)
- **API Base URL**: `http://localhost:5000/api`
- **CORS Allowed Origins**: Supports multiple origins via comma-separated `CLIENT_ORIGIN` env var, or defaults to:
  - `http://localhost:5173`
  - `http://localhost:5174`
  - `http://localhost:3000`
- **Cross-Origin-Resource-Policy**: `cross-origin` (required for cross-port requests)

### Frontend (Vite - Typically Port 5173)
- **Default Dev Server**: `http://localhost:5173` (Vite auto-increments if port is busy: 5174, 5175, etc.)
- **API URL**: Reads from `VITE_API_URL` env var, defaults to `http://localhost:5000/api`

---

## How to Run

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

**Expected Output:**
```
[nodemon] starting `node src/server.js`
MongoDB connected: ...
API listening on port 5000
```

**Backend will be available at:** `http://localhost:5000`

---

### Terminal 2: Start Frontend
```bash
npm run dev
```

**Expected Output:**
```
VITE v8.2.2  ready in XXX ms

➜  Local:   http://localhost:5173/
```

**Frontend will be available at:** Whatever port Vite prints (usually 5173, but may be 5174, 5175 if 5173 is busy)

---

## Important Notes

1. **CORS is flexible** - The backend accepts requests from `localhost:5173`, `localhost:5174`, and `localhost:3000` by default. If Vite picks a different port, the backend will still accept it.

2. **No hardcoded ports in frontend** - The frontend uses `VITE_API_URL` environment variable or defaults to `http://localhost:5000/api`. It will work regardless of which port Vite picks for the dev server.

3. **To use a custom frontend port**, set it in your environment:
   ```bash
   # .env file in project root (frontend)
   VITE_API_URL=http://localhost:5000/api
   ```

4. **To allow additional origins in production**, update `backend/.env`:
   ```bash
   CLIENT_ORIGIN=http://localhost:5173,https://yourdomain.com
   ```

---

## Testing the Complete Flow

1. Open the frontend URL that Vite printed (e.g., `http://localhost:5173`)
2. Click "Initialize new user" to register
3. Fill in the registration form and submit
4. You should be automatically logged in and see the Mission Control dashboard
5. Navigate to Settings to verify theme switching works
6. Toggle between Dark and Light themes
7. Toggle Task reminders on/off
8. Click "Save changes" - settings should persist
9. Logout and login again - your theme preference should be restored

---

## Troubleshooting

### "Failed to fetch" error
- **Check backend is running**: `curl http://localhost:5000/api/health` should return JSON
- **Check CORS headers**: The response should include `Access-Control-Allow-Origin` and `Cross-Origin-Resource-Policy: cross-origin`
- **Check browser console**: Look for specific CORS or network errors

### Port conflicts
- If backend fails to start on 5000: Another process is using that port. Kill it or change `PORT` in `backend/.env`
- If frontend picks 5174/5175: This is normal Vite behavior. The backend CORS allows these ports by default.

### Theme not persisting
- Check browser localStorage for `paceflow_token`
- Verify `/auth/me` returns `theme` and `remindersEnabled` fields
- Check browser console for any API errors

---

## Files Modified in This Implementation

### Backend (7 files)
1. `backend/src/app.js` - Flexible CORS with multiple origins
2. `backend/src/models/User.js` - Added theme and remindersEnabled fields
3. `backend/src/controllers/authController.js` - Include theme/reminders in responses, updateSettings endpoint
4. `backend/src/routes/authRoutes.js` - PATCH /auth/settings route
5. `backend/src/controllers/userController.js` - User update method
6. `backend/src/routes/userRoutes.js` - PUT /:id route
7. `backend/src/validators/userValidator.js` - Validation for new fields

### Frontend (5 files)
1. `src/index.css` - Complete light/dark theme system with CSS variables
2. `src/services/api.js` - updateSettings API method
3. `src/hooks/useAuth.jsx` - Theme application on login/logout/settings change
4. `src/AppConnected.jsx` - Settings page with real theme toggle and reminders toggle
5. `src/AppAuthenticated.jsx` - Theme-aware auth pages
