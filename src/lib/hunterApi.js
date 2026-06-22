export async function searchDomain(apiKey, domain) {
  const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    const msg = data.errors?.[0]?.details || `Hunter.io error ${res.status}`;
    throw new Error(msg);
  }

  return data.data?.emails || [];
}

export function extractDomain(websiteUrl) {
  try {
    const url = new URL(
      websiteUrl.startsWith('http') ? websiteUrl : 'https://' + websiteUrl
    );
    return url.hostname.replace(/^www\./, '');
  } catch {
    return websiteUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}
