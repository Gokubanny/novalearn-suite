import axios from 'axios';
import FormData from 'form-data';

/**
 * Calls the Python face recognition service with retry + backoff.
 * Tuned for Render free-tier cold starts (2-3 min): the first attempt
 * often fails while the service is still waking up, then the retry
 * succeeds once it's warm.
 *
 * Each individual attempt times out at 30s — if a response takes
 * exactly ~30,000ms, that's this axios timeout firing, not a bug in
 * the face service itself. Cross-check the face service logs at that
 * timestamp before assuming a code issue.
 */
export const callFaceServiceWithRetry = async (
  url: string,
  getFormData: () => FormData, // fresh FormData per attempt — a used stream can't be resent
  headers: Record<string, string>,
  maxRetries: number = 2,
  retryDelay: number = 120000
): Promise<any> => {
  let lastError: any;
  let delay = retryDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Face service attempt ${attempt}/${maxRetries}: ${url}`);
      const formData = getFormData();

      const response = await axios.post(url, formData, {
        headers: { ...formData.getHeaders(), ...headers },
        timeout: 30000,
      });

      console.log(`Face service attempt ${attempt} succeeded`);
      return response;
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error.response?.status === 429;
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      const isServerError = error.response?.status >= 500;

      console.log(`Face service attempt ${attempt} failed:`, {
        status: error.response?.status,
        code: error.code,
        message: error.message,
      });

      if ((isRateLimit || isTimeout || isServerError) && attempt < maxRetries) {
        const waitTime = delay + Math.random() * 500;
        console.log(`Retrying face service in ${Math.round(waitTime)}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }

  throw lastError;
};