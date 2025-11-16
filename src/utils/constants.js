// Tag emoji mapping for categories
export const TAG_EMOJIS = {
    basics: "📚",
    greetings: "👋",
    everyday: "🌞",
    family: "🐶",
    food: "🍜",
    work: "💼",
    questions: "❓",
    shopping: "🛒",
    restaurant: "🍽️",
    cooking: "👨‍🍳",
    hobbies: "🎨",
    holidays: "🎉",
    health: "🏥",
    travel: "✈️",
    directions: "🗺️",
    time: "⏰",
    weather: "🌤️",
    numbers: "🔢",
    colors: "🎨",
    animals: "🐾",
    body: "🧍",
    clothing: "👔",
    emotions: "😊",
    home: "🏠",
    transportation: "🚗",
    education: "🎓",
    sports: "⚽",
    nature: "🌳",
    technology: "💻",
    default: "🏷️",
    places: "🏠",
    pronouns: "👤",
};

/**
 * Get emoji for a given tag
 * @param {string} tag - The tag name
 * @returns {string} The emoji for the tag
 */
export const getTagEmoji = (tag) => {
    const lowerTag = tag.toLowerCase();
    return TAG_EMOJIS[lowerTag] || TAG_EMOJIS["default"];
};

// Update interval for background images and tips rotation (5 minutes)
export const BACKGROUND_UPDATE_INTERVAL = 300000;

// TTS configuration
export const TTS_CONFIG = {
    languageCode: "vi-VN",
    voiceName: "vi-VN-Wavenet-A",
    ssmlGender: "FEMALE",
    audioEncoding: "MP3",
    pitch: 0,
    speakingRate: 0.9, // Slightly slower for learning
};
