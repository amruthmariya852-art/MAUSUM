/**
 * Mausam 2.0 - AI Smart Packing & Travel Risk Engine
 * Generates tailored packing checklists based on destination forecast conditions.
 */

const PackingAdvisor = {
  /**
   * Generate intelligent packing list based on destination weather attributes
   */
  generatePackingList(destinationName, tempMax, tempMin, rainSum, pop, uvMax, windMax) {
    const categories = [
      {
        name: "Essential Weather Apparel",
        icon: "shirt",
        items: []
      },
      {
        name: "Footwear & Outdoor Gear",
        icon: "footprints",
        items: []
      },
      {
        name: "Health, Skin & Protection",
        icon: "shield-check",
        items: []
      },
      {
        name: "Travel Documents & Tech",
        icon: "briefcase",
        items: []
      }
    ];

    // 1. Rain / Monsoon checks
    if (rainSum > 5 || pop > 40) {
      categories[0].items.push({ text: "Compact Windproof Umbrella", essential: true, badge: "Rain Alert" });
      categories[0].items.push({ text: "Breathable Raincoat / Waterproof Poncho", essential: true, badge: "Monsoon" });
      categories[1].items.push({ text: "Waterproof or Quick-dry Footwear", essential: true });
      categories[3].items.push({ text: "Waterproof phone pouch / dry bag", essential: false });
    }

    // 2. Cold / Himalayan / Winter checks
    if (tempMin < 10) {
      categories[0].items.push({ text: "Thermal inners (Base layer)", essential: true, badge: "Coldwave" });
      categories[0].items.push({ text: "Heavy Down Jacket / Fleece Sweater", essential: true });
      categories[0].items.push({ text: "Woolen Beanie & Neck Gaiter", essential: false });
      categories[1].items.push({ text: "Woolen socks & insulated walking boots", essential: true });
      categories[2].items.push({ text: "Heavy cold-cream & lip balm", essential: true });
    } else if (tempMin < 18) {
      categories[0].items.push({ text: "Light jacket / Cardigan / Windcheater", essential: true, badge: "Mild Chill" });
    }

    // 3. Hot / Tropical / Summer checks
    if (tempMax > 34) {
      categories[0].items.push({ text: "Breathable pure cotton / linen clothing", essential: true, badge: "Heatwave" });
      categories[0].items.push({ text: "Wide-brim UV sun hat", essential: true });
      categories[2].items.push({ text: "Electrolyte ORS sachets (Hydration)", essential: true });
    }

    // 4. UV checks
    if (uvMax >= 6) {
      categories[2].items.push({ text: "Broad spectrum Sunscreen (SPF 50+ PA+++)", essential: true, badge: "High UV" });
      categories[2].items.push({ text: "UV-400 Polarized Sunglasses", essential: true });
    }

    // 5. Standard travel essentials
    categories[2].items.push({ text: "Personal First Aid & Anti-allergy medication", essential: true });
    categories[3].items.push({ text: "Universal travel adapter & 20,000mAh Power Bank", essential: true });
    categories[3].items.push({ text: "Govt ID Cards / E-tickets & Digital Transit passes", essential: true });

    return {
      destination: destinationName,
      summary: `Forecast for ${destinationName}: ${tempMin}°C to ${tempMax}°C with ${pop}% precipitation probability.`,
      categories: categories
    };
  }
};
