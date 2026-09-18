from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import or_
from app.extensions import db
from app.models import Tool
from app.utils.upload import save_upload_file, delete_upload_file
import re

tools_bp = Blueprint('tools', __name__, url_prefix='/api/tools')

def validate_url(url):
    """Validate URL format"""
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # or IP
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return re.match(url_pattern, url) is not None

def check_admin():
    """Check if admin mode is enabled"""
    return current_app.config.get('ADMIN_MODE', False)

def check_circular_dependency(tool_id, parent_id, existing_tool=False):
    """Check for circular parent-child relationships"""
    if not parent_id or tool_id == parent_id:
        return False
    
    visited = set()
    current = parent_id
    
    while current:
        if current in visited:
            return True  # Circular dependency found
        visited.add(current)
        tool = Tool.query.get(current)
        if not tool:
            break
        current = tool.parent_id
    
    return False

@tools_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'success': True, 'message': 'API is healthy'}), 200

@tools_bp.route('', methods=['GET'])
def get_tools():
    """Get all tools with optional filters"""
    try:
        category = request.args.get('category')
        search = request.args.get('search', '').strip()
        favorites_only = request.args.get('favorites', 'false').lower() == 'true'
        parent_id = request.args.get('parent_id')
        
        query = Tool.query
        
        # Filter by parent
        if parent_id:
            try:
                parent_id = int(parent_id)
                query = query.filter_by(parent_id=parent_id)
            except (ValueError, TypeError):
                return jsonify({'success': False, 'error': 'Invalid parent_id'}), 400
        elif category != 'All Tools':
            # Default: get top-level tools only
            query = query.filter_by(parent_id=None)
        
        # Filter by favorites
        if favorites_only:
            query = query.filter_by(favorite=True)
        
        # Filter by category
        if category and category != 'All Tools':
            query = query.filter_by(category=category)
        
        # Search
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Tool.name.ilike(search_term),
                    Tool.description.ilike(search_term),
                    Tool.url.ilike(search_term),
                    Tool.category.ilike(search_term)
                )
            )
        
        tools = query.order_by(Tool.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [tool.to_dict() for tool in tools],
            'count': len(tools)
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/<int:tool_id>', methods=['GET'])
def get_tool(tool_id):
    """Get a specific tool with its children"""
    try:
        tool = Tool.query.get(tool_id)
        if not tool:
            return jsonify({'success': False, 'error': 'Tool not found'}), 404
        
        return jsonify({
            'success': True,
            'data': tool.to_dict(include_children=True)
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('', methods=['POST'])
def create_tool():
    """Create a new tool"""
    try:
        if not check_admin():
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        data = request.form
        
        # Validate required fields
        name = data.get('name', '').strip()
        url = data.get('url', '').strip()
        category = data.get('category', '').strip()
        
        if not name:
            return jsonify({'success': False, 'error': 'Tool name is required'}), 400
        
        if not url:
            return jsonify({'success': False, 'error': 'Target URL is required'}), 400
        
        if not validate_url(url):
            return jsonify({'success': False, 'error': 'Invalid URL format'}), 400
        
        if not category:
            return jsonify({'success': False, 'error': 'Category is required'}), 400
        
        # Check for duplicate name
        existing = Tool.query.filter_by(name=name).first()
        if existing:
            return jsonify({'success': False, 'error': 'A tool with this name already exists'}), 409
        
        # Validate parent
        parent_id = data.get('parent_id')
        if parent_id:
            try:
                parent_id = int(parent_id) if parent_id else None
                if parent_id:
                    parent_tool = Tool.query.get(parent_id)
                    if not parent_tool:
                        return jsonify({'success': False, 'error': 'Parent tool not found'}), 400
            except (ValueError, TypeError):
                return jsonify({'success': False, 'error': 'Invalid parent_id'}), 400
        
        # Handle logo upload
        logo_path = None
        if 'logo' in request.files:
            try:
                logo_path = save_upload_file(request.files['logo'])
            except ValueError as e:
                return jsonify({'success': False, 'error': str(e)}), 400
        
        # Create tool
        tool = Tool(
            name=name,
            url=url,
            category=category,
            description=data.get('description', '').strip() or None,
            logo=logo_path,
            credential_username=data.get('username', '').strip() or None,
            credential_password=data.get('password') or None,
            parent_id=parent_id,
            favorite=data.get('favorite', 'false').lower() == 'true'
        )
        
        db.session.add(tool)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Tool "{name}" added successfully',
            'data': tool.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/<int:tool_id>', methods=['PUT'])
def update_tool(tool_id):
    """Update an existing tool"""
    try:
        if not check_admin():
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        tool = Tool.query.get(tool_id)
        if not tool:
            return jsonify({'success': False, 'error': 'Tool not found'}), 404
        
        data = request.form
        
        # Update name
        if 'name' in data:
            name = data.get('name', '').strip()
            if not name:
                return jsonify({'success': False, 'error': 'Tool name is required'}), 400
            
            # Check for duplicate name (excluding current tool)
            existing = Tool.query.filter(Tool.name == name, Tool.id != tool_id).first()
            if existing:
                return jsonify({'success': False, 'error': 'A tool with this name already exists'}), 409
            
            tool.name = name
        
        # Update URL
        if 'url' in data:
            url = data.get('url', '').strip()
            if not url:
                return jsonify({'success': False, 'error': 'Target URL is required'}), 400
            
            if not validate_url(url):
                return jsonify({'success': False, 'error': 'Invalid URL format'}), 400
            
            tool.url = url
        
        # Update category
        if 'category' in data:
            category = data.get('category', '').strip()
            if not category:
                return jsonify({'success': False, 'error': 'Category is required'}), 400
            tool.category = category
        
        # Update description
        if 'description' in data:
            tool.description = data.get('description', '').strip() or None
        
        # Update parent
        if 'parent_id' in data:
            parent_id = data.get('parent_id')
            if parent_id and parent_id != 'null':
                try:
                    parent_id = int(parent_id)
                    
                    # Validate parent
                    if parent_id == tool_id:
                        return jsonify({'success': False, 'error': 'A tool cannot be its own parent'}), 400
                    
                    parent_tool = Tool.query.get(parent_id)
                    if not parent_tool:
                        return jsonify({'success': False, 'error': 'Parent tool not found'}), 400
                    
                    # Check for circular dependency
                    if check_circular_dependency(tool_id, parent_id, existing_tool=True):
                        return jsonify({'success': False, 'error': 'Circular parent relationship detected'}), 400
                    
                    tool.parent_id = parent_id
                except (ValueError, TypeError):
                    return jsonify({'success': False, 'error': 'Invalid parent_id'}), 400
            else:
                tool.parent_id = None
        
        # Update favorite
        if 'favorite' in data:
            tool.favorite = data.get('favorite', 'false').lower() == 'true'
        
        # Handle logo upload
        if 'logo' in request.files:
            try:
                # Delete old logo
                if tool.logo:
                    delete_upload_file(tool.logo)
                
                tool.logo = save_upload_file(request.files['logo'])
            except ValueError as e:
                return jsonify({'success': False, 'error': str(e)}), 400
        
        # Update credentials if provided in form data
        if 'username' in data:
            tool.credential_username = data.get('username', '').strip() or None
        if 'password' in data:
            tool.credential_password = data.get('password') or None
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Tool "{tool.name}" updated successfully',
            'data': tool.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/<int:tool_id>/credentials', methods=['GET'])
def get_tool_credentials(tool_id):
    """Return credentials only for the requested tool, never in tool lists."""
    try:
        tool = Tool.query.get(tool_id)
        if not tool:
            return jsonify({'success': False, 'error': 'Tool not found'}), 404

        return jsonify({
            'success': True,
            'data': {
                'username': tool.credential_username or '',
                'password': tool.credential_password or '',
            }
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error loading credentials for tool {tool_id}: {e}")
        return jsonify({'success': False, 'error': 'Unable to load credentials'}), 500

@tools_bp.route('/<int:tool_id>/credentials', methods=['PUT'])
def update_tool_credentials(tool_id):
    """Update credentials for one independent tool record."""
    try:
        if not check_admin():
            return jsonify({'success': False, 'error': 'Admin access required'}), 403

        tool = Tool.query.get(tool_id)
        if not tool:
            return jsonify({'success': False, 'error': 'Tool not found'}), 404

        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({'success': False, 'error': 'Invalid request body'}), 400

        username = data.get('username', '')
        password = data.get('password', '')

        if username is not None and not isinstance(username, str):
            return jsonify({'success': False, 'error': 'Username must be text'}), 400
        if password is not None and not isinstance(password, str):
            return jsonify({'success': False, 'error': 'Password must be text'}), 400

        tool.credential_username = (username.strip() if isinstance(username, str) else None) or None
        tool.credential_password = password if password else None
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Credentials updated successfully',
            'data': {
                'username': tool.credential_username or '',
                'password': tool.credential_password or ''
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error saving credentials for tool {tool_id}: {e}")
        return jsonify({'success': False, 'error': 'Unable to save credentials'}), 500

@tools_bp.route('/<int:tool_id>', methods=['DELETE'])
def delete_tool(tool_id):
    """Delete a tool"""
    try:
        if not check_admin():
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        tool = Tool.query.get(tool_id)
        if not tool:
            return jsonify({'success': False, 'error': 'Tool not found'}), 404
        
        # Check if tool has children
        child_count = len(tool.children) if tool.children else 0
        if child_count > 0:
            return jsonify({
                'success': False,
                'error': f'Tool has {child_count} sub-tool(s). Please delete sub-tools first or they will be removed.',
                'child_count': child_count
            }), 409
        
        tool_name = tool.name
        
        # Delete logo
        if tool.logo:
            delete_upload_file(tool.logo)
        
        db.session.delete(tool)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Tool "{tool_name}" deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/<int:tool_id>/favorite', methods=['PATCH'])
def toggle_favorite(tool_id):
    """Toggle favorite status"""
    try:
        tool = Tool.query.get(tool_id)
        if not tool:
            return jsonify({'success': False, 'error': 'Tool not found'}), 404
        
        tool.favorite = not tool.favorite
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Tool {"added to" if tool.favorite else "removed from"} favorites',
            'data': tool.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/<int:tool_id>/children', methods=['GET'])
def get_children(tool_id):
    """Get children of a tool"""
    try:
        tool = Tool.query.get(tool_id)
        if not tool:
            return jsonify({'success': False, 'error': 'Tool not found'}), 404
        
        children = Tool.query.filter_by(parent_id=tool_id).order_by(Tool.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [child.to_dict() for child in children],
            'count': len(children)
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
