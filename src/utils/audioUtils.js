/**
 * Convert base64 string to Blob
 * @param {string} base64 - Base64 encoded string
 * @param {string} mimeType - MIME type for the blob
 * @returns {Blob} The blob object
 */
export const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

/**
 * Play audio using Web Speech API fallback
 * @param {string} text - Text to speak
 */
export const playWithSpeechSynthesis = (text) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'vi-VN'
  speechSynthesis.speak(utterance)
}
