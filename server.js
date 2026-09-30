require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const { initDatabase, db } = require('./db/database');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const AUTH_SECRET = process.env.AUTH_SECRET || 'ann_dubai_luxury_advisory_secret_key_2026';

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

// ============================================================================
// Security & Authentication Helpers
// ============================================================================

// Cryptographic Token Generation (HMAC-SHA256)
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Rate Limiting: Form Submissions
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 50;

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
  if (timestamps.length > 0 && now - timestamps[timestamps.length - 1] < 1000) {
    return { allowed: false, message: 'Please wait a moment between form submissions.' };
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return { allowed: true };
}

// Rate Limiting: Authentication Endpoints (Brute-Force Defense)
const loginAttemptsMap = new Map();
const LOGIN_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_LOGIN_ATTEMPTS = 5;

function checkLoginRateLimit(ip) {
  const now = Date.now();
  const attempts = (loginAttemptsMap.get(ip) || []).filter(ts => now - ts < LOGIN_WINDOW_MS);
  if (attempts.length >= MAX_LOGIN_ATTEMPTS) {
    return false;
  }
  return true;
}

function recordLoginFailure(ip) {
  const now = Date.now();
  const attempts = (loginAttemptsMap.get(ip) || []).filter(ts => now - ts < LOGIN_WINDOW_MS);
  attempts.push(now);
  loginAttemptsMap.set(ip, attempts);
}

function recordLoginSuccess(ip) {
  loginAttemptsMap.delete(ip);
}

// Clean up stale rate limits periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, valid);
  }
  for (const [ip, timestamps] of loginAttemptsMap.entries()) {
    const valid = timestamps.filter(ts => now - ts < LOGIN_WINDOW_MS);
    if (valid.length === 0) loginAttemptsMap.delete(ip);
    else loginAttemptsMap.set(ip, valid);
  }
}, 5 * 60 * 1000);

// Helper to parse JSON body with strict length limit
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.socket.destroy();
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

// Allowed CORS Origins
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://anamikamenon24.github.io'
]);

function getCorsOrigin(req) {
  if (!req) return 'http://localhost:3000';
  const origin = req.headers['origin'];
  if (!origin) return 'http://localhost:3000';
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  if (req.headers['host'] && origin.includes(req.headers['host'])) return origin;
  return 'http://localhost:3000';
}

function sendJSON(res, statusCode, data, req = null) {
  const allowOrigin = getCorsOrigin(req);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth-token',
    'Access-Control-Allow-Credentials': 'true',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  res.end(JSON.stringify(data));
}

// Anti-Spam & Form Validation
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

// Extract and cryptographically verify authenticated identity
function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || '';
  let token = null;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }
  return verifyToken(token);
}

// Enforce mandatory authentication and optional role restrictions
function requireAuth(req, res, requiredRole = null) {
  const user = getAuthUser(req);
  if (!user) {
    sendJSON(res, 401, { success: false, message: 'Authentication required. Please log in.' }, req);
    return null;
  }
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    sendJSON(res, 403, { success: false, message: 'Access denied. Insufficient administrative privileges.' }, req);
    return null;
  }
  return user;
}

// ============================================================================
// HTTP Server
// ============================================================================
const server = http.createServer(async (req, res) => {
  const clientIp = req.socket.remoteAddress || '127.0.0.1';
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    const allowOrigin = getCorsOrigin(req);
    res.writeHead(204, {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth-token',
      'Access-Control-Allow-Credentials': 'true',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    });
    res.end();
    return;
  }

  // --------------------------------------------------------------------------
  // API Routes
  // --------------------------------------------------------------------------
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Authentication: Login with Rate Limiting & Signed Tokens
      if (pathname === '/api/auth/login' && method === 'POST') {
        if (!checkLoginRateLimit(clientIp)) {
          return sendJSON(res, 429, { 
            success: false, 
            message: 'Too many failed login attempts. Please wait 5 minutes before trying again.' 
          }, req);
        }

        const { email, password } = await parseRequestBody(req);
        const user = await db.authenticateUser(email, password);
        if (!user) {
          recordLoginFailure(clientIp);
          return sendJSON(res, 401, { success: false, message: 'Invalid email or password.' }, req);
        }

        recordLoginSuccess(clientIp);
        const token = generateToken(user);
        return sendJSON(res, 200, { success: true, user, token }, req);
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
        return sendJSON(res, 200, { success: true, count: properties.length, properties }, req);
      }

      if (pathname.startsWith('/api/properties/') && method === 'GET') {
        const slug = pathname.replace('/api/properties/', '');
        const property = await db.getPropertyBySlug(slug);
        if (!property) return sendJSON(res, 404, { success: false, message: 'Property not found' }, req);
        return sendJSON(res, 200, { success: true, property }, req);
      }

      // 3. Public Off-Plan Catalog
      if (pathname === '/api/off-plan' && method === 'GET') {
        const projects = await db.getOffPlanProjects();
        return sendJSON(res, 200, { success: true, count: projects.length, projects }, req);
      }

      if (pathname.startsWith('/api/off-plan/') && method === 'GET') {
        const slug = pathname.replace('/api/off-plan/', '');
        const project = await db.getOffPlanProjectBySlug(slug);
        if (!project) return sendJSON(res, 404, { success: false, message: 'Off-plan project not found' }, req);
        return sendJSON(res, 200, { success: true, project }, req);
      }

      // 4. Developers & Staff Directory
      if (pathname === '/api/developers' && method === 'GET') {
        const developers = await db.getDevelopers();
        return sendJSON(res, 200, { success: true, count: developers.length, developers }, req);
      }

      if (pathname === '/api/staff' && method === 'GET') {
        const staff = await db.getStaff();
        return sendJSON(res, 200, { success: true, count: staff.length, staff }, req);
      }

      // 5. Public Lead Submission (with Rate Limiting, Anti-Spam & Correct Branding)
      if (pathname === '/api/leads' && method === 'POST') {
        const rateCheck = checkRateLimit(clientIp);
        if (!rateCheck.allowed) {
          return sendJSON(res, 429, { success: false, message: rateCheck.message }, req);
        }

        const body = await parseRequestBody(req);
        const check = validateAndCheckSpam(body);

        if (check.isSpam) {
          return sendJSON(res, 200, {
            success: true,
            vip_code: 'ANN-BOT-VOID',
            message: 'Thank you. An Ann Real Estate advisor will contact you within 24 hours.'
          }, req);
        }

        if (check.isValid === false) {
          return sendJSON(res, 400, { success: false, message: check.message }, req);
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
          message: 'Thank you. An Ann Real Estate advisor will contact you within 24 hours.'
        }, req);
      }

      // ======================================================================
      // Admin Area Endpoints (Protected with Mandatory Authentication)
      // ======================================================================

      // Notification Bell: Check for new leads (Auth required)
      if (pathname === '/api/admin/notifications' && method === 'GET') {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const notifications = await db.getNotifications(authUser);
        return sendJSON(res, 200, notifications, req);
      }

      // Dashboard Overview Metrics & Charts (Auth required)
      if (pathname === '/api/admin/dashboard' && method === 'GET') {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const metrics = await db.getDashboardMetrics(authUser);
        return sendJSON(res, 200, metrics, req);
      }

      // Leads Directory & Kanban (Auth required & Role-enforced)
      if (pathname === '/api/admin/leads' && method === 'GET') {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const filters = {
          stage: parsedUrl.query.stage,
          rating: parsedUrl.query.rating,
          agentId: parsedUrl.query.agentId,
          search: parsedUrl.query.search
        };
        const leads = await db.getLeads(filters, authUser);
        return sendJSON(res, 200, { success: true, count: leads.length, leads }, req);
      }

      // Single Lead Detail & History (Auth required)
      if (pathname.match(/^\/api\/admin\/leads\/\d+$/) && method === 'GET') {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const leadId = pathname.split('/').pop();
        const lead = await db.getLeadById(leadId, authUser);
        if (!lead) return sendJSON(res, 404, { success: false, message: 'Lead not found' }, req);
        return sendJSON(res, 200, { success: true, lead }, req);
      }

      // Update Lead (Auth required)
      if (pathname.match(/^\/api\/admin\/leads\/\d+$/) && method === 'PATCH') {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const leadId = pathname.split('/').pop();
        const updates = await parseRequestBody(req);
        const updated = await db.updateLead(leadId, updates, authUser);
        return sendJSON(res, 200, { success: true, lead: updated }, req);
      }

      // Add Note to Lead (Auth required)
      if (pathname.match(/^\/api\/admin\/leads\/\d+\/notes$/) && method === 'POST') {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const leadId = pathname.split('/')[4];
        const { note_text } = await parseRequestBody(req);
        const note = await db.addNote(leadId, authUser.id, note_text);
        return sendJSON(res, 201, { success: true, note }, req);
      }

      // Mark Lead Won (Auth required)
      if (pathname.match(/^\/api\/admin\/leads\/\d+\/won$/) && method === 'POST') {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const leadId = pathname.split('/')[4];
        const { property_id, sale_price_aed, notes } = await parseRequestBody(req);
        const result = await db.markDealWon(leadId, property_id, sale_price_aed, authUser.id, notes);
        return sendJSON(res, 200, { success: true, ...result }, req);
      }

      // Viewings (Auth required)
      if (pathname === '/api/admin/viewings' && method === 'GET') {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const viewings = await db.getViewings(authUser);
        return sendJSON(res, 200, { success: true, count: viewings.length, viewings }, req);
      }

      if (pathname === '/api/admin/viewings' && method === 'POST') {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const body = await parseRequestBody(req);
        const viewing = await db.createViewing({ ...body, agent_id: authUser.id });
        return sendJSON(res, 201, { success: true, viewing }, req);
      }

      // Agent Leaderboard (Auth required)
      if (pathname === '/api/admin/leaderboard' && method === 'GET') {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const leaderboard = await db.getLeaderboard();
        return sendJSON(res, 200, { success: true, leaderboard }, req);
      }

      // Stale Leads (Auth required)
      if (pathname === '/api/admin/stale-leads' && method === 'GET') {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const staleLeads = await db.getStaleLeads(authUser);
        return sendJSON(res, 200, { success: true, count: staleLeads.length, staleLeads }, req);
      }

      // Property Inventory CRUD (Admin privileges required)
      if (pathname === '/api/admin/properties' && method === 'POST') {
        const authUser = requireAuth(req, res, 'admin');
        if (!authUser) return;
        const body = await parseRequestBody(req);
        const newProp = await db.createProperty(body);
        return sendJSON(res, 201, { success: true, property: newProp }, req);
      }

      if (pathname.match(/^\/api\/admin\/properties\/\d+$/) && method === 'PUT') {
        const authUser = requireAuth(req, res, 'admin');
        if (!authUser) return;
        const propId = pathname.split('/').pop();
        const body = await parseRequestBody(req);
        const updated = await db.updateProperty(propId, body);
        return sendJSON(res, 200, { success: true, property: updated }, req);
      }

      if (pathname.match(/^\/api\/admin\/properties\/\d+$/) && method === 'DELETE') {
        const authUser = requireAuth(req, res, 'admin');
        if (!authUser) return;
        const propId = pathname.split('/').pop();
        await db.deleteProperty(propId);
        return sendJSON(res, 200, { success: true, message: 'Property removed' }, req);
      }

      // Off-Plan Projects CRUD (Admin privileges required)
      if (pathname === '/api/admin/projects' && method === 'POST') {
        const authUser = requireAuth(req, res, 'admin');
        if (!authUser) return;
        const body = await parseRequestBody(req);
        const newProj = await db.createProject(body);
        return sendJSON(res, 201, { success: true, project: newProj }, req);
      }

      if (pathname.match(/^\/api\/admin\/projects\/\d+$/) && method === 'PUT') {
        const authUser = requireAuth(req, res, 'admin');
        if (!authUser) return;
        const projId = pathname.split('/').pop();
        const body = await parseRequestBody(req);
        const updated = await db.updateProject(projId, body);
        return sendJSON(res, 200, { success: true, project: updated }, req);
      }

      if (pathname.match(/^\/api\/admin\/projects\/\d+$/) && method === 'DELETE') {
        const authUser = requireAuth(req, res, 'admin');
        if (!authUser) return;
        const projId = pathname.split('/').pop();
        await db.deleteProject(projId);
        return sendJSON(res, 200, { success: true, message: 'Project removed' }, req);
      }

      return sendJSON(res, 404, { success: false, message: 'Endpoint not found' }, req);
    } catch (err) {
      console.error('API Error:', err);
      return sendJSON(res, 500, { success: false, message: 'An internal server error occurred.' }, req);
    }
  }

  // --------------------------------------------------------------------------
  // Static File Serving with Standard Security Headers & SPA Fallback
  // --------------------------------------------------------------------------
  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath.startsWith('/admin')) {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(path.join(PUBLIC_DIR, reqPath));
  if (!safePath.startsWith(PUBLIC_DIR) || path.basename(safePath).startsWith('.') || safePath.includes('node_modules')) {
    res.writeHead(403, { 
      'Content-Type': 'text/plain',
      'X-Content-Type-Options': 'nosniff'
    });
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
          res.writeHead(200, { 
            'Content-Type': 'text/html; charset=utf-8',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://*.unsplash.com; connect-src 'self';"
          });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const headers = { 
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    if (ext === '.html') {
      headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://*.unsplash.com; connect-src 'self';";
    }

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
