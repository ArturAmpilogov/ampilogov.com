// Keep reviewed metadata only when the actual file set and all hashes match.
export const preserveUnchangedBundle = (previous, next) => {
  const fingerprint = (bundle) => {
    if (!bundle?.path || !bundle.sha256 || !Array.isArray(bundle.fragments)) return null;
    const files = [{ path: bundle.path, sha256: bundle.sha256 }, ...bundle.fragments];
    if (files.some((file) => !file.path || !file.sha256)) return null;
    return JSON.stringify(files.map(({ path, sha256 }) => [path, sha256])
      .sort(([a], [b]) => a.localeCompare(b)));
  };
  const before = fingerprint(previous);
  return before !== null && before === fingerprint(next) ? previous : next;
};
