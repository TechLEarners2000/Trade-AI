import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authAPI } from '@/lib/api'
import type { AuthState, User } from '@/types'

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      return rejectWithValue(err.response?.data?.detail || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: { email: string; password: string; full_name: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      return rejectWithValue(err.response?.data?.detail || 'Registration failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getMe()
      return response.data
    } catch {
      return rejectWithValue('Failed to fetch user')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.accessToken = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
        state.user = action.payload.user
        localStorage.setItem('access_token', action.payload.access_token)
        localStorage.setItem('refresh_token', action.payload.refresh_token)
      })
      .addCase(loginUser.rejected, (state) => { state.isLoading = false })
      .addCase(registerUser.pending, (state) => { state.isLoading = true })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.accessToken = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
        state.user = action.payload.user
        localStorage.setItem('access_token', action.payload.access_token)
        localStorage.setItem('refresh_token', action.payload.refresh_token)
      })
      .addCase(registerUser.rejected, (state) => { state.isLoading = false })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout, setUser } = authSlice.actions
export default authSlice.reducer
