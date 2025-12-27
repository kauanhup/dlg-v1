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
    
    # ========== SLOTS (QML -> Python) ==========
    
    @Slot(str, str)
    def login(self, email: str, password: str):
        """Faz login com email e senha"""
        self.loading = True
        
        result = supabase.login(email, password)
        
        self.loading = False
        
        if result["success"]:
            self._user_data = result["user"]
            self.loginSuccess.emit(json.dumps(result["user"] or {}))
            # Carrega dados adicionais após login
            self._loadUserData()
        else:
            self.loginError.emit(result["error"] or "Erro desconhecido")
    
    @Slot()
    def logout(self):
        """Faz logout"""
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
    
    # ========== MÉTODOS PRIVADOS ==========
    
    def _loadUserData(self):
        """Carrega todos os dados do usuário após login"""
        self.loadProfile()
        self.loadLicense()
