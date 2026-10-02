import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/manrope'
import '@fontsource-variable/dm-sans'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import { AppearanceProvider } from './showcase/appearance'
import './styles.css'
import './brand-preview.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <AppearanceProvider>
        <App />
      </AppearanceProvider>
    </MotionConfig>
  </React.StrictMode>,
)
