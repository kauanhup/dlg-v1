#!/usr/bin/env python3
"""
DLG Connect - QML Application
Teste com: python DLG_CONNECT/main.py
Requisitos: pip install PySide6 supabase
"""

import sys
import os
from pathlib import Path

from PySide6.QtWidgets import QApplication
from PySide6.QtQml import QQmlApplicationEngine, qmlRegisterType
from PySide6.QtCore import QUrl
from PySide6.QtGui import QIcon

# Adiciona o diretório atual ao path para imports
sys.path.insert(0, str(Path(__file__).parent))

# Importa a bridge
from api.bridge import Backend


def main():
    # Configurar aplicação
    app = QApplication(sys.argv)
    app.setApplicationName("DLG Connect")
    app.setApplicationVersion("2.0.1")
    app.setOrganizationName("DLG")
    
    # Registrar o Backend para uso no QML
    qmlRegisterType(Backend, "DLGConnect", 1, 0, "Backend")
    
    # Criar engine QML
    engine = QQmlApplicationEngine()
    
    # Caminho do arquivo QML principal (relativo ao script)
    script_dir = Path(__file__).parent.resolve()
    qml_file = script_dir / "main.qml"
    
    # Adicionar o diretório do script ao import path do QML
    engine.addImportPath(str(script_dir))
    engine.addImportPath(str(script_dir / "pages"))
    engine.addImportPath(str(script_dir / "components"))
    
    if not qml_file.exists():
        print(f"Erro: Arquivo QML não encontrado: {qml_file}")
        sys.exit(1)
    
    print(f"Carregando QML de: {qml_file}")
    
    # Carregar QML
    engine.load(QUrl.fromLocalFile(str(qml_file)))
    
    # Verificar se carregou corretamente
    if not engine.rootObjects():
        print("Erro: Falha ao carregar QML")
        sys.exit(1)
    
    print("✓ DLG Connect iniciado com sucesso!")
    print("✓ Backend conectado ao Lovable Cloud")
    
    # Executar aplicação
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
