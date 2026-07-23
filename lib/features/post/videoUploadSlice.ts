import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VideoUploadState {
  isProcessing: boolean;
  postId: string | null;
  progress: number;
  status: string; // 'processing', 'completed', 'failed', ''
}

const initialState: VideoUploadState = {
  isProcessing: false,
  postId: null,
  progress: 0,
  status: '',
};

const videoUploadSlice = createSlice({
  name: 'videoUpload',
  initialState,
  reducers: {
    startVideoUpload: (state, action: PayloadAction<{ postId: string }>) => {
      state.isProcessing = true;
      state.postId = action.payload.postId;
      state.progress = 0;
      state.status = 'processing';
    },
    updateVideoProgress: (state, action: PayloadAction<{ progress: number; status: string }>) => {
      state.progress = action.payload.progress;
      state.status = action.payload.status;
    },
    clearVideoUpload: (state) => {
      state.isProcessing = false;
      state.postId = null;
      state.progress = 0;
      state.status = '';
    },
    restoreVideoUploadState: (state, action: PayloadAction<VideoUploadState>) => {
      return action.payload;
    },
  },
});

export const { startVideoUpload, updateVideoProgress, clearVideoUpload, restoreVideoUploadState } = videoUploadSlice.actions;
export default videoUploadSlice.reducer;
