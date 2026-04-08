export function shareOnTwitter(postUrl, title) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(postUrl)}`;

  window.open(twitterUrl, "_blank", "noopener,noreferrer");
}

export function shareOnWhatsApp(postUrl, title) {
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${title} ${postUrl}`
  )}`;

  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

export function shareOnFacebook(postUrl) {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    postUrl
  )}`;

  window.open(facebookUrl, "_blank", "noopener,noreferrer");
}