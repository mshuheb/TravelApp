# TravelApp
TravelApp is a collaborative mobile platform for planning, organizing, and managing group or solo trips. Users can create itineraries, discover places, track shared expenses, and much more—all supported by robust authentication, cloud storage, and a modern, user-friendly React Native interface.
# 🚀 Features
- **User Authentication:** Secure signup/sign-in via email/password, Google, or Facebook, with JWT-based session management.
- **Profile Management:** Update your name, profile photo (upload to AWS S3), and manage your wishlist of places.
- **Trip Planning:** Create trips with detailed itineraries, daily activities, and collaborative tools.
- **Place & Activity Discovery:** Integrated with Google Places API for rich place details, photos, and reviews.
- **Wishlist:** Save and manage favorite spots for quick access and planning.
- **Expense Tracking:** Log, split, and comment on expenses among participants for each trip.
- **Notes:** Add, edit, and delete trip notes.
- **Media Handling:** Upload profile photos to AWS S3; use Cloudinary for trip backgrounds; fetch place images from Google Places.
- **Dark Mode:** System-wide dark/light theme toggle.
- **Collaborative:** Invite and manage participants, assign roles (host/traveler), and keep everyone in sync.
# 📸 Screenshots
<img width="250" alt="Screenshot_1754670789" src="https://github.com/user-attachments/assets/06d1e9f5-af9f-40cb-aabd-5a2d7d113ef9" />
<img width="250" alt="Screenshot_1754670723" src="https://github.com/user-attachments/assets/e6c8904b-9926-49ce-9a78-ef270aa9a7d9" />
<img width="250" alt="Screenshot_1754675098" src="https://github.com/user-attachments/assets/9bb41c01-9f4f-404b-9f8e-204d64dfb207" />
<img width="250" alt="Screenshot_1754671122" src="https://github.com/user-attachments/assets/33d8f726-f91d-4310-b042-e68ffdb920a5" />
<img width="250" alt="Screenshot_1754671135" src="https://github.com/user-attachments/assets/e7ae21eb-5be3-40f6-870d-19376adaa5ea" />
<img width="250" alt="Screenshot_1754671215" src="https://github.com/user-attachments/assets/540fa9ba-1a11-42b0-bb73-77fe0d0dbca7" />
<img width="250" alt="Screenshot_1754672594" src="https://github.com/user-attachments/assets/4c89d4b8-5f0e-4b89-9ca7-49e13ac3c2f5" />
<img width="250" alt="Screenshot_1754672910" src="https://github.com/user-attachments/assets/971d2ada-f188-4ae6-90ef-9d830c0377a8" />
<img width="250" alt="Screenshot_1754672705" src="https://github.com/user-attachments/assets/2c827836-0988-456b-8ae3-8d138acfd82f" />
<img width="250" alt="Screenshot_1754672710" src="https://github.com/user-attachments/assets/b68d107a-83ce-498c-9c60-447e2fa85602" />
<img width="250" alt="Screenshot_1754670637" src="https://github.com/user-attachments/assets/fc18736b-ecfe-4463-af6d-0fd684cde82b" /> 
<img width="250" alt="Screenshot_1754670643" src="https://github.com/user-attachments/assets/2bbccb3c-ecaa-4b35-9745-72a997a0b634" />
<img width="250" alt="Screenshot_1754670652" src="https://github.com/user-attachments/assets/751ccc77-54f7-46a1-9b52-761c731916f6" />

# 🛠️ Tech Stack
- **Frontend:** React Native
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT, bcrypt, Google OAuth, Facebook OAuth
- **Storage:**
  - **Media:** AWS S3 (profile photos), Cloudinary (default images), Google Places API (place images)
  - **Local:** AsyncStorage (tokens, theme), Multer (file upload)
- **APIs:** Google Places, Google Gemini (Generative AI chat)
- **Testing:** Jest, React Native Testing Library

# Getting Started
> **Note:**  [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup)

To start Metro:
```bash
# using npm
npm start

# OR using Yarn
yarn start
```
Command to start your Android or iOS app:

**For Android**
```bash
# using npm
npx react-native run-android

# OR using Yarn
yarn android
```

**For iOS**
```bash
# using npm
npx react-native run-ios

# OR using Yarn
yarn ios
```

# 🧪 Running Tests
```bash
npm test
