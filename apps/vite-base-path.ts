export interface FederatedBasePathOptions {
  explicitEnvKeys: string[];
  productionFallback: string;
}

const ensureTrailingSlash = (value: string): string => {
  if (!value) {
    return value;
  }

  if (value === '/' || value === './') {
    return value;
  }

  return value.endsWith('/') ? value : `${value}/`;
};

export const resolveFederatedBasePath = (
  mode: string,
  env: Record<string, string>,
  { explicitEnvKeys, productionFallback }: FederatedBasePathOptions,
): string => {
  const explicitBase = explicitEnvKeys
    .map((key) => env[key])
    .find((candidate) => candidate && candidate.trim().length > 0);

  if (explicitBase) {
    return ensureTrailingSlash(explicitBase.trim());
  }

  if (mode === 'development') {
    return '/';
  }

  return ensureTrailingSlash(productionFallback);
};
