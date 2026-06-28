"use client"

import { fetchJson } from "@/lib/fetch-json"
import { useCallback, useEffect, useState } from "react"

type FeatureMap = Record<string, boolean>

let cachedFeatures: FeatureMap | null = null
let cachePromise: Promise<FeatureMap> | null = null

async function fetchFeatures(): Promise<FeatureMap> {
  if (cachedFeatures) return cachedFeatures
  if (cachePromise) return cachePromise

  cachePromise = fetchJson<{
    features: { featureKey: string; enabled: boolean }[]
  }>("/api/admin/features")
    .then((d) => {
      const map: FeatureMap = {}
      for (const f of d.features ?? []) {
        map[f.featureKey] = f.enabled
      }
      cachedFeatures = map
      return map
    })
    .catch(() => ({}))
    .finally(() => {
      cachePromise = null
    })

  return cachePromise
}

export function getCachedFeatures(): FeatureMap {
  return cachedFeatures ?? {}
}

export async function isFeatureEnabled(featureKey: string): Promise<boolean> {
  const features = await fetchFeatures()
  return features[featureKey] ?? true
}

export function useFeatureFlag(featureKey: string) {
  const [enabled, setEnabled] = useState(true)

  const check = useCallback(async () => {
    const val = await isFeatureEnabled(featureKey)
    setEnabled(val)
  }, [featureKey])

  useEffect(() => {
    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [check])

  return enabled
}

export function useFeatureFlags() {
  const [features, setFeatures] = useState<FeatureMap>(getCachedFeatures())

  useEffect(() => {
    fetchFeatures().then(setFeatures)
    const interval = setInterval(() => {
      fetchFeatures().then(setFeatures)
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  return features
}
