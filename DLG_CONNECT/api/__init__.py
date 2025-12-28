"""
DLG Connect - API Module
Módulos de conexão com backend
"""

from .supabase_client import api, DLGApiClient
from .bridge import Backend

__all__ = ["api", "DLGApiClient", "Backend"]
