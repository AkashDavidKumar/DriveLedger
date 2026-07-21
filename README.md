# DriveLedger

**Personal Driver Work & Salary Manager**

DriveLedger is a personal, fully offline Android application built to help tractor, tipper, and cultivator drivers independently manage their daily work sessions, trips, and salary expectations without relying on internet connectivity or third-party servers.

## Key Features (Phase 1)

*   **Offline-First Architecture**: Built entirely on SQLite + Drizzle ORM. No cloud, no backend, no ads. Data never leaves your device.
*   **Daily Work Sessions**: Effortlessly start a live work session. Lock in rates (Per Hour, Per Day, Half Day) and log pickups/drops.
*   **Glove-Friendly Trip Counter**: A massive, simplified trip counter designed for real-world fieldwork conditions. 
*   **Salary Calculations**: Automatically calculates expected daily and hourly earnings.
*   **Salary & Payment Tracking**: Record payments securely. The app prevents accidental overpayments and calculates pending salaries dynamically.
*   **History Archives**: Fully searchable and filterable history screen showing every piece of completed work.

## Technology Stack

*   **Framework**: React Native + Expo (SDK 57)
*   **Language**: Strict TypeScript
*   **Database**: SQLite (`expo-sqlite`)
*   **ORM**: Drizzle ORM
*   **Styling**: NativeWind v4 (TailwindCSS)
*   **State & Validation**: React Hook Form + Zod
*   **Icons**: Ionicons

## Getting Started

### Prerequisites
* Node.js
* npm or yarn
* Expo Go app on your physical device, or an Android Emulator

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AkashDavidKumar/DriveLedger.git
   cd DriveLedger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npx expo start
   ```

## Project Structure
- `/src/database`: Drizzle schemas, migrations, and local SQLite connection logic.
- `/src/models`: Zod validation schemas for strict UI validation.
- `/src/navigation`: React Navigation Root, Stack, and Bottom Tab navigators.
- `/src/screens`: UI components grouped by feature (Dashboard, Work, Salary, Modals).
- `/src/services`: Centralized business logic (database queries, cascade deletions, salary math).

## License
Private Use Only.
