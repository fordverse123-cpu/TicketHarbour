# TicketHarbor 🎟️

TicketHarbor is a production-ready, full-stack multi-category ticket booking platform built using the MERN stack (**MongoDB, Express.js, React, Node.js**).

---

## 🚀 Features

- **7 Ticket Categories**:
  1. 🎬 **Movies**: IMAX 4K screenings, theater seat maps, showtimes
  2. 🎵 **Events & Concerts**: Stadium concerts, live shows, lawn tiers
  3. 🏏 **Sports**: Cricket, football, and arena stadium block seats
  4. 🚌 **Bus**: Intercity AC sleeper, Volvo coaches, route schedules
  5. 🚆 **Train**: Class-based (Sleeper, 3A, 2A, 1A, Executive)
  6. ✈️ **Flights**: Airline bookings (Economy & Business Premier)
  7. 🎡 **Attractions**: Day passes & amusement park tickets
- **Real-Time Seat Locking**: 5-minute temporary seat hold with countdown timer to prevent double booking.
- **JWT Auth & Token Rotation**: Access Token (15m) + Refresh Token (7d) stored in secure `httpOnly` cookies with Axios response interceptor for auto-refresh.
- **PDF & QR Code E-Tickets**: Automated PDF ticket generation with embedded QR codes using `pdfkit` & `qrcode`.
- **Payment Gateway**: Stripe / test mode with webhook confirmation.
- **Admin Control Center**: Revenue analytics, stats counters, CRUD management for listings/schedules, and QR scanner gate check-in tool.
- **Dark Mode Support**: Styled exclusively with Tailwind CSS (`font-sans` configured throughout).

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router v6, Axios, Tailwind CSS, React Hot Toast, Lucide Icons.
- **Backend**: Node.js, Express.js, Mongoose, MongoDB Atlas.
- **Auth**: JWT, BcryptJS, Cookie-Parser.
- **Email & PDF**: Nodemailer, PDFKit, QRCode.

---

## 📂 Project Structure

```text
/TicketHarbour
  ├── server/              # Express API Server
  │   ├── config/          # Database connection
  │   ├── controllers/     # Auth, Listing, Booking, Payment, Admin controllers
  │   ├── models/          # User, Listing, Schedule, Booking, Category, Venue, Payment
  │   ├── routes/          # Express API route modules (/api/v1/*)
  │   ├── middleware/      # Auth protect, authorize, error handler
  │   ├── utils/           # JWT, Nodemailer, PDF Generator
  │   ├── scripts/         # Master seed.js script
  │   └── server.js        # Main entry point
  ├── client/              # React Vite Frontend
  │   ├── src/components/  # Navbar, Footer, SeatSelector, SkeletonLoader
  │   ├── src/context/     # AuthContext with auto-refresh
  │   ├── src/pages/       # Home, Listings, ListingDetail, Checkout, MyBookings, Admin
  │   └── src/services/    # Axios API instance
  ├── render.yaml          # Render deployment blueprint
  └── README.md
```

---

## 📡 API Endpoint Documentation

All endpoints are versioned under `/api/v1`:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new user account & send verification email |
| `POST` | `/api/v1/auth/login` | Public | Login & receive httpOnly JWT access/refresh cookies |
| `POST` | `/api/v1/auth/logout` | Private | Revoke refresh token and clear cookies |
| `POST` | `/api/v1/auth/refresh` | Public | Refresh access token via refresh token rotation |
| `GET`  | `/api/v1/auth/me` | Private | Get current logged in user profile |
| `GET`  | `/api/v1/categories` | Public | Get all 7 ticket categories |
| `GET`  | `/api/v1/listings` | Public | Get listings with keyword search, category, city, price range, rating filter & pagination |
| `GET`  | `/api/v1/listings/:id` | Public | Get single listing details |
| `GET`  | `/api/v1/schedules` | Public | Get showtimes / trip dates with live seat map availability |
| `POST` | `/api/v1/bookings/lock-seats` | Private | Hold seats for 5 minutes with real-time expiration |
| `POST` | `/api/v1/bookings` | Private | Create booking reservation |
| `POST` | `/api/v1/bookings/:id/confirm` | Private | Confirm payment & send email with PDF QR ticket |
| `GET`  | `/api/v1/bookings/my-bookings` | Private | List user's upcoming & past bookings |
| `GET`  | `/api/v1/bookings/:id/ticket-pdf` | Private | Download generated PDF ticket with QR code |
| `POST` | `/api/v1/bookings/verify-qr` | Admin | Verify QR code string / ref at venue gate |
| `GET`  | `/api/v1/admin/stats` | Admin | Get revenue stats, category breakdown, recent orders |

---

## 💻 Local Setup & Seeding

1. **Clone the repository**:
   ```bash
   git clone https://github.com/fordverse123-cpu/TicketHarbour.git
   cd TicketHarbour
   ```

2. **Setup Server**:
   ```bash
   cd server
   npm install
   # Run Seed Script
   node scripts/seed.js
   # Start Server
   npm run dev
   ```

3. **Setup Client**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---

## 🌐 Render Deployment Blueprint (`render.yaml`)

This project includes a `render.yaml` blueprint for 1-click deployment on Render:

1. Connect your GitHub repository to **Render**.
2. Select **Blueprints** -> **New Blueprint Instance**.
3. Render will automatically detect `render.yaml` and provision:
   - `ticketharbor-backend` (Node.js web service)
   - `ticketharbor-frontend` (Static Site with SPA fallback)
4. Add environment variables:
   - `MONGO_URI` / `MONGODB_URI`
   - `CLIENT_URL`
