import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import ".."
import "../components"

Rectangle {
    id: root
    color: Theme.background
    
    signal loginSuccess()
    
    property bool showAnimation: false
    
    // Simple fade in
    opacity: 0
    Component.onCompleted: fadeIn.start()
    
    NumberAnimation {
        id: fadeIn
        target: root
        property: "opacity"
        from: 0; to: 1
        duration: 300
        easing.type: Easing.OutCubic
    }
    
    RowLayout {
        anchors.fill: parent
        spacing: 0
        
        // Left Panel - Branding
        Rectangle {
            Layout.preferredWidth: parent.width * 0.42
            Layout.fillHeight: true
            color: Theme.card
            
            // Right border
            Rectangle {
                anchors.right: parent.right
                width: 1
                height: parent.height
                color: Theme.border
            }
            
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 48
                spacing: 0
                
                // Hero title
                ColumnLayout {
                    spacing: 8
                    
                    Text {
                        text: "Automação"
                        font.pixelSize: 32
                        font.weight: Font.Bold
                        color: Theme.foreground
                    }
                    
                    Row {
                        spacing: 10
                        
                        Text {
                            text: "Profissional"
                            font.pixelSize: 32
                            font.weight: Font.Bold
                            color: Theme.foreground
                        }
                        
                        Text {
                            text: "para"
                            font.pixelSize: 32
                            font.weight: Font.Light
                            color: Theme.mutedForeground
                        }
                    }
                    
                    // Telegram badge
                    Rectangle {
                        Layout.topMargin: 4
                        width: telegramText.width + 24
                        height: telegramText.height + 12
                        radius: 8
                        color: Qt.rgba(0, 0.5, 1, 0.1)
                        border.width: 1
                        border.color: Qt.rgba(0, 0.5, 1, 0.3)
                        
                        Text {
                            id: telegramText
                            anchors.centerIn: parent
                            text: "Telegram"
                            font.pixelSize: 32
                            font.weight: Font.Bold
                            color: Theme.primary
                        }
                    }
                }
                
                Item { Layout.preferredHeight: 28 }
                
                // Description
                Text {
                    text: "Gerencie múltiplas contas, automatize ações\ne maximize seus resultados com segurança."
                    font.pixelSize: 15
                    color: Theme.mutedForeground
                    lineHeight: 1.6
                }
                
                Item { Layout.preferredHeight: 40 }
                
                // Features
                ColumnLayout {
                    spacing: 12
                    Layout.fillWidth: true
                    
                    Repeater {
                        model: [
                            { title: "Extração de membros", desc: "Extraia membros de grupos e canais", icon: "users", color: "#0080ff" },
                            { title: "Adicionar em grupos", desc: "Adicione membros automaticamente", icon: "userPlus", color: "#22c55e" },
                            { title: "Sistema anti-ban", desc: "Proteção inteligente contra bloqueios", icon: "shield", color: "#8b5cf6" }
                        ]
                        
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 68
                            color: featureMouse.containsMouse ? Qt.rgba(0.07, 0.09, 0.12, 1) : Theme.muted
                            border.width: 1
                            border.color: featureMouse.containsMouse ? Theme.borderHover : Theme.border
                            radius: 10
                            
                            Behavior on color { ColorAnimation { duration: 150 } }
                            Behavior on border.color { ColorAnimation { duration: 150 } }
                            
                            // Left accent
                            Rectangle {
                                anchors.left: parent.left
                                anchors.verticalCenter: parent.verticalCenter
                                width: 3
                                height: parent.height - 24
                                radius: 2
                                color: modelData.color
                            }
                            
                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 16
                                anchors.rightMargin: 16
                                spacing: 14
                                
                                // Icon
                                Rectangle {
                                    Layout.preferredWidth: 36
                                    Layout.preferredHeight: 36
                                    radius: 8
                                    color: Qt.rgba(
                                        parseInt(modelData.color.substr(1,2), 16)/255,
                                        parseInt(modelData.color.substr(3,2), 16)/255,
                                        parseInt(modelData.color.substr(5,2), 16)/255,
                                        0.15
                                    )
                                    
                                    Icon {
                                        anchors.centerIn: parent
                                        name: modelData.icon
                                        size: 18
                                        color: modelData.color
                                    }
                                }
                                
                                ColumnLayout {
                                    spacing: 2
                                    Layout.fillWidth: true
                                    
                                    Text {
                                        text: modelData.title
                                        font.pixelSize: 13
                                        font.weight: Font.DemiBold
                                        color: Theme.foreground
                                    }
                                    
                                    Text {
                                        text: modelData.desc
                                        font.pixelSize: 11
                                        color: Theme.mutedForeground
                                    }
                                }
                                
                                Icon {
                                    name: "check"
                                    size: 16
                                    color: Theme.accent
                                }
                            }
                            
                            MouseArea {
                                id: featureMouse
                                anchors.fill: parent
                                hoverEnabled: true
                            }
                        }
                    }
                }
                
                Item { Layout.fillHeight: true }
            }
        }
        
        // Right Panel - Login Form
        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: Theme.background
            
            // Form container
            Rectangle {
                id: formCard
                anchors.centerIn: parent
                width: Math.min(400, parent.width * 0.85)
                height: formColumn.height
                color: Theme.card
                border.width: 1
                border.color: Theme.border
                radius: 12
                
                ColumnLayout {
                    id: formColumn
                    width: parent.width
                    spacing: 0
                    
                    // Form content
                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.margins: 28
                        spacing: 24
                        
                        // Fields
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 18
                            
                            // Email field
                            ColumnLayout {
                                Layout.fillWidth: true
                                spacing: 8
                                
                                RowLayout {
                                    spacing: 4
                                    
                                    Text {
                                        text: "Email"
                                        font.pixelSize: 13
                                        font.weight: Font.Medium
                                        color: Theme.foreground
                                    }
                                    
                                    Text {
                                        text: "*"
                                        font.pixelSize: 13
                                        color: Theme.destructive
                                    }
                                }
                                
                                Rectangle {
                                    id: emailFieldBg
                                    Layout.fillWidth: true
                                    Layout.preferredHeight: 48
                                    color: emailFieldMouse.containsMouse || emailInput.activeFocus ? Qt.rgba(0.1, 0.12, 0.16, 1) : Theme.muted
                                    border.width: emailInput.activeFocus ? 2 : 1
                                    border.color: emailInput.activeFocus ? Theme.primary : 
                                                  emailFieldMouse.containsMouse ? Theme.borderHover : Theme.border
                                    radius: 8
                                    
                                    Behavior on color { ColorAnimation { duration: 150 } }
                                    Behavior on border.color { ColorAnimation { duration: 150 } }
                                    
                                    MouseArea {
                                        id: emailFieldMouse
                                        anchors.fill: parent
                                        hoverEnabled: true
                                        cursorShape: Qt.IBeamCursor
                                        onClicked: emailInput.forceActiveFocus()
                                    }
                                    
                                    RowLayout {
                                        anchors.fill: parent
                                        anchors.leftMargin: 14
                                        anchors.rightMargin: 14
                                        spacing: 12
                                        
                                        Icon {
                                            name: "mail"
                                            size: 18
                                            color: emailInput.activeFocus ? Theme.primary : Theme.mutedForeground
                                            
                                            Behavior on color { ColorAnimation { duration: 150 } }
                                        }
                                        
                                        TextInput {
                                            id: emailInput
                                            Layout.fillWidth: true
                                            font.pixelSize: 14
                                            color: Theme.foreground
                                            clip: true
                                            verticalAlignment: TextInput.AlignVCenter
                                            selectByMouse: true
                                            
                                            Text {
                                                visible: !emailInput.text && !emailInput.activeFocus
                                                text: "seu@email.com"
                                                font.pixelSize: 14
                                                color: Theme.subtleForeground
                                            }
                                        }
                                    }
                                }
                            }
                            
                            // Password field
                            ColumnLayout {
                                Layout.fillWidth: true
                                spacing: 8
                                
                                RowLayout {
                                    spacing: 4
                                    
                                    Text {
                                        text: "Senha"
                                        font.pixelSize: 13
                                        font.weight: Font.Medium
                                        color: Theme.foreground
                                    }
                                    
                                    Text {
                                        text: "*"
                                        font.pixelSize: 13
                                        color: Theme.destructive
                                    }
                                }
                                
                                Rectangle {
                                    id: passwordFieldBg
                                    Layout.fillWidth: true
                                    Layout.preferredHeight: 48
                                    color: passwordFieldMouse.containsMouse || passwordInput.activeFocus ? Qt.rgba(0.1, 0.12, 0.16, 1) : Theme.muted
                                    border.width: passwordInput.activeFocus ? 2 : 1
                                    border.color: passwordInput.activeFocus ? Theme.primary : 
                                                  passwordFieldMouse.containsMouse ? Theme.borderHover : Theme.border
                                    radius: 8
                                    
                                    Behavior on color { ColorAnimation { duration: 150 } }
                                    Behavior on border.color { ColorAnimation { duration: 150 } }
                                    
                                    MouseArea {
                                        id: passwordFieldMouse
                                        anchors.fill: parent
                                        hoverEnabled: true
                                        cursorShape: Qt.IBeamCursor
                                        onClicked: passwordInput.forceActiveFocus()
                                    }
                                    
                                    RowLayout {
                                        anchors.fill: parent
                                        anchors.leftMargin: 14
                                        anchors.rightMargin: 14
                                        spacing: 12
                                        
                                        Icon {
                                            name: "lock"
                                            size: 18
                                            color: passwordInput.activeFocus ? Theme.primary : Theme.mutedForeground
                                            
                                            Behavior on color { ColorAnimation { duration: 150 } }
                                        }
                                        
                                        TextInput {
                                            id: passwordInput
                                            Layout.fillWidth: true
                                            font.pixelSize: 14
                                            color: Theme.foreground
                                            clip: true
                                            echoMode: TextInput.Password
                                            verticalAlignment: TextInput.AlignVCenter
                                            selectByMouse: true
                                            
                                            Text {
                                                visible: !passwordInput.text && !passwordInput.activeFocus
                                                text: "••••••••"
                                                font.pixelSize: 14
                                                color: Theme.subtleForeground
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Login Button
                        Rectangle {
                            id: loginBtn
                            Layout.fillWidth: true
                            Layout.preferredHeight: 48
                            radius: 8
                            color: loginBtnMouse.pressed ? Qt.darker(Theme.primary, 1.1) : 
                                   loginBtnMouse.containsMouse ? Qt.lighter(Theme.primary, 1.1) : Theme.primary
                            
                            Behavior on color { ColorAnimation { duration: 150 } }
                            
                            RowLayout {
                                anchors.centerIn: parent
                                spacing: 10
                                
                                Icon {
                                    name: "logIn"
                                    size: 18
                                    color: "#ffffff"
                                }
                                
                                Text {
                                    text: "Entrar"
                                    font.pixelSize: 14
                                    font.weight: Font.DemiBold
                                    color: "#ffffff"
                                }
                            }
                            
                            MouseArea {
                                id: loginBtnMouse
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: root.showAnimation = true
                            }
                        }
                        
                        // Divider
                        RowLayout {
                            Layout.fillWidth: true
                            spacing: 16
                            
                            Rectangle {
                                Layout.fillWidth: true
                                height: 1
                                color: Theme.border
                            }
                            
                            Text {
                                text: "ou"
                                font.pixelSize: 12
                                color: Theme.mutedForeground
                            }
                            
                            Rectangle {
                                Layout.fillWidth: true
                                height: 1
                                color: Theme.border
                            }
                        }
                        
                        // Create account link
                        Text {
                            Layout.alignment: Qt.AlignHCenter
                            text: "Não tem uma conta? <a href='https://dlgconnect.com/login' style='color: " + Theme.primary + "; text-decoration: none;'>Criar conta</a>"
                            textFormat: Text.RichText
                            font.pixelSize: 13
                            color: Theme.mutedForeground
                            
                            onLinkActivated: function(link) {
                                Qt.openUrlExternally(link)
                            }
                            
                            MouseArea {
                                anchors.fill: parent
                                acceptedButtons: Qt.NoButton
                                cursorShape: parent.hoveredLink ? Qt.PointingHandCursor : Qt.ArrowCursor
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Telegram Animation Overlay
    Loader {
        id: animationLoader
        anchors.fill: parent
        active: root.showAnimation
        sourceComponent: TelegramAnimation {
            onAnimationComplete: {
                root.showAnimation = false
                root.loginSuccess()
            }
        }
    }
}
