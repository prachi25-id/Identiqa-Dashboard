from datetime import datetime
from app.extensions import db

class Tool(db.Model):
    """Tool model with support for parent-child relationships"""
    __tablename__ = 'tools'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True, index=True)
    url = db.Column(db.String(2048), nullable=False)
    category = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    logo = db.Column(db.String(500), nullable=True)
    credential_username = db.Column(db.String(255), nullable=True)
    credential_password = db.Column(db.Text, nullable=True)
    
    # Parent-child relationship
    parent_id = db.Column(db.Integer, db.ForeignKey('tools.id'), nullable=True, index=True)
    
    # Self-referencing relationship
    children = db.relationship(
        'Tool',
        backref=db.backref('parent', remote_side=[id]),
        lazy='joined',
        cascade='all, delete-orphan'
    )
    
    favorite = db.Column(db.Boolean, default=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self, include_children=True):
        """Convert tool to dictionary"""
        data = {
            'id': self.id,
            'name': self.name,
            'url': self.url,
            'category': self.category,
            'description': self.description,
            'logo': self.logo,
            # Kept alongside `logo` for clients that expect an explicit URL
            # field. Both values are persistent backend paths, never blob URLs.
            'logo_url': self.logo,
            'parent_id': self.parent_id,
            'favorite': self.favorite,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'child_count': len(self.children) if self.children else 0,
        }
        
        if include_children and self.children:
            data['children'] = [child.to_dict(include_children=False) for child in self.children]
        
        return data
    
    def __repr__(self):
        return f'<Tool {self.name}>'
