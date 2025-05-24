# Gebeya Home Rental Frontend

This is the frontend application for the Gebeya Home Rental platform, built with React and Vite.

## Features

- User authentication (login, register, profile management)
- Property browsing and searching
- Real-time chat between users
- Property management for owners
- Rental agreement management
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:

   ```
   VITE_API_URL=http://localhost:5000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
frontend/
├── public/          # Static files
├── src/
│   ├── components/  # Reusable components
│   ├── hooks/       # Custom React hooks
│   ├── pages/       # Page components
│   ├── App.jsx      # Main application component
│   ├── main.jsx     # Application entry point
│   └── index.css    # Global styles
├── index.html       # HTML template
├── package.json     # Project dependencies and scripts
├── vite.config.js   # Vite configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## Technologies Used

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Socket.IO Client
- Zustand (State Management)

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
