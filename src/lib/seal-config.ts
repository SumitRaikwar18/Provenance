import type { KeyServerConfig } from "@mysten/seal";

export interface PublicSealConfig {
  enabled: boolean;
  packageId: string;
  moduleName: string;
  threshold: number;
  keyServers: KeyServerConfig[];
}

function parseKeyServers(value: string | undefined): KeyServerConfig[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as KeyServerConfig[];
    if (Array.isArray(parsed)) {
      return parsed.filter((server) => server.objectId && Number(server.weight) > 0);
    }
  } catch {
    // Fall through to the comma-separated format.
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [objectId, weight = "1", aggregatorUrl] = part.split(":");
      return { objectId, weight: Number(weight), aggregatorUrl } satisfies KeyServerConfig;
    })
    .filter((server) => server.objectId && server.weight > 0);
}

export function getPublicSealConfig(): PublicSealConfig {
  const keyServers = parseKeyServers(process.env.NEXT_PUBLIC_SEAL_KEY_SERVERS);
  const threshold = Number(process.env.NEXT_PUBLIC_SEAL_THRESHOLD ?? "2");
  const packageId = process.env.NEXT_PUBLIC_SEAL_PACKAGE_ID ?? "";

  return {
    enabled: process.env.NEXT_PUBLIC_SEAL_ENABLED === "true" && Boolean(packageId) && keyServers.length > 0,
    packageId,
    moduleName: process.env.NEXT_PUBLIC_SEAL_MODULE ?? "provenance_private",
    threshold,
    keyServers,
  };
}

export function isSealThresholdConfigured() {
  const config = getPublicSealConfig();
  return config.enabled && config.threshold > 0 && config.threshold <= config.keyServers.length;
}
