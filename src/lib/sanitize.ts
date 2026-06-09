import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Uses DOMPurify to remove potentially dangerous elements and attributes.
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'u', 's', 'del', 'ins',
      'a', 'img',
      'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'figure', 'figcaption',
      'video', 'audio', 'source',
      'iframe'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id',
      'target', 'rel',
      'width', 'height',
      'controls', 'autoplay', 'loop', 'muted', 'poster',
      'type', 'frameborder', 'allowfullscreen',
      'style'
    ],
    ALLOW_DATA_ATTR: false,
    // Allow safe protocols only
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Sanitize style attributes to prevent CSS-based attacks
    SANITIZE_DOM: true,
    // Don't allow script URLs in href
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    FORBID_TAGS: ['script', 'style', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea']
  });
};
