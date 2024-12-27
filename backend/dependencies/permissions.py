from enum import Enum
from typing import List, Callable
from functools import wraps
from fastapi import HTTPException
import inspect

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

class RolePermissions:
    ROLE_PERMISSIONS = {
        UserRole.ADMIN: [
            "manage_users",
            "upload_file",
            "download_file",
            "share_file",
            "delete_file",
            "view_all_files",
        ],
        UserRole.USER: [
            "upload_file",
            "download_file",
            "share_file",
            "delete_file",
        ],
        UserRole.GUEST: [
            "view_shared_files",
        ]
    }

    @staticmethod
    def has_permission(role: str, permission: str) -> bool:
        return permission in RolePermissions.ROLE_PERMISSIONS.get(role, [])

def require_permissions(required_permissions: List[str]):
    def decorator(func: Callable):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Get the current user from the dependency
            current_user_data = kwargs.get('current_user_data')
            if not current_user_data:
                raise HTTPException(status_code=401, detail="Not authenticated")
            
            current_user, _ = current_user_data
            
            # Check if user has required permissions based on role
            user_permissions = []
            if current_user.role == 'admin':
                user_permissions = ['upload_file', 'download_file', 'share_file']
            elif current_user.role == 'user':
                user_permissions = ['upload_file', 'download_file', 'share_file']
            
            # Check if user has all required permissions
            for permission in required_permissions:
                if permission not in user_permissions:
                    raise HTTPException(
                        status_code=403,
                        detail=f"Missing required permission: {permission}"
                    )
            
            if inspect.iscoroutinefunction(func):
                return await func(*args, **kwargs)
            return func(*args, **kwargs)

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Get the current user from the dependency
            current_user_data = kwargs.get('current_user_data')
            if not current_user_data:
                raise HTTPException(status_code=401, detail="Not authenticated")
            
            current_user, _ = current_user_data
            
            # Check if user has required permissions based on role
            user_permissions = []
            if current_user.role == 'admin':
                user_permissions = ['upload_file', 'download_file', 'share_file']
            elif current_user.role == 'user':
                user_permissions = ['upload_file', 'download_file', 'share_file']
            
            # Check if user has all required permissions
            for permission in required_permissions:
                if permission not in user_permissions:
                    raise HTTPException(
                        status_code=403,
                        detail=f"Missing required permission: {permission}"
                    )
            
            return func(*args, **kwargs)

        return async_wrapper if inspect.iscoroutinefunction(func) else sync_wrapper
    return decorator