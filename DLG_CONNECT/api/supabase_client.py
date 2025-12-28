"""
DLG Connect - Supabase Client
Módulo de conexão com o banco de dados Lovable Cloud (Supabase)
"""

from supabase import create_client, Client
from typing import Optional, Dict, Any, List
import os
import platform
import uuid
import socket


class SupabaseClient:
    """Cliente Supabase para o DLG Connect"""
    
    # Configuração do Lovable Cloud (Supabase)
    SUPABASE_URL = "https://nydtfckvvslkbyolipsf.supabase.co"
    SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZHRmY2t2dnNsa2J5b2xpcHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTMyNDMsImV4cCI6MjA4MTM2OTI0M30.1vHOv48yxJNkyjodlWA3l94mDVDMRwVa97a-0R_U4uI"
    
    _instance: Optional['SupabaseClient'] = None
    _client: Optional[Client] = None
    _current_user: Optional[Dict[str, Any]] = None
    _session: Optional[Dict[str, Any]] = None
    _device_id: Optional[str] = None
    
    def __new__(cls):
        """Singleton pattern para garantir uma única instância"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._client = create_client(self.SUPABASE_URL, self.SUPABASE_ANON_KEY)
            self._device_id = self._generate_device_id()
    
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
    
    @property
    def device_id(self) -> str:
        """Retorna o ID único do dispositivo"""
        return self._device_id or ""
    
    # ========== DEVICE IDENTIFICATION ==========
    
    def _generate_device_id(self) -> str:
        """Gera um ID único para o dispositivo baseado em hardware"""
        try:
            # Combina informações únicas do sistema
            machine_id = platform.node()  # Nome do computador
            mac = uuid.getnode()  # Endereço MAC
            system_info = f"{platform.system()}-{platform.machine()}"
            
            # Cria hash único
            unique_string = f"{machine_id}-{mac}-{system_info}"
            device_hash = str(uuid.uuid5(uuid.NAMESPACE_DNS, unique_string))
            return device_hash
        except Exception:
            # Fallback para UUID aleatório (persistido localmente)
            return str(uuid.uuid4())
    
    def _get_device_info(self) -> Dict[str, Any]:
        """Retorna informações do dispositivo atual"""
        try:
            hostname = socket.gethostname()
            ip_address = socket.gethostbyname(hostname)
        except Exception:
            hostname = "unknown"
            ip_address = "unknown"
        
        return {
            "device_id": self._device_id,
            "device_name": platform.node(),
            "device_os": f"{platform.system()} {platform.release()}",
            "ip_address": ip_address
        }
    
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
            # Desativa a sessão do dispositivo antes de sair
            if self._current_user:
                self._deactivate_device_session()
            
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
    
    def is_license_valid(self) -> dict:
        """
        Verifica se a licença está válida (ativa E não expirada)
        Retorna: {"valid": bool, "days_remaining": int | None, "error": str | None}
        """
        from datetime import datetime, timezone
        
        license_data = self.get_license()
        
        if not license_data:
            return {
                "valid": False,
                "days_remaining": None,
                "error": "Nenhuma licença encontrada"
            }
        
        try:
            end_date_str = license_data.get("end_date")
            if not end_date_str:
                return {
                    "valid": False,
                    "days_remaining": None,
                    "error": "Data de expiração não definida"
                }
            
            # Parse ISO format date
            end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            
            if end_date < now:
                return {
                    "valid": False,
                    "days_remaining": 0,
                    "error": "Licença expirada"
                }
            
            days_remaining = (end_date - now).days
            return {
                "valid": True,
                "days_remaining": days_remaining,
                "error": None
            }
        except Exception as e:
            return {
                "valid": False,
                "days_remaining": None,
                "error": f"Erro ao verificar licença: {str(e)}"
            }
    
    def is_banned(self) -> dict:
        """
        Verifica se o usuário está banido
        Retorna: {"banned": bool, "reason": str | None}
        """
        profile = self.get_profile()
        
        if not profile:
            return {"banned": False, "reason": None}
        
        return {
            "banned": profile.get("banned", False),
            "reason": profile.get("ban_reason")
        }
    
    # ========== DEVICE SESSIONS (Controle de dispositivos) ==========
    
    def get_active_device_count(self) -> int:
        """Retorna quantos dispositivos ativos o usuário tem"""
        if not self._current_user:
            return 0
        
        try:
            response = self._client.table("bot_device_sessions").select("id").eq(
                "user_id", self._current_user.get("id")
            ).eq("is_active", True).execute()
            return len(response.data) if response.data else 0
        except Exception:
            return 0
    
    def get_max_devices_allowed(self) -> int:
        """Retorna o limite de dispositivos do plano do usuário"""
        subscription = self.get_subscription()
        if not subscription:
            return 1  # Padrão: 1 dispositivo
        
        plan = subscription.get("subscription_plans", {})
        return plan.get("max_devices", 1) if plan else 1
    
    def can_register_device(self) -> Dict[str, Any]:
        """
        Verifica se pode registrar mais um dispositivo
        Retorna: {"allowed": bool, "active_count": int, "max_allowed": int, "error": str | None}
        """
        if not self._current_user:
            return {
                "allowed": False,
                "active_count": 0,
                "max_allowed": 0,
                "error": "Usuário não autenticado"
            }
        
        # Verifica se o dispositivo atual já está registrado
        try:
            response = self._client.table("bot_device_sessions").select("id").eq(
                "user_id", self._current_user.get("id")
            ).eq("device_id", self._device_id).eq("is_active", True).maybeSingle().execute()
            
            if response.data:
                # Dispositivo já registrado, permitir
                return {
                    "allowed": True,
                    "active_count": self.get_active_device_count(),
                    "max_allowed": self.get_max_devices_allowed(),
                    "error": None,
                    "already_registered": True
                }
        except Exception:
            pass
        
        active_count = self.get_active_device_count()
        max_allowed = self.get_max_devices_allowed()
        
        return {
            "allowed": active_count < max_allowed,
            "active_count": active_count,
            "max_allowed": max_allowed,
            "error": None if active_count < max_allowed else f"Limite de {max_allowed} dispositivo(s) atingido",
            "already_registered": False
        }
    
    def register_device_session(self) -> Dict[str, Any]:
        """
        Registra o dispositivo atual para o usuário
        Retorna: {"success": bool, "error": str | None}
        """
        if not self._current_user:
            return {"success": False, "error": "Usuário não autenticado"}
        
        device_info = self._get_device_info()
        
        try:
            # Upsert - atualiza se existir, insere se não
            response = self._client.table("bot_device_sessions").upsert({
                "user_id": self._current_user.get("id"),
                "device_id": device_info["device_id"],
                "device_name": device_info["device_name"],
                "device_os": device_info["device_os"],
                "ip_address": device_info["ip_address"],
                "is_active": True,
                "last_activity_at": "now()"
            }, on_conflict="user_id,device_id").execute()
            
            return {"success": True, "error": None}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _deactivate_device_session(self):
        """Desativa a sessão do dispositivo atual"""
        if not self._current_user:
            return
        
        try:
            self._client.table("bot_device_sessions").update({
                "is_active": False
            }).eq("user_id", self._current_user.get("id")).eq(
                "device_id", self._device_id
            ).execute()
        except Exception:
            pass
    
    def get_user_devices(self) -> List[Dict[str, Any]]:
        """Retorna lista de dispositivos do usuário"""
        if not self._current_user:
            return []
        
        try:
            response = self._client.table("bot_device_sessions").select("*").eq(
                "user_id", self._current_user.get("id")
            ).order("last_activity_at", desc=True).execute()
            return response.data or []
        except Exception:
            return []
    
    def deactivate_device(self, device_id: str) -> Dict[str, Any]:
        """Desativa um dispositivo específico (para liberar slot)"""
        if not self._current_user:
            return {"success": False, "error": "Usuário não autenticado"}
        
        try:
            self._client.table("bot_device_sessions").update({
                "is_active": False
            }).eq("user_id", self._current_user.get("id")).eq(
                "device_id", device_id
            ).execute()
            return {"success": True, "error": None}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # ========== BOT ACTIVITY LOGS ==========
    
    def log_activity(self, action: str, details: Dict[str, Any] = None) -> bool:
        """
        Registra uma atividade do bot
        Actions: login, logout, extract_members, add_members, etc.
        """
        if not self._current_user:
            return False
        
        device_info = self._get_device_info()
        
        try:
            self._client.table("bot_activity_logs").insert({
                "user_id": self._current_user.get("id"),
                "device_id": device_info["device_id"],
                "action": action,
                "details": details or {},
                "ip_address": device_info["ip_address"]
            }).execute()
            return True
        except Exception:
            return False
    
    def get_activity_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retorna os últimos logs de atividade do usuário"""
        if not self._current_user:
            return []
        
        try:
            response = self._client.table("bot_activity_logs").select("*").eq(
                "user_id", self._current_user.get("id")
            ).order("created_at", desc=True).limit(limit).execute()
            return response.data or []
        except Exception:
            return []
    
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
    
    def get_recaptcha_settings(self) -> Dict[str, Any]:
        """Busca configurações do reCAPTCHA"""
        try:
            response = self._client.table("gateway_settings").select(
                "recaptcha_enabled, recaptcha_site_key"
            ).limit(1).single().execute()
            
            if response.data:
                return {
                    "enabled": response.data.get("recaptcha_enabled", False),
                    "site_key": response.data.get("recaptcha_site_key", "")
                }
            return {"enabled": False, "site_key": ""}
        except Exception:
            return {"enabled": False, "site_key": ""}
    
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
