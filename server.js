require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { initDatabase, db } = require('./db/database');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

// Rate limiting cache (IP -> { timestamps: [] })
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 50; // Generous window for interactive testing

function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [now]);
    return { allowed: true };
  }
  const timestamps = rateLimitMap.get(ip).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, message: 'Too many inquiries sent quickly. Please wait a moment.' };
  }
  // Cooldown check (minimum 1 second between submissions)
  if (timestamps.length > 0 && now - timestamps[timestamps.length - 1] < 1000) {
    return { allowed: false, message: 'Please wait a moment between form submissions.' };
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return { allowed: true };
}

// Clean up old rate limit keys periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, valid);
  }
}, 5 * 60 * 1000);

// Helper to parse JSON body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
  });
  res.end(JSON.stringify(data));
}

// Anti-Spam Validation
function validateAndCheckSpam(data) {
  // Honeypot check
  if (data.website_hp && data.website_hp.trim() !== '') {
    return { isSpam: true, reason: 'Honeypot triggered' };
  }

  // Name check
  if (!data.full_name || data.full_name.trim().length < 2) {
    return { isValid: false, message: 'Please enter a valid full name.' };
  }

  // Phone check
  const phoneClean = (data.phone || '').replace(/[\s\-\+\(\)]/g, '');
  if (!phoneClean || phoneClean.length < 7 || !/^\d+$/.test(phoneClean)) {
    return { isValid: false, message: 'Please provide a valid direct telephone or WhatsApp number.' };
  }

  // Email check
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { isValid: false, message: 'Please enter a valid email address.' };
    }
  }

  return { isValid: true, isSpam: false };
}

// Helper to extract authenticated user from request headers
function getAuthUser(req) {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'] || 'agent';
  if (!userId) return null;
  return { id: parseInt(userId, 10), role: userRole };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
    });
    res.end();
    return;
  }

  // --------------------------------------------------------------------------
  // API Routes
  // --------------------------------------------------------------------------
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Authentication: Login
      if (pathname === '/api/auth/login' && method === 'POST') {
        const { email, password } = await parseRequestBody(req);
        const user = await db.authenticateUser(email, password);
        if (!user) {
          return sendJSON(res, 401, { success: false, message: 'Invalid email or password.' });
        }
        return sendJSON(res, 200, { success: true, user });
      }

      // 2. Public Property Catalog
      if (pathname === '/api/properties' && method === 'GET') {
        const filters = {
          community: parsedUrl.query.community,
          bedrooms: parsedUrl.query.bedrooms,
          minPrice: parsedUrl.query.minPrice,
          maxPrice: parsedUrl.query.maxPrice,
          type: parsedUrl.query.type
        };
        const properties = await db.getProperties(filters);
        return sendJSON(res, 200, { success: true, count: properties.length, properties });
      }

      if (pathname.startsWith('/api/properties/') && method === 'GET') {
        const slug = pathname.replace('/api/properties/', '');
        const property = await db.getPropertyBySlug(slug);
        if (!property) return sendJSON(res, 404, { success: false, message: 'Property not found' });
        return sendJSON(res, 200, { success: true, property });
      }

      // 3. Public Off-Plan Catalog
      if (pathname === '/api/off-plan' && method === 'GET') {
        const projects = await db.getOffPlanProjects();
        return sendJSON(res, 200, { success: true, count: projects.length, projects });
      }

      if (pathname.startsWith('/api/off-plan/') && method === 'GET') {
        const slug = pathname.replace('/api/off-plan/', '');
        const project = await db.getOffPlanProjectBySlug(slug);
        if (!project) return sendJSON(res, 404, { success: false, message: 'Off-plan project not found' });
        return sendJSON(res, 200, { success: true, project });
      }

      // 4. Developers & Staff Directory
      if (pathname === '/api/developers' && method === 'GET') {
        const developers = await db.getDevelopers();
        return sendJSON(res, 200, { success: true, count: developers.length, developers });
      }

      if (pathname === '/api/staff' && method === 'GET') {
        const staff = await db.getStaff();
        return sendJSON(res, 200, { success: true, count: staff.length, staff });
      }

      // 5. Public Lead Submission (with Rate Limiting & Anti-Spam)
      if (pathname === '/api/leads' && method === 'POST') {
        // Rate limiting check
        const rateCheck = checkRateLimit(clientIp);
        if (!rateCheck.allowed) {
          return sendJSON(res, 429, { success: false, message: rateCheck.message });
        }

        const body = await parseRequestBody(req);
        const check = validateAndCheckSpam(body);

        if (check.isSpam) {
          // Silently absorb bot spam
          return sendJSON(res, 200, {
            success: true,
            vip_code: 'ANN-BOT-VOID',
            message: 'Thank you. An Ann Real Estate advisor will contact you within 24 hours.'
          });
        }

        if (check.isValid === false) {
          return sendJSON(res, 400, { success: false, message: check.message });
        }

        const newLead = await db.createLead(body);
        const vipCode = 'ANN-' + Math.floor(1000 + Math.random() * 9000);

        if (body.viewing_date && body.property_id) {
          await db.createViewing({
            property_id: parseInt(body.property_id, 10),
            lead_id: newLead.id,
            agent_id: body.agent_id ? parseInt(body.agent_id, 10) : 2,
            viewing_date: body.viewing_date,
            notes: body.notes || 'Viewing scheduled from website'
          });
        }

        return sendJSON(res, 201, {
          success: true,
          lead_id: newLead.id,
          vip_code: vipCode,
          lead_type: body.lead_type,
          full_name: newLead.full_name,
          source_form: body.source_form || 'Website Form',
          score: newLead.score,
          rating: newLead.rating,
          message: 'Thank you. A Jay Real Estate advisor will contact you within 24 hours.'
        });
      }

      // ======================================================================
      // Admin Area Endpoints
      // ======================================================================
      const authUser = getAuthUser(req);

      // Notification Bell: Check for new leads
      if (pathname === '/api/admin/notifications' && method === 'GET') {
        const notifications = await db.getNotifications();
        return sendJSON(res, 200, notifications);
      }

      // Dashboard Overview Metrics & Charts
      if (pathname === '/api/admin/dashboard' && method === 'GET') {
        const metrics = await db.getDashboardMetrics(authUser);
        return sendJSON(res, 200, metrics);
      }

      // Leads Directory & Kanban (Role-Isolated for Agents)
      if (pathname === '/api/admin/leads' && method === 'GET') {
        const filters = {
          stage: parsedUrl.query.stage,
          rating: parsedUrl.query.rating,
          agentId: parsedUrl.query.agentId,
          search: parsedUrl.query.search
        };
        const leads = await db.getLeads(filters, authUser);
        return sendJSON(res, 200, { success: true, count: leads.length, leads });
      }

      // Single Lead Detail & History
      if (pathname.match(/^\/api\/admin\/leads\/\d+$/) && method === 'GET') {
        const leadId = pathname.split('/').pop();
        const lead = await db.getLeadById(leadId);
        if (!lead) return sendJSON(res, 404, { success: false, message: 'Lead not found' });
        return sendJSON(res, 200, { success: true, lead });
      }

      // Update Lead (Stage, Rating, Assigned Agent, etc.)
      if (pathname.match(/^\/api\/admin\/leads\/\d+$/) && method === 'PATCH') {
        const leadId = pathname.split('/').pop();
        const updates = await parseRequestBody(req);
        const updated = await db.updateLead(leadId, updates);
        return sendJSON(res, 200, { success: true, lead: updated });
      }

      // Add Note to Lead
      if (pathname.match(/^\/api\/admin\/leads\/\d+\/notes$/) && method === 'POST') {
        const leadId = pathname.split('/')[4];
        const { note_text, agent_id } = await parseRequestBody(req);
        const note = await db.addNote(leadId, agent_id || (authUser ? authUser.id : 1), note_text);
        return sendJSON(res, 201, { success: true, note });
      }

      // Mark Lead Won (Calculates 2% Commission & Marks Property Sold)
      if (pathname.match(/^\/api\/admin\/leads\/\d+\/won$/) && method === 'POST') {
        const leadId = pathname.split('/')[4];
        const { property_id, sale_price_aed, agent_id, notes } = await parseRequestBody(req);
        const result = await db.markDealWon(leadId, property_id, sale_price_aed, agent_id || (authUser ? authUser.id : 2), notes);
        return sendJSON(res, 200, { success: true, ...result });
      }

      // Viewings
      if (pathname === '/api/admin/viewings' && method === 'GET') {
        const viewings = await db.getViewings(authUser);
        return sendJSON(res, 200, { success: true, count: viewings.length, viewings });
      }

      if (pathname === '/api/admin/viewings' && method === 'POST') {
        const body = await parseRequestBody(req);
        const viewing = await db.createViewing(body);
        return sendJSON(res, 201, { success: true, viewing });
      }

      // Agent Leaderboard
      if (pathname === '/api/admin/leaderboard' && method === 'GET') {
        const leaderboard = await db.getLeaderboard();
        return sendJSON(res, 200, { success: true, leaderboard });
      }

      // Stale Leads (> 3 Days Inactive)
      if (pathname === '/api/admin/stale-leads' && method === 'GET') {
        const staleLeads = await db.getStaleLeads(authUser);
        return sendJSON(res, 200, { success: true, count: staleLeads.length, staleLeads });
      }

      // Property Inventory CRUD (Admin only or authorized agents)
      if (pathname === '/api/admin/properties' && method === 'POST') {
        const body = await parseRequestBody(req);
        const newProp = await db.createProperty(body);
        return sendJSON(res, 201, { success: true, property: newProp });
      }

      if (pathname.match(/^\/api\/admin\/properties\/\d+$/) && method === 'PUT') {
        const propId = pathname.split('/').pop();
        const body = await parseRequestBody(req);
        const updated = await db.updateProperty(propId, body);
        return sendJSON(res, 200, { success: true, property: updated });
      }

      if (pathname.match(/^\/api\/admin\/properties\/\d+$/) && method === 'DELETE') {
        const propId = pathname.split('/').pop();
        await db.deleteProperty(propId);
        return sendJSON(res, 200, { success: true, message: 'Property removed' });
      }

      // Off-Plan Projects CRUD
      if (pathname === '/api/admin/projects' && method === 'POST') {
        const body = await parseRequestBody(req);
        const newProj = await db.createProject(body);
        return sendJSON(res, 201, { success: true, project: newProj });
      }

      if (pathname.match(/^\/api\/admin\/projects\/\d+$/) && method === 'PUT') {
        const projId = pathname.split('/').pop();
        const body = await parseRequestBody(req);
        const updated = await db.updateProject(projId, body);
        return sendJSON(res, 200, { success: true, project: updated });
      }

      if (pathname.match(/^\/api\/admin\/projects\/\d+$/) && method === 'DELETE') {
        const projId = pathname.split('/').pop();
        await db.deleteProject(projId);
        return sendJSON(res, 200, { success: true, message: 'Project removed' });
      }

      return sendJSON(res, 404, { success: false, message: 'Endpoint not found' });
    } catch (err) {
      console.error('API Error:', err);
      return sendJSON(res, 500, { success: false, message: 'Server error', error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Static File Serving & SPA Fallback
  // --------------------------------------------------------------------------
  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath.startsWith('/admin')) {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(path.join(PUBLIC_DIR, reqPath));
  if (!safePath.startsWith(PUBLIC_DIR) || path.basename(safePath).startsWith('.') || safePath.includes('node_modules')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (err2, content) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const headers = { 'Content-Type': contentType };

    if (ext === '.html' || ext === '.js' || ext === '.css') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      headers['Cache-Control'] = 'public, max-age=3600';
    }

    res.writeHead(200, headers);
    fs.createReadStream(safePath).pipe(res);
  });
});

// Start Server and Initialize Database
server.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`Ann Real Estate Luxury Portal is running at:`);
  console.log(`http://localhost:${PORT}`);
  console.log(`====================================================`);
  await initDatabase();
});
