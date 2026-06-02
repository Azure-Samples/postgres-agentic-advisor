import { useState, useEffect, useRef } from 'react';
import axiosClient from '../client/axiosClient';

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 7 * 60 * 1000; // 7 minutes
const OVERLAY_DELAY_MS = 1000;

export const useHealthCheck = () => {
  const [isReady, setIsReady] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isError, setIsError] = useState(false);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadlineRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const timedOutRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    timedOutRef.current = false;

    delayRef.current = setTimeout(() => {
      if (mountedRef.current) setShowOverlay(true);
    }, OVERLAY_DELAY_MS);

    const check = async () => {
      if (!mountedRef.current || timedOutRef.current) return;

      try {
        const response = await axiosClient.get('/health/ready');
        if (!mountedRef.current || timedOutRef.current) return;

        if (response.status === 200) {
          if (delayRef.current) clearTimeout(delayRef.current);
          setIsReady(true);
          setShowOverlay(false);
          if (deadlineRef.current) clearTimeout(deadlineRef.current);
          return;
        }

        // HTTP error (404, 5xx, etc.) → show error state
        setIsError(true);
      } catch {
        // Network error / no response → backend may still be starting
      }

      if (mountedRef.current && !timedOutRef.current) {
        retryRef.current = setTimeout(check, POLL_INTERVAL_MS);
      }
    };

    // Hard stop after 7 minutes — show error, cancel any pending retry
    deadlineRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      timedOutRef.current = true;
      if (retryRef.current) clearTimeout(retryRef.current);
      setShowOverlay(true);
      setIsError(true);
    }, TIMEOUT_MS);

    check();

    return () => {
      mountedRef.current = false;
      if (retryRef.current) clearTimeout(retryRef.current);
      if (deadlineRef.current) clearTimeout(deadlineRef.current);
      if (delayRef.current) clearTimeout(delayRef.current);
    };
  }, []);

  return { isReady, showOverlay, isError };
};
