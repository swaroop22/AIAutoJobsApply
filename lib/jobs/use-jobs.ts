'use client';

import { useEffect, useState } from 'react';
import type { JobPosting } from '@/lib/app-db/types';

type JobsResponse = { jobs: JobPosting[]; fetchedAt: string };

let cache: JobsResponse | null = null;
let inflight: Promise<JobsResponse> | null = null;

async function loadJobs(): Promise<JobsResponse> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetch('/api/jobs')
      .then((res) => {
        if (!res.ok) throw new Error(`Job feed returned ${res.status}`);
        return res.json();
      })
      .then((data: JobsResponse) => {
        cache = data;
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useJobs() {
  const [data, setData] = useState<JobsResponse | null>(cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) return;
    let cancelled = false;
    loadJobs()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load jobs');
      });
    return () => {
      cancelled = true;
    };
  }, [data]);

  return {
    jobs: data?.jobs ?? [],
    fetchedAt: data?.fetchedAt,
    loading: !data && !error,
    error,
  };
}
