"""
DLG Connect - QML Bridge
Ponte entre QML e Python para comunicação com o backend
"""

from PySide6.QtCore import QObject, Signal, Slot, Property
from PySide6.QtQml import QmlElement
from typing import Optional
import json

from .supabase_client import supabase

# Registra a classe para uso no QML
QML_IMPORT_NAME = "DLGConnect"
QML_IMPORT_MAJOR_VERSION = 1


@QmlElement
class Backend(QObject):
    """
    Bridge entre QML e Python
    Expõe todas as funcionalidades do backend para a interface
    """
    
    # ========== SIGNALS (Python -> QML) ==========
    
    # Auth signals
    loginSuccess = Signal(str)  # Emite JSON com dados do usuário
    loginError = Signal(str)    # Emite mensagem de erro
    logoutSuccess = Signal()
    
    # Ban/Device signals
    userBanned = Signal(str)      # Emite motivo do ban
    deviceLimitReached = Signal(str)  # Emite JSON com info de limite
    
    # Data signals
    profileLoaded = Signal(str)      # JSON do perfil
    licenseLoaded = Signal(str)      # JSON da licença
    subscriptionLoaded = Signal(str) # JSON da assinatura
    sessionsLoaded = Signal(str)     # JSON das sessions
    
    # Status signals
    loadingChanged = Signal(bool)
    errorOccurred = Signal(str)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self._loading = False
        self._user_data = None
        self._profile_data = None
        self._license_data = None
    
    # ========== PROPERTIES ==========
    
    @Property(bool, notify=loadingChanged)
    def loading(self) -> bool:
        return self._loading
    
    @loading.setter
    def loading(self, value: bool):
        if self._loading != value:
            self._loading = value
            self.loadingChanged.emit(value)
    
    @Property(bool)
    def isAuthenticated(self) -> bool:
        return supabase.is_authenticated
    
    @Property(str)
    def userId(self) -> str:
        if supabase.user:
            return supabase.user.get("id", "")
        return ""
    
    @Property(str)
    def userEmail(self) -> str:
        if supabase.user:
            return supabase.user.get("email", "")
        return ""
    
    @Property(str)
    def deviceId(self) -> str:
        """Retorna o ID único deste dispositivo"""
        return supabase.device_id
    
    # ========== SLOTS (QML -> Python) ==========
    
    @Slot(str, str)
    def login(self, email: str, password: str):
        """
        Faz login com email e senha
        Fluxo completo:
        1. Autentica no Supabase
        2. Verifica se usuário está banido
        3. Verifica limite de dispositivos
        4. Registra dispositivo
        5. Loga atividade
        """
        self.loading = True
        
        # 1. Autenticação
        result = supabase.login(email, password)
        
        if not result["success"]:
            self.loading = False
            self.loginError.emit(result["error"] or "Erro desconhecido")
            return
        
        self._user_data = result["user"]
        
        # 2. Verificar ban
        ban_check = supabase.is_banned()
        if ban_check["banned"]:
            # Faz logout e emite sinal de ban
            supabase.logout()
            self._user_data = None
            self.loading = False
            self.userBanned.emit(ban_check["reason"] or "Conta suspensa")
            return
        
        # 3. Verificar limite de dispositivos
        device_check = supabase.can_register_device()
        if not device_check["allowed"]:
            # Faz logout e emite sinal de limite atingido
            supabase.logout()
            self._user_data = None
            self.loading = False
            self.deviceLimitReached.emit(json.dumps({
                "active_count": device_check["active_count"],
                "max_allowed": device_check["max_allowed"],
                "error": device_check["error"]
            }))
            return
        
        # 4. Registrar dispositivo
        if not device_check.get("already_registered"):
            supabase.register_device_session()
        
        # 5. Logar atividade de login
        supabase.log_activity("bot_login", {
            "device_name": supabase._get_device_info()["device_name"],
            "device_os": supabase._get_device_info()["device_os"]
        })
        
        self.loading = False
        self.loginSuccess.emit(json.dumps(result["user"] or {}))
        
        # Carrega dados adicionais após login
        self._loadUserData()
    
    @Slot()
    def logout(self):
        """Faz logout"""
        # Loga atividade de logout
        supabase.log_activity("bot_logout")
        
        result = supabase.logout()
        if result["success"]:
            self._user_data = None
            self._profile_data = None
            self._license_data = None
            self.logoutSuccess.emit()
        else:
            self.errorOccurred.emit(result["error"] or "Erro ao sair")
    
    @Slot()
    def loadProfile(self):
        """Carrega o perfil do usuário"""
        self.loading = True
        
        profile = supabase.get_profile()
        self._profile_data = profile
        
        self.loading = False
        self.profileLoaded.emit(json.dumps(profile or {}))
    
    @Slot()
    def loadLicense(self):
        """Carrega a licença do usuário"""
        self.loading = True
        
        license_data = supabase.get_license()
        self._license_data = license_data
        
        self.loading = False
        self.licenseLoaded.emit(json.dumps(license_data or {}))
    
    @Slot()
    def loadSubscription(self):
        """Carrega a assinatura do usuário"""
        self.loading = True
        
        subscription = supabase.get_subscription()
        
        self.loading = False
        self.subscriptionLoaded.emit(json.dumps(subscription or {}))
    
    @Slot()
    def loadSessions(self):
        """Carrega as sessions do usuário"""
        self.loading = True
        
        sessions = supabase.get_user_sessions()
        
        self.loading = False
        self.sessionsLoaded.emit(json.dumps(sessions or []))
    
    @Slot(result=bool)
    def hasActiveLicense(self) -> bool:
        """Verifica se tem licença ativa"""
        return supabase.has_active_license()
    
    @Slot(result=str)
    def isLicenseValid(self) -> str:
        """
        Verifica se a licença está válida (ativa E não expirada)
        Retorna JSON: {"valid": bool, "days_remaining": int | None, "error": str | None}
        """
        result = supabase.is_license_valid()
        return json.dumps(result)
    
    @Slot(result=str)
    def isBanned(self) -> str:
        """
        Verifica se o usuário está banido
        Retorna JSON: {"banned": bool, "reason": str | None}
        """
        result = supabase.is_banned()
        return json.dumps(result)
    
    @Slot(result=str)
    def getProfileSync(self) -> str:
        """Retorna o perfil de forma síncrona (JSON)"""
        if self._profile_data:
            return json.dumps(self._profile_data)
        profile = supabase.get_profile()
        self._profile_data = profile
        return json.dumps(profile or {})
    
    @Slot(result=str)
    def getLicenseSync(self) -> str:
        """Retorna a licença de forma síncrona (JSON)"""
        if self._license_data:
            return json.dumps(self._license_data)
        license_data = supabase.get_license()
        self._license_data = license_data
        return json.dumps(license_data or {})
    
    @Slot(str, result=str)
    def getSystemSetting(self, key: str) -> str:
        """Busca uma configuração do sistema"""
        value = supabase.get_system_setting(key)
        return value or ""
    
    # ========== DEVICE MANAGEMENT ==========
    
    @Slot(result=str)
    def getDeviceInfo(self) -> str:
        """Retorna informações do dispositivo atual"""
        return json.dumps(supabase._get_device_info())
    
    @Slot(result=str)
    def getUserDevices(self) -> str:
        """Retorna lista de dispositivos do usuário"""
        devices = supabase.get_user_devices()
        return json.dumps(devices)
    
    @Slot(str, result=str)
    def deactivateDevice(self, device_id: str) -> str:
        """Desativa um dispositivo específico"""
        result = supabase.deactivate_device(device_id)
        return json.dumps(result)
    
    @Slot(result=str)
    def getDeviceLimits(self) -> str:
        """Retorna informações sobre limites de dispositivos"""
        return json.dumps({
            "active_count": supabase.get_active_device_count(),
            "max_allowed": supabase.get_max_devices_allowed(),
            "current_device_id": supabase.device_id
        })
    
    # ========== ACTIVITY LOGGING ==========
    
    @Slot(str, str)
    def logActivity(self, action: str, details_json: str = "{}"):
        """
        Registra uma atividade do bot
        Chamado do QML para logar ações como extrair membros, adicionar, etc.
        """
        try:
            details = json.loads(details_json) if details_json else {}
        except Exception:
            details = {}
        
        supabase.log_activity(action, details)
    
    @Slot(result=str)
    def getActivityLogs(self) -> str:
        """Retorna os últimos logs de atividade"""
        logs = supabase.get_activity_logs()
        return json.dumps(logs)
    
    # ========== RECAPTCHA ==========
    
    @Slot(result=str)
    def getRecaptchaSettings(self) -> str:
        """Retorna configurações do reCAPTCHA"""
        settings = supabase.get_recaptcha_settings()
        return json.dumps(settings)
    
    # ========== TRIAL SYSTEM ==========
    
    trialExpired = Signal(str)  # Emite JSON com info do trial expirado
    trialNotEligible = Signal(str)  # Dispositivo já usou trial
    
    @Slot(result=str)
    def checkTrialEligibility(self) -> str:
        """
        Verifica se o dispositivo pode usar trial
        Retorna JSON: {"eligible": bool, "already_used": bool, "trial_days": int, ...}
        """
        result = supabase.check_trial_eligibility()
        return json.dumps(result)
    
    @Slot(result=str)
    def registerTrial(self) -> str:
        """
        Registra o dispositivo como tendo usado trial
        Retorna JSON: {"success": bool, "trial_expires_at": str, ...}
        """
        user_id = supabase.user.get("id") if supabase.user else None
        result = supabase.register_trial(user_id)
        
        if result.get("success"):
            supabase.log_activity("trial_started", {
                "duration_days": result.get("duration_days"),
                "expires_at": result.get("trial_expires_at")
            })
        
        return json.dumps(result)
    
    @Slot(result=str)
    def getTrialStatus(self) -> str:
        """
        Verifica o status do trial para o dispositivo atual
        Retorna JSON: {"active": bool, "expires_at": str, "days_remaining": int, ...}
        """
        result = supabase.get_trial_status()
        return json.dumps(result)
    
    @Slot(result=str)
    def getDeviceFingerprint(self) -> str:
        """Retorna o fingerprint único do dispositivo"""
        return supabase.get_device_fingerprint()
    
    @Slot(result=str)
    def validateAccess(self) -> str:
        """
        Validação completa de acesso:
        1. Verifica se está banido
        2. Verifica se tem licença válida ou trial ativo
        Retorna JSON: {"allowed": bool, "reason": str, ...}
        """
        # Verificar ban
        ban_check = supabase.is_banned()
        if ban_check["banned"]:
            return json.dumps({
                "allowed": False,
                "reason": "banned",
                "ban_reason": ban_check["reason"]
            })
        
        # Verificar licença
        license_check = supabase.is_license_valid()
        if license_check["valid"]:
            return json.dumps({
                "allowed": True,
                "reason": "license",
                "days_remaining": license_check["days_remaining"]
            })
        
        # Verificar trial
        trial_status = supabase.get_trial_status()
        if trial_status.get("active"):
            return json.dumps({
                "allowed": True,
                "reason": "trial",
                "is_trial": True,
                "days_remaining": trial_status.get("days_remaining"),
                "expires_at": trial_status.get("expires_at")
            })
        
        # Verificar se pode iniciar trial
        trial_eligible = supabase.check_trial_eligibility()
        if trial_eligible.get("eligible"):
            return json.dumps({
                "allowed": False,
                "reason": "no_license_trial_available",
                "trial_days": trial_eligible.get("trial_days"),
                "message": "Sem licença ativa. Inicie o período de teste gratuito."
            })
        
        # Sem acesso
        return json.dumps({
            "allowed": False,
            "reason": "no_access",
            "trial_used": trial_eligible.get("already_used", False),
            "message": "Licença expirada e período de teste já utilizado."
        })
    
    # ========== MÉTODOS PRIVADOS ==========
    
    def _loadUserData(self):
        """Carrega todos os dados do usuário após login"""
        self.loadProfile()
        self.loadLicense()
