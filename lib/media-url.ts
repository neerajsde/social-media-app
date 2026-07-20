/**
 * Resolves storage keys returned by the API through the public CDN.
 * Existing absolute, data, and blob URLs are left unchanged for backwards
 * compatibility and local upload previews.
 */
export function getMediaUrl(url?: string): string | undefined {
  if (!url || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url)) {
    return url;
  }

  const cdnUrl = process.env.NEXT_PUBLIC_AWS_CDN_URL;
  if (!cdnUrl) {
    return url;
  }

  return `${cdnUrl.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
}
