"""
DLG Connect - Supabase Client
Módulo de conexão com o banco de dados Lovable Cloud (Supabase)
"""

from supabase import create_client, Client
from typing import Optional, Dict, Any
import os


class SupabaseClient:
    """Cliente Supabase para o DLG Connect"""
    
    # Configuração do Lovable Cloud (Supabase)
    SUPABASE_URL = "https://nydtfckvvslkbyolipsf.supabase.co"
    SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZHRmY2t2dnNsa2J5b2xpcHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTMyNDMsImV4cCI6MjA4MTM2OTI0M30.1vHOv48yxJNkyjodlWA3l94mDVDMRwVa97a-0R_U4uI"
    
    _instance: Optional['SupabaseClient'] = None
    _client: Optional[Client] = None
    _current_user: Optional[Dict[str, Any]] = None
    _session: Optional[Dict[str, Any]] = None
    
    def __new__(cls):
        """Singleton pattern para garantir uma única instância"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._client = create_client(self.SUPABASE_URL, self.SUPABASE_ANON_KEY)
    
    @property
    def client(self) -> Client:
        """Retorna o cliente Supabase"""
        return self._client
    
    @property
    def user(self) -> Optional[Dict[str, Any]]:
        """Retorna o usuário atual logado"""
        return self._current_user
    
    @property
    def is_authenticated(self) -> bool:
        """Verifica se há um usuário autenticado"""
        return self._current_user is not None
    
    # ========== AUTENTICAÇÃO ==========
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """
        Faz login com email e senha
        Retorna: {"success": bool, "user": dict | None, "error": str | None}
        """
        try:
            response = self._client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            self._current_user = response.user.__dict__ if response.user else None
            self._session = response.session.__dict__ if response.session else None
            
            return {
                "success": True,
                "user": self._current_user,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "user": None,
                "error": str(e)
            }
    
    def logout(self) -> Dict[str, Any]:
        """Faz logout do usuário atual"""
        try:
            self._client.auth.sign_out()
            self._current_user = None
            self._session = None
            return {"success": True, "error": None}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # ========== PERFIL DO USUÁRIO ==========
    
    def get_profile(self) -> Optional[Dict[str, Any]]:
        """Busca o perfil do usuário logado"""
        if not self._current_user:
            return None
        
        try:
            response = self._client.table("profiles").select("*").eq(
                "user_id", self._current_user.get("id")
            ).single().execute()
            return response.data
        except Exception:
            return None
    
    # ========== LICENÇA ==========
    
    def get_license(self) -> Optional[Dict[str, Any]]:
        """Busca a licença ativa do usuário logado"""
        if not self._current_user:
            return None
        
        try:
            response = self._client.table("licenses").select("*").eq(
                "user_id", self._current_user.get("id")
            ).eq("status", "active").single().execute()
            return response.data
        except Exception:
            return None
    
    def has_active_license(self) -> bool:
        """Verifica se o usuário tem licença ativa"""
        license_data = self.get_license()
        return license_data is not None
    
    # ========== SUBSCRIPTION ==========
    
    def get_subscription(self) -> Optional[Dict[str, Any]]:
        """Busca a assinatura ativa do usuário"""
        if not self._current_user:
            return None
        
        try:
            response = self._client.table("user_subscriptions").select(
                "*, subscription_plans(*)"
            ).eq(
                "user_id", self._current_user.get("id")
            ).eq("status", "active").single().execute()
            return response.data
        except Exception:
            return None
    
    # ========== SESSIONS (Telegram) ==========
    
    def get_user_sessions(self) -> list:
        """Busca as sessions do usuário"""
        if not self._current_user:
            return []
        
        try:
            response = self._client.table("user_sessions").select("*").eq(
                "user_id", self._current_user.get("id")
            ).execute()
            return response.data or []
        except Exception:
            return []
    
    # ========== CONFIGURAÇÕES DO SISTEMA ==========
    
    def get_system_setting(self, key: str) -> Optional[str]:
        """Busca uma configuração do sistema"""
        try:
            response = self._client.table("system_settings").select("value").eq(
                "key", key
            ).single().execute()
            return response.data.get("value") if response.data else None
        except Exception:
            return None
    
    def get_bot_file(self) -> Optional[Dict[str, Any]]:
        """Busca informações do arquivo do bot ativo"""
        try:
            response = self._client.table("bot_files").select("*").eq(
                "is_active", True
            ).single().execute()
            return response.data
        except Exception:
            return None


# Instância global para uso em todo o app
supabase = SupabaseClient()
