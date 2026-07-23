'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../lib/store'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { useGetProfileQuery } from '../lib/features/user/userApi'
import { setUser, logout, setCredentials, setAuthInitialized } from '../lib/features/auth/authSlice'
import { restoreVideoUploadState } from '../lib/features/post/videoUploadSlice'

function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state) => state.auth);

  // Restore credentials from localStorage on mount (prevents SSR hydration error)
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUserStr = localStorage.getItem('user');
      const storedUser = storedUserStr ? JSON.parse(storedUserStr) : undefined;
      
      if (storedToken && storedRefreshToken) {
        dispatch(setCredentials({
          accessToken: storedToken,
          refreshToken: storedRefreshToken,
          user: storedUser,
        }));
        // setCredentials already calls setCookie internally, so the cookie
        // will be (re)set here on every page refresh too.
      }
    } catch (e) {
      console.warn('Failed to restore auth session:', e);
    } finally {
      dispatch(setAuthInitialized(true));
    }
  }, [dispatch]);

  // Call profile query if accessToken is present (restores user on app mount)
  const { data, error, isSuccess } = useGetProfileQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (isSuccess && data?.user) {
      dispatch(setUser(data.user));
    }
  }, [isSuccess, data, dispatch]);

  useEffect(() => {
    if (error) {
      const status = (error as any)?.status;
      if (status === 401 || status === 403) {
        dispatch(logout());
      }
    }
  }, [error, dispatch]);

  return <>{children}</>;
}

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()

    if (typeof window !== 'undefined') {
      try {
        const savedVideoState = localStorage.getItem('videoUploadState');
        if (savedVideoState) {
          const parsedState = JSON.parse(savedVideoState);
          // Only restore if it's currently processing to avoid stuck states from old failed runs
          if (parsedState?.isProcessing) {
            storeRef.current.dispatch(restoreVideoUploadState(parsedState));
          }
        }
      } catch (e) {
        console.warn('Failed to restore video upload state:', e);
      }

      storeRef.current.subscribe(() => {
        const state = storeRef.current?.getState().videoUpload;
        if (state) {
          if (state.isProcessing) {
            localStorage.setItem('videoUploadState', JSON.stringify(state));
          } else {
            localStorage.removeItem('videoUploadState');
          }
        }
      });
    }
  }

  return (
    <Provider store={storeRef.current}>
      <AuthInit>{children}</AuthInit>
    </Provider>
  )
}