import os
from datetime import timedelta

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
configured_upload_root = os.environ.get('UPLOAD_ROOT') or os.environ.get('UPLOAD_FOLDER') or 'uploads'
if not os.path.isabs(configured_upload_root):
    configured_upload_root = os.path.join(BACKEND_DIR, configured_upload_root)

class Config:
    """Base configuration"""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    # Store files outside the Python package. The directory is absolute so it
    # does not change when Flask is launched from a different working folder.
    UPLOAD_ROOT = os.path.abspath(configured_upload_root)
    UPLOAD_FOLDER = os.path.join(UPLOAD_ROOT, 'tool-logos')
    MAX_UPLOAD_SIZE = int(os.environ.get('MAX_UPLOAD_SIZE', 5242880))
    ADMIN_MODE = os.environ.get('ADMIN_MODE', 'true').lower() == 'true'
    
    # CORS
    CORS_ORIGINS = '*'
    
    # SQLite
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///infrahub.db')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
