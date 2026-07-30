import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api';

const storedUser  = JSON.parse(localStorage.getItem('x1_user')  || 'null');
const storedToken = localStorage.getItem('x1_token') || null;

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.login(creds);
    localStorage.setItem('x1_token', data.token);
    localStorage.setItem('x1_user', JSON.stringify(data.user));
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const signup = createAsyncThunk('auth/signup', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.signup(formData);
    localStorage.setItem('x1_token', data.token);
    localStorage.setItem('x1_user', JSON.stringify(data.user));
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Signup failed'); }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.getMe();
    localStorage.setItem('x1_user', JSON.stringify(data.user));
    return data.user;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await authAPI.logout(); } catch {}
  localStorage.removeItem('x1_token');
  localStorage.removeItem('x1_user');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    storedUser,
    token:   storedToken,
    loading: false,
    error:   null,
    isAuthenticated: !!storedToken,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser:    (state, { payload }) => {
      state.user = payload;
      localStorage.setItem('x1_user', JSON.stringify(payload));
    },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true;  state.error = null; };
    const rejected = (state, { payload }) => { state.loading = false; state.error = payload; };

    builder
      .addCase(login.pending,   pending)
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false; state.user = payload.user; state.token = payload.token; state.isAuthenticated = true;
      })
      .addCase(login.rejected,  rejected)

      .addCase(signup.pending,   pending)
      .addCase(signup.fulfilled, (state, { payload }) => {
        state.loading = false; state.user = payload.user; state.token = payload.token; state.isAuthenticated = true;
      })
      .addCase(signup.rejected,  rejected)

      .addCase(getMe.fulfilled, (state, { payload }) => { state.user = payload; })

      .addCase(logout.fulfilled, (state) => {
        state.user = null; state.token = null; state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
