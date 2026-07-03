import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { fetchCurrentUser } from '@/store/authSlice'
import App from './App'
import './styles/globals.css'

const token = localStorage.getItem('access_token')
if (token) {
  store.dispatch(fetchCurrentUser())
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
