import os
from flask import Flask, send_from_directory
from app.config import config_by_name
from app.extensions import db, cors
from app.routes import tools_bp

def create_app(config_name=None):
    """Flask application factory"""
    
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config_by_name.get(config_name, config_by_name['development']))
    
    # Initialize extensions
    db.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": app.config.get('CORS_ORIGINS', ['http://localhost:5173']),
            "allow_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
        },
        r"/uploads/*": {
            "origins": app.config.get('CORS_ORIGINS', ['http://localhost:5173']),
            "allow_headers": ["Content-Type"],
            "methods": ["GET", "OPTIONS"]
        }
    })
    
    # Register blueprints
    app.register_blueprint(tools_bp)

    @app.route('/api/health', methods=['GET'])
    def health_route():
        """Public health endpoint for the main API base path."""
        return {
            'success': True,
            'message': 'API is healthy'
        }
    
    # Ensure the configured upload root exists and is served from the same path
    upload_root = app.config.get('UPLOAD_ROOT', os.path.join(app.root_path, 'uploads'))
    os.makedirs(upload_root, exist_ok=True)
    upload_logo_dir = app.config.get('UPLOAD_FOLDER', os.path.join(upload_root, 'tool-logos'))
    os.makedirs(upload_logo_dir, exist_ok=True)
    
    # Serve uploaded files as static files
    @app.route('/uploads/<path:filename>')
    def download_file(filename):
        """Serve uploaded files"""
        return send_from_directory(upload_root, filename)
    
    # Setup CLI commands
    setup_cli(app)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app

def setup_cli(app):
    """Setup Flask CLI commands"""
    
    @app.cli.command()
    def init_db():
        """Initialize the database"""
        db.create_all()
        print("Database initialized successfully!")
    
    @app.cli.command()
    def seed_db():
        """Seed database with development data"""
        from app.models import Tool
        
        # Check if data already exists
        if Tool.query.first():
            print("Database already has data. Skipping seed.")
            return
        
        # Create top-level tools
        tools_data = [
            {
                'name': 'Zabbix',
                'url': 'http://192.168.1.163:8080',
                'category': 'Monitoring',
                'description': 'Zabbix Monitoring Platform',
                'logo': None
            },
            {
                'name': 'Grafana',
                'url': 'http://192.168.1.163:3000',
                'category': 'Monitoring',
                'description': 'Grafana Metrics & Visualization',
                'logo': None
            },
            {
                'name': 'Zammad',
                'url': 'http://192.168.1.163:8082',
                'category': 'Service Desk',
                'description': 'Zammad Helpdesk & CRM',
                'logo': None
            },
            {
                'name': 'OpenStack',
                'url': 'http://192.168.1.163:8000',
                'category': 'Cloud',
                'description': 'OpenStack Cloud Platform',
                'logo': None
            },
            {
                'name': 'Ceph',
                'url': 'http://192.168.1.163:8080/ceph',
                'category': 'Storage',
                'description': 'Ceph Storage System',
                'logo': None
            },
            {
                'name': 'EVE-NG',
                'url': 'http://192.168.1.163:8081',
                'category': 'Network Lab',
                'description': 'Emulated Virtual Environment',
                'logo': None
            }
        ]
        
        created_tools = {}
        
        # Create tools
        for tool_data in tools_data:
            tool = Tool(**tool_data)
            db.session.add(tool)
            db.session.flush()
            created_tools[tool.name] = tool
        
        db.session.commit()
        
        # Create OpenStack children
        openstack = created_tools.get('OpenStack')
        if openstack:
            children_data = [
                {
                    'name': 'Horizon',
                    'url': 'http://192.168.1.163:8000/horizon',
                    'category': 'Cloud',
                    'description': 'OpenStack Dashboard',
                    'parent_id': openstack.id
                },
                {
                    'name': 'Skyline',
                    'url': 'http://192.168.1.163:8000/skyline',
                    'category': 'Cloud',
                    'description': 'Modern OpenStack Dashboard',
                    'parent_id': openstack.id
                },
                {
                    'name': 'Nova',
                    'url': 'http://192.168.1.163:8000/nova',
                    'category': 'Cloud',
                    'description': 'Compute Service',
                    'parent_id': openstack.id
                },
                {
                    'name': 'Neutron',
                    'url': 'http://192.168.1.163:8000/neutron',
                    'category': 'Cloud',
                    'description': 'Networking Service',
                    'parent_id': openstack.id
                },
                {
                    'name': 'Cinder',
                    'url': 'http://192.168.1.163:8000/cinder',
                    'category': 'Cloud',
                    'description': 'Block Storage Service',
                    'parent_id': openstack.id
                },
                {
                    'name': 'Glance',
                    'url': 'http://192.168.1.163:8000/glance',
                    'category': 'Cloud',
                    'description': 'Image Service',
                    'parent_id': openstack.id
                },
                {
                    'name': 'Keystone',
                    'url': 'http://192.168.1.163:8000/keystone',
                    'category': 'Cloud',
                    'description': 'Identity Service',
                    'parent_id': openstack.id
                }
            ]
            
            for child_data in children_data:
                child = Tool(**child_data)
                db.session.add(child)
            
            db.session.commit()
        
        print("Database seeded with development data successfully!")
    
    @app.cli.command()
    def reset_db():
        """Reset the database"""
        if input("Are you sure? Type 'yes' to confirm: ").lower() == 'yes':
            db.drop_all()
            db.create_all()
            print("Database reset successfully!")
        else:
            print("Cancelled.")
    
    @app.cli.command()
    def list_tools():
        """List all tools in database"""
        from app.models import Tool
        
        tools = Tool.query.all()
        if not tools:
            print("No tools found.")
            return
        
        for tool in tools:
            parent_info = f" (parent: {tool.parent.name})" if tool.parent else ""
            print(f"{tool.id}. {tool.name} [{tool.category}]{parent_info}")
