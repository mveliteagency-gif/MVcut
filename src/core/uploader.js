// Global Media Uploader & File Importer for MVcut Pro
import { store } from './state.js';

// Global reactive uploaded media storage
export const globalMediaLibrary = [];

export function openGlobalMediaPicker({ onSuccess = () => {} } = {}) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = 'video/*,image/*,audio/*,.mp4,.mov,.webm,.mkv,.avi,.jpg,.jpeg,.png,.webp,.gif,.mp3,.wav,.m4a,.ogg';
  input.style.display = 'none';
  document.body.appendChild(input);

  input.addEventListener('change', (e) => {
    handleMediaFiles(e.target.files);
    document.body.removeChild(input);
    onSuccess();
  });

  input.click();
}

export function handleMediaFiles(files) {
  if (!files || !files.length) return;

  Array.from(files).forEach((file) => {
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video') || /\.(mp4|mov|webm|mkv|avi)$/i.test(file.name);
    const isImage = file.type.startsWith('image') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);
    const isAudio = file.type.startsWith('audio') || /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name);

    if (isVideo) {
      const video = document.createElement('video');
      video.src = url;
      video.preload = 'auto';
      video.playsInline = true;
      video.muted = false;

      const onVideoReady = () => {
        const dur = (isFinite(video.duration) && video.duration > 0) ? video.duration : 10.0;
        
        let thumb = null;
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 320;
          canvas.height = 180;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, 320, 180);
          thumb = canvas.toDataURL('image/jpeg', 0.7);
        } catch (err) {}

        const mediaItem = {
          id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          type: 'video',
          duration: dur,
          element: video,
          thumb: thumb
        };

        globalMediaLibrary.push(mediaItem);

        // Add clip to video track
        store.addClip({
          trackId: 't-video',
          name: file.name,
          type: 'video',
          duration: Math.min(dur, 30),
          sourceDuration: dur,
          sourceElement: video
        });

        store.emit('media:imported', mediaItem);
      };

      if (video.readyState >= 1) {
        onVideoReady();
      } else {
        video.onloadedmetadata = onVideoReady;
      }
    } else if (isImage) {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const mediaItem = {
          id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          type: 'image',
          duration: 5.0,
          element: img,
          thumb: url
        };

        globalMediaLibrary.push(mediaItem);

        store.addClip({
          trackId: 't-video',
          name: file.name,
          type: 'image',
          duration: 5.0,
          sourceDuration: 5.0,
          sourceElement: img
        });

        store.emit('media:imported', mediaItem);
      };
    } else if (isAudio) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.onloadedmetadata = () => {
        const dur = (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : 15.0;
        const mediaItem = {
          id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          type: 'audio',
          duration: dur,
          element: audio,
          thumb: null
        };

        globalMediaLibrary.push(mediaItem);

        store.addClip({
          trackId: 't-audio',
          name: file.name,
          type: 'audio',
          duration: Math.min(dur, 45),
          sourceDuration: dur,
          sourceElement: audio
        });

        store.emit('media:imported', mediaItem);
      };
    }
  });
}
