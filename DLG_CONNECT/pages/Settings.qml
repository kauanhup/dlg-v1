import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import ".."
import "../components"

Rectangle {
    id: root
    color: Theme.background
    
    // Reusable SettingsToggle component
    component SettingsToggle: Rectangle {
        id: toggleItem
        property string title: ""
        property string desc: ""
        property bool checked: false
        
        Layout.fillWidth: true
        Layout.preferredHeight: 44
        color: toggleMouse.containsMouse ? Qt.rgba(1, 1, 1, 0.04) : Qt.rgba(1, 1, 1, 0.02)
        radius: 4
        
        Behavior on color { ColorAnimation { duration: 100 } }
        
        MouseArea {
            id: toggleMouse
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: toggleSwitch.checked = !toggleSwitch.checked
        }
        
        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 10
            anchors.rightMargin: 10
            
            ColumnLayout {
                spacing: 2
                
                Text { 
                    text: toggleItem.title
                    font.pixelSize: 12
                    color: Theme.foreground 
                }
                Text { 
                    text: toggleItem.desc
                    font.pixelSize: 9
                    color: Theme.mutedForeground 
                }
            }
            
            Item { Layout.fillWidth: true }
            
            // Custom Switch
            Rectangle {
                id: toggleSwitch
                property bool checked: toggleItem.checked
                
                width: 36
                height: 20
                radius: 10
                color: checked ? Theme.primary : Qt.rgba(1, 1, 1, 0.1)
                
                Behavior on color { ColorAnimation { duration: 150 } }
                
                Rectangle {
                    width: 16
                    height: 16
                    radius: 8
                    x: parent.checked ? parent.width - width - 2 : 2
                    anchors.verticalCenter: parent.verticalCenter
                    color: "white"
                    
                    Behavior on x { NumberAnimation { duration: 150; easing.type: Easing.OutQuad } }
                }
            }
        }
    }
    
    // Reusable Panel Header
    component PanelHeader: Rectangle {
        property string title: ""
        property color iconColor: Theme.primary
        property string iconName: ""
        
        Layout.fillWidth: true
        Layout.preferredHeight: 34
        color: Qt.rgba(1, 1, 1, 0.02)
        radius: 6
        
        Rectangle {
            anchors.bottom: parent.bottom
            anchors.left: parent.left
            anchors.right: parent.right
            height: 6
            color: parent.color
        }
        
        Rectangle {
            anchors.bottom: parent.bottom
            width: parent.width
            height: 1
            color: Qt.rgba(1, 1, 1, 0.05)
        }
        
        RowLayout {
            anchors.left: parent.left
            anchors.leftMargin: 12
            anchors.verticalCenter: parent.verticalCenter
            spacing: 8
            
            Icon {
                name: iconName
                size: 14
                color: iconColor
            }
            
            Text {
                text: title
                font.pixelSize: 12
                font.weight: Font.Medium
                color: Theme.foreground
            }
        }
    }
    
    ScrollView {
        anchors.fill: parent
        anchors.margins: 16
        contentWidth: availableWidth
        clip: true
        
        ColumnLayout {
            width: parent.width
            spacing: 12
            
            // Header
            Text {
                text: "Configurações"
                font.pixelSize: 18
                font.weight: Font.DemiBold
                color: Theme.foreground
            }
            
            // Settings - 2 column layout
            RowLayout {
                Layout.fillWidth: true
                spacing: 12
                
                // Left Column
                ColumnLayout {
                    Layout.fillWidth: true
                    Layout.alignment: Qt.AlignTop
                    spacing: 12
                    
                    // ===== API Credentials =====
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: apiCol.height
                        color: Theme.card
                        radius: 6
                        
                        ColumnLayout {
                            id: apiCol
                            width: parent.width
                            spacing: 0
                            
                            PanelHeader {
                                title: "Credenciais API"
                                iconName: "lock"
                                iconColor: Theme.primary
                            }
                            
                            ColumnLayout {
                                Layout.fillWidth: true
                                Layout.margins: 12
                                spacing: 12
                                
                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 4
                                    
                                    Text { text: "API ID do Telegram"; font.pixelSize: 10; color: Theme.mutedForeground }
                                    AppInput { Layout.fillWidth: true; placeholderText: "123456" }
                                }
                                
                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 4
                                    
                                    Text { text: "API Hash"; font.pixelSize: 10; color: Theme.mutedForeground }
                                    AppInput { Layout.fillWidth: true; placeholderText: "••••••••"; echoMode: TextInput.Password }
                                }
                                
                                Text {
                                    text: "Obtenha em my.telegram.org"
                                    font.pixelSize: 9
                                    color: Theme.mutedForeground
                                }
                            }
                        }
                    }
                    
                    // ===== Filtros de Membros =====
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: filterCol.height
                        color: Theme.card
                        radius: 6
                        
                        ColumnLayout {
                            id: filterCol
                            width: parent.width
                            spacing: 0
                            
                            PanelHeader {
                                title: "Filtros de Membros"
                                iconName: "users"
                                iconColor: Theme.primary
                            }
                            
                            ColumnLayout {
                                Layout.fillWidth: true
                                Layout.margins: 10
                                spacing: 6
                                
                                SettingsToggle { title: "Apenas com Foto"; desc: "Usuários com avatar"; checked: false }
                                SettingsToggle { title: "Apenas Ativos"; desc: "Online recentemente"; checked: false }
                                SettingsToggle { title: "Verificar Duplicados"; desc: "Evitar repetidos"; checked: true }
                            }
                        }
                    }
                }
                
                // Right Column
                ColumnLayout {
                    Layout.fillWidth: true
                    Layout.alignment: Qt.AlignTop
                    spacing: 12
                    
                    // ===== Segurança =====
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: secCol.height
                        color: Theme.card
                        radius: 6
                        
                        ColumnLayout {
                            id: secCol
                            width: parent.width
                            spacing: 0
                            
                            PanelHeader {
                                title: "Segurança"
                                iconName: "shield"
                                iconColor: "#f59e0b"
                            }
                            
                            ColumnLayout {
                                Layout.fillWidth: true
                                Layout.margins: 10
                                spacing: 6
                                
                                SettingsToggle { title: "Anti-Ban Mode"; desc: "Delays aleatórios extras"; checked: true }
                                SettingsToggle { title: "Simular Digitação"; desc: "Parecer mais humano"; checked: true }
                                SettingsToggle { title: "Proxy Rotativo"; desc: "Alternar IPs"; checked: false }
                            }
                        }
                    }
                    
                    // ===== Configurações de Ações =====
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: actionsCol.height
                        color: Theme.card
                        radius: 6
                        
                        ColumnLayout {
                            id: actionsCol
                            width: parent.width
                            spacing: 0
                            
                            PanelHeader {
                                title: "Configurações de Ações"
                                iconName: "settings"
                                iconColor: Theme.primary
                            }
                            
                            ColumnLayout {
                                Layout.fillWidth: true
                                Layout.margins: 12
                                spacing: 12
                                
                                // Input fields row
                                RowLayout {
                                    Layout.fillWidth: true
                                    spacing: 16
                                    
                                    ColumnLayout {
                                        Layout.fillWidth: true
                                        spacing: 4
                                        
                                        Text { text: "Delay (segundos)"; font.pixelSize: 10; color: Theme.mutedForeground }
                                        AppInput { Layout.fillWidth: true; placeholderText: "30"; text: "30" }
                                        Text { text: "Recomendado: 25-40s"; font.pixelSize: 9; color: Theme.mutedForeground }
                                    }
                                    
                                    ColumnLayout {
                                        Layout.fillWidth: true
                                        spacing: 4
                                        
                                        Text { text: "Limite de Adições"; font.pixelSize: 10; color: Theme.mutedForeground }
                                        AppInput { Layout.fillWidth: true; placeholderText: "50"; text: "50" }
                                        Text { text: "Máximo: 50/conta"; font.pixelSize: 9; color: Theme.mutedForeground }
                                    }
                                }
                                
                                // Divider
                                Rectangle {
                                    Layout.fillWidth: true
                                    Layout.preferredHeight: 1
                                    color: Qt.rgba(1, 1, 1, 0.05)
                                }
                                
                                // Toggle
                                SettingsToggle { 
                                    title: "Pular Duplicatas"
                                    desc: "Evita membros já adicionados"
                                    checked: true 
                                }
                            }
                        }
                    }
                }
            }
            
            // Save Button
            Rectangle {
                Layout.preferredWidth: saveRow.width + 24
                Layout.preferredHeight: 36
                color: saveMouse.containsMouse ? Qt.lighter(Theme.primary, 1.1) : Theme.primary
                radius: 6
                
                Behavior on color { ColorAnimation { duration: 100 } }
                
                scale: saveMouse.pressed ? 0.97 : 1.0
                Behavior on scale { NumberAnimation { duration: 80 } }
                
                MouseArea {
                    id: saveMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                }
                
                RowLayout {
                    id: saveRow
                    anchors.centerIn: parent
                    spacing: 6
                    
                    Icon {
                        name: "check"
                        size: 14
                        color: Theme.primaryForeground
                    }
                    
                    Text {
                        text: "Salvar Configurações"
                        font.pixelSize: 12
                        font.weight: Font.Medium
                        color: Theme.primaryForeground
                    }
                }
            }
            
            // ===== Tutoriais Section =====
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: tutorialsCol.height
                color: Theme.card
                radius: 6
                
                ColumnLayout {
                    id: tutorialsCol
                    width: parent.width
                    spacing: 0
                    
                    PanelHeader {
                        title: "Tutoriais"
                        iconName: "play"
                        iconColor: "#ef4444"
                    }
                    
                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.margins: 12
                        spacing: 8
                        
                        // Tutorial Button Component
                        component TutorialButton: Rectangle {
                            property string label: ""
                            property string btnIcon: "play"
                            property string url: ""
                            
                            Layout.fillWidth: true
                            Layout.preferredHeight: 40
                            color: tutBtnMouse.containsMouse ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(1, 1, 1, 0.02)
                            radius: 6
                            border.width: 1
                            border.color: Qt.rgba(1, 1, 1, 0.1)
                            
                            Behavior on color { ColorAnimation { duration: 100 } }
                            
                            scale: tutBtnMouse.pressed ? 0.97 : 1.0
                            Behavior on scale { NumberAnimation { duration: 80 } }
                            
                            MouseArea {
                                id: tutBtnMouse
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: Qt.openUrlExternally(url)
                            }
                            
                            RowLayout {
                                anchors.centerIn: parent
                                spacing: 6
                                
                                Icon {
                                    name: btnIcon
                                    size: 14
                                    color: Theme.foreground
                                }
                                
                                Text {
                                    text: label
                                    font.pixelSize: 11
                                    font.weight: Font.Medium
                                    color: Theme.foreground
                                }
                            }
                        }
                        
                        // Row 1
                        RowLayout {
                            Layout.fillWidth: true
                            spacing: 8
                            
                            TutorialButton { label: "Como Começar"; btnIcon: "play"; url: "https://youtube.com" }
                            TutorialButton { label: "Configurar API"; btnIcon: "lock"; url: "https://youtube.com" }
                            TutorialButton { label: "Adicionar Membros"; btnIcon: "users"; url: "https://youtube.com" }
                        }
                        
                        // Row 2
                        RowLayout {
                            Layout.fillWidth: true
                            spacing: 8
                            
                            TutorialButton { label: "Múltiplas Contas"; btnIcon: "layers"; url: "https://youtube.com" }
                            TutorialButton { label: "Anti-Ban Tips"; btnIcon: "shield"; url: "https://youtube.com" }
                            TutorialButton { label: "Automação"; btnIcon: "settings"; url: "https://youtube.com" }
                        }
                    }
                }
            }
            
            Item { Layout.preferredHeight: 20 }
        }
    }
}
