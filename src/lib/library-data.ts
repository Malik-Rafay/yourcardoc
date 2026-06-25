export type LibraryArticle = {
  id: string;
  category: string;
  title: string;
  description: string;
  symptoms: string[];
  fix: string;
  cost: string;
};

export const LIBRARY_CATEGORIES = [
  "Engine",
  "Brakes",
  "Transmission",
  "Electrical",
  "AC/Heating",
  "Tires",
  "Fluids",
] as const;

export const LIBRARY: LibraryArticle[] = [
  {
    id: "worn-brake-pads",
    category: "Brakes",
    title: "Worn Brake Pads",
    description: "Brake pads wear down with use. When the friction material is thin, braking distance increases and you'll hear a squeal from the wear indicator.",
    symptoms: ["High-pitched squeal when braking", "Longer stopping distance", "Vibration through pedal"],
    fix: "Lift the car, remove the wheel, unbolt the caliper, slide out old pads, compress the piston, install new pads, reassemble. Bed in the new pads with 10-15 moderate stops.",
    cost: "€60–€150 per axle (DIY parts); €180–€350 at a mechanic.",
  },
  {
    id: "battery-dead",
    category: "Electrical",
    title: "Dead or Weak Battery",
    description: "A 12V battery typically lasts 3–5 years. Cold weather, parasitic drain, or a failing alternator can shorten its life.",
    symptoms: ["Slow cranking", "Dim headlights", "Clicking when turning the key", "Dashboard warning lights"],
    fix: "Test voltage (should be 12.6V at rest). Clean terminals. If under 12.4V after a full charge, replace the battery. Match group size and CCA rating.",
    cost: "€80–€200 for parts; €120–€280 installed.",
  },
  {
    id: "overheating",
    category: "Engine",
    title: "Engine Overheating",
    description: "Causes range from low coolant and a stuck thermostat to a failing water pump or blown head gasket. Stop driving immediately to avoid catastrophic damage.",
    symptoms: ["Temperature gauge in the red", "Steam from under the hood", "Sweet smell of coolant", "Coolant leaks"],
    fix: "Let the engine cool fully (30+ min). Check coolant level and look for leaks. Top up 50/50 coolant mix. If it overheats again, get the cooling system pressure-tested.",
    cost: "€20 (top-up) to €1500+ (head gasket).",
  },
  {
    id: "ac-not-cold",
    category: "AC/Heating",
    title: "AC Not Blowing Cold",
    description: "Most often a low refrigerant charge from a slow leak, but can also be a failing compressor or blend door actuator.",
    symptoms: ["Warm air from vents", "Weak airflow", "Hissing or clicking from dash"],
    fix: "Use a recharge kit with built-in pressure gauge. If pressure stays low after recharge, there's a leak — UV dye can locate it. Compressor jobs are shop work.",
    cost: "€30–€60 (recharge); €400–€1200 (compressor).",
  },
  {
    id: "low-tire-pressure",
    category: "Tires",
    title: "Low Tire Pressure / TPMS Light",
    description: "Tires lose ~1 PSI per month and more in cold weather. Persistent loss = slow leak from a nail, valve, or rim corrosion.",
    symptoms: ["TPMS warning light", "Vehicle pulls to one side", "Reduced fuel economy", "Uneven wear"],
    fix: "Check pressures cold against the door-jamb sticker. Inflate to spec. If one tire keeps dropping, inspect tread for nails and use a plug kit or visit a shop.",
    cost: "€0 (air); €15–€40 (patch/plug); €80–€200 per tire.",
  },
  {
    id: "low-oil",
    category: "Fluids",
    title: "Low Oil / Oil Change Due",
    description: "Engine oil lubricates and cools moving parts. Skipping changes accelerates wear; running low can destroy bearings.",
    symptoms: ["Oil pressure warning light", "Ticking from top of engine", "Burning oil smell", "Dipstick reads below MIN"],
    fix: "Drain warm oil, replace the filter, refill with the grade in your owner's manual. Reset the maintenance reminder. Typical interval is every 8,000–15,000 km.",
    cost: "€40–€80 DIY; €80–€180 at a shop.",
  },
  {
    id: "transmission-slip",
    category: "Transmission",
    title: "Transmission Slipping",
    description: "An automatic that revs without accelerating, shifts hard, or hesitates may be low on fluid, have a worn clutch pack, or need a solenoid replaced.",
    symptoms: ["High RPM with low acceleration", "Delayed engagement into gear", "Burnt smell", "Check Engine light"],
    fix: "Check transmission fluid level and color (should be pink/red, not brown). Top up if low. Anything beyond that — fluid change, solenoid, rebuild — is shop work.",
    cost: "€100–€300 (fluid service); €1500–€4000+ (rebuild).",
  },
  {
    id: "check-engine-light",
    category: "Engine",
    title: "Check Engine Light On",
    description: "A general warning triggered by the OBD-II system. The actual problem could be anything from a loose gas cap to a failed catalytic converter.",
    symptoms: ["Steady CEL", "Possible rough idle", "Reduced power", "Worse fuel economy"],
    fix: "Plug in an OBD-II scanner (cheap online) and read the code. Look up the P-code for likely causes. A flashing CEL means stop driving — engine misfire can damage the catalytic converter.",
    cost: "€20 (scanner) + variable repair cost.",
  },
  {
    id: "wont-start",
    category: "Electrical",
    title: "Engine Won't Start",
    description: "Distinguish between no crank (electrical) and cranks-but-won't-fire (fuel/spark). Most no-starts are battery- or starter-related.",
    symptoms: ["Nothing happens when key turned", "Clicking sound", "Engine cranks but doesn't catch"],
    fix: "Check battery voltage and terminal connections first. Try a jump-start. If it cranks but won't run, listen for the fuel pump prime and check for spark with a tester.",
    cost: "€0 (loose connection) to €600+ (starter motor).",
  },
];