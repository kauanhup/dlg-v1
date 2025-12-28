"""
DLG Connect - API Client
Módulo de conexão com a API PHP hospedada na Hostinger
"""

import requests
import platform
import uuid
import socket
import hashlib
import os
from typing import Optional, Dict, Any, List

from .session_manager import session_manager


class DLGApiClient:
    """Cliente para a API do DLG Connect (Lovable Cloud Edge Function)"""
    
    # =====================================================
    # CONFIGURAÇÃO - EDGE FUNCTION DO LOVABLE CLOUD
    # =====================================================
    # URL da Edge Function (automático, não precisa configurar nada)
    API_URL = "https://nydtfckvvslkbyolipsf.supabase.co/functions/v1/bot-auth"
    
    # Anon key para autenticação (pública, pode ficar no código)
    ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZHRmY2t2dnNsa2J5b2xpcHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTMyNDMsImV4cCI6MjA4MTM2OTI0M30.1vHOv48yxJNkyjodlWA3l94mDVDMRwVa97a-0R_U4uI"
    
    _instance: Optional['DLGApiClient'] = None
    _current_user: Optional[Dict[str, Any]] = None
    _access_token: Optional[str] = None
    _device_fingerprint: Optional[str] = None
    _license_info: Optional[Dict[str, Any]] = None
    _trial_info: Optional[Dict[str, Any]] = None
    
    # Configurações do reCAPTCHA (carregadas do servidor)
    _recaptcha_enabled: bool = False
    _recaptcha_site_key: Optional[str] = None
    
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
    
    @property
    def recaptcha_enabled(self) -> bool:
        """Retorna se o reCAPTCHA está habilitado"""
        return self._recaptcha_enabled
    
    @property
    def recaptcha_site_key(self) -> str:
        """Retorna a site key do reCAPTCHA"""
        return self._recaptcha_site_key or ""
    
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
    
    # ========== reCAPTCHA ==========
    
    def load_recaptcha_settings(self) -> Dict[str, Any]:
        """
        Carrega configurações do reCAPTCHA do servidor PHP
        Retorna: {"success": bool, "enabled": bool, "siteKey": str}
        """
        result = self._api_request("get_recaptcha_settings", {})
        
        if result.get("success"):
            self._recaptcha_enabled = result.get("enabled", False)
            self._recaptcha_site_key = result.get("siteKey", "")
            print(f"[reCAPTCHA] Configurações carregadas - Enabled: {self._recaptcha_enabled}")
        else:
            print(f"[reCAPTCHA] Erro ao carregar: {result.get('error', 'desconhecido')}")
        
        return result
    
    # ========== API COMMUNICATION ==========
    
    def _api_request(self, action: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Faz uma requisição para a Edge Function do Lovable Cloud
        """
        payload = {
            "action": action,
            **(data or {})
        }
        
        # Headers para Edge Function
        headers = {
            "Content-Type": "application/json",
            "apikey": self.ANON_KEY,
            "Authorization": f"Bearer {self.ANON_KEY}"
        }
        
        try:
            print(f"[API] Requisição: {action} -> {self.API_URL}")
            response = requests.post(
                self.API_URL,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            print(f"[API] Resposta: {response.status_code}")
            result = response.json()
            
            # LOG DETALHADO para debug
            if action in ["full_login_check", "verify_session"]:
                print(f"[API] Resultado {action}: success={result.get('success')}, access={result.get('access')}, reason={result.get('reason')}")
                if result.get("reason") == "banned":
                    print(f"[API] USUÁRIO BANIDO - ban_reason: {result.get('ban_reason')}")
            
            # Adiciona status code ao resultado
            result["_status_code"] = response.status_code
            
            return result
            
        except requests.exceptions.Timeout:
            print(f"[API] Timeout ao conectar em: {self.API_URL}")
            return {"success": False, "error": "Timeout na conexão com o servidor"}
        except requests.exceptions.ConnectionError as e:
            print(f"[API] Erro de conexão: {self.API_URL} - {str(e)}")
            return {"success": False, "error": f"Erro de conexão com {self.API_URL}"}
        except requests.exceptions.SSLError as e:
            print(f"[API] Erro SSL: {str(e)}")
            return {"success": False, "error": "Erro de certificado SSL"}
        except Exception as e:
            print(f"[API] Erro: {str(e)}")
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
    
    def full_login(self, email: str, password: str, recaptcha_token: str = "") -> Dict[str, Any]:
        """
        Login completo com TODAS as verificações no servidor:
        - reCAPTCHA (validado no servidor PHP)
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
            "code": str | None (RECAPTCHA_FAILED, RECAPTCHA_REQUIRED, MAINTENANCE, BANNED, NO_LICENSE, DEVICE_LIMIT, INVALID_CREDENTIALS)
        }
        """
        device_info = self._get_device_info()
        
        # Montar payload com token do reCAPTCHA
        payload = {
            "email": email,
            "password": password,
            "recaptcha_token": recaptcha_token,
            **device_info
        }
        
        result = self._api_request("full_login_check", payload)
        
        # DEBUG: Log completo da resposta
        print(f"[API] full_login_check RAW response: {result}")
        
        # Mapear resposta da edge function para formato esperado pelo bridge
        success = result.get("success", False)
        access = result.get("access")  # Não usar default aqui!
        reason = result.get("reason", "")
        code = result.get("code", "")
        
        # LOG para debug
        print(f"[API] full_login_check parsed: success={success}, access={access}, reason={reason}, code={code}")
        
        # Se não tem acesso ou não teve sucesso, mapear o erro
        # access pode ser None, False, ou não existir - todos são "sem acesso"
        has_access = access is True  # Só True explícito significa acesso
        
        if not success or not has_access:
            # Mapear reason -> code se code não foi fornecido pela API
            if not code:
                reason_to_code = {
                    "banned": "BANNED",
                    "maintenance": "MAINTENANCE", 
                    "device_limit": "DEVICE_LIMIT",
                    "no_license": "NO_LICENSE",
                    "recaptcha_required": "RECAPTCHA_REQUIRED",
                    "recaptcha_failed": "RECAPTCHA_FAILED",
                    "invalid_credentials": "INVALID_CREDENTIALS",
                }
                code = reason_to_code.get(reason, "UNKNOWN")
            
            result["code"] = code
            result["success"] = False  # Garantir que success é False
            
            print(f"[API] Erro mapeado: code={code}, reason={reason}")
            
            # Mapear campos específicos de ban
            if reason == "banned" or code == "BANNED":
                result["ban_reason"] = result.get("ban_reason") or result.get("message", "Conta suspensa")
                print(f"[API] BANNED - ban_reason: {result.get('ban_reason')}")
            
            # Mapear campos de device limit
            if reason == "device_limit" or code == "DEVICE_LIMIT":
                result["activeDevices"] = result.get("active_devices", 0)
                result["maxDevices"] = result.get("max_devices", 1)
            
            # Mapear campos de trial
            if reason == "no_license" or code == "NO_LICENSE":
                result["canUseTrial"] = result.get("trial_eligible", False)
                result["trialDays"] = result.get("trial_days", 3)
        
        if result.get("success") and result.get("access"):
            self._current_user = result.get("user")
            self._access_token = result.get("access_token")
            self._license_info = {
                "plan_name": result.get("plan_name"),
                "expires_at": result.get("expires_at"),
                "is_trial": result.get("is_trial", False)
            } if result.get("plan_name") else None
            self._trial_info = {
                "is_trial": result.get("is_trial", False),
                "expires_at": result.get("expires_at")
            } if result.get("is_trial") else None
            
            # SALVAR SESSÃO LOCALMENTE para auto-login futuro
            user = result.get("user", {})
            session_manager.save_session(
                user_id=user.get("id", ""),
                email=user.get("email", ""),
                name=user.get("name", ""),
                avatar=user.get("avatar", ""),
                device_fingerprint=self._device_fingerprint,
                plan_name=result.get("plan_name", ""),
                expires_at=result.get("expires_at", ""),
                is_trial=result.get("is_trial", False)
            )
        
        return result
    
    def verify_session(self) -> Dict[str, Any]:
        """
        Verifica sessão salva localmente sem precisar de senha.
        Usado para auto-login quando o bot abre.
        
        Retorna:
            - Se sessão válida: mesmo formato do full_login com access=True
            - Se inválida: {"success": False, "should_clear_session": True/False, ...}
        """
        # Verificar se tem sessão salva
        if not session_manager.has_session():
            return {
                "success": False,
                "has_session": False,
                "error": "Nenhuma sessão salva"
            }
        
        saved_session = session_manager.get_session()
        user_id = saved_session.get("user_id")
        
        # Verificar integridade da sessão (mesmo dispositivo)
        if not session_manager.verify_integrity(self._device_fingerprint):
            session_manager.clear_session()
            return {
                "success": False,
                "has_session": False,
                "error": "Sessão inválida para este dispositivo"
            }
        
        print(f"[Session] Verificando sessão para: {saved_session.get('email')}")
        
        # Chamar edge function para verificar no servidor
        device_info = self._get_device_info()
        result = self._api_request("verify_session", {
            "user_id": user_id,
            **device_info
        })
        
        # Se deve limpar sessão local
        if result.get("should_clear_session"):
            print(f"[Session] Sessão expirada/inválida, limpando...")
            session_manager.clear_session()
        
        # Mapear resposta para códigos
        if not result.get("success") or not result.get("access", True):
            reason = result.get("reason", "")
            
            reason_to_code = {
                "banned": "BANNED",
                "maintenance": "MAINTENANCE", 
                "device_limit": "DEVICE_LIMIT",
                "no_license": "NO_LICENSE",
                "user_not_found": "USER_NOT_FOUND",
            }
            
            code = result.get("code") or reason_to_code.get(reason, "UNKNOWN")
            result["code"] = code
            
            if reason == "banned":
                result["ban_reason"] = result.get("ban_reason") or result.get("message", "Conta suspensa")
            
            if reason == "device_limit":
                result["activeDevices"] = result.get("active_devices", 0)
                result["maxDevices"] = result.get("max_devices", 1)
            
            if reason == "no_license":
                result["canUseTrial"] = result.get("trial_eligible", False)
                result["trialDays"] = result.get("trial_days", 3)
            
            result["success"] = False
        
        # Se acesso liberado, atualizar estado local
        if result.get("success") and result.get("access"):
            self._current_user = result.get("user")
            self._license_info = {
                "plan_name": result.get("plan_name"),
                "expires_at": result.get("expires_at"),
                "is_trial": result.get("is_trial", False)
            } if result.get("plan_name") else None
            self._trial_info = {
                "is_trial": result.get("is_trial", False),
                "expires_at": result.get("expires_at")
            } if result.get("is_trial") else None
            
            # Atualizar sessão local com dados mais recentes
            user = result.get("user", {})
            session_manager.save_session(
                user_id=user.get("id", ""),
                email=user.get("email", ""),
                name=user.get("name", ""),
                avatar=user.get("avatar", ""),
                device_fingerprint=self._device_fingerprint,
                plan_name=result.get("plan_name", ""),
                expires_at=result.get("expires_at", ""),
                is_trial=result.get("is_trial", False)
            )
        
        result["has_session"] = True
        return result
    
    def has_saved_session(self) -> bool:
        """Verifica rapidamente se tem sessão salva localmente"""
        return session_manager.has_session()
    
    def get_saved_session_email(self) -> Optional[str]:
        """Retorna o email da sessão salva (para exibir na UI)"""
        return session_manager.get_email()
    
    def logout(self) -> Dict[str, Any]:
        """Faz logout e desativa sessão do dispositivo"""
        user_id = None
        if self._current_user:
            user_id = self._current_user.get("id")
        elif session_manager.has_session():
            user_id = session_manager.get_user_id()
        
        if user_id:
            result = self._api_request("logout", {
                "user_id": user_id,
                "device_fingerprint": self._device_fingerprint
            })
        else:
            result = {"success": True, "message": "Já deslogado"}
        
        # Limpar estado local
        self._current_user = None
        self._access_token = None
        self._license_info = None
        self._trial_info = None
        
        # Limpar sessão salva
        session_manager.clear_session()
        print("[Session] Logout completo - sessão local removida")
        
        return result
    
    def clear_local_session(self):
        """Limpa apenas a sessão local sem chamar o servidor"""
        session_manager.clear_session()
        self._current_user = None
        self._access_token = None
        self._license_info = None
        self._trial_info = None
    
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
