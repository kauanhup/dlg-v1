"""
DLG Connect - QML Bridge
Ponte entre QML e Python para comunicação com o backend via API PHP
"""

from PySide6.QtCore import QObject, Signal, Slot, Property
from PySide6.QtQml import QmlElement
from typing import Optional
import json

from .supabase_client import api

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
    # IMPORTANTE: Os nomes dos sinais devem corresponder exatamente
    # aos handlers no QML (onLoginSuccess, onLoginError, etc.)
    
    # Auth signals
    loginSuccess = Signal(str, name="loginSuccess")  # Emite JSON com dados do usuário
    loginError = Signal(str, str, name="loginError")  # Emite mensagem de erro e código
    logoutSuccess = Signal(name="logoutSuccess")
    
    # Ban/Device signals
    userBanned = Signal(str, name="userBanned")      # Emite motivo do ban
    deviceLimitReached = Signal(str, name="deviceLimitReached")  # Emite JSON com info de limite
    maintenanceMode = Signal(str, name="maintenanceMode")  # Emite mensagem de manutenção
    
    # License/Trial signals
    noLicense = Signal(str, name="noLicense")  # Sem licença ativa
    trialAvailable = Signal(str, name="trialAvailable")  # Trial disponível
    trialExpired = Signal(str, name="trialExpired")  # Trial expirado
    
    # Data signals
    profileLoaded = Signal(str, name="profileLoaded")      # JSON do perfil
    licenseLoaded = Signal(str, name="licenseLoaded")      # JSON da licença
    
    # Status signals
    loadingChanged = Signal(bool, name="loadingChanged")
    errorOccurred = Signal(str, name="errorOccurred")
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self._loading = False
    
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
        return api.is_authenticated
    
    @Property(str)
    def userId(self) -> str:
        if api.user:
            return api.user.get("id", "")
        return ""
    
    @Property(str)
    def userEmail(self) -> str:
        if api.user:
            return api.user.get("email", "")
        return ""
    
    @Property(str)
    def userName(self) -> str:
        return api.get_user_display_name()
    
    @Property(str)
    def userAvatar(self) -> str:
        return api.get_user_avatar()
    
    @Property(str)
    def planName(self) -> str:
        return api.get_plan_name()
    
    @Property(str)
    def deviceFingerprint(self) -> str:
        """Retorna o fingerprint único deste dispositivo"""
        return api.device_fingerprint
    
    @Property(str)
    def accessType(self) -> str:
        """Retorna tipo de acesso: 'license', 'trial', ou 'none'"""
        return api.get_access_type()
    
    # ========== SLOTS (QML -> Python) ==========
    
    @Slot(str, str)
    def login(self, email: str, password: str):
        """
        Faz login completo com todas as verificações:
        1. Valida credenciais
        2. Verifica manutenção
        3. Verifica ban
        4. Verifica licença/trial
        5. Verifica limite de dispositivos
        """
        self.loading = True
        
        result = api.full_login(email, password)
        
        self.loading = False
        
        if result.get("success"):
            # Login bem-sucedido
            self.loginSuccess.emit(json.dumps({
                "user": result.get("user"),
                "license": result.get("license"),
                "trial": result.get("trial"),
                "accessType": api.get_access_type()
            }))
            return
        
        # Trata os diferentes tipos de erro
        error_code = result.get("code", "UNKNOWN")
        error_message = result.get("error", "Erro desconhecido")
        
        if error_code == "MAINTENANCE":
            self.maintenanceMode.emit(error_message)
        elif error_code == "BANNED":
            self.userBanned.emit(result.get("ban_reason", error_message))
        elif error_code == "DEVICE_LIMIT":
            self.deviceLimitReached.emit(json.dumps({
                "active_count": result.get("activeDevices", 0),
                "max_allowed": result.get("maxDevices", 1),
                "error": error_message
            }))
        elif error_code == "NO_LICENSE":
            if result.get("canUseTrial"):
                self.trialAvailable.emit(json.dumps({
                    "trial_days": result.get("trialDays", 3),
                    "message": error_message
                }))
            else:
                self.noLicense.emit(error_message)
        else:
            self.loginError.emit(error_message, error_code)
    
    @Slot()
    def logout(self):
        """Faz logout"""
        result = api.logout()
        if result.get("success"):
            self.logoutSuccess.emit()
        else:
            self.errorOccurred.emit(result.get("error", "Erro ao sair"))
    
    @Slot(result=str)
    def checkLicense(self) -> str:
        """Verifica licença do usuário atual"""
        result = api.check_license()
        return json.dumps(result)
    
    @Slot(result=str)
    def checkTrial(self) -> str:
        """Verifica trial para este dispositivo"""
        result = api.check_trial()
        return json.dumps(result)
    
    @Slot(result=str)
    def registerTrial(self) -> str:
        """Registra trial para o usuário/dispositivo atual"""
        result = api.register_trial()
        return json.dumps(result)
    
    @Slot(result=bool)
    def hasActiveLicense(self) -> bool:
        """Verifica se tem licença ativa"""
        return api.has_active_license()
    
    @Slot(result=bool)
    def hasActiveTrial(self) -> bool:
        """Verifica se tem trial ativo"""
        return api.has_active_trial()
    
    @Slot(result=bool)
    def canUseTrial(self) -> bool:
        """Verifica se é elegível para trial"""
        return api.can_use_trial()
    
    @Slot(result=int)
    def getLicenseDaysRemaining(self) -> int:
        """Retorna dias restantes da licença"""
        return api.get_license_days_remaining()
    
    @Slot(result=str)
    def getDeviceInfo(self) -> str:
        """Retorna informações do dispositivo atual"""
        return json.dumps(api._get_device_info())
    
    @Slot(result=str)
    def getAccessType(self) -> str:
        """Retorna tipo de acesso: 'license', 'trial', ou 'none'"""
        return api.get_access_type()
    
    @Slot(result=str)
    def getUserInfo(self) -> str:
        """Retorna informações completas do usuário"""
        return json.dumps({
            "id": api.user.get("id") if api.user else None,
            "email": api.user.get("email") if api.user else None,
            "name": api.get_user_display_name(),
            "avatar": api.get_user_avatar(),
            "plan": api.get_plan_name(),
            "accessType": api.get_access_type(),
            "isAuthenticated": api.is_authenticated,
            "license": api.license,
            "trial": api.trial
        })
    
    @Slot(result=str)
    def getLicenseInfo(self) -> str:
        """Retorna informações da licença"""
        return json.dumps(api.license or {})
    
    @Slot(result=str)
    def getTrialInfo(self) -> str:
        """Retorna informações do trial"""
        return json.dumps(api.trial or {})
