export function fallbackPoster(title = "iMovies") {
  const safeTitle = String(title).replace(/[&<>"']/g, "").slice(0, 36) || "iMovies";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2a1020"/><stop offset="1" stop-color="#10111c"/></linearGradient></defs><rect width="400" height="600" fill="url(#g)"/><rect x="34" y="34" width="332" height="532" rx="20" fill="none" stroke="#ff304f" stroke-opacity=".75" stroke-width="2"/><path d="M152 232h96v96h-96z" fill="#ff304f" fill-opacity=".18"/><path d="M178 250l58 30-58 30z" fill="#ff304f"/><text x="200" y="390" fill="#f7f7fa" font-family="Arial, sans-serif" font-weight="700" font-size="22" text-anchor="middle">${safeTitle}</text><text x="200" y="424" fill="#a1a1af" font-family="Arial, sans-serif" font-size="14" text-anchor="middle">iMovies</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function handlePosterError(event, title) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallbackPoster(title);
}
