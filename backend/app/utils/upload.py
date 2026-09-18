import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'svg', 'webp'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_safe_filename(filename):
    """Generate a safe unique filename"""
    ext = os.path.splitext(filename)[1].lower()
    unique_id = str(uuid.uuid4())
    return f"logo_{unique_id}{ext}"

def save_upload_file(file):
    """Save uploaded file and return the relative path"""
    if not file or file.filename == '':
        raise ValueError('No file selected')
    
    if not allowed_file(file.filename):
        raise ValueError('File type not allowed. Allowed types: png, jpg, jpeg, svg, webp')
    
    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    max_size = current_app.config.get('MAX_UPLOAD_SIZE', 5242880)
    if file_size > max_size:
        raise ValueError(f'File too large. Max size: {max_size / 1024 / 1024}MB')
    
    # Ensure upload folder exists
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    
    # Generate safe filename
    safe_filename = generate_safe_filename(file.filename)
    filepath = os.path.join(upload_folder, safe_filename)
    
    # Save file
    file.save(filepath)
    
    # Store a browser-facing URL path, never the local Windows filesystem path.
    return f"/uploads/tool-logos/{safe_filename}"

def delete_upload_file(filepath):
    """Delete uploaded file"""
    if not filepath:
        return
    
    # Tool.logo is a public URL path such as /uploads/tool-logos/logo.png.
    # Convert it back to a file below the configured public upload root.
    relative_path = filepath.lstrip('/')
    if relative_path.startswith('uploads/'):
        relative_path = relative_path[len('uploads/'):]
    full_path = os.path.abspath(os.path.join(
        current_app.config.get('UPLOAD_ROOT', current_app.config.get('UPLOAD_FOLDER', 'uploads')),
        relative_path,
    ))
    upload_root = os.path.abspath(current_app.config.get('UPLOAD_ROOT', current_app.config.get('UPLOAD_FOLDER', 'uploads')))
    if os.path.commonpath([upload_root, full_path]) != upload_root:
        return
    if os.path.exists(full_path):
        try:
            os.remove(full_path)
        except Exception as e:
            print(f"Error deleting file {full_path}: {e}")
