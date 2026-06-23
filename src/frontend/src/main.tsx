import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="279859455145-qmm0hogj3eqe2kdp6fnaoggd99sfktla.apps.googleusercontent.com">
        <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)