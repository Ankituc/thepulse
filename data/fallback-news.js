// Fallback news data used when GNews API key is missing, invalid, or rate-limited.

const fallbackDatabase = {
  general: [
    {
      title: "Global Summit Reaches Landmark Accord on Clean Energy Transition",
      description: "Delegates from over 90 countries agree on an accelerated roadmap for renewable power investments and green infrastructure financing.",
      content: "International leaders concluded a week of high-stakes negotiations with an ambitious multi-billion dollar pledge dedicated to wind, solar, and grid modernization projects.",
      url: "https://apnews.com/article/energy-transition-climate-summit",
      image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      source: { name: "Associated Press", url: "https://apnews.com" }
    },
    {
      title: "Next-Generation Space Telescope Captures Earliest Known Galaxy Clusters",
      description: "Astrophysicists reveal unprecedented high-resolution imagery showcasing cosmic structures formed just 300 million years after the Big Bang.",
      content: "The observatory's infrared instruments detected ancient star-forming nurseries that challenge established models of early galactic evolution.",
      url: "https://www.reuters.com/science/space-telescope-galaxy-discovery",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      source: { name: "Reuters", url: "https://www.reuters.com" }
    },
    {
      title: "Major Tech Consortia Announce Standardized Architecture for Autonomous Agents",
      description: "Leading technology companies unite to create open protocols ensuring privacy, safety, and interoperability across autonomous AI systems.",
      content: "The new open framework aims to give developers unified tools while providing users with auditable control over data exchange.",
      url: "https://www.theverge.com/tech/autonomous-agents-open-standards",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      source: { name: "The Verge", url: "https://www.theverge.com" }
    },
    {
      title: "Central Banks Signal Stabilization in Benchmark Interest Rates",
      description: "Monetary policymakers cite steady employment and cooling inflation indicators as signals of a soft landing for the global economy.",
      content: "Financial markets responded favorably as central bank officials suggested a period of macroeconomic consistency ahead.",
      url: "https://www.bloomberg.com/news/articles/central-banks-interest-rates",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      source: { name: "Bloomberg", url: "https://www.bloomberg.com" }
    },
    {
      title: "Urban Reforestation Project Transforms City Heat Islands",
      description: "Innovative micro-forests planted across urban centers demonstrate up to a four-degree Celsius temperature drop in surrounding neighborhoods.",
      content: "The botanical initiative combines native flora with smart rainwater collection systems to improve urban microclimates.",
      url: "https://www.bbc.com/news/science-environment-urban-trees",
      image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
      source: { name: "BBC News", url: "https://www.bbc.com" }
    },
    {
      title: "High-Speed Rail Corridor Expansion Connects Key Manufacturing Hubs",
      description: "A newly unveiled transit network reduces freight and passenger travel times by 40%, spurring regional commerce.",
      content: "Engineers confirmed the first electrified passenger run reached record efficiency levels during inaugural testing.",
      url: "https://www.ft.com/content/high-speed-rail-infrastructure",
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
      source: { name: "Financial Times", url: "https://www.ft.com" }
    },
    {
      title: "Breakthrough in Solid-State Battery Tech Promises 800-Mile EV Range",
      description: "Materials scientists develop an innovative non-flammable ceramic electrolyte that doubles energy density while halving recharge times.",
      content: "Commercial automotive partners anticipate pilot manufacturing lines entering production within the next eighteen months.",
      url: "https://arstechnica.com/cars/solid-state-battery-breakthrough",
      image: "https://images.unsplash.com/photo-1558441719-8b489c63f707?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 310 * 60 * 1000).toISOString(),
      source: { name: "Ars Technica", url: "https://arstechnica.com" }
    }
  ],

  world: [
    {
      title: "International Coalition Unveils New Maritime Safety and Trade Protocol",
      description: "Naval representatives and maritime shipping leaders agree to shared satellite monitoring corridors to safeguard merchant navigation.",
      content: "The multilateral pact reinforces vital trade lanes and establishes instant distress communication hubs across three continents.",
      url: "https://www.reuters.com/world/maritime-security-treaty",
      image: "https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      source: { name: "Reuters", url: "https://www.reuters.com" }
    },
    {
      title: "European Union Finalizes Harmonized AI Governance Legislation",
      description: "Member states adopt comprehensive transparency guidelines for foundational model providers and critical infrastructure software.",
      content: "Officials emphasized that the legislation balances citizen privacy protections with incentives for domestic technological research.",
      url: "https://www.dw.com/en/eu-adopts-ai-act/a-685934",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      source: { name: "Deutsche Welle", url: "https://www.dw.com" }
    },
    {
      title: "Pacific Rim Nations Partner on Deep-Sea Biodiversity Protection",
      description: "A newly created marine reserve spans over 2 million square kilometers of vulnerable coral and deep-trench ecosystems.",
      content: "Biologists celebrated the creation of the sanctuary, which will ban commercial seabed dredging and protect endangered migratory species.",
      url: "https://www.bbc.com/news/world-pacific-marine-reserve",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
      source: { name: "BBC News", url: "https://www.bbc.com" }
    },
    {
      title: "Cross-Border Humanitarian Water Grid Commissioned in East Africa",
      description: "Engineers activate a solar-powered aquifer distribution network providing reliable potable water to rural border communities.",
      content: "The cooperative infrastructure project marks a milestone in regional climate adaptation and drought mitigation.",
      url: "https://www.aljazeera.com/news/east-africa-water-grid",
      image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 200 * 60 * 1000).toISOString(),
      source: { name: "Al Jazeera", url: "https://www.aljazeera.com" }
    },
    {
      title: "Global Aviation Accord Targets 100% Sustainable Aviation Fuel by 2040",
      description: "Commercial airlines and fuel refiners commit to scaling synthetic kerosene and waste-derived biofuels over the coming decade.",
      content: "Industry analysts project rapid capital reallocation toward domestic biorefineries across North America, Europe, and Asia.",
      url: "https://apnews.com/article/aviation-sustainable-fuel-accord",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 260 * 60 * 1000).toISOString(),
      source: { name: "Associated Press", url: "https://apnews.com" }
    }
  ],

  nation: [
    {
      title: "National Digital Infrastructure Bill Passes with Bipartisan Support",
      description: "Legislation provides long-term funding for high-speed fiber connectivity, rural broadband access, and secure civic identity portals.",
      content: "Lawmakers lauded the historic vote, emphasizing that universal high-speed access will democratize remote education and telehealth services.",
      url: "https://www.thehindu.com/news/national/digital-infrastructure-bill",
      image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      source: { name: "The Hindu", url: "https://www.thehindu.com" }
    },
    {
      title: "Election Commission Enhances Real-Time Voter Assistance Systems",
      description: "New mobile verification tools and accessible polling infrastructure aim to boost civic participation in upcoming state elections.",
      content: "The Commission announced streamlined registration procedures alongside round-the-clock multilingual helplines.",
      url: "https://indianexpress.com/article/india/election-commission-voter-app",
      image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
      source: { name: "Indian Express", url: "https://indianexpress.com" }
    },
    {
      title: "Clean River Basin Renewal Project Reaches Phase Two Milestones",
      description: "Ecological monitoring teams record the return of native fish species and substantial water clarity improvements along key riverways.",
      content: "Modern effluent treatment stations and community watershed stewardship programs are cited as drivers of the turnaround.",
      url: "https://timesofindia.indiatimes.com/india/river-restoration-project",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 165 * 60 * 1000).toISOString(),
      source: { name: "Times of India", url: "https://timesofindia.indiatimes.com" }
    },
    {
      title: "Solar Rooftop Incentive Program Expands to 5 Million Households",
      description: "Subsidies and net-metering guarantees encourage residential solar installations across suburban and semi-urban communities.",
      content: "Grid operators anticipate decentralized rooftop solar will shave peak summer load demand by more than 15%.",
      url: "https://www.ndtv.com/india-news/solar-rooftop-expansion-scheme",
      image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 225 * 60 * 1000).toISOString(),
      source: { name: "NDTV", url: "https://www.ndtv.com" }
    }
  ],

  business: [
    {
      title: "Global Tech Stocks Rally as Semiconductor Demand Hits Record Highs",
      description: "Surging demand for enterprise AI accelerators and low-power mobile chipsets drives chipmakers to all-time highs.",
      content: "Industry reports indicate foundries are operating at near-maximum capacity, with multi-year advance orders from cloud hyperscalers.",
      url: "https://www.bloomberg.com/markets/tech-rally-semiconductors",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      source: { name: "Bloomberg", url: "https://www.bloomberg.com" }
    },
    {
      title: "Venture Capital Inflows Pivot Toward Climate Tech and Quantum Computing",
      description: "Early-stage funding rounds reveal strong investor appetite for grid storage solutions and post-silicon computational models.",
      content: "Seed and Series A valuations in carbon capture and quantum sensing outperformed general consumer software during Q3.",
      url: "https://techcrunch.com/climate-tech-venture-capital-growth",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
      source: { name: "TechCrunch", url: "https://techcrunch.com" }
    },
    {
      title: "Retail E-Commerce Giants Integrate Real-Time Logistics AI",
      description: "Automated warehouse robotics and predictive parcel routing cut order fulfillment times down to under two hours in metropolitan zones.",
      content: "Supply chain managers report significant drops in inventory waste and carbon footprints per delivery.",
      url: "https://www.reuters.com/business/retail-logistics-ai-overhaul",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      source: { name: "Reuters", url: "https://www.reuters.com" }
    },
    {
      title: "Green Hydrogen Commercialization Accelerates with New Coastal Facility",
      description: "An electrolysis plant powered exclusively by offshore wind begins shipping zero-emission industrial feedstock to steelmakers.",
      content: "The plant represents the first large-scale commercial test for displacing fossil fuels in heavy manufacturing.",
      url: "https://www.ft.com/content/green-hydrogen-industrial-revolution",
      image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
      source: { name: "Financial Times", url: "https://www.ft.com" }
    }
  ],

  technology: [
    {
      title: "Open-Source AI Models Achieve Parity with Proprietary Industry Giants",
      description: "Benchmark testing reveals community-developed foundational models match commercial APIs in coding, reasoning, and multimodal understanding.",
      content: "The open release enables developers to run high-performance AI inference on local hardware without sending telemetry to third parties.",
      url: "https://www.theverge.com/tech/open-source-ai-breakthrough",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      source: { name: "The Verge", url: "https://www.theverge.com" }
    },
    {
      title: "Next-Gen Web Standards Advance: WebAssembly Threads and Native GPU Compute",
      description: "Browser vendors roll out unified APIs enabling console-quality graphics and local machine learning models directly inside web browsers.",
      content: "Developers can now build rich browser applications with instantaneous startup and offline capabilities.",
      url: "https://arstechnica.com/gadgets/webassembly-gpu-compute-standards",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
      source: { name: "Ars Technica", url: "https://arstechnica.com" }
    },
    {
      title: "Quantum Key Distribution Network Connects Remote Research Laboratories",
      description: "Physicists complete an unhackable optical fiber quantum encryption corridor across 400 kilometers of telecom cables.",
      content: "The network provides provable forward security resistant to future quantum computing decryption attacks.",
      url: "https://www.wired.com/story/quantum-key-distribution-fiber",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      source: { name: "Wired", url: "https://www.wired.com" }
    },
    {
      title: "Spatial Computing Displays Double Resolution with Micro-OLED Breakthrough",
      description: "Display manufacturers unveil retina-density micro-displays with 4,000 pixels per inch and zero perceived motion blur.",
      content: "The breakthrough is expected to power lighter, more comfortable headsets and augmented-reality spectacles by next year.",
      url: "https://techcrunch.com/micro-oled-spatial-computing-displays",
      image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 175 * 60 * 1000).toISOString(),
      source: { name: "TechCrunch", url: "https://techcrunch.com" }
    }
  ],

  sports: [
    {
      title: "Underdog Squad Clinches Thrilling Extra-Time Football Championship Victory",
      description: "A dramatic 94th-minute stoppage-time volley seals a historic underdog triumph in front of 80,000 roaring spectators.",
      content: "Fans celebrated across the city as the club lifted its first major silverware in over four decades.",
      url: "https://www.espn.com/soccer/championship-extra-time-winner",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      source: { name: "ESPN", url: "https://www.espn.com" }
    },
    {
      title: "World Record Shattered in 100m Freestyle at Swimming Championships",
      description: "Nineteen-year-old sprint prodigy clocks an astonishing 46.80 seconds, shaving two-tenths off the longstanding global mark.",
      content: "Analysts praised the swimmer's explosive underwater turn technique and relentless final 25-meter cadence.",
      url: "https://www.bbc.com/sport/swimming-world-record-freestyle",
      image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 115 * 60 * 1000).toISOString(),
      source: { name: "BBC Sport", url: "https://www.bbc.com" }
    },
    {
      title: "Grand Slam Tennis Final Sets New All-Time Endurance Record",
      description: "A five-set, five-hour marathon between the top two seeds ends in a breathtaking tiebreak that captivated millions worldwide.",
      content: "Both competitors embraced at the net after what commentators hailed as one of the greatest matches in tennis history.",
      url: "https://www.theguardian.com/sport/grand-slam-tennis-epic-final",
      image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      source: { name: "The Guardian", url: "https://www.theguardian.com" }
    },
    {
      title: "Formula E Unveils Next-Gen Electric Racers with 600kW Fast Charging",
      description: "The motorsport series showcases its newest all-electric race cars capable of 200 mph speeds with mid-race pitstop flash charging.",
      content: "Engineers noted that technology developed on the track will accelerate consumer EV battery charging innovations.",
      url: "https://www.motorsport.com/formula-e/gen4-car-reveal",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 245 * 60 * 1000).toISOString(),
      source: { name: "Motorsport", url: "https://www.motorsport.com" }
    }
  ],

  science: [
    {
      title: "James Webb Space Telescope Detects Carbon-Rich Atmosphere on Exoplanet",
      description: "Spectroscopic observations of a temperate sub-Neptune world 120 light-years away reveal methane and carbon dioxide in its atmosphere.",
      content: "Astronomers say the atmospheric composition suggests a potential water-covered ocean surface beneath a hydrogen-rich canopy.",
      url: "https://www.nasa.gov/mission/exoplanet-atmosphere-detection",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      source: { name: "NASA Science", url: "https://www.nasa.gov" }
    },
    {
      title: "Biochemists Engineer Enzyme Capable of Degrading Plastics in Hours",
      description: "A computationally optimized bacterial enzyme breaks down post-consumer PET bottles into base monomers under ambient room conditions.",
      content: "The process creates a closed-loop recycling pathway that eliminates the need for petroleum-derived plastic synthesis.",
      url: "https://www.nature.com/articles/engineered-plastic-degrading-enzyme",
      image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
      source: { name: "Nature", url: "https://www.nature.com" }
    },
    {
      title: "Nuclear Fusion Test Reactor Sustains 100-Million-Degree Plasma for Record Time",
      description: "Advanced magnetic confinement coils maintain a stable thermonuclear reaction core for over twenty continuous minutes.",
      content: "The experiment marks another critical engineering validation on the path toward commercial clean fusion power plants.",
      url: "https://www.newscientist.com/article/fusion-reactor-plasma-record",
      image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 145 * 60 * 1000).toISOString(),
      source: { name: "New Scientist", url: "https://www.newscientist.com" }
    },
    {
      title: "Paleontologists Discover Perfectly Preserved Feathered Dinosaur Specimen",
      description: "Fossilized amber specimens from East Asia capture soft tissue structures and original pigment melanosomes in extraordinary detail.",
      content: "The study provides clear evidence of early evolutionary plumage coloration and thermal regulation in theropod dinosaurs.",
      url: "https://www.nationalgeographic.com/science/feathered-dinosaur-fossil",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
      source: { name: "National Geographic", url: "https://www.nationalgeographic.com" }
    }
  ],

  entertainment: [
    {
      title: "Indie Sci-Fi Drama Sweeps International Film Festival Honors",
      description: "A micro-budget philosophical thriller shot on anamorphic 16mm film captures the prestigious top jury prize and critical acclaim.",
      content: "The jury cited the film's intimate narrative, authentic performances, and masterclass sound design.",
      url: "https://variety.com/film/indie-scifi-triumph-festival",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      source: { name: "Variety", url: "https://variety.com" }
    },
    {
      title: "Legendary Soundtrack Composer Debuts First Symphonic Masterwork in a Decade",
      description: "The sold-out world premiere at London's Royal Albert Hall receives an unprecedented ten-minute standing ovation.",
      content: "Combining acoustic orchestral arrangements with subtle modular synthesizers, the suite explores themes of memory and discovery.",
      url: "https://pitchfork.com/news/symphonic-masterwork-premiere",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
      source: { name: "Pitchfork", url: "https://pitchfork.com" }
    },
    {
      title: "Streaming Platforms Embrace Interactive Narrative Experiments",
      description: "New choose-your-own-path cinematic releases allow viewers to dynamically guide character choices and branch plotlines in 4K HDR.",
      content: "Data analysts report audience engagement and re-watch rates quadrupled compared to conventional static releases.",
      url: "https://www.hollywoodreporter.com/interactive-streaming-formats",
      image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 160 * 60 * 1000).toISOString(),
      source: { name: "The Hollywood Reporter", url: "https://www.hollywoodreporter.com" }
    },
    {
      title: "Global Retrospective Celebrates Fifty Years of Electronic Music Evolution",
      description: "A major museum exhibition traces the journey of analog synthesizers from experimental university labs to international stadium anthems.",
      content: "Visitors can interact with vintage drum machines, rare vocoders, and iconic hardware that defined modern pop culture.",
      url: "https://www.billboard.com/music/electronic-music-retrospective",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 230 * 60 * 1000).toISOString(),
      source: { name: "Billboard", url: "https://www.billboard.com" }
    }
  ]
};

function getFallbackHeadlines(category = "general") {
  const articles = fallbackDatabase[category] || fallbackDatabase.general;
  return {
    totalArticles: articles.length,
    articles
  };
}

function searchFallbackNews(query = "") {
  const normalizedQuery = query.toLowerCase().trim();
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  
  // Aggregate articles from all categories without duplicates by title
  const seenTitles = new Set();
  const allArticles = [];
  for (const cat of Object.keys(fallbackDatabase)) {
    for (const article of fallbackDatabase[cat]) {
      if (!seenTitles.has(article.title)) {
        seenTitles.add(article.title);
        allArticles.push({ ...article, category: cat });
      }
    }
  }

  if (!tokens.length) {
    return { totalArticles: allArticles.length, articles: allArticles };
  }

  const matches = allArticles.filter((article) => {
    const text = `${article.title} ${article.description} ${article.content || ""} ${article.source.name} ${article.category || ""}`.toLowerCase();
    return tokens.some((token) => text.includes(token));
  });

  return {
    totalArticles: matches.length,
    articles: matches
  };
}

module.exports = {
  fallbackDatabase,
  getFallbackHeadlines,
  searchFallbackNews
};
