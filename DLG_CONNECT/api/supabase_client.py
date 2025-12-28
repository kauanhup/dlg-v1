"""
DLG Connect - API Client
Módulo de conexão com a API PHP hospedada na Hostinger
"""

import requests
import platform
import uuid
import socket
import hashlib
from typing import Optional, Dict, Any, List


class DLGApiClient:
    """Cliente para a API PHP do DLG Connect (Hostinger)"""
    
    # =====================================================
    # CONFIGURAÇÃO - ALTERE PARA SEU DOMÍNIO
    # =====================================================
    API_URL = "https://seudominio.com/api/bot-api.php"  # ALTERE AQUI!
    API_SECRET = "dlg_bot_2024_Xk9mP2nQ7rT3wY5zB8cD4fG6hJ"  # Mesma do config.php
    
    _instance: Optional['DLGApiClient'] = None
    _current_user: Optional[Dict[str, Any]] = None
    _access_token: Optional[str] = None
    _device_fingerprint: Optional[str] = None
    _license_info: Optional[Dict[str, Any]] = None
    _trial_info: Optional[Dict[str, Any]] = None
    
    def __new__(cls):
        """Singleton pattern para garantir uma única instância"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._device_fingerprint is None:
            self._device_fingerprint = self._generate_device_fingerprint()
    
    # ========== PROPRIEDADES ==========
    
    @property
    def user(self) -> Optional[Dict[str, Any]]:
        """Retorna o usuário atual logado"""
        return self._current_user
    
    @property
    def is_authenticated(self) -> bool:
        """Verifica se há um usuário autenticado"""
        return self._current_user is not None
    
    @property
    def device_fingerprint(self) -> str:
        """Retorna o fingerprint único do dispositivo"""
        return self._device_fingerprint or ""
    
    @property
    def license(self) -> Optional[Dict[str, Any]]:
        """Retorna informações da licença"""
        return self._license_info
    
    @property
    def trial(self) -> Optional[Dict[str, Any]]:
        """Retorna informações do trial"""
        return self._trial_info
    
    # ========== DEVICE IDENTIFICATION ==========
    
    def _generate_device_fingerprint(self) -> str:
        """Gera fingerprint único do dispositivo para controle de trial"""
        try:
            machine_id = platform.node()
            mac_address = uuid.getnode()
            processor = platform.processor()
            system = platform.system()
            release = platform.release()
            
            fingerprint_data = f"{machine_id}-{mac_address}-{processor}-{system}-{release}"
            fingerprint = hashlib.sha256(fingerprint_data.encode()).hexdigest()
            
            return fingerprint
        except Exception:
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
            "device_fingerprint": self._device_fingerprint,
            "device_name": platform.node(),
            "device_os": f"{platform.system()} {platform.release()}",
            "machine_id": platform.node(),
            "ip_address": ip_address
        }
    
    # ========== API COMMUNICATION ==========
    
    def _api_request(self, action: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Faz uma requisição para a API PHP
        """
        payload = {
            "action": action,
            "api_key": self.API_SECRET,
            **(data or {})
        }
        
        try:
            response = requests.post(
                self.API_URL,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            result = response.json()
            
            # Adiciona status code ao resultado
            result["_status_code"] = response.status_code
            
            return result
            
        except requests.exceptions.Timeout:
            return {"success": False, "error": "Timeout na conexão com o servidor"}
        except requests.exceptions.ConnectionError:
            return {"success": False, "error": "Erro de conexão. Verifique sua internet."}
        except Exception as e:
            return {"success": False, "error": f"Erro: {str(e)}"}
    
    # ========== AUTENTICAÇÃO ==========
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """
        Login simples - apenas valida credenciais
        Retorna: {"success": bool, "user": dict | None, "error": str | None}
        """
        result = self._api_request("login", {
            "email": email,
            "password": password
        })
        
        if result.get("success"):
            self._current_user = result.get("user")
            self._access_token = result.get("access_token")
        
        return result
    
    def full_login(self, email: str, password: str) -> Dict[str, Any]:
        """
        Login completo com TODAS as verificações:
        - Manutenção
        - Ban
        - Licença
        - Trial
        - Limite de dispositivos
        
        Retorna: {
            "success": bool,
            "user": dict,
            "license": dict | None,
            "trial": dict | None,
            "canUseTrial": bool,
            "maxDevices": int,
            "activeDevices": int,
            "error": str | None,
            "code": str | None (MAINTENANCE, BANNED, NO_LICENSE, DEVICE_LIMIT, INVALID_CREDENTIALS)
        }
        """
        device_info = self._get_device_info()
        
        result = self._api_request("full_login_check", {
            "email": email,
            "password": password,
            **device_info
        })
        
        if result.get("success"):
            self._current_user = result.get("user")
            self._access_token = result.get("access_token")
            self._license_info = result.get("license")
            self._trial_info = result.get("trial")
        
        return result
    
    def logout(self) -> Dict[str, Any]:
        """Faz logout e desativa sessão do dispositivo"""
        if not self._current_user:
            return {"success": True, "message": "Já deslogado"}
        
        result = self._api_request("logout", {
            "user_id": self._current_user.get("id"),
            "device_fingerprint": self._device_fingerprint
        })
        
        # Limpar estado local
        self._current_user = None
        self._access_token = None
        self._license_info = None
        self._trial_info = None
        
        return result
    
    # ========== LICENÇA ==========
    
    def check_license(self) -> Dict[str, Any]:
        """
        Verifica licença do usuário atual
        Retorna: {"success": bool, "hasLicense": bool, "license": dict | None}
        """
        if not self._current_user:
            return {"success": False, "error": "Usuário não autenticado"}
        
        result = self._api_request("check_license", {
            "user_id": self._current_user.get("id")
        })
        
        if result.get("success"):
            self._license_info = result.get("license")
        
        return result
    
    def has_active_license(self) -> bool:
        """Verifica rapidamente se tem licença ativa"""
        return self._license_info is not None
    
    def get_license_days_remaining(self) -> int:
        """Retorna dias restantes da licença"""
        if not self._license_info:
            return 0
        return self._license_info.get("days_remaining", 0)
    
    # ========== TRIAL ==========
    
    def check_trial(self) -> Dict[str, Any]:
        """
        Verifica elegibilidade/status do trial para este dispositivo
        Retorna: {"success": bool, "trial": {"exists": bool, "eligible": bool, "active": bool, ...}}
        """
        result = self._api_request("check_trial", {
            "device_fingerprint": self._device_fingerprint
        })
        
        if result.get("success"):
            self._trial_info = result.get("trial")
        
        return result
    
    def register_trial(self) -> Dict[str, Any]:
        """
        Registra trial para o usuário/dispositivo atual
        Retorna: {"success": bool, "trial": {"active": bool, "expires_at": str, ...}}
        """
        if not self._current_user:
            return {"success": False, "error": "Usuário não autenticado"}
        
        device_info = self._get_device_info()
        
        result = self._api_request("register_trial", {
            "user_id": self._current_user.get("id"),
            **device_info
        })
        
        if result.get("success"):
            self._trial_info = result.get("trial")
        
        return result
    
    def has_active_trial(self) -> bool:
        """Verifica rapidamente se tem trial ativo"""
        if not self._trial_info:
            return False
        return self._trial_info.get("active", False)
    
    def can_use_trial(self) -> bool:
        """Verifica se é elegível para trial"""
        if not self._trial_info:
            self.check_trial()
        return self._trial_info.get("eligible", False) if self._trial_info else False
    
    # ========== UTILITÁRIOS ==========
    
    def get_user_display_name(self) -> str:
        """Retorna nome do usuário para exibição"""
        if not self._current_user:
            return "Visitante"
        return self._current_user.get("name") or self._current_user.get("email", "Usuário")
    
    def get_user_avatar(self) -> str:
        """Retorna avatar do usuário"""
        if not self._current_user:
            return "😀"
        return self._current_user.get("avatar", "😀")
    
    def get_plan_name(self) -> str:
        """Retorna nome do plano atual"""
        if self._license_info:
            return self._license_info.get("plan_name", "Sem plano")
        if self._trial_info and self._trial_info.get("active"):
            return "Trial"
        return "Sem plano"
    
    def is_trial_expired(self) -> bool:
        """Verifica se o trial expirou"""
        if not self._trial_info:
            return False
        return self._trial_info.get("expired", False)
    
    def get_access_type(self) -> str:
        """
        Retorna tipo de acesso: 'license', 'trial', ou 'none'
        """
        if self._license_info:
            return "license"
        if self._trial_info and self._trial_info.get("active"):
            return "trial"
        return "none"


# =====================================================
# INSTÂNCIA GLOBAL
# =====================================================
api = DLGApiClient()


# =====================================================
# FUNÇÕES DE ATALHO (compatibilidade)
# =====================================================

def login(email: str, password: str) -> Dict[str, Any]:
    """Atalho para login completo"""
    return api.full_login(email, password)

def logout() -> Dict[str, Any]:
    """Atalho para logout"""
    return api.logout()

def is_authenticated() -> bool:
    """Verifica se está autenticado"""
    return api.is_authenticated

def get_user() -> Optional[Dict[str, Any]]:
    """Retorna usuário atual"""
    return api.user

def has_license() -> bool:
    """Verifica se tem licença"""
    return api.has_active_license()

def has_trial() -> bool:
    """Verifica se tem trial ativo"""
    return api.has_active_trial()
