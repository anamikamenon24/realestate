/**
 * Ann Real Estate - Database Access & CRM Operations
 * Supports Neon Serverless PostgreSQL with in-memory fallback.
 */

require('dotenv').config();
const { Pool } = require('pg');
const seed = require('./seedData');

let pool = null;
let isPostgres = false;

// In-Memory state store
const memoryStore = {
  developers: JSON.parse(JSON.stringify(seed.developers)),
  offPlanProjects: JSON.parse(JSON.stringify(seed.offPlanProjects)),
  properties: JSON.parse(JSON.stringify(seed.properties)),
  staffLogins: JSON.parse(JSON.stringify(seed.staffLogins)),
  buyerLeads: JSON.parse(JSON.stringify(seed.buyerLeads)),
  viewings: JSON.parse(JSON.stringify(seed.viewings)),
  completedSales: JSON.parse(JSON.stringify(seed.completedSales)),
  notes: JSON.parse(JSON.stringify(seed.notes))
};

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS developers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  established_year INTEGER,
  headquarters VARCHAR(255),
  website VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS off_plan_projects (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  community VARCHAR(255) NOT NULL,
  price_from_aed BIGINT NOT NULL,
  handover_date VARCHAR(100),
  payment_plan TEXT,
  description TEXT,
  bedrooms_available VARCHAR(255),
  image_url TEXT,
  status VARCHAR(100),
  roi_estimate VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  community VARCHAR(255) NOT NULL,
  price_aed BIGINT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  sqft INTEGER NOT NULL,
  property_type VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  status VARCHAR(100),
  features TEXT,
  completion_status VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS staff_logins (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) DEFAULT 'agent123',
  role VARCHAR(255) DEFAULT 'agent',
  phone VARCHAR(100),
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS buyer_leads (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(100) NOT NULL,
  lead_type VARCHAR(100),
  source_form VARCHAR(255),
  score INTEGER DEFAULT 50,
  rating VARCHAR(50) DEFAULT 'WARM',
  assigned_agent_id INTEGER REFERENCES staff_logins(id) ON DELETE SET NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  project_id INTEGER REFERENCES off_plan_projects(id) ON DELETE SET NULL,
  budget_aed BIGINT,
  timeline VARCHAR(100),
  notes TEXT,
  status VARCHAR(100) DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES buyer_leads(id) ON DELETE CASCADE,
  agent_id INTEGER REFERENCES staff_logins(id) ON DELETE SET NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS viewings (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES buyer_leads(id) ON DELETE CASCADE,
  agent_id INTEGER REFERENCES staff_logins(id) ON DELETE SET NULL,
  viewing_date VARCHAR(100) NOT NULL,
  status VARCHAR(100) DEFAULT 'Scheduled',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS completed_sales (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  project_id INTEGER REFERENCES off_plan_projects(id) ON DELETE SET NULL,
  lead_id INTEGER REFERENCES buyer_leads(id) ON DELETE SET NULL,
  agent_id INTEGER REFERENCES staff_logins(id) ON DELETE SET NULL,
  sale_price_aed BIGINT NOT NULL,
  commission_aed BIGINT NOT NULL,
  sale_date DATE NOT NULL,
  notes TEXT
);
`;

async function initDatabase() {
  const connString = process.env.DATABASE_URL;

  if (connString && (connString.startsWith('postgres://') || connString.startsWith('postgresql://'))) {
    try {
      pool = new Pool({
        connectionString: connString,
        ssl: { rejectUnauthorized: false }
      });

      await pool.query('SELECT NOW()');
      isPostgres = true;
      console.log('✓ Successfully connected to Neon PostgreSQL database!');

      // Run migrations
      await pool.query(SCHEMA_SQL);

      // Check if schema requires column migrations
      try {
        await pool.query('ALTER TABLE staff_logins ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT \'agent123\'');
        await pool.query('ALTER TABLE buyer_leads ADD COLUMN IF NOT EXISTS source_form VARCHAR(255)');
        await pool.query('ALTER TABLE buyer_leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 50');
        await pool.query('ALTER TABLE buyer_leads ADD COLUMN IF NOT EXISTS rating VARCHAR(50) DEFAULT \'WARM\'');
        await pool.query('ALTER TABLE buyer_leads ADD COLUMN IF NOT EXISTS assigned_agent_id INTEGER REFERENCES staff_logins(id) ON DELETE SET NULL');
      } catch (e) {
        // Ignored if already exist
      }

      const devRes = await pool.query('SELECT COUNT(*) FROM developers');
      if (parseInt(devRes.rows[0].count, 10) === 0) {
        console.log('Seeding Neon database with full CRM dataset...');

        for (const d of seed.developers) {
          await pool.query(
            'INSERT INTO developers (id, name, description, established_year, headquarters, website) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
            [d.id, d.name, d.description, d.established_year, d.headquarters, d.website]
          );
        }

        for (const p of seed.offPlanProjects) {
          await pool.query(
            `INSERT INTO off_plan_projects (id, developer_id, title, slug, community, price_from_aed, handover_date, payment_plan, description, bedrooms_available, image_url, status, roi_estimate)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (id) DO NOTHING`,
            [p.id, p.developer_id, p.title, p.slug, p.community, p.price_from_aed, p.handover_date, p.payment_plan, p.description, p.bedrooms_available, p.image_url, p.status, p.roi_estimate]
          );
        }

        for (const pr of seed.properties) {
          await pool.query(
            `INSERT INTO properties (id, developer_id, title, slug, community, price_aed, bedrooms, bathrooms, sqft, property_type, description, image_url, status, features, completion_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) ON CONFLICT (id) DO NOTHING`,
            [pr.id, pr.developer_id, pr.title, pr.slug, pr.community, pr.price_aed, pr.bedrooms, pr.bathrooms, pr.sqft, pr.property_type, pr.description, pr.image_url, pr.status, pr.features, pr.completion_status]
          );
        }

        for (const s of seed.staffLogins) {
          await pool.query(
            'INSERT INTO staff_logins (id, full_name, email, password, role, phone, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
            [s.id, s.full_name, s.email, s.password, s.role, s.phone, s.avatar_url]
          );
        }

        for (const l of seed.buyerLeads) {
          await pool.query(
            `INSERT INTO buyer_leads (id, full_name, email, phone, lead_type, source_form, score, rating, assigned_agent_id, property_id, project_id, budget_aed, timeline, notes, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) ON CONFLICT (id) DO NOTHING`,
            [l.id, l.full_name, l.email, l.phone, l.lead_type, l.source_form, l.score, l.rating, l.assigned_agent_id, l.property_id, l.project_id, l.budget_aed, l.timeline, l.notes, l.status, l.created_at]
          );
        }

        for (const v of seed.viewings) {
          await pool.query(
            'INSERT INTO viewings (id, property_id, lead_id, agent_id, viewing_date, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
            [v.id, v.property_id, v.lead_id, v.agent_id, v.viewing_date, v.status, v.notes]
          );
        }

        for (const cs of seed.completedSales) {
          await pool.query(
            'INSERT INTO completed_sales (id, property_id, project_id, lead_id, agent_id, sale_price_aed, commission_aed, sale_date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
            [cs.id, cs.property_id, cs.project_id, cs.lead_id, cs.agent_id, cs.sale_price_aed, cs.commission_aed, cs.sale_date, cs.notes]
          );
        }

        for (const n of seed.notes) {
          await pool.query(
            'INSERT INTO notes (id, lead_id, agent_id, note_text, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
            [n.id, n.lead_id, n.agent_id, n.note_text, n.created_at]
          );
        }

        await pool.query(`SELECT setval('developers_id_seq', (SELECT MAX(id) FROM developers))`);
        await pool.query(`SELECT setval('off_plan_projects_id_seq', (SELECT MAX(id) FROM off_plan_projects))`);
        await pool.query(`SELECT setval('properties_id_seq', (SELECT MAX(id) FROM properties))`);
        await pool.query(`SELECT setval('staff_logins_id_seq', (SELECT MAX(id) FROM staff_logins))`);
        await pool.query(`SELECT setval('buyer_leads_id_seq', (SELECT MAX(id) FROM buyer_leads))`);
        await pool.query(`SELECT setval('viewings_id_seq', (SELECT MAX(id) FROM viewings))`);
        await pool.query(`SELECT setval('completed_sales_id_seq', (SELECT MAX(id) FROM completed_sales))`);
        await pool.query(`SELECT setval('notes_id_seq', (SELECT MAX(id) FROM notes))`);

        console.log('✓ Neon database seeded with CRM tables & data successfully!');
      }

    } catch (err) {
      console.warn('Neon connection failed:', err.message);
      isPostgres = false;
    }
  } else {
    isPostgres = false;
  }
}

const db = {
  isPostgres: () => isPostgres,

  // Auth: authenticate user by email and password
  async authenticateUser(email, password) {
    if (!email || !password) return null;
    const cleanEmail = email.toLowerCase().trim();

    if (isPostgres) {
      const res = await pool.query('SELECT id, full_name, email, role, phone, avatar_url FROM staff_logins WHERE LOWER(email) = $1 AND password = $2', [cleanEmail, password]);
      return res.rows[0] || null;
    }

    const user = memoryStore.staffLogins.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!user) return null;
    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  // Properties Catalog
  async getProperties(filters = {}) {
    if (isPostgres) {
      let query = `
        SELECT p.*, d.name as developer_name 
        FROM properties p 
        LEFT JOIN developers d ON p.developer_id = d.id 
        WHERE 1=1
      `;
      const params = [];
      let idx = 1;

      if (filters.community && filters.community !== 'all') {
        query += ` AND p.community ILIKE $${idx++}`;
        params.push(`%${filters.community}%`);
      }
      if (filters.bedrooms && filters.bedrooms !== 'all') {
        query += ` AND p.bedrooms = $${idx++}`;
        params.push(parseInt(filters.bedrooms, 10));
      }
      if (filters.minPrice) {
        query += ` AND p.price_aed >= $${idx++}`;
        params.push(parseInt(filters.minPrice, 10));
      }
      if (filters.maxPrice) {
        query += ` AND p.price_aed <= $${idx++}`;
        params.push(parseInt(filters.maxPrice, 10));
      }
      if (filters.type && filters.type !== 'all') {
        query += ` AND p.property_type ILIKE $${idx++}`;
        params.push(`%${filters.type}%`);
      }

      query += ` ORDER BY p.price_aed DESC`;
      const res = await pool.query(query, params);
      return res.rows;
    }

    return memoryStore.properties.filter(p => {
      if (filters.community && filters.community !== 'all' && !p.community.toLowerCase().includes(filters.community.toLowerCase())) return false;
      if (filters.bedrooms && filters.bedrooms !== 'all' && p.bedrooms !== parseInt(filters.bedrooms, 10)) return false;
      if (filters.minPrice && p.price_aed < parseInt(filters.minPrice, 10)) return false;
      if (filters.maxPrice && p.price_aed > parseInt(filters.maxPrice, 10)) return false;
      if (filters.type && filters.type !== 'all' && !p.property_type.toLowerCase().includes(filters.type.toLowerCase())) return false;
      return true;
    }).map(p => {
      const dev = memoryStore.developers.find(d => d.id === p.developer_id);
      return { ...p, developer_name: dev ? dev.name : 'Ann Sovereign Developments' };
    });
  },

  async getPropertyBySlug(slug) {
    if (isPostgres) {
      const res = await pool.query(`
        SELECT p.*, d.name as developer_name, d.description as developer_description
        FROM properties p 
        LEFT JOIN developers d ON p.developer_id = d.id 
        WHERE p.slug = $1
      `, [slug]);
      return res.rows[0] || null;
    }
    const prop = memoryStore.properties.find(p => p.slug === slug);
    if (!prop) return null;
    const dev = memoryStore.developers.find(d => d.id === prop.developer_id);
    return { ...prop, developer_name: dev ? dev.name : 'Ann Sovereign Developments', developer_description: dev ? dev.description : '' };
  },

  // Off-Plan Catalog
  async getOffPlanProjects() {
    if (isPostgres) {
      const res = await pool.query(`
        SELECT p.*, d.name as developer_name 
        FROM off_plan_projects p 
        LEFT JOIN developers d ON p.developer_id = d.id 
        ORDER BY p.id ASC
      `);
      return res.rows;
    }
    return memoryStore.offPlanProjects.map(p => {
      const dev = memoryStore.developers.find(d => d.id === p.developer_id);
      return { ...p, developer_name: dev ? dev.name : 'Private Developer' };
    });
  },

  async getOffPlanProjectBySlug(slug) {
    if (isPostgres) {
      const res = await pool.query(`
        SELECT p.*, d.name as developer_name, d.description as developer_description
        FROM off_plan_projects p 
        LEFT JOIN developers d ON p.developer_id = d.id 
        WHERE p.slug = $1
      `, [slug]);
      return res.rows[0] || null;
    }
    const project = memoryStore.offPlanProjects.find(p => p.slug === slug);
    if (!project) return null;
    const dev = memoryStore.developers.find(d => d.id === project.developer_id);
    return { ...project, developer_name: dev ? dev.name : 'Private Developer', developer_description: dev ? dev.description : '' };
  },

  // Developers & Staff
  async getDevelopers() {
    if (isPostgres) {
      const res = await pool.query('SELECT * FROM developers ORDER BY id ASC');
      return res.rows;
    }
    return memoryStore.developers;
  },

  async getStaff() {
    if (isPostgres) {
      const res = await pool.query('SELECT id, full_name, email, role, phone, avatar_url FROM staff_logins ORDER BY id ASC');
      return res.rows;
    }
    return memoryStore.staffLogins.map(s => {
      const { password: _, ...rest } = s;
      return rest;
    });
  },

  // Create Buyer Lead with Auto-Score & Source Tracking
  async createLead(leadData) {
    const { full_name, email, phone, lead_type, source_form, property_id, project_id, budget_aed, timeline, notes } = leadData;

    // Calculate score (0-100) and rating (HOT / WARM / COLD)
    const { score, rating } = seed.computeScore(leadData);

    // Default round-robin agent assignment (agents 2, 3, 4)
    const agentIds = [2, 3, 4];
    const assigned_agent_id = leadData.assigned_agent_id ? parseInt(leadData.assigned_agent_id, 10) : agentIds[Math.floor(Math.random() * agentIds.length)];

    if (isPostgres) {
      const res = await pool.query(`
        INSERT INTO buyer_leads (full_name, email, phone, lead_type, source_form, score, rating, assigned_agent_id, property_id, project_id, budget_aed, timeline, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'New')
        RETURNING *
      `, [full_name, email, phone, lead_type, source_form || 'Website Inquiry', score, rating, assigned_agent_id, property_id || null, project_id || null, budget_aed || null, timeline || 'Immediate', notes || 'Inquiry registered from portal']);
      return res.rows[0];
    }

    const newLead = {
      id: memoryStore.buyerLeads.length + 1,
      full_name,
      email,
      phone,
      lead_type: lead_type || 'General Inquiry',
      source_form: source_form || 'Website Inquiry',
      score,
      rating,
      assigned_agent_id,
      property_id: property_id || null,
      project_id: project_id || null,
      budget_aed: budget_aed || null,
      timeline: timeline || 'Immediate',
      notes: notes || 'Inquiry registered from portal',
      status: 'New',
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    };
    memoryStore.buyerLeads.unshift(newLead);
    return newLead;
  },

  // Admin Leads Management with Agent Isolation
  async getLeads(filters = {}, user = null) {
    let leads = [];

    if (isPostgres) {
      let query = `
        SELECT l.*, s.full_name as agent_name, p.title as property_title, op.title as project_title
        FROM buyer_leads l
        LEFT JOIN staff_logins s ON l.assigned_agent_id = s.id
        LEFT JOIN properties p ON l.property_id = p.id
        LEFT JOIN off_plan_projects op ON l.project_id = op.id
        WHERE 1=1
      `;
      const params = [];
      let idx = 1;

      // Agent isolation: Agents ONLY see their own leads
      if (user && user.role === 'agent') {
        query += ` AND l.assigned_agent_id = $${idx++}`;
        params.push(user.id);
      }

      if (filters.stage && filters.stage !== 'all') {
        query += ` AND l.status ILIKE $${idx++}`;
        params.push(filters.stage);
      }
      if (filters.rating && filters.rating !== 'all') {
        query += ` AND l.rating = $${idx++}`;
        params.push(filters.rating);
      }
      if (filters.agentId && filters.agentId !== 'all') {
        query += ` AND l.assigned_agent_id = $${idx++}`;
        params.push(parseInt(filters.agentId, 10));
      }
      if (filters.search) {
        query += ` AND (l.full_name ILIKE $${idx} OR l.phone ILIKE $${idx} OR l.email ILIKE $${idx})`;
        params.push(`%${filters.search}%`);
        idx++;
      }

      query += ` ORDER BY l.id DESC`;
      const res = await pool.query(query, params);
      leads = res.rows;
    } else {
      leads = memoryStore.buyerLeads.filter(l => {
        // Agent isolation
        if (user && user.role === 'agent' && l.assigned_agent_id !== user.id) {
          return false;
        }
        if (filters.stage && filters.stage !== 'all' && l.status.toLowerCase() !== filters.stage.toLowerCase()) {
          return false;
        }
        if (filters.rating && filters.rating !== 'all' && l.rating !== filters.rating) {
          return false;
        }
        if (filters.agentId && filters.agentId !== 'all' && l.assigned_agent_id !== parseInt(filters.agentId, 10)) {
          return false;
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const match = (l.full_name || '').toLowerCase().includes(q) ||
                        (l.phone || '').toLowerCase().includes(q) ||
                        (l.email || '').toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      }).map(l => {
        const agent = memoryStore.staffLogins.find(s => s.id === l.assigned_agent_id);
        const prop = memoryStore.properties.find(p => p.id === l.property_id);
        const proj = memoryStore.offPlanProjects.find(pr => pr.id === l.project_id);
        return {
          ...l,
          agent_name: agent ? agent.full_name : 'Unassigned',
          property_title: prop ? prop.title : null,
          project_title: proj ? proj.title : null
        };
      });
    }

    return leads;
  },

  async getLeadById(id) {
    const leadId = parseInt(id, 10);
    if (isPostgres) {
      const res = await pool.query(`
        SELECT l.*, s.full_name as agent_name, p.title as property_title, p.price_aed as property_price, op.title as project_title
        FROM buyer_leads l
        LEFT JOIN staff_logins s ON l.assigned_agent_id = s.id
        LEFT JOIN properties p ON l.property_id = p.id
        LEFT JOIN off_plan_projects op ON l.project_id = op.id
        WHERE l.id = $1
      `, [leadId]);
      if (res.rows.length === 0) return null;
      const lead = res.rows[0];

      // Notes
      const notesRes = await pool.query(`
        SELECT n.*, s.full_name as agent_name 
        FROM notes n 
        LEFT JOIN staff_logins s ON n.agent_id = s.id 
        WHERE n.lead_id = $1 
        ORDER BY n.id DESC
      `, [leadId]);
      lead.notes_history = notesRes.rows;

      // Viewings
      const viewRes = await pool.query('SELECT * FROM viewings WHERE lead_id = $1', [leadId]);
      lead.viewings_history = viewRes.rows;

      return lead;
    }

    const lead = memoryStore.buyerLeads.find(l => l.id === leadId);
    if (!lead) return null;
    const agent = memoryStore.staffLogins.find(s => s.id === lead.assigned_agent_id);
    const prop = memoryStore.properties.find(p => p.id === lead.property_id);
    const proj = memoryStore.offPlanProjects.find(pr => pr.id === lead.project_id);
    const notesHistory = memoryStore.notes.filter(n => n.lead_id === leadId).map(n => {
      const a = memoryStore.staffLogins.find(st => st.id === n.agent_id);
      return { ...n, agent_name: a ? a.full_name : 'Private Advisor' };
    });
    const viewingsHistory = memoryStore.viewings.filter(v => v.lead_id === leadId);

    return {
      ...lead,
      agent_name: agent ? agent.full_name : 'Unassigned',
      property_title: prop ? prop.title : null,
      property_price: prop ? prop.price_aed : null,
      project_title: proj ? proj.title : null,
      notes_history: notesHistory,
      viewings_history: viewingsHistory
    };
  },

  async updateLead(id, updates) {
    const leadId = parseInt(id, 10);

    if (isPostgres) {
      const fields = [];
      const params = [leadId];
      let idx = 2;

      for (const [key, val] of Object.entries(updates)) {
        fields.push(`${key} = $${idx++}`);
        params.push(val);
      }
      fields.push(`updated_at = NOW()`);

      const query = `UPDATE buyer_leads SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
      const res = await pool.query(query, params);
      return res.rows[0];
    }

    const lead = memoryStore.buyerLeads.find(l => l.id === leadId);
    if (!lead) return null;
    Object.assign(lead, updates, { updated_at: new Date().toISOString() });
    return lead;
  },

  async addNote(leadId, agentId, text) {
    if (isPostgres) {
      const res = await pool.query('INSERT INTO notes (lead_id, agent_id, note_text) VALUES ($1, $2, $3) RETURNING *', [leadId, agentId, text]);
      return res.rows[0];
    }
    const newNote = {
      id: memoryStore.notes.length + 1,
      lead_id: parseInt(leadId, 10),
      agent_id: agentId ? parseInt(agentId, 10) : 1,
      note_text: text,
      created_at: new Date().toISOString().split('T')[0]
    };
    memoryStore.notes.unshift(newNote);
    return newNote;
  },

  // Mark Deal Won (Calculates 2% commission & Marks Property Sold)
  async markDealWon(leadId, propertyId, salePriceAED, agentId, notesText = '') {
    const price = parseFloat(salePriceAED) || 0;
    const commission = Math.round(price * 0.02); // 2% commission

    if (isPostgres) {
      // 1. Update lead stage to 'Won'
      await pool.query('UPDATE buyer_leads SET status = \'Won\', updated_at = NOW() WHERE id = $1', [leadId]);

      // 2. Mark property as 'Sold' if propertyId provided
      if (propertyId) {
        await pool.query('UPDATE properties SET status = \'Sold\' WHERE id = $1', [propertyId]);
      }

      // 3. Record Completed Sale
      const res = await pool.query(`
        INSERT INTO completed_sales (property_id, lead_id, agent_id, sale_price_aed, commission_aed, sale_date, notes)
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6)
        RETURNING *
      `, [propertyId || null, leadId, agentId || 1, price, commission, notesText || 'Deal marked as Won']);

      return {
        sale: res.rows[0],
        commission_aed: commission,
        sale_price_aed: price
      };
    }

    const lead = memoryStore.buyerLeads.find(l => l.id === parseInt(leadId, 10));
    if (lead) lead.status = 'Won';

    if (propertyId) {
      const prop = memoryStore.properties.find(p => p.id === parseInt(propertyId, 10));
      if (prop) prop.status = 'Sold';
    }

    const newSale = {
      id: memoryStore.completedSales.length + 1,
      property_id: propertyId ? parseInt(propertyId, 10) : null,
      project_id: null,
      lead_id: parseInt(leadId, 10),
      agent_id: agentId ? parseInt(agentId, 10) : 1,
      sale_price_aed: price,
      commission_aed: commission,
      sale_date: new Date().toISOString().split('T')[0],
      notes: notesText || 'Deal closed'
    };
    memoryStore.completedSales.unshift(newSale);

    return {
      sale: newSale,
      commission_aed: commission,
      sale_price_aed: price
    };
  },

  // Viewings
  async getViewings(user = null) {
    if (isPostgres) {
      let query = `
        SELECT v.*, p.title as property_title, p.community, l.full_name as lead_name, l.phone as lead_phone, s.full_name as agent_name
        FROM viewings v
        LEFT JOIN properties p ON v.property_id = p.id
        LEFT JOIN buyer_leads l ON v.lead_id = l.id
        LEFT JOIN staff_logins s ON v.agent_id = s.id
        WHERE 1=1
      `;
      const params = [];
      if (user && user.role === 'agent') {
        query += ` AND v.agent_id = $1`;
        params.push(user.id);
      }
      query += ` ORDER BY v.id DESC`;
      const res = await pool.query(query, params);
      return res.rows;
    }

    return memoryStore.viewings.filter(v => {
      if (user && user.role === 'agent' && v.agent_id !== user.id) return false;
      return true;
    }).map(v => {
      const prop = memoryStore.properties.find(p => p.id === v.property_id);
      const lead = memoryStore.buyerLeads.find(l => l.id === v.lead_id);
      const agent = memoryStore.staffLogins.find(s => s.id === v.agent_id);
      return {
        ...v,
        property_title: prop ? prop.title : 'Prime Dubai Residence',
        community: prop ? prop.community : 'Dubai',
        lead_name: lead ? lead.full_name : 'Valued Buyer',
        lead_phone: lead ? lead.phone : '',
        agent_name: agent ? agent.full_name : 'Senior Director'
      };
    });
  },

  async createViewing(data) {
    const { property_id, lead_id, agent_id, viewing_date, notes } = data;
    if (isPostgres) {
      const res = await pool.query(`
        INSERT INTO viewings (property_id, lead_id, agent_id, viewing_date, status, notes)
        VALUES ($1, $2, $3, $4, 'Confirmed', $5)
        RETURNING *
      `, [property_id, lead_id, agent_id || 1, viewing_date, notes || 'Viewing scheduled']);
      return res.rows[0];
    }
    const newViewing = {
      id: memoryStore.viewings.length + 1,
      property_id: parseInt(property_id, 10),
      lead_id: parseInt(lead_id, 10),
      agent_id: agent_id ? parseInt(agent_id, 10) : 1,
      viewing_date,
      status: 'Confirmed',
      notes: notes || 'Viewing scheduled'
    };
    memoryStore.viewings.unshift(newViewing);
    return newViewing;
  },

  // Agent Leaderboard
  async getLeaderboard() {
    const agents = isPostgres
      ? (await pool.query('SELECT id, full_name, email, role, phone, avatar_url FROM staff_logins WHERE role != \'admin\' ORDER BY id ASC')).rows
      : memoryStore.staffLogins.filter(s => s.role !== 'admin');

    const leaderboard = [];
    const monthlyTarget = 25000000; // AED 25,000,000 monthly sales quota

    for (const ag of agents) {
      let salesCount = 0;
      let salesVol = 0;
      let comm = 0;

      if (isPostgres) {
        const salesRes = await pool.query('SELECT COUNT(*), COALESCE(SUM(sale_price_aed), 0) as vol, COALESCE(SUM(commission_aed), 0) as comm FROM completed_sales WHERE agent_id = $1', [ag.id]);
        salesCount = parseInt(salesRes.rows[0].count, 10);
        salesVol = parseInt(salesRes.rows[0].vol, 10);
        comm = parseInt(salesRes.rows[0].comm, 10);
      } else {
        const agSales = memoryStore.completedSales.filter(cs => cs.agent_id === ag.id);
        salesCount = agSales.length;
        salesVol = agSales.reduce((acc, s) => acc + s.sale_price_aed, 0);
        comm = agSales.reduce((acc, s) => acc + s.commission_aed, 0);
      }

      leaderboard.push({
        agent_id: ag.id,
        full_name: ag.full_name,
        role: ag.role || 'Senior Client Director',
        avatar_url: ag.avatar_url,
        sales_count: salesCount,
        deals_won: salesCount,
        sales_volume_aed: salesVol,
        commission_earned_aed: comm,
        monthly_target_aed: monthlyTarget,
        target_progress_pct: Math.min(100, Math.round((salesVol / monthlyTarget) * 100)),
        quota_percent: Math.min(100, Math.round((salesVol / monthlyTarget) * 100))
      });
    }

    return leaderboard.sort((a, b) => b.sales_volume_aed - a.sales_volume_aed);
  },

  // Stale Leads (> 3 days with status 'New' or 'Contacted')
  async getStaleLeads(user = null) {
    if (isPostgres) {
      let query = `
        SELECT l.*, s.full_name as agent_name, p.title as property_title 
        FROM buyer_leads l
        LEFT JOIN staff_logins s ON l.assigned_agent_id = s.id
        LEFT JOIN properties p ON l.property_id = p.id
        WHERE (l.status = 'New' OR l.status = 'Contacted')
          AND l.created_at <= NOW() - INTERVAL '3 days'
      `;
      const params = [];
      if (user && user.role === 'agent') {
        query += ` AND l.assigned_agent_id = $1`;
        params.push(user.id);
      }
      query += ` ORDER BY l.created_at ASC`;
      const res = await pool.query(query, params);
      return res.rows;
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return memoryStore.buyerLeads.filter(l => {
      if (user && user.role === 'agent' && l.assigned_agent_id !== user.id) return false;
      if (l.status !== 'New' && l.status !== 'Contacted') return false;
      const created = new Date(l.created_at);
      return created <= threeDaysAgo;
    }).map(l => {
      const agent = memoryStore.staffLogins.find(s => s.id === l.assigned_agent_id);
      const prop = memoryStore.properties.find(p => p.id === l.property_id);
      return {
        ...l,
        agent_name: agent ? agent.full_name : 'Unassigned',
        property_title: prop ? prop.title : null
      };
    });
  },

  // Notification Bell: Count of unread / 'New' leads
  async getNotifications() {
    if (isPostgres) {
      const countRes = await pool.query('SELECT COUNT(*) FROM buyer_leads WHERE status = \'New\'');
      const recentRes = await pool.query(`
        SELECT id, full_name, lead_type, source_form, budget_aed, rating, score, created_at 
        FROM buyer_leads 
        WHERE status = 'New' 
        ORDER BY id DESC LIMIT 8
      `);
      const count = parseInt(countRes.rows[0].count, 10);
      return {
        success: true,
        new_leads_count: count,
        unread_count: count,
        recent: recentRes.rows,
        recent_new_leads: recentRes.rows
      };
    }

    const newLeads = memoryStore.buyerLeads.filter(l => l.status === 'New');
    const recent = newLeads.slice(0, 8);
    return {
      success: true,
      new_leads_count: newLeads.length,
      unread_count: newLeads.length,
      recent: recent,
      recent_new_leads: recent
    };
  },

  // Dashboard Metrics
  async getDashboardMetrics(user = null) {
    const leads = await this.getLeads({}, user);
    const viewings = await this.getViewings(user);

    // Sales metrics
    let totalSalesVol = 0;
    let totalComm = 0;
    let salesCount = 0;

    if (isPostgres) {
      let salesQuery = 'SELECT COUNT(*), COALESCE(SUM(sale_price_aed), 0) as vol, COALESCE(SUM(commission_aed), 0) as comm FROM completed_sales WHERE 1=1';
      const params = [];
      if (user && user.role === 'agent') {
        salesQuery += ' AND agent_id = $1';
        params.push(user.id);
      }
      const sRes = await pool.query(salesQuery, params);
      salesCount = parseInt(sRes.rows[0].count, 10);
      totalSalesVol = parseInt(sRes.rows[0].vol, 10);
      totalComm = parseInt(sRes.rows[0].comm, 10);
    } else {
      const sales = memoryStore.completedSales.filter(s => !user || user.role !== 'agent' || s.agent_id === user.id);
      salesCount = sales.length;
      totalSalesVol = sales.reduce((acc, s) => acc + s.sale_price_aed, 0);
      totalComm = sales.reduce((acc, s) => acc + s.commission_aed, 0);
    }

    // Pipeline deal value (sum of budgets for active leads: New, Contacted, Viewing, Offer)
    const activeLeads = leads.filter(l => ['new', 'contacted', 'viewing', 'offer'].includes((l.status || '').toLowerCase()));
    const totalPipelineValue = activeLeads.reduce((acc, l) => acc + (Number(l.budget_aed) || 0), 0);

    // Leads by stage counts
    const stageCounts = {
      New: leads.filter(l => (l.status || '').toLowerCase() === 'new').length,
      Contacted: leads.filter(l => (l.status || '').toLowerCase() === 'contacted').length,
      Viewing: leads.filter(l => (l.status || '').toLowerCase() === 'viewing').length,
      Offer: leads.filter(l => (l.status || '').toLowerCase() === 'offer made' || (l.status || '').toLowerCase() === 'offer').length,
      Won: leads.filter(l => (l.status || '').toLowerCase() === 'won').length,
      Lost: leads.filter(l => (l.status || '').toLowerCase() === 'lost').length
    };

    // Rating counts
    const ratingCounts = {
      HOT: leads.filter(l => l.rating === 'HOT').length,
      WARM: leads.filter(l => l.rating === 'WARM').length,
      COLD: leads.filter(l => l.rating === 'COLD').length
    };

    return {
      success: true,
      metrics: {
        new_leads_today: leads.filter(l => l.status === 'New').length,
        total_pipeline_value_aed: totalPipelineValue,
        viewings_this_week: viewings.length,
        sales_volume_month_aed: totalSalesVol,
        sales_count_month: salesCount,
        commission_month_aed: totalComm || Math.round(totalSalesVol * 0.02)
      },
      stage_breakdown: stageCounts,
      rating_breakdown: ratingCounts,
      new_leads_today: leads.filter(l => l.status === 'New').length,
      total_pipeline_value_aed: totalPipelineValue,
      viewings_this_week: viewings.length,
      sales_this_month: salesCount,
      commission_this_month_aed: totalComm,
      total_sales_volume_aed: totalSalesVol,
      stage_counts: stageCounts,
      rating_counts: ratingCounts
    };
  },

  // CRUD for Properties
  async createProperty(data) {
    const slug = (data.title || 'luxury-property').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    if (isPostgres) {
      const res = await pool.query(`
        INSERT INTO properties (developer_id, title, slug, community, price_aed, bedrooms, bathrooms, sqft, property_type, description, image_url, status, features, completion_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [data.developer_id || 1, data.title, slug, data.community, data.price_aed, data.bedrooms || 3, data.bathrooms || 4, data.sqft || 3000, data.property_type || 'Villa', data.description, data.image_url || 'assets/images/palm-villa.jpg', data.status || 'Ready to Move', data.features || 'Private Pool, Luxury Finishes', data.completion_status || 'Completed']);
      return res.rows[0];
    }
    const newProp = {
      id: memoryStore.properties.length + 1,
      developer_id: data.developer_id ? parseInt(data.developer_id, 10) : 1,
      title: data.title,
      slug,
      community: data.community,
      price_aed: parseInt(data.price_aed, 10),
      bedrooms: parseInt(data.bedrooms || 3, 10),
      bathrooms: parseInt(data.bathrooms || 4, 10),
      sqft: parseInt(data.sqft || 3000, 10),
      property_type: data.property_type || 'Villa',
      description: data.description,
      image_url: data.image_url || 'assets/images/palm-villa.jpg',
      status: data.status || 'Ready to Move',
      features: data.features || 'Private Pool, Luxury Finishes',
      completion_status: data.completion_status || 'Completed'
    };
    memoryStore.properties.unshift(newProp);
    return newProp;
  },

  async updateProperty(id, data) {
    const propId = parseInt(id, 10);
    if (isPostgres) {
      const res = await pool.query(`
        UPDATE properties SET title = $2, community = $3, price_aed = $4, bedrooms = $5, bathrooms = $6, sqft = $7, property_type = $8, status = $9, description = $10, image_url = $11
        WHERE id = $1
        RETURNING *
      `, [propId, data.title, data.community, data.price_aed, data.bedrooms, data.bathrooms, data.sqft, data.property_type, data.status, data.description, data.image_url]);
      return res.rows[0];
    }
    const prop = memoryStore.properties.find(p => p.id === propId);
    if (!prop) return null;
    Object.assign(prop, data);
    return prop;
  },

  async deleteProperty(id) {
    const propId = parseInt(id, 10);
    if (isPostgres) {
      await pool.query('DELETE FROM properties WHERE id = $1', [propId]);
      return true;
    }
    const idx = memoryStore.properties.findIndex(p => p.id === propId);
    if (idx !== -1) {
      memoryStore.properties.splice(idx, 1);
      return true;
    }
    return false;
  },

  // CRUD for Off-Plan Projects
  async createProject(data) {
    const slug = (data.title || 'off-plan-project').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    if (isPostgres) {
      const res = await pool.query(`
        INSERT INTO off_plan_projects (developer_id, title, slug, community, price_from_aed, handover_date, payment_plan, description, bedrooms_available, image_url, status, roi_estimate)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [data.developer_id || 1, data.title, slug, data.community, data.price_from_aed, data.handover_date, data.payment_plan, data.description, data.bedrooms_available, data.image_url || 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=85', data.status || 'Under Construction', data.roi_estimate || '8.5% Net Projected Yield']);
      return res.rows[0];
    }
    const newProj = {
      id: memoryStore.offPlanProjects.length + 1,
      developer_id: data.developer_id ? parseInt(data.developer_id, 10) : 1,
      title: data.title,
      slug,
      community: data.community,
      price_from_aed: parseInt(data.price_from_aed, 10),
      handover_date: data.handover_date || 'Q4 2027',
      payment_plan: data.payment_plan || '60/40 Plan',
      description: data.description,
      bedrooms_available: data.bedrooms_available || '1, 2, 3 Bedrooms',
      image_url: data.image_url || 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=85',
      status: data.status || 'Under Construction',
      roi_estimate: data.roi_estimate || '8.5% Net Projected Yield'
    };
    memoryStore.offPlanProjects.unshift(newProj);
    return newProj;
  },

  async updateProject(id, data) {
    const projId = parseInt(id, 10);
    if (isPostgres) {
      const res = await pool.query(`
        UPDATE off_plan_projects SET title = $2, community = $3, price_from_aed = $4, handover_date = $5, payment_plan = $6, description = $7, image_url = $8
        WHERE id = $1
        RETURNING *
      `, [projId, data.title, data.community, data.price_from_aed, data.handover_date, data.payment_plan, data.description, data.image_url]);
      return res.rows[0];
    }
    const proj = memoryStore.offPlanProjects.find(p => p.id === projId);
    if (!proj) return null;
    Object.assign(proj, data);
    return proj;
  },

  async deleteProject(id) {
    const projId = parseInt(id, 10);
    if (isPostgres) {
      await pool.query('DELETE FROM off_plan_projects WHERE id = $1', [projId]);
      return true;
    }
    const idx = memoryStore.offPlanProjects.findIndex(p => p.id === projId);
    if (idx !== -1) {
      memoryStore.offPlanProjects.splice(idx, 1);
      return true;
    }
    return false;
  }
};

module.exports = {
  initDatabase,
  db
};
