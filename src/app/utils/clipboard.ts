/**
 * Copy text to clipboard with fallback for browsers that block the Clipboard API
 * @param text - Text to copy
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first (but silently fail if blocked)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Silently fallback - no warning needed as this is expected in some environments
    }
  }

  // Fallback to older execCommand method (works in more restricted environments)
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Make it invisible and non-interactive
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('aria-hidden', 'true');
    
    // Add to DOM
    document.body.appendChild(textarea);
    
    // Select the text (use setSelectionRange for better mobile support)
    textarea.focus();
    textarea.select();
    
    // For iOS compatibility
    const range = document.createRange();
    range.selectNodeContents(textarea);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    textarea.setSelectionRange(0, textarea.value.length);
    
    // Try to copy
    const successful = document.execCommand('copy');
    
    // Remove from DOM
    document.body.removeChild(textarea);
    
    if (successful) {
      return true;
    }
    
    throw new Error('execCommand copy failed');
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}