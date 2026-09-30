/**
 * Ann Real Estate - Client-Side Luxury Seed Data Archive
 * Enables autonomous offline and GitHub Pages static hosting
 */

(function () {
  const developers = [
    {
      id: 1,
      name: "OmniLux Developments",
      description: "Pioneering sculptural, ultra-luxury residential towers with cantilevered terraces and high-performance sustainable architecture.",
      established_year: 2014,
      headquarters: "DIFC Gate Village, Dubai",
      website: "https://omnilux.ae"
    },
    {
      id: 2,
      name: "Aura Properties Dubai",
      description: "Distinguished master builders of high-yield urban towers and waterfront residences across Business Bay and Dubai Marina.",
      established_year: 2011,
      headquarters: "Downtown Boulevard, Dubai",
      website: "https://auraproperties.ae"
    },
    {
      id: 3,
      name: "Veritas Sovereign Living",
      description: "Exclusive creator of custom private-island beachfront mansions, branded hotel penthouses, and presidential enclaves.",
      established_year: 2008,
      headquarters: "Palm Jumeirah Boardwalk, Dubai",
      website: "https://veritassovereign.ae"
    },
    {
      id: 4,
      name: "Elysian Bay Developments",
      description: "Maritime visionary crafting waterfront lifestyle communities with private yacht berths, marinas, and lagoon boardwalks.",
      established_year: 2016,
      headquarters: "Dubai Marina Promenade, Dubai",
      website: "https://elysianbay.ae"
    },
    {
      id: 5,
      name: "Mirage Luxe Properties",
      description: "Creators of boutique golf-course sanctuaries, contemporary family estates, and low-rise wellness residences in Dubai Hills and JVC.",
      established_year: 2017,
      headquarters: "Dubai Hills Estate Business Park, Dubai",
      website: "https://mirageluxe.ae"
    }
  ];

  const offPlanProjects = [
    {
      id: 1,
      developer_id: 2,
      title: "Aura Marina Bay Tower",
      slug: "aura-marina-bay-tower",
      community: "Dubai Marina",
      price_from_aed: 3200000,
      handover_date: "Q4 2026",
      payment_plan: "60/40 (20% Down • 40% During Construction • 40% on Handover)",
      description: "A 64-storey sculptural waterfront tower with private yacht berths, 360-degree marina panoramas, and rooftop infinity lagoon.",
      bedrooms_available: "1, 2, 3 & 4 Bedroom Penthouses",
      image_url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=85",
      status: "Under Construction (58% Complete)",
      roi_estimate: "8.4% Net Projected Yield"
    },
    {
      id: 2,
      developer_id: 1,
      title: "The Luminary Downtown",
      slug: "the-luminary-downtown",
      community: "Downtown Dubai",
      price_from_aed: 4500000,
      handover_date: "Q2 2027",
      payment_plan: "70/30 (10% Booking • 60% Construction Milestones • 30% on Handover)",
      description: "Rising in the Opera District with direct, unobstructed views of Burj Khalifa and the Dubai Fountains. Features 7-meter ceilings.",
      bedrooms_available: "2, 3 & 4 Bedroom Sky Mansions",
      image_url: "assets/images/hero-skyline.jpg",
      status: "Under Construction (35% Complete)",
      roi_estimate: "7.8% Net Projected Yield"
    },
    {
      id: 3,
      developer_id: 3,
      title: "Solstice Palm Residences",
      slug: "solstice-palm-residences",
      community: "Palm Jumeirah",
      price_from_aed: 16800000,
      handover_date: "Q1 2027",
      payment_plan: "50/50 (20% Down • 30% Construction • 50% on Handover)",
      description: "Bespoke beachfront residences situated on the prestigious crescent of Palm Jumeirah with private sea frontage and infinity plunge pools.",
      bedrooms_available: "3, 4 & 5 Bedroom Waterfront Penthouses",
      image_url: "assets/images/palm-villa.jpg",
      status: "Foundation & Substructure Complete",
      roi_estimate: "9.1% Capital Growth Potential"
    },
    {
      id: 4,
      developer_id: 2,
      title: "Canal Heights Sovereign",
      slug: "canal-heights-sovereign",
      community: "Business Bay",
      price_from_aed: 2100000,
      handover_date: "Q3 2026",
      payment_plan: "60/40 (15% Down • 45% Construction • 40% on Handover)",
      description: "Curved crystal glass towers along the Dubai Water Canal promenade with floor-to-ceiling glass and smart home integration.",
      bedrooms_available: "1, 2 & 3 Bedroom Canal Suites",
      image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
      status: "Under Construction (62% Complete)",
      roi_estimate: "8.6% Net Projected Yield"
    },
    {
      id: 5,
      developer_id: 5,
      title: "Verdant Hills Residences",
      slug: "verdant-hills-residences",
      community: "Dubai Hills Estate",
      price_from_aed: 2800000,
      handover_date: "Q4 2027",
      payment_plan: "80/20 (20% Down • 60% Construction • 20% on Handover)",
      description: "Surrounded by rolling golf greens and tranquil parks, offering oversized balconies, family lounges, and wellness sanctuaries.",
      bedrooms_available: "1, 2 & 3 Bedroom Park Apartments",
      image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
      status: "Piling & Excavation Underway",
      roi_estimate: "7.9% Net Projected Yield"
    },
    {
      id: 6,
      developer_id: 5,
      title: "Serenity Park Terrace",
      slug: "serenity-park-terrace",
      community: "Jumeirah Village Circle (JVC)",
      price_from_aed: 980000,
      handover_date: "Q2 2026",
      payment_plan: "50/50 Post-Handover (20% Down • 30% Handover • 50% Over 2 Years)",
      description: "Modern urban sanctuary with resort amenities, co-working lounges, rooftop pool, and strong rental demand in central Dubai.",
      bedrooms_available: "Studio, 1 & 2 Bedroom Apartments",
      image_url: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=85",
      status: "Superstructure 80% Complete",
      roi_estimate: "9.4% Net Rental Yield"
    }
  ];

  const properties = [
    {
      id: 1,
      developer_id: 3,
      title: "The Palm Frond Seraphina Villa",
      slug: "palm-frond-seraphina-villa",
      community: "Palm Jumeirah",
      price_aed: 48000000,
      bedrooms: 6,
      bathrooms: 8,
      sqft: 12500,
      property_type: "Beachfront Villa",
      description: "A trophy beachfront mansion on Frond N of Palm Jumeirah featuring private white-sand beach access, Italian travertine stone, infinity pool, and subterranean 5-car gallery.",
      image_url: "assets/images/palm-villa.jpg",
      status: "Ready to Move",
      features: "Private Beach Frontage, Travertine Pool, Subterranean 5-Car Garage, Poliform Chef Kitchen, Private Wellness Spa, Bang & Olufsen Audio",
      completion_status: "Completed (Vacant on Transfer)"
    },
    {
      id: 2,
      developer_id: 3,
      title: "Palm Crescent Beachfront Penthouse",
      slug: "palm-crescent-beachfront-penthouse",
      community: "Palm Jumeirah",
      price_aed: 18200000,
      bedrooms: 3,
      bathrooms: 4,
      sqft: 3800,
      property_type: "Sky Penthouse",
      description: "Commands open Arabian Gulf and sunset horizon views from an expansive wraps-around entertaining terrace with private plunge pool.",
      image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "Sunset Horizon Views, Private Plunge Pool, Valet Concierge, Private Elevator Access, Rimadesio Joinery",
      completion_status: "Completed (Ready for Occupancy)"
    },
    {
      id: 3,
      developer_id: 3,
      title: "Frond K Sunset Signature Estate",
      slug: "frond-k-sunset-signature-estate",
      community: "Palm Jumeirah",
      price_aed: 62000000,
      bedrooms: 7,
      bathrooms: 9,
      sqft: 15200,
      property_type: "Ultra-Prime Mansion",
      description: "One of the most palatial custom estates on Palm Jumeirah, boasting double-height ceilings, a 25-meter infinity lap pool, and bespoke European furnishings.",
      image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "25-Meter Lap Pool, 8-Car Showroom, Private Cinema, Detached Staff Quarters, Direct Yacht Mooring",
      completion_status: "Completed"
    },
    {
      id: 4,
      developer_id: 4,
      title: "Azure Marina Penthouse Duplex",
      slug: "azure-marina-penthouse-duplex",
      community: "Dubai Marina",
      price_aed: 12900000,
      bedrooms: 4,
      bathrooms: 5,
      sqft: 5400,
      property_type: "Duplex Penthouse",
      description: "Crown residence spanning the top two floors with uninterrupted panoramic views of luxury yachts, Ain Dubai, and the turquoise Arabian Gulf.",
      image_url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "360-Degree Marina Views, Double Height Atrium, Private Spa, 3 Designated Parking Bays, Smart Lighting",
      completion_status: "Completed"
    },
    {
      id: 5,
      developer_id: 4,
      title: "Marina Gate Waterfront Residence",
      slug: "marina-gate-waterfront-residence",
      community: "Dubai Marina",
      price_aed: 3600000,
      bedrooms: 2,
      bathrooms: 3,
      sqft: 1600,
      property_type: "Waterfront Apartment",
      description: "Steps from the marina promenade. Bright open-plan living with contemporary Italian finishes, infinity pool, and state-of-the-art gym.",
      image_url: "https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "Marina Promenade Access, Infinity Pool, Floor-to-Ceiling Windows, High Rental Yield (7.8%)",
      completion_status: "Completed"
    },
    {
      id: 6,
      developer_id: 4,
      title: "Marina Yacht Enclave Apartment",
      slug: "marina-yacht-enclave-apartment",
      community: "Dubai Marina",
      price_aed: 6200000,
      bedrooms: 3,
      bathrooms: 4,
      sqft: 2750,
      property_type: "Luxury Apartment",
      description: "Frontline yacht club positioning. Features oversized entertainer's balcony, maid's room, and private resident yacht charter privileges.",
      image_url: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "Direct Marina Views, Maid Room, Concierge, Resident Yacht Lounge, Covered Parking",
      completion_status: "Completed"
    },
    {
      id: 7,
      developer_id: 1,
      title: "Burj Crown Sky Residence",
      slug: "burj-crown-sky-residence",
      community: "Downtown Dubai",
      price_aed: 7800000,
      bedrooms: 3,
      bathrooms: 4,
      sqft: 2450,
      property_type: "High-Rise Residence",
      description: "Floor-to-ceiling glass frames direct vistas of the illuminated Burj Khalifa. Walking distance to Dubai Mall and Dubai Opera.",
      image_url: "assets/images/sky-penthouse.jpg",
      status: "Ready to Move",
      features: "Direct Burj Khalifa View, Walk to Dubai Opera, Marble Bathrooms, 24/7 Concierge, Covered Parking",
      completion_status: "Completed"
    },
    {
      id: 8,
      developer_id: 1,
      title: "Opera District Executive Duplex",
      slug: "opera-district-executive-duplex",
      community: "Downtown Dubai",
      price_aed: 14500000,
      bedrooms: 4,
      bathrooms: 5,
      sqft: 4200,
      property_type: "Duplex Penthouse",
      description: "Artful modernist duplex featuring a double-height grand salon, private terrace overlooking dancing fountains, and bespoke Dornbracht fixtures.",
      image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "Double-Height Ceilings, Fountain Panoramas, Sub-Zero Appliances, Private Lift, 24/7 Security",
      completion_status: "Completed"
    },
    {
      id: 9,
      developer_id: 1,
      title: "Downtown Boulevard Horizon View",
      slug: "downtown-boulevard-horizon-view",
      community: "Downtown Dubai",
      price_aed: 5900000,
      bedrooms: 2,
      bathrooms: 3,
      sqft: 1950,
      property_type: "Urban Luxury Suite",
      description: "Positioned along Sheikh Mohammed bin Rashid Boulevard. Features designer furnishing package, automated drapery, and high rental return.",
      image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "Boulevard Views, Fully Furnished Option, High Rental Yield (7.5%), Valet Parking",
      completion_status: "Completed"
    },
    {
      id: 10,
      developer_id: 2,
      title: "The Opus Canal Panorama",
      slug: "the-opus-canal-panorama",
      community: "Business Bay",
      price_aed: 4350000,
      bedrooms: 2,
      bathrooms: 3,
      sqft: 1820,
      property_type: "Waterfront Apartment",
      description: "Sculptural architectural masterpiece directly on the Dubai Water Canal with designer interiors, hotel concierge service, and fine dining downstairs.",
      image_url: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "Direct Canal Boardwalk, Branded Concierge, Infinity Lap Pool, Michelin Restaurant Access",
      completion_status: "Completed"
    },
    {
      id: 11,
      developer_id: 2,
      title: "Executive Bay Canal Loft",
      slug: "executive-bay-canal-loft",
      community: "Business Bay",
      price_aed: 2850000,
      bedrooms: 1,
      bathrooms: 2,
      sqft: 1180,
      property_type: "Designer Loft",
      description: "Soaring 5-meter ceilings with industrial-chic marble details, private balcony over the water canal, and 5 minutes to Downtown Dubai.",
      image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "5-Meter Ceilings, Canal Views, Metro Proximity, Turnkey Investor Ready (8.1% Yield)",
      completion_status: "Completed"
    },
    {
      id: 12,
      developer_id: 5,
      title: "Park Ridge Emerald Mansion",
      slug: "park-ridge-emerald-mansion",
      community: "Dubai Hills Estate",
      price_aed: 22500000,
      bedrooms: 5,
      bathrooms: 6,
      sqft: 8900,
      property_type: "Golf Course Villa",
      description: "Nestled directly on the 18-hole championship golf course fairways. Features sunken garden firepit, temperature-controlled pool, and maid/driver suites.",
      image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "Fairway Views, Sunken Firepit, Private Pool, Staff Accommodations, Close to King's College Hospital",
      completion_status: "Completed"
    },
    {
      id: 13,
      developer_id: 5,
      title: "Club Villas Golf Sanctuary",
      slug: "club-villas-golf-sanctuary",
      community: "Dubai Hills Estate",
      price_aed: 9200000,
      bedrooms: 4,
      bathrooms: 5,
      sqft: 4100,
      property_type: "Modern Family Villa",
      description: "Rooftop lounge overlooking Burj Khalifa and lush greenery. Walking distance to clubhouse, driving range, and international schools.",
      image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "Rooftop Stargazing Deck, Golf Clubhouse Proximity, Private Garden, Gated Security",
      completion_status: "Completed"
    },
    {
      id: 14,
      developer_id: 5,
      title: "L’Orangerie Boutique Residence",
      slug: "lorangerie-boutique-residence",
      community: "Jumeirah Village Circle (JVC)",
      price_aed: 1450000,
      bedrooms: 2,
      bathrooms: 3,
      sqft: 1350,
      property_type: "Modern Apartment with Plunge Pool",
      description: "Unique boutique concept with a private terrace plunge pool, European oak flooring, designer kitchen, and exceptionally high 9.2% net rental yields.",
      image_url: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "Private Plunge Pool on Terrace, European Oak Floors, High Yield (9.2%), Low Service Charges",
      completion_status: "Completed"
    },
    {
      id: 15,
      developer_id: 5,
      title: "Verona Terraces Family Home",
      slug: "verona-terraces-family-home",
      community: "Jumeirah Village Circle (JVC)",
      price_aed: 890000,
      bedrooms: 1,
      bathrooms: 2,
      sqft: 840,
      property_type: "Apartment Suite",
      description: "Ideal prime entry-point investment. Oversized bedroom, closed kitchen, resort-style communal amenities, and minutes from Circle Mall.",
      image_url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=85",
      status: "Ready to Move",
      features: "High ROI (9.5%), Fully Fitted Kitchen, Community Pool & Gym, Walk to Circle Mall",
      completion_status: "Completed"
    }
  ];

  const staffLogins = [
    {
      id: 1,
      full_name: "Anamika Menon",
      email: "admin@annrealestate.ae",
      role: "admin",
      phone: "+971 4 800 2900",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      full_name: "Rashid Al-Falasi",
      email: "rashid@annrealestate.ae",
      role: "agent",
      phone: "+971 4 800 2901",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      full_name: "Helena Vance-Montgomery",
      email: "helena@annrealestate.ae",
      role: "agent",
      phone: "+971 4 800 2902",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 4,
      full_name: "Kareem Mansoor",
      email: "kareem@annrealestate.ae",
      role: "agent",
      phone: "+971 4 800 2903",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
    }
  ];

  function computeScore(lead) {
    let score = 0;
    if (lead.phone && lead.phone.trim().length > 6) score += 15;
    const combined = ((lead.notes || '') + ' ' + (lead.timeline || '') + ' ' + (lead.lead_type || '')).toLowerCase();
    if (combined.includes('cash') || combined.includes('immediate') || combined.includes('liquid') || combined.includes('ready')) {
      score += 20;
    }
    if (combined.includes('immediate') || combined.includes('30 days') || combined.includes('urgent')) {
      score += 25;
    } else if (combined.includes('60 days') || combined.includes('q4') || combined.includes('q1')) {
      score += 15;
    } else {
      score += 5;
    }
    const budget = Number(lead.budget_aed) || 0;
    if (budget >= 30000000) score += 25;
    else if (budget >= 15000000) score += 20;
    else if (budget >= 5000000) score += 15;
    else score += 10;
    if (lead.property_id || lead.project_id) score += 15;

    score = Math.min(100, Math.max(10, score));
    let rating = 'COLD';
    if (score >= 70) rating = 'HOT';
    else if (score >= 40) rating = 'WARM';

    return { score, rating };
  }

  const rawLeads = [
    { id: 1, full_name: "Lord Alistair Sterling", email: "sterling.family@londonadvisory.co.uk", phone: "+44 20 7946 0912", lead_type: "Ultra-Prime Ready", source_form: "Property Detail - Book a Viewing", property_id: 1, project_id: null, budget_aed: 50000000, timeline: "Immediate Cash Buyer", notes: "Seeking private beachfront villa on Palm Jumeirah with yacht access.", status: "Offer Made", assigned_agent_id: 2, created_at: "2026-09-02" },
    { id: 2, full_name: "Jean-Luc Moreau", email: "jl.moreau@monacoprivate.mc", phone: "+377 98 97 12 00", lead_type: "Off-Plan Investment", source_form: "Off-Plan Project - Download Brochure", property_id: null, project_id: 3, budget_aed: 18000000, timeline: "Q4 2026", notes: "Interested in Solstice Palm penthouse, cash milestone plan.", status: "Won", assigned_agent_id: 4, created_at: "2026-09-04" },
    { id: 3, full_name: "Vikram Singhania", email: "v.singhania@singhaniagroup.in", phone: "+91 98200 45678", lead_type: "Downtown Duplex", source_form: "Home Register Interest", property_id: 8, project_id: null, budget_aed: 15000000, timeline: "Within 30 Days", notes: "High floor Burj Khalifa and Fountain view required.", status: "Viewing", assigned_agent_id: 3, created_at: "2026-09-06" },
    { id: 4, full_name: "Sheikh Mansoor Al-Qasimi", email: "m.alqasimi@gulfinvest.ae", phone: "+971 50 882 1999", lead_type: "Golf Villa", source_form: "Property Detail - Enquire", property_id: 12, project_id: null, budget_aed: 25000000, timeline: "Immediate Cash", notes: "Prefers full fairway view in Dubai Hills Estate.", status: "Offer Made", assigned_agent_id: 2, created_at: "2026-09-07" },
    { id: 5, full_name: "Dmitri Volkov", email: "d.volkov@zurichwealth.ch", phone: "+41 44 215 8890", lead_type: "Off-Plan Portfolio", source_form: "Off-Plan Project - Download Brochure", property_id: null, project_id: 1, budget_aed: 12000000, timeline: "Q1 2027", notes: "Acquiring 3 units in Aura Marina Bay Tower for rental yield.", status: "Contacted", assigned_agent_id: 4, created_at: "2026-09-08" },
    { id: 6, full_name: "Sophia Zhang", email: "sophia.zhang@sgcapital.com.sg", phone: "+65 6712 3456", lead_type: "Golden Visa Investor", source_form: "Mortgage Calculator - Speak to Advisor", property_id: 4, project_id: null, budget_aed: 14000000, timeline: "60 Days", notes: "Requires 10-year UAE Golden Visa assistance for family office.", status: "Contacted", assigned_agent_id: 3, created_at: "2026-09-09" },
    { id: 7, full_name: "Tariq Haddad", email: "tariq.haddad@riyadhholding.sa", phone: "+966 50 123 9876", lead_type: "Palm Frond Estate", source_form: "Property Detail - Book a Viewing", property_id: 3, project_id: null, budget_aed: 65000000, timeline: "Immediate Cash", notes: "Looking at Frond K ultra-prime trophy mansion.", status: "Viewing", assigned_agent_id: 2, created_at: "2026-09-10" },
    { id: 8, full_name: "Dr. Marcus Henderson", email: "mhenderson@harleystreet.co.uk", phone: "+44 7700 900123", lead_type: "Canal Residence", source_form: "Sell Your Property - Valuation", property_id: 10, project_id: null, budget_aed: 4500000, timeline: "90 Days", notes: "Relocating consulting practice to Dubai DIFC.", status: "Contacted", assigned_agent_id: 3, created_at: "2026-09-11" },
    { id: 9, full_name: "Elena Rostova", email: "elena@rostovapartners.ae", phone: "+971 52 443 8911", lead_type: "Downtown Apartment", source_form: "Floating Call Me Back", property_id: 7, project_id: null, budget_aed: 8000000, timeline: "Immediate", notes: "Looking for turnkey Burj Crown luxury unit.", status: "Viewing", assigned_agent_id: 4, created_at: "2026-09-12" },
    { id: 10, full_name: "Carlos Mendez", email: "cmendez@ibizaresidences.es", phone: "+34 91 123 4567", lead_type: "JVC High Yield", source_form: "Property Detail - Enquire", property_id: 14, project_id: null, budget_aed: 1500000, timeline: "30 Days Cash", notes: "Seeking high 9%+ ROI unit with plunge pool.", status: "Won", assigned_agent_id: 4, created_at: "2026-09-13" },
    { id: 11, full_name: "Amira El-Sayed", email: "amira.elsayed@cairoinvest.com", phone: "+20 100 234 5678", lead_type: "Dubai Hills Villa", source_form: "Home Search Bar", property_id: 13, project_id: null, budget_aed: 9500000, timeline: "Immediate", notes: "Family looking for 4-bedroom villa close to international school.", status: "Offer Made", assigned_agent_id: 2, created_at: "2026-09-14" },
    { id: 12, full_name: "Julian Van Der Bilt", email: "julian@amsterdamcapital.nl", phone: "+31 20 890 1234", lead_type: "Business Bay Loft", source_form: "Contact Page", property_id: 11, project_id: null, budget_aed: 3000000, timeline: "Immediate", notes: "Interested in Executive Bay canal loft.", status: "Contacted", assigned_agent_id: 3, created_at: "2026-09-15" },
    { id: 13, full_name: "Nasser Al-Kuwari", email: "nasser@dohapartners.qa", phone: "+974 5512 3456", lead_type: "Downtown Penthouse", source_form: "Top Bar Register Interest", property_id: 2, project_id: null, budget_aed: 20000000, timeline: "60 Days", notes: "Vacation home search for winter in Dubai.", status: "Viewing", assigned_agent_id: 3, created_at: "2026-09-16" },
    { id: 14, full_name: "Charlotte Beaumont", email: "cbeaumont@parisinvest.fr", phone: "+33 1 42 68 00 11", lead_type: "Off-Plan Canal", source_form: "Off-Plan Project - Download Brochure", property_id: null, project_id: 4, budget_aed: 2500000, timeline: "Q3 2026", notes: "Canal Heights Sovereign brochure downloaded.", status: "New", assigned_agent_id: 4, created_at: "2026-09-17" },
    { id: 15, full_name: "Arthur Pendelton", email: "arthur@pendelton-holdings.co.uk", phone: "+44 20 8123 9900", lead_type: "Marina Waterfront", source_form: "Property Detail - Book a Viewing", property_id: 5, project_id: null, budget_aed: 3800000, timeline: "30 Days", notes: "Retirement residence search on Dubai Marina walk.", status: "Viewing", assigned_agent_id: 3, created_at: "2026-09-17" },
    { id: 16, full_name: "Fahad Al-Otaibi", email: "fahad@kuwaitcapital.kw", phone: "+965 9912 8844", lead_type: "Palm Villa", source_form: "Property Detail - Enquire", property_id: 1, project_id: null, budget_aed: 48000000, timeline: "Immediate Cash", notes: "Full cash buyer requesting valuation report.", status: "Won", assigned_agent_id: 2, created_at: "2026-09-18" },
    { id: 17, full_name: "Chloe Dupont", email: "chloe.dupont@genevaprivate.ch", phone: "+41 22 730 4567", lead_type: "Off-Plan Dubai Hills", source_form: "Off-Plan Project - Download Brochure", property_id: null, project_id: 5, budget_aed: 3000000, timeline: "Q4 2027", notes: "Verdant Hills payment plan inquiry.", status: "New", assigned_agent_id: 4, created_at: "2026-09-19" },
    { id: 18, full_name: "Arjun Patel", email: "arjun.patel@mumbaitech.in", phone: "+91 99300 11223", lead_type: "JVC Entry Investment", source_form: "Home Search Bar", property_id: 15, project_id: null, budget_aed: 900000, timeline: "Immediate", notes: "First-time Dubai property investor.", status: "Contacted", assigned_agent_id: 4, created_at: "2026-09-19" },
    { id: 19, full_name: "Matteo Rossi", email: "mrossi@milanodesign.it", phone: "+39 02 8765 4321", lead_type: "Marina Yacht Enclave", source_form: "Property Detail - Book a Viewing", property_id: 6, project_id: null, budget_aed: 6500000, timeline: "60 Days", notes: "Loves nautical lifestyle, needs private yacht berth.", status: "Viewing", assigned_agent_id: 4, created_at: "2026-09-20" },
    { id: 20, full_name: "Sarah Jenkins", email: "sarah.j@sydneywealth.com.au", phone: "+61 2 9123 4567", lead_type: "Downtown Boulevard", source_form: "Home Register Interest", property_id: 9, project_id: null, budget_aed: 6000000, timeline: "45 Days", notes: "Expat returning to the Middle East.", status: "Contacted", assigned_agent_id: 3, created_at: "2026-09-20" },
    { id: 21, full_name: "Hassan Al-Bloushi", email: "hassan@muscatadvisory.om", phone: "+968 9234 5678", lead_type: "Off-Plan JVC", source_form: "Off-Plan Project - Download Brochure", property_id: null, project_id: 6, budget_aed: 1100000, timeline: "Q2 2026", notes: "Serenity Park Terrace post-handover plan.", status: "New", assigned_agent_id: 4, created_at: "2026-09-21" },
    { id: 22, full_name: "Maximilian Weber", email: "m.weber@frankfurtinvest.de", phone: "+49 69 9876 5432", lead_type: "Dubai Hills Mansion", source_form: "Property Detail - Book a Viewing", property_id: 12, project_id: null, budget_aed: 23000000, timeline: "Immediate Cash", notes: "Looking for gated family golf community.", status: "Viewing", assigned_agent_id: 2, created_at: "2026-09-21" },
    { id: 23, full_name: "Laila Al-Ghamdi", email: "laila@jeddahholdings.sa", phone: "+966 54 876 5432", lead_type: "Palm Penthouse", source_form: "Floating Call Me Back", property_id: 2, project_id: null, budget_aed: 18500000, timeline: "30 Days", notes: "Requested video walkthrough of Palm Crescent.", status: "Viewing", assigned_agent_id: 3, created_at: "2026-09-22" },
    { id: 24, full_name: "Oliver King", email: "oking@chelseaproperties.co.uk", phone: "+44 20 7123 8877", lead_type: "Marina Duplex", source_form: "Property Detail - Enquire", property_id: 4, project_id: null, budget_aed: 13000000, timeline: "Immediate Cash", notes: "UK investor seeking Dubai tax residency.", status: "Won", assigned_agent_id: 3, created_at: "2026-09-22" },
    { id: 25, full_name: "Guan Yu Chen", email: "chen.guanyu@shanghaifamily.cn", phone: "+86 21 6888 1234", lead_type: "Off-Plan Downtown", source_form: "Off-Plan Project - Download Brochure", property_id: null, project_id: 2, budget_aed: 5000000, timeline: "Q2 2027", notes: "The Luminary Downtown VIP reservation.", status: "Offer Made", assigned_agent_id: 4, created_at: "2026-09-23" },
    { id: 26, full_name: "Fatima Al-Marri", email: "fatima.almarri@dubaiholding.ae", phone: "+971 50 334 9900", lead_type: "Dubai Hills Club Villa", source_form: "Property Detail - Book a Viewing", property_id: 13, project_id: null, budget_aed: 9200000, timeline: "Immediate", notes: "UAE national purchasing upgrade home.", status: "Offer Made", assigned_agent_id: 2, created_at: "2026-09-23" },
    { id: 27, full_name: "Henrik Lindqvist", email: "henrik@stockholmadvisory.se", phone: "+46 8 123 4567", lead_type: "Business Bay Canal", source_form: "Contact Page", property_id: 10, project_id: null, budget_aed: 4500000, timeline: "60 Days", notes: "European winter residence search.", status: "Contacted", assigned_agent_id: 3, created_at: "2026-09-24" },
    { id: 28, full_name: "Rania Kassem", email: "rkassem@beirutgroup.lb", phone: "+961 3 123 456", lead_type: "JVC Plunge Pool", source_form: "Property Detail - Book a Viewing", property_id: 14, project_id: null, budget_aed: 1500000, timeline: "30 Days", notes: "Requested floorplan for L’Orangerie.", status: "Viewing", assigned_agent_id: 4, created_at: "2026-09-24" },
    { id: 29, full_name: "James Worthington", email: "jworthington@edinburghprivate.co.uk", phone: "+44 131 496 0888", lead_type: "Burj Crown High Floor", source_form: "Mortgage Calculator - Speak to Advisor", property_id: 7, project_id: null, budget_aed: 8000000, timeline: "Immediate Cash", notes: "Seeking turnkey prime rental property.", status: "Offer Made", assigned_agent_id: 3, created_at: "2026-09-25" },
    { id: 30, full_name: "Bader Al-Sabah", email: "bader.alsabah@kuwaitinv.kw", phone: "+965 9722 3344", lead_type: "Palm Trophy Estate", source_form: "Property Detail - Book a Viewing", property_id: 3, project_id: null, budget_aed: 62000000, timeline: "Immediate Cash", notes: "Family trust looking for Frond K estate.", status: "Viewing", assigned_agent_id: 2, created_at: "2026-09-25" },
    { id: 31, full_name: "Natasha Romanova", email: "natasha@viennaasset.at", phone: "+43 1 234 5678", lead_type: "Marina Gate Flat", source_form: "Property Detail - Book a Viewing", property_id: 5, project_id: null, budget_aed: 3700000, timeline: "30 Days", notes: "Prefers high floor with marina view.", status: "Viewing", assigned_agent_id: 3, created_at: "2026-09-26" },
    { id: 32, full_name: "Dr. Ziad Nabulsi", email: "drziad@ammanmedical.jo", phone: "+962 7 9123 4567", lead_type: "Off-Plan Marina", source_form: "Off-Plan Project - Download Brochure", property_id: null, project_id: 1, budget_aed: 3500000, timeline: "Q4 2026", notes: "Inquiring about 60/40 payment plan.", status: "New", assigned_agent_id: 4, created_at: "2026-09-26" },
    { id: 33, full_name: "Claire O'Connor", email: "claire@dublincapital.ie", phone: "+353 1 496 0123", lead_type: "Business Bay Loft", source_form: "Home Register Interest", property_id: 11, project_id: null, budget_aed: 2900000, timeline: "45 Days", notes: "Cash buyer looking for immediate tenancy.", status: "Contacted", assigned_agent_id: 3, created_at: "2026-09-27" },
    { id: 34, full_name: "Mansoor Ebrahimi", email: "mebrahimi@tehranart.ir", phone: "+98 21 8877 6655", lead_type: "Downtown Duplex", source_form: "Property Detail - Book a Viewing", property_id: 8, project_id: null, budget_aed: 15000000, timeline: "60 Days", notes: "Opera district high ceiling duplex.", status: "Viewing", assigned_agent_id: 2, created_at: "2026-09-27" },
    { id: 35, full_name: "Alexander Becker", email: "alexander@munichwealth.de", phone: "+49 89 1234 5678", lead_type: "Dubai Hills Fairway", source_form: "Sell Your Property - Valuation", property_id: 12, project_id: null, budget_aed: 22500000, timeline: "Immediate Cash", notes: "Wants championship golf view villa.", status: "Won", assigned_agent_id: 2, created_at: "2026-09-28" },
    { id: 36, full_name: "Yasmin Al-Majid", email: "yasmin@manamafamily.bh", phone: "+973 3912 3456", lead_type: "Palm Beachfront Villa", source_form: "Property Detail - Book a Viewing", property_id: 1, project_id: null, budget_aed: 48000000, timeline: "Immediate Cash", notes: "Viewing scheduled with Helena Vance.", status: "Viewing", assigned_agent_id: 3, created_at: "2026-09-28" },
    { id: 37, full_name: "Kenneth Wong", email: "kenneth.wong@hkadvisory.hk", phone: "+852 9123 4567", lead_type: "Off-Plan Palm", source_form: "Off-Plan Project - Download Brochure", property_id: null, project_id: 3, budget_aed: 17000000, timeline: "Q1 2027", notes: "Golden Visa investment portfolio.", status: "New", assigned_agent_id: 4, created_at: "2026-09-28" },
    { id: 38, full_name: "Gabriela Silva", email: "gabriela@lisboarealestate.pt", phone: "+351 21 123 4567", lead_type: "JVC Investor Unit", source_form: "Top Bar Register Interest", property_id: 15, project_id: null, budget_aed: 900000, timeline: "30 Days", notes: "Entry-level rental yield property.", status: "New", assigned_agent_id: 4, created_at: "2026-09-29" },
    { id: 39, full_name: "Saad Al-Muhairi", email: "saad.almuhairi@adnocadvisory.ae", phone: "+971 50 112 8877", lead_type: "Downtown Suite", source_form: "Floating Call Me Back", property_id: 9, project_id: null, budget_aed: 6000000, timeline: "Immediate Cash", notes: "Local investor expanding Downtown holdings.", status: "Offer Made", assigned_agent_id: 2, created_at: "2026-09-29" },
    { id: 40, full_name: "William Thorne", email: "wthorne@mayfairadvisory.co.uk", phone: "+44 20 7946 0888", lead_type: "Marina Yacht Enclave", source_form: "Property Detail - Book a Viewing", property_id: 6, project_id: null, budget_aed: 6400000, timeline: "Immediate", notes: "Direct inquiry for 3-bedroom yacht marina view.", status: "New", assigned_agent_id: 3, created_at: "2026-09-29" }
  ];

  const buyerLeads = rawLeads.map(l => {
    const { score, rating } = computeScore(l);
    return {
      ...l,
      score,
      rating
    };
  });

  const viewings = [
    { id: 1, property_id: 1, lead_id: 1, agent_id: 2, viewing_date: "2026-09-30 11:00 GST", status: "Confirmed", notes: "Private security access arranged for Frond N villa." },
    { id: 2, property_id: 8, lead_id: 3, agent_id: 3, viewing_date: "2026-09-30 15:30 GST", status: "Confirmed", notes: "Sunset viewing for Opera District duplex fountain view." },
    { id: 3, property_id: 12, lead_id: 4, agent_id: 2, viewing_date: "2026-10-01 10:00 GST", status: "Confirmed", notes: "Golf cart tour of Park Ridge fairway mansion." },
    { id: 4, property_id: 7, lead_id: 9, agent_id: 4, viewing_date: "2026-10-01 14:00 GST", status: "Confirmed", notes: "Client visiting Burj Crown high floor unit." },
    { id: 5, property_id: 5, lead_id: 15, agent_id: 3, viewing_date: "2026-10-02 11:30 GST", status: "Confirmed", notes: "Marina Gate waterfront walk and apartment inspection." },
    { id: 6, property_id: 2, lead_id: 13, agent_id: 3, viewing_date: "2026-10-02 16:00 GST", status: "Scheduled", notes: "Palm Crescent penthouse inspection with chauffeur service." },
    { id: 7, property_id: 6, lead_id: 19, agent_id: 4, viewing_date: "2026-10-03 12:00 GST", status: "Scheduled", notes: "Marina yacht berth demonstration included." },
    { id: 8, property_id: 13, lead_id: 26, agent_id: 2, viewing_date: "2026-10-03 15:00 GST", status: "Scheduled", notes: "Club Villas rooftop deck viewing." },
    { id: 9, property_id: 14, lead_id: 28, agent_id: 4, viewing_date: "2026-10-04 11:00 GST", status: "Scheduled", notes: "L'Orangerie plunge pool verification." },
    { id: 10, property_id: 3, lead_id: 30, agent_id: 2, viewing_date: "2026-10-04 16:30 GST", status: "Confirmed", notes: "VIP sunset private island viewing with family office director." }
  ];

  const completedSales = [
    { id: 1, property_id: 1, project_id: null, lead_id: 16, agent_id: 2, sale_price_aed: 48000000, commission_aed: 960000, sale_date: "2026-08-14", notes: "Palm Jumeirah Frond villa sold to GCC family office." },
    { id: 2, property_id: 4, project_id: null, lead_id: 24, agent_id: 3, sale_price_aed: 12900000, commission_aed: 258000, sale_date: "2026-08-22", notes: "Azure Marina penthouse sold with UK investor Golden Visa." },
    { id: 3, property_id: 12, project_id: null, lead_id: 35, agent_id: 2, sale_price_aed: 22500000, commission_aed: 450000, sale_date: "2026-09-05", notes: "Park Ridge Emerald Mansion on golf course closed." },
    { id: 4, property_id: null, project_id: 3, lead_id: 2, agent_id: 4, sale_price_aed: 16800000, commission_aed: 336000, sale_date: "2026-09-12", notes: "Solstice Palm Residences penthouse off-plan contract registered." },
    { id: 5, property_id: 14, project_id: null, lead_id: 10, agent_id: 4, sale_price_aed: 1450000, commission_aed: 29000, sale_date: "2026-09-20", notes: "L’Orangerie JVC plunge pool unit closed for European investor." }
  ];

  const notes = [
    { id: 1, lead_id: 1, agent_id: 2, note_text: "Client confirmed liquid funds available at Emirates NBD private bank. Escrow deposit ready.", created_at: "2026-09-05" },
    { id: 2, lead_id: 2, agent_id: 4, note_text: "Monaco client signed SPA agreement for Solstice Palm off-plan penthouse.", created_at: "2026-09-15" },
    { id: 3, lead_id: 4, agent_id: 2, note_text: "Sheikh Mansoor visited Dubai Hills; prefers the extended garden plot.", created_at: "2026-09-18" },
    { id: 4, lead_id: 6, agent_id: 3, note_text: "Golden Visa documentation processed via DLD Cube center.", created_at: "2026-09-21" },
    { id: 5, lead_id: 7, agent_id: 2, note_text: "Riyadh holding family office requested private helicopter transfer to Frond K.", created_at: "2026-09-23" }
  ];

  const seedExport = {
    developers,
    offPlanProjects,
    properties,
    staffLogins,
    buyerLeads,
    viewings,
    completedSales,
    notes,
    computeScore
  };

  if (typeof window !== 'undefined') {
    window.ANN_SEED_DATA = seedExport;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = seedExport;
  }
})();
