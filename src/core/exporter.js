// Video Exporter Pipeline for MVcut Pro (MediaRecorder / Canvas Stream + Web Audio)
import { store } from './state.js';
import { getExportAudioTracks, setMonitorMuted, resumeAudio } from './audioEngine.js';

export async function exportProject({
  renderer,
  resolution = '1080p',
  fps = 30,
  onProgress = () => {},
  onComplete = () => {},
  onError = () => {}
}) {
  const canvas = renderer.canvas;
  const state = store.getState();
  const totalDuration = state.duration;

  // Save previous playhead state
  const prevTime = state.currentTime;
  const wasPlaying = state.isPlaying;
  store.pause();

  try {
    resumeAudio();
    setMonitorMuted(true);

    // Select supported mime type
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')) {
      mimeType = 'video/mp4;codecs=avc1,mp4a.40.2';
    } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
      mimeType = 'video/mp4;codecs=avc1';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      mimeType = 'video/webm;codecs=vp8,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    }

    const stream = canvas.captureStream(fps);
    const audioTracks = getExportAudioTracks();
    audioTracks.forEach(track => stream.addTrack(track));

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: resolution === '4k' ? 25000000 : 8000000
    });

    const recordedChunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      setMonitorMuted(false);
      const blob = new Blob(recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const filename = `${state.projectTitle || 'video'}_${resolution}_PRO.${ext}`;

      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Restore user playhead
      store.setCurrentTime(prevTime);
      if (wasPlaying) store.play();

      onComplete({ url, blob, filename });
    };

    mediaRecorder.start();

    // Frame-by-frame export
    const frameInterval = 1 / fps;
    let exportCurrentTime = 0;

    const renderStep = () => {
      if (exportCurrentTime <= totalDuration) {
        store.setCurrentTime(exportCurrentTime);
        renderer.renderFrame();

        const percent = Math.min(100, Math.round((exportCurrentTime / totalDuration) * 100));
        onProgress(percent);

        exportCurrentTime += frameInterval;
        setTimeout(renderStep, 1000 / fps);
      } else {
        onProgress(100);
        setTimeout(() => {
          try {
            mediaRecorder.stop();
          } catch (e) {
            setMonitorMuted(false);
          }
        }, 300);
      }
    };

    renderStep();

  } catch (err) {
    console.error('Export error:', err);
    setMonitorMuted(false);
    store.setCurrentTime(prevTime);
    onError(err);
  }
}
