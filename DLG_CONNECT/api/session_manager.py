"""
DLG Connect - Session Manager
Gerencia persistência de sessão local para auto-login
"""

import os
import json
import hashlib
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime


class SessionManager:
    """Gerencia sessão local do usuário para persistência de login"""
    
    _instance: Optional['SessionManager'] = None
    
    # Pasta de dados do app
    APP_NAME = "DLG Connect"
    SESSION_FILE = "session.json"
    
    def __new__(cls):
        """Singleton pattern"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self._app_data_path = self._get_app_data_path()
        self._session_path = self._get_session_path()
        self._session_data: Optional[Dict[str, Any]] = None
        self._initialized = True
        
        # Carregar sessão existente
        self._load_session()
        
        print(f"[Session] Pasta de dados: {self._app_data_path}")
    
    def _get_app_data_path(self) -> Path:
        """Retorna o caminho da pasta de dados do app baseado no SO"""
        import platform
        
        system = platform.system()
        
        if system == "Windows":
            # Windows: %APPDATA%/DLG Connect/
            app_data = os.environ.get("APPDATA", os.path.expanduser("~"))
            base_path = Path(app_data) / self.APP_NAME
        elif system == "Darwin":
            # macOS: ~/Library/Application Support/DLG Connect/
            base_path = Path.home() / "Library" / "Application Support" / self.APP_NAME
        else:
            # Linux (dev): ~/.dlg-connect/
            base_path = Path.home() / ".dlg-connect"
        
        # Criar diretório principal se não existir
        base_path.mkdir(parents=True, exist_ok=True)
        
        return base_path
    
    def _get_session_path(self) -> Path:
        """Retorna o caminho do arquivo de sessão"""
        return self._app_data_path / self.SESSION_FILE
    
    def get_app_data_path(self) -> Path:
        """Retorna o caminho da pasta de dados do app (público)"""
        return self._app_data_path
    
    def get_sessions_folder(self) -> Path:
        """Retorna pasta para armazenar sessions do Telegram"""
        sessions_path = self._app_data_path / "telegram_sessions"
        sessions_path.mkdir(parents=True, exist_ok=True)
        return sessions_path
    
    def get_logs_folder(self) -> Path:
        """Retorna pasta para logs locais"""
        logs_path = self._app_data_path / "logs"
        logs_path.mkdir(parents=True, exist_ok=True)
        return logs_path
    
    def get_cache_folder(self) -> Path:
        """Retorna pasta para cache"""
        cache_path = self._app_data_path / "cache"
        cache_path.mkdir(parents=True, exist_ok=True)
        return cache_path
    
    def _load_session(self) -> bool:
        """Carrega sessão do arquivo local"""
        try:
            if self._session_path.exists():
                with open(self._session_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # Verificar se a sessão não está corrompida
                if data.get("user_id") and data.get("email"):
                    self._session_data = data
                    print(f"[Session] Sessão carregada para: {data.get('email')}")
                    return True
                    
        except Exception as e:
            print(f"[Session] Erro ao carregar sessão: {e}")
        
        self._session_data = None
        return False
    
    def save_session(
        self,
        user_id: str,
        email: str,
        name: str = "",
        avatar: str = "",
        device_fingerprint: str = "",
        plan_name: str = "",
        expires_at: str = "",
        is_trial: bool = False
    ) -> bool:
        """Salva sessão localmente após login bem-sucedido"""
        try:
            session_data = {
                "user_id": user_id,
                "email": email,
                "name": name,
                "avatar": avatar,
                "device_fingerprint": device_fingerprint,
                "plan_name": plan_name,
                "expires_at": expires_at,
                "is_trial": is_trial,
                "saved_at": datetime.now().isoformat(),
                # Hash para verificação de integridade
                "checksum": self._generate_checksum(user_id, email, device_fingerprint)
            }
            
            with open(self._session_path, 'w', encoding='utf-8') as f:
                json.dump(session_data, f, indent=2)
            
            self._session_data = session_data
            print(f"[Session] Sessão salva para: {email}")
            return True
            
        except Exception as e:
            print(f"[Session] Erro ao salvar sessão: {e}")
            return False
    
    def clear_session(self) -> bool:
        """Remove sessão local (logout ou erro de verificação)"""
        try:
            if self._session_path.exists():
                self._session_path.unlink()
                print("[Session] Sessão removida")
            
            self._session_data = None
            return True
            
        except Exception as e:
            print(f"[Session] Erro ao remover sessão: {e}")
            return False
    
    def has_session(self) -> bool:
        """Verifica se existe uma sessão salva"""
        return self._session_data is not None and bool(self._session_data.get("user_id"))
    
    def get_session(self) -> Optional[Dict[str, Any]]:
        """Retorna dados da sessão salva"""
        return self._session_data
    
    def get_user_id(self) -> Optional[str]:
        """Retorna o user_id da sessão salva"""
        if self._session_data:
            return self._session_data.get("user_id")
        return None
    
    def get_email(self) -> Optional[str]:
        """Retorna o email da sessão salva"""
        if self._session_data:
            return self._session_data.get("email")
        return None
    
    def get_device_fingerprint(self) -> Optional[str]:
        """Retorna o device_fingerprint da sessão salva"""
        if self._session_data:
            return self._session_data.get("device_fingerprint")
        return None
    
    def verify_integrity(self, device_fingerprint: str) -> bool:
        """Verifica se a sessão é válida para este dispositivo"""
        if not self._session_data:
            return False
        
        # Verificar se o device_fingerprint bate
        saved_fp = self._session_data.get("device_fingerprint", "")
        if saved_fp and saved_fp != device_fingerprint:
            print("[Session] Device fingerprint não confere")
            return False
        
        # Verificar checksum
        expected_checksum = self._generate_checksum(
            self._session_data.get("user_id", ""),
            self._session_data.get("email", ""),
            saved_fp
        )
        
        if self._session_data.get("checksum") != expected_checksum:
            print("[Session] Checksum inválido")
            return False
        
        return True
    
    def _generate_checksum(self, user_id: str, email: str, device_fp: str) -> str:
        """Gera checksum para verificação de integridade"""
        data = f"{user_id}:{email}:{device_fp}:dlg_secret_salt"
        return hashlib.sha256(data.encode()).hexdigest()[:16]


# Instância global
session_manager = SessionManager()
