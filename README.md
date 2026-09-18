# InfraHub - Infrastructure Tool Portal

A professional, enterprise-grade centralized portal for managing and accessing multiple infrastructure tools from one dashboard.

## Overview

InfraHub is a full-stack web application that provides a single entry point for accessing various infrastructure tools such as Zabbix, Grafana, Zammad, OpenStack, Ceph, and more. It eliminates the need to remember individual URLs and provides a professional interface for tool discovery and management.

### Key Features

- **Centralized Tool Management**: Add, edit, and delete infrastructure tools without code modifications
- **Parent/Child Tool Hierarchy**: Support for complex platforms with multiple sub-services (e.g., OpenStack with Horizon, Nova, Neutron, etc.)
- **Logo Upload**: Upload custom logos for each tool
- **Search & Filter**: Global search across tool names, descriptions, URLs, and even child tools
- **Favorites**: Mark tools as favorites for quick access
- **Professional UI**: Modern, responsive dashboard suitable for enterprise use
- **Admin Mode**: Distinguish between regular users and administrators
- **REST API**: Clean, documented API for backend integration

## Architecture

```
InfraHub/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Flask app factory
│   │   ├── config.py              # Configuration management
│   │   ├── extensions.py           # Database and extensions
│   │   ├── models/
│   │   │   └── tool.py             # SQLAlchemy Tool model
│   │   ├── routes/
│   │   │   └── tools.py            # API endpoints
│   │   └── utils/
│   │       └── upload.py           # File upload utilities
│   ├── uploads/                  # Uploaded logos directory
│   ├── run.py                    # Application entry point
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment configuration template
│
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── ToolCard.jsx
│   │   │   ├── ToolGrid.jsx
│   │   │   ├── AddToolModal.jsx
│   │   │   ├── ToolDetailsDrawer.jsx
│   │   │   ├── DeleteConfirmation.jsx
│   │   │   └── Toast.jsx
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── styles/               # CSS files
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   ├── index.html                # HTML template
│   ├── package.json              # Node dependencies
│   ├── vite.config.js            # Vite configuration
│   └── .env.example              # Environment template
│
├── README.md                     # This file
└── .gitignore                    # Git ignore rules
```

## System Requirements

### Backend
- Python 3.8+
- pip (Python package manager)
- SQLite 3+

### Frontend
- Node.js 16+
- npm 7+

### Deployment (Optional)
- Ubuntu 20.04+ (for server deployment)
- Nginx (reverse proxy)
- Gunicorn (WSGI server)
- systemd (service management)

## Installation

### 1. Backend Setup

#### Create Virtual Environment
```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment
```bash
# Copy .env.example to .env
cp .env.example .env
# or on Windows
copy .env.example .env

# Edit .env with your settings
# Important: Change SECRET_KEY for production
```

#### Initialize Database
```bash
# Create tables
flask --app app init-db

# (Optional) Seed development data
flask --app app seed-db

# View tools (to verify)
flask --app app list-tools
```

### 2. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Configure Environment (Optional)
```bash
# For production builds, create .env.production if needed
# Default: VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

#### Terminal 1: Start Backend
```bash
cd backend

# Activate virtual environment (if not already)
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate

# Run Flask
python run.py
```

Backend will start on: `http://localhost:5000`

#### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

Frontend will start on: `http://localhost:5173`

Open your browser to: **http://localhost:5173**

### Development Commands

#### Backend
```bash
# Run development server
python run.py

# Initialize database
flask --app app init-db

# Seed development data
flask --app app seed-db

# Reset database (careful!)
flask --app app reset-db

# List all tools
flask --app app list-tools
```

#### Frontend
```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Documentation

### Base URL
`http://localhost:5000/api`

### Endpoints

#### Health Check
```
GET /health
```

#### Get Tools
```
GET /tools
Query Parameters:
  - category: Filter by category
  - search: Search by name/description/URL
  - favorites: Get only favorites (true/false)
  - parent_id: Get children of a specific parent

Response:
{
  "success": true,
  "data": [...],
  "count": 5
}
```

#### Get Single Tool
```
GET /tools/{id}

Response includes children if present.
```

#### Create Tool
```
POST /tools
Content-Type: multipart/form-data

Required Fields:
  - name
  - url
  - category

Optional Fields:
  - description
  - logo (file upload)
  - parent_id (for child tools)
  - favorite (true/false)
```

#### Update Tool
```
PUT /tools/{id}
Content-Type: multipart/form-data

Any field can be updated. Send only fields to update.
```

#### Delete Tool
```
DELETE /tools/{id}

Note: Tool must have no children. Delete children first.
```

#### Toggle Favorite
```
PATCH /tools/{id}/favorite

Toggles the favorite status of a tool.
```

#### Get Children
```
GET /tools/{parent_id}/children

Returns all children of a parent tool.
```

## Usage Guide

### Adding a New Tool (No Code Change Required)

1. Click **"+ Add New Tool"** in the sidebar
2. Fill in the form:
   - **Tool Name**: Name of the tool
   - **Target URL**: Full URL (http://... or https://...)
   - **Category**: Select or create new category
   - **Description**: Optional description
   - **Logo**: Optional logo upload (PNG, JPG, JPEG, SVG, WEBP)
   - **Parent Tool**: Optional parent for sub-tools
   - **Favorite**: Mark as favorite
3. Click **"Add to Dashboard"**
4. Tool appears immediately - no rebuild required!

### Creating Sub-tools (Parent/Child Hierarchy)

#### Method 1: Create Child When Adding Tool
1. Click "Add New Tool"
2. Select **"Parent Tool"** field and choose a parent tool
3. Fill in other details
4. Submit

#### Method 2: Add Child to Existing Parent
1. Click on a parent tool card (if it has children indicator)
2. Opens details drawer
3. Click "Add Sub-tool"
4. Fill form and submit

### Editing a Tool
1. Click the **pencil icon** on a tool card
2. Modify the fields
3. Click "Save Changes"

### Deleting a Tool
1. Click the **trash icon** on a tool card
2. Confirm deletion
3. If tool has children, you'll be warned before deletion

### Searching Tools
1. Use the search bar at the top
2. Search queries check:
   - Tool names
   - Descriptions
   - URLs
   - Categories
   - Child tool names and descriptions
3. Results update in real-time

### Filtering by Category
1. Use the sidebar categories
2. Click a category to filter
3. "All Tools" shows everything
4. "Favorites" shows only starred tools

## Database Schema

### Tool Table

```sql
CREATE TABLE tools (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  url VARCHAR(2048) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  logo VARCHAR(500),
  parent_id INTEGER,
  favorite BOOLEAN DEFAULT false,
  created_at DATETIME,
  updated_at DATETIME,
  
  FOREIGN KEY (parent_id) REFERENCES tools(id)
);
```

**Fields:**
- `id`: Unique identifier
- `name`: Tool name (unique)
- `url`: Tool URL
- `category`: Category name
- `description`: Optional description
- `logo`: Path to uploaded logo
- `parent_id`: NULL for top-level, otherwise points to parent tool ID
- `favorite`: Boolean favorite flag
- `created_at`, `updated_at`: Timestamps

## Security Considerations

### Current Implementation
- Environment-based configuration
- Secure file upload (type validation, unique filenames)
- Input validation on backend
- CORS configuration for allowed origins
- No password storage

### Future Enhancements
- LDAP/Active Directory integration
- OAuth2/OIDC support
- User authentication and authorization
- Audit logging
- Role-based access control (RBAC)
- Encryption for sensitive data

### Best Practices

**Do NOT:**
- Commit `.env` file to version control
- Store passwords in the database
- Expose Flask debug mode in production
- Use default SECRET_KEY in production

**Do:**
- Change SECRET_KEY for production
- Use HTTPS in production
- Keep dependencies updated
- Validate all user input
- Use environment variables for sensitive config

## Environment Variables

### Backend (.env)

```
# Flask Configuration
FLASK_ENV=development|production
SECRET_KEY=your-secret-key-change-this

# Database
DATABASE_URL=sqlite:///infrahub.db

# File Upload
UPLOAD_FOLDER=uploads
MAX_UPLOAD_SIZE=5242880  # 5MB in bytes

# Admin Mode (for development)
ADMIN_MODE=true|false

# Server
PORT=5000
```

### Frontend (.env or .env.production)

```
VITE_API_URL=http://localhost:5000/api
# For production:
VITE_API_URL=/api  # relative URL when deployed on same server
```

## Authentication & Authorization

### Current Architecture
The application runs in **Admin Mode** with all users having administrative privileges. This is suitable for internal company use on a private network.

### Future Integration with LDAP/SSO

The codebase is designed to easily integrate with enterprise authentication:

1. **Backend Changes Required:**
   - Add user model and database table
   - Implement authentication middleware
   - Add JWT token generation/validation
   - Implement role checking (admin vs. user)

2. **Frontend Changes Required:**
   - Add login page
   - Implement token storage and refresh
   - Add logout functionality
   - Check user roles before showing admin features

3. **Configuration:**
   - LDAP server URL
   - Active Directory domain
   - OIDC provider details

Example flow with LDAP:
```
User → InfraHub Login → Company LDAP → Token → Access to Tools
```

## Deployment Guide

### Ubuntu 20.04 Deployment

#### Prerequisites
```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Python, Node, and dependencies
sudo apt install -y python3 python3-pip python3-venv \
                    nodejs npm \
                    nginx \
                    supervisor
```

#### Backend Deployment

```bash
# Clone/copy application
cd /opt
sudo mkdir -p infrahub
sudo chown $USER:$USER infrahub
cd infrahub

# Copy backend files
cp -r backend .

# Create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn

# Create .env
cp .env.example .env
# Edit .env with production settings

# Initialize database
flask --app app init-db

# Run once to verify
gunicorn -w 4 -b 127.0.0.1:5000 "app:create_app()"
```

#### Frontend Deployment

```bash
cd /opt/infrahub

# Copy frontend files
cp -r frontend .

cd frontend
npm install
npm run build

# Frontend build outputs to dist/
```

#### Nginx Configuration

Create `/etc/nginx/sites-available/infrahub`:

```nginx
upstream flask_app {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name your-domain.com;  # Change this

    # React frontend
    location / {
        root /opt/infrahub/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API reverse proxy
    location /api/ {
        proxy_pass http://flask_app/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded files
    location /uploads/ {
        alias /opt/infrahub/backend/uploads/;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/infrahub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Systemd Service for Gunicorn

Create `/etc/systemd/system/infrahub.service`:

```ini
[Unit]
Description=InfraHub Flask Application
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/opt/infrahub/backend
Environment="PATH=/opt/infrahub/backend/venv/bin"
ExecStart=/opt/infrahub/backend/venv/bin/gunicorn \
    -w 4 \
    -b 127.0.0.1:5000 \
    --timeout 60 \
    "app:create_app()"
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable infrahub
sudo systemctl start infrahub
sudo systemctl status infrahub
```

#### SSL/HTTPS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx

sudo certbot --nginx -d your-domain.com
# Follow prompts

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

#### Backup & Maintenance

```bash
# Backup database
sudo cp /opt/infrahub/backend/infrahub.db /backup/infrahub-$(date +%Y%m%d).db

# Backup uploads
sudo tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz /opt/infrahub/backend/uploads/

# Logs
sudo journalctl -u infrahub -f  # Follow logs
```

## Troubleshooting

### Backend Issues

**Port Already in Use**
```bash
# Find process on port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

**Database Errors**
```bash
# Reset database
flask --app app reset-db

# Check database integrity
sqlite3 infrahub.db ".tables"
sqlite3 infrahub.db "SELECT COUNT(*) FROM tools;"
```

**Import Errors**
```bash
# Verify virtual environment is activated
which python  # Should show venv path

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues

**Blank Page / Module Not Found**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**API Connection Issues**
```
1. Check backend is running on port 5000
2. Check VITE_API_URL configuration
3. Check browser console for CORS errors
4. Verify backend .env CORS_ORIGINS includes frontend URL
```

**Build Fails**
```bash
npm run build  # Check error messages
npm install  # Reinstall dependencies
```

### General Issues

**Tools Not Appearing**
```bash
# Backend
flask --app app list-tools

# Check database
sqlite3 infrahub.db "SELECT id, name FROM tools;"

# Check frontend API calls in browser console
```

**Logo Upload Failed**
1. Check file size < 5MB
2. Verify file type (PNG, JPG, JPEG, SVG, WEBP)
3. Check uploads folder has write permissions
4. Check logs for detailed error

## Testing Checklist

### Core Functionality
- [x] Dashboard loads with tools
- [x] Search works across names and descriptions
- [x] Category filtering works
- [x] Favorite toggle works and persists
- [x] Add tool opens modal and submits correctly
- [x] Edit tool updates in real-time
- [x] Delete tool removes from dashboard
- [x] Logo upload and display works

### Parent/Child Relationships
- [x] Parent tool shows child count
- [x] Clicking parent opens details drawer
- [x] Drawer shows all children
- [x] Can add child through "Add Sub-tool"
- [x] Parent with zero children works
- [x] Parent with many children (20+) works
- [x] Circular parent relationships prevented

### Validation
- [x] Empty name rejected
- [x] Invalid URL rejected
- [x] Duplicate name rejected
- [x] Self-parent prevented
- [x] Non-existent parent rejected

### UI/UX
- [x] Responsive on mobile
- [x] Loading states display
- [x] Error messages show
- [x] Toast notifications work
- [x] Modal animations smooth
- [x] Search results instant
- [x] No hard-coded tool URLs

### API
- [x] Health check works
- [x] GET /tools returns all
- [x] GET /tools/{id} returns single with children
- [x] POST /tools creates tool
- [x] PUT /tools/{id} updates tool
- [x] DELETE /tools/{id} deletes tool
- [x] PATCH /tools/{id}/favorite toggles

## Future Enhancements

1. **User Management**
   - LDAP/Active Directory integration
   - OAuth2/OIDC support
   - Per-user favorites
   - User profiles

2. **Advanced Features**
   - Tool health checks/status
   - Tool availability scheduling
   - Usage analytics
   - Tool grouping/tagging
   - Drag-and-drop tool ordering
   - Admin dashboard with metrics

3. **Integrations**
   - Webhook support
   - Tool availability monitoring
   - Audit logging
   - Export/import tools
   - API key management

4. **UI/UX**
   - Dark mode
   - Custom themes
   - Tool shortcuts/bookmarks
   - Recently used tools
   - Tool recommendations

## Support & Contributing

For issues, questions, or contributions, contact your InfraHub administrator.

## License

This project is proprietary and intended for internal company use.

---

**Last Updated**: 2024
**Version**: 1.0.0
