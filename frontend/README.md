# Parking App Frontend

A React-based mobile-first frontend for the Smart Parking application, matching the prototype at https://parkingapp.evolvv.app/

## Features

- **Authentication**: Login and Register screens with Supabase integration
- **Dashboard**: Statistics overview (vehicles, active sessions, transactions)
- **Vehicles Management**: Add, edit, and soft delete vehicles with license plate validation
- **Parking Sessions**: View parking sessions with vehicle filtering
- **Transactions**: Manage transactions with payment method and status tracking
- **Profile**: View and update user profile information
- **Role-based Access**: Supports User, Manager, Driver, and Super Admin roles

## Tech Stack

- React 18
- Vite
- React Router DOM
- Supabase (for backend integration)
- CSS (mobile-first, responsive design)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in the code (using backend/.env values):
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── BottomNav.jsx    # Bottom navigation bar
│   ├── VehicleCard.jsx  # Vehicle card component
│   ├── TransactionCard.jsx
│   └── ParkingSessionCard.jsx
├── pages/               # Page components
│   ├── Home.jsx         # Home screen (matches prototype)
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Vehicles.jsx
│   ├── ParkingSessions.jsx
│   ├── Transactions.jsx
│   └── Profile.jsx
├── lib/
│   └── supabase.js      # Supabase client configuration
├── styles/
│   └── buttons.css      # Shared button styles
├── App.jsx              # Main app component with routing
└── main.jsx             # Entry point
```

## Dummy Data

The app includes dummy data with the following UUIDs:
- John Doe: 2 vehicles (a47c5498-7344-4e79-babb-75e4f5f01096 and second vehicle)
- James Cameron: 1 vehicle (6cbaeed9-5f6e-49ed-99b2-70b58a0f0dd9)
- Phoenix Mall site: 32112460-fb7a-4958-b871-8d78d74dd157

## Validation

- License plate format: XX XX XX XXXX (e.g., MH 12 AB 1234)
- Payment methods: upi, netbanking, card, cash
- Transaction status: pending, completed, failed
- Soft delete for vehicles (sets is_active to false)

## Design

The UI matches the prototype exactly:
- Mobile-first responsive design
- Blue/purple gradient header
- Card-based layouts
- Bottom navigation bar
- Consistent spacing and typography

