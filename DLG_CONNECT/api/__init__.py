"""
DLG Connect - API Module
Módulos de conexão com backend
"""

from .supabase_client import supabase, SupabaseClient
from .bridge import Backend

__all__ = ["supabase", "SupabaseClient", "Backend"]
