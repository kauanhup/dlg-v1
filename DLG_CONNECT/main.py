#!/usr/bin/env python3
"""
DLG Connect - QML Application
Teste com: python public/qml/main.py (da raiz) OU python main.py (de public/qml/)
Requisitos: pip install PySide6
"""

import sys
import os
from pathlib import Path

from PySide6.QtWidgets import QApplication
from PySide6.QtQml import QQmlApplicationEngine
from PySide6.QtCore import QUrl
from PySide6.QtGui import QIcon


def main():
    # Configurar aplicação
    app = QApplication(sys.argv)
    app.setApplicationName("DLG Connect")
    app.setApplicationVersion("2.0.1")
    app.setOrganizationName("DLG")
    
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
    
    # Executar aplicação
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
