import type { Module } from "../types";
import { qq } from "../types";

export const coffee: Module = {
  id: "coffee",
  name: "Coffee & McCafé basics",
  summary: "Origins, language of coffee, storage, opening checks, and the March 2024 blend.",
  flows: [
    {
      title: "Bean to cup",
      steps: [
        { t: "Green bean", d: "Grown in about 70 countries" },
        { t: "Roast", d: "12–15 min, above 200°C" },
        { t: "Grind", d: "Match the basket to the dose" },
        { t: "Extract", d: "Water 88–92°C" },
        { t: "Crema", d: "Golden layer shows quality" },
      ],
    },
    {
      title: "Four enemies of coffee",
      steps: [
        { t: "Light", d: "Keep beans in the dark" },
        { t: "Heat", d: "Away from machines" },
        { t: "Oxygen", d: "Airtight container" },
        { t: "Moisture", d: "No fridge or freezer" },
      ],
    },
    {
      title: "Broken glass",
      steps: [
        { t: "Isolate", d: "Barriers, safety first" },
        { t: "Remove food", d: "Replace it with a smile" },
        { t: "Discard", d: "Rigid container, then dumpster" },
        { t: "Record", d: "Tell the manager" },
      ],
    },
  ],
  notes: [
    { lv: 0, text: "Coffee grows in about 70 countries. The top three producers are Brazil, Vietnam, and Colombia. More than one billion cups are drunk every day. In dollars traded, coffee ranks second to oil." },
    { lv: 0, text: "March 2024 SOP: McCafé coffee is from Guatemala, Colombia, Costa Rica, and Ethiopia. Manager notes give the blend as 20% Costa Rica, 20% Guatemala, 30% Colombia, 15% Ethiopian wet-process, and 15% Ethiopian sun-dried, roasted by Café Najjar in Beirut. An older quiz answer listed Brazil instead of this origin." },
    { lv: 0, text: "Arabica grows higher, up to 2000 m, with richer flavour and more acidity. Robusta grows up to 800 m, has more caffeine and less acidity, and is used in espresso blends for body and crema. A plant can reach 10 m if it is not pruned. First fruit in 3–5 years, about 40 cups a year, productive for up to 50 years." },
    { lv: 1, text: "Fragrance is released when beans are roasted and again when they are ground. Aroma is the smell when hot water hits the grounds. Body is weight on the tongue. Crema is the golden oil cap that holds aroma. Acidity is a crisp, sharp taste. A light roast keeps the most acidity, called bite. Decaf must be under 0.1% caffeine." },
    { lv: 1, text: "Store open beans airtight, cool, dark, and dry. Never in the fridge or freezer, and never beside the machine. Empty and clean the hopper each night. Beans stay in the hopper for 4 hours at most. Low volume: keep the hopper under half full." },
    { lv: 1, text: "Milk thermometer: 50% ice and 50% cold water, stem at least 5 cm deep, wait 30 seconds, target 0°C ±1°C. Do the crema test every morning. Half a packet of sugar should rest on the crema, then sink slowly. After 2–3 stirs the crema should reform." },
    { lv: 2, text: "Wash hands at least every 60 minutes for 20 seconds with antimicrobial handwash, and again whenever needed. Cloth bucket: half a sanitiser packet in 4.75 L warm water, three-quarters full, changed every 4 hours." },
    { lv: 2, text: "Counter experience time is 5 minutes. Two deep is too deep. Time starts when the guest joins the queue and ends at farewell. Minimum stock before opening: 24 hours of paper and 2 hours of refrigerated product. Open cuts: blue adhesive strip plus a glove." },
  ],
  questions: [
    qq("How long does coffee roasting typically take?", "About 12–15 minutes", "5–8 minutes", "25–30 minutes", "45–60 minutes", "Green beans are heated in a drum for about 12–15 minutes at temperatures that can exceed 200°C.", 0),
    qq("Arabica is grown at altitudes up to…", "2000 m", "500 m", "800 m", "3500 m", "Arabica grows up to 2000 m and is richer, with higher acidity. Robusta grows up to 800 m.", 0),
    qq("Which bean is used in espresso blends for more body and crema?", "Robusta", "Arabica", "Decaf only", "Green tea", "Robusta has more caffeine and less acidity, and it adds body and crema.", 0),
    qq("March 2024 SOP: McCafé coffee comes from…", "Guatemala, Colombia, Costa Rica and Ethiopia", "Brazil, Colombia and Costa Rica", "Vietnam, India and Kenya", "Mexico, Peru and Indonesia", "The Coffee Origin section of the March 2024 SOP names Guatemala, Colombia, Costa Rica, and Ethiopia. Brazil is a top producer, not the stated McCafé origin.", 1),
    qq("Milk thermometer calibration: ice water mix and target reading?", "50% ice / 50% cold water, 0°C ±1°C", "60% ice / 40% water, 4°C", "Hot water, 60°C", "Ice only, −2°C", "Immerse the stem at least 5 cm, wait 30 seconds, and adjust if the reading is outside 0°C ±1°C.", 1),
    qq("How should opened coffee beans be stored?", "Airtight container, cool dark dry place", "In the freezer", "In the fridge", "Next to the espresso machine", "Keep beans away from light, heat, oxygen, and moisture. Never use the fridge, freezer, or a spot near heat.", 1),
    qq("How often should cloth buckets of sanitised water be changed?", "Every 4 hours", "Every 1 hour", "Every 8 hours", "Once a day", "Sanitiser mix: half a packet in 4.75 L warm water, filled to three-quarters.", 2),
    qq("Wash hands at least every… using antimicrobial handwash for 20 seconds", "60 minutes", "30 minutes", "2 hours", "Each shift", "Rewash whenever needed, and at least once an hour.", 2),
    qq("Experience time for counter service is…", "5 minutes (2 deep is too deep)", "2 minutes", "10 minutes", "15 minutes", "It starts when the guest joins the queue and ends when they are farewelled.", 2),
    qq("Who is the goat herder in the famous coffee legend?", "Kaldi", "Kenzo", "Karim", "Kofi", "Kaldi, in Ethiopia around 600 AD, saw goats become lively after eating the berries.", 0),
    qq("Where was the first successful coffee planting outside Arabia?", "Java, in 1699", "Brazil, in 1850", "Kenya, in 1700", "Turkey, in 1500", "The Dutch planted coffee on the island of Java.", 2),
    qq("A coffee tree gives about how many cups a year, and first fruits after?", "About 40 cups; 3–5 years", "About 400 cups; 1 year", "About 4 cups; 10 years", "About 100 cups; 8 years", "A well-kept plant can stay productive for up to 50 years.", 1),
    qq("Coffee ranks second to what in dollars traded?", "Oil", "Gold", "Wheat", "Sugar", "More than one billion cups are drunk every day.", 0),
    qq("Which roast has the highest acidity, or bite?", "Light roast", "Dark roast", "Decaf only", "All roasts are the same", "Roasting removes some of the acidity, so a light roast keeps the most bite.", 1),
    qq("Fragrance is released…", "When beans are roasted and again when ground", "Only when the coffee is brewed", "When beans are packed", "When milk is added", "Aroma is what you smell when hot water hits the grounds.", 0),
    qq("Opening crema test: what should sugar crystals do on the crema?", "Rest briefly, then sink slowly", "Sink instantly", "Float forever", "Dissolve at once", "Use half a packet of sugar. After stirring two or three times, the crema should reform.", 2),
    qq("Minimum stock check before opening?", "24 hours paper / 2 hours refrigerated", "1 hour paper / 1 hour fridge", "7 days of everything", "No minimum", "Also check that equipment is clean, safe, and free of electrical damage.", 2),
    qq("Open cuts or sores on hands must be…", "Covered with a blue adhesive strip and a glove", "Left open", "Covered by a tissue", "Ignored if small", "Hands are washed every hour and whenever needed.", 1),
    qq("The three highest coffee-producing countries are…", "Brazil, Vietnam and Colombia", "Ethiopia, Yemen and Java", "Costa Rica, Kenya and Peru", "India, Mexico and Indonesia", "Stated in the March 2024 SOP introduction. This is production rank, not the McCafé origin list.", 1),
    qq("Roasted beans may be called decaffeinated only if caffeine is…", "Under 0.1%", "Under 1%", "Under 2%", "Zero, with no trace allowed", "Caffeine is removed from the green beans. The roasted beans must stay under 0.1%.", 2),
    qq("Left unpruned, a coffee plant would grow to about…", "10 metres", "2 metres", "25 metres", "50 centimetres", "On plantations the plants are pruned so the fruit can be harvested.", 1),
    qq("Manager notes: Colombia’s share of the McCafé blend is…", "30%", "50%", "15%", "20% only, with no Colombia", "The same notes list 20% Costa Rica, 20% Guatemala, 15% Ethiopian wet-process, and 15% Ethiopian sun-dried.", 2),
    qq("Manager notes: who roasts the McCafé blend?", "Café Najjar, Beirut", "A roaster in Brazil", "The restaurant", "Melitta, on site", "The blend is described as medium-dark, full-bodied, with fruity, floral, and chocolate notes.", 2),
    qq("Crema is produced by…", "Oil in the beans", "Added butter", "Milk foam", "Sugar crystals", "It looks a little like honey and forms a cap that holds aroma and flavour in the cup.", 1),
  ],
};
