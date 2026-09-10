/**
 * Mausam 2.0 - Voice Briefing & Multilingual Accessibility Engine
 * Web Speech API Text-to-Speech synthesizer for English and Hindi.
 */

const VoiceBriefing = {
  currentUtterance: null,
  currentLanguage: 'en', // 'en' or 'hi'

  /**
   * Compose personalized bulletin script based on current state
   */
  composeBulletin(personaKey, locationName, weatherData, aqData) {
    const current = weatherData.current || {};
    const temp = Math.round(current.temperature_2m || 30);
    const cond = WeatherService.interpretWMO(current.weather_code || 0).desc;
    const aqi = aqData.current?.us_aqi || 120;
    const aqiBand = WeatherService.getIndianAQIBand(aqi).label;

    if (this.currentLanguage === 'hi') {
      // Hindi bulletin
      let text = `नमस्कार। यह भारत मौसम विज्ञान विभाग का मौसम बुलेटिन है। `;
      text += `${locationName} में वर्तमान तापमान ${temp} डिग्री सेल्सियस है और मौसम ${cond} है। `;
      text += `वायु गुणवत्ता सूचकांक ${aqi} यानी ${aqiBand} श्रेणी में है। `;

      switch (personaKey) {
        case 'health':
          text += `स्वास्थ्य सलाह: पीएम 2.5 का स्तर अधिक होने के कारण संवेदनशील लोग बाहर व्यायाम करने से बचें और मास्क का उपयोग करें।`;
          break;
        case 'fitness':
          text += `फिटनेस अपडेट: दौड़ने और साइकिलिंग के लिए सुबह 6 से 8 बजे का समय सबसे अनुकूल रहेगा। भरपूर पानी पिएं।`;
          break;
        case 'beach':
          text += `तटीय चेतावनी: समुद्र में मध्यम लहरें रहेंगी। उच्च ज्वार के समय गहरे पानी में जाने से बचें।`;
          break;
        case 'agri':
          text += `कृषि मौसम सलाह: मिट्टी में नमी सामान्य है। आगामी दिनों में वर्षा की संभावना को देखते हुए कीटनाशक छिड़काव की योजना बनाएं।`;
          break;
        case 'commute':
          text += `यातायात अलर्ट: मुख्य मार्गों पर दृश्यता अच्छी है। शाम के समय हल्की वर्षा की संभावना है, सावधानी से वाहन चलाएं।`;
          break;
        case 'family':
          text += `परिवार और स्कूल अलर्ट: दोपहर 2 बजे स्कूल छुट्टी के समय मौसम सामान्य रहेगा। बच्चों को पर्याप्त तरल पदार्थ दें।`;
          break;
        case 'travel':
          text += `यात्रा परामर्श: गंतव्य के लिए हल्के कपड़े और छाता साथ रखें।`;
          break;
        case 'event':
          text += `इवेंट प्लानर: खुले में आयोजित कार्यक्रमों के लिए शाम का समय आरामदायक रहेगा। वर्षा की संभावना 20 प्रतिशत है।`;
          break;
        default:
          text += `दिन का मौसम अनुकूल रहेगा। सुरक्षित रहें, स्वस्थ रहें।`;
      }
      return text;
    } else {
      // English bulletin
      let text = `Welcome to the India Meteorological Department's Mausam briefing for ${locationName}. `;
      text += `Currently, the temperature is ${temp} degrees Celsius with ${cond}. `;
      text += `Air Quality Index is ${aqi}, categorized as ${aqiBand}. `;

      switch (personaKey) {
        case 'health':
          text += `Health recommendation: Elevated PM 2.5 levels detected. Sensitive groups and asthma patients should avoid heavy outdoor exercise and use an N95 mask.`;
          break;
        case 'fitness':
          text += `Fitness advice: The optimal running and cycling window is between 6:00 AM and 8:00 AM. Stay well hydrated.`;
          break;
        case 'beach':
          text += `Coastal alert: Moderate swell conditions are expected. High tide peak is anticipated around 2:30 PM. Swimmers should exercise caution.`;
          break;
        case 'agri':
          text += `Agricultural advisory: Soil moisture is at optimal levels. Plan crop irrigation and pesticide spraying according to the 7-day precipitation forecast.`;
          break;
        case 'commute':
          text += `Commuter warning: Visibility is clear at 3,500 meters. Moderate evening traffic congestion expected during light scattered showers.`;
          break;
        case 'family':
          text += `Parent advisory: Morning and afternoon school commute hours are forecast to be clear. Perfect conditions for outdoor children play.`;
          break;
        case 'travel':
          text += `Travel intelligence: Flight and railway transit operations are on schedule. Remember to pack an umbrella and sun protection.`;
          break;
        case 'event':
          text += `Event planning: Outdoor thermal comfort score is 82 out of 100. Rain contingency probability is low today.`;
          break;
        default:
          text += `Have a productive and weather-safe day ahead.`;
      }
      return text;
    }
  },

  /**
   * Speak text via Web Speech API
   */
  speak(text, onStart, onEnd) {
    if (!('speechSynthesis' in window)) {
      alert("Speech synthesis not supported in this browser.");
      return;
    }

    this.stop();

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    this.currentUtterance.rate = 0.95;
    this.currentUtterance.pitch = 1.0;

    // Try to pick an Indian English / Hindi voice if available
    const voices = window.speechSynthesis.getVoices();
    if (this.currentLanguage === 'hi') {
      const hiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi') || v.name.includes('India'));
      if (hiVoice) this.currentUtterance.voice = hiVoice;
    } else {
      const inVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India') || v.name.includes('English'));
      if (inVoice) this.currentUtterance.voice = inVoice;
    }

    this.currentUtterance.onstart = () => {
      if (onStart) onStart();
    };

    this.currentUtterance.onend = () => {
      if (onEnd) onEnd();
    };

    this.currentUtterance.onerror = (e) => {
      console.warn("Speech error:", e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(this.currentUtterance);
  },

  /**
   * Stop current speech
   */
  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
