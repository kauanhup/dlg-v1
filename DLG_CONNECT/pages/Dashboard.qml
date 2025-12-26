import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import ".."
import "../components"

Rectangle {
    id: root
    color: Theme.background
    
    signal navigateToActions(int tabIndex)
    
    property var user: ({
        name: "Kauan",
        plan: "Pro",
        expiresAt: "2025-01-15",
        daysRemaining: 22,
        totalDays: 30
    })
    
    property real progressPercentage: (user.daysRemaining / user.totalDays) * 100
    
    property var accounts: [
        { phone: "+55 11 98765-4321", flood: "Ativa", floodColor: "#22c55e" },
        { phone: "+55 21 91234-5678", flood: "Ativa", floodColor: "#22c55e" },
        { phone: "+55 11 95555-4444", flood: "Float 2d", floodColor: "#0080ff" },
        { phone: "+55 19 97777-8888", flood: "Ativa", floodColor: "#22c55e" },
        { phone: "+55 48 92222-3333", flood: "7 dias", floodColor: "#f59e0b" },
        { phone: "+55 85 96666-1111", flood: "Banida", floodColor: "#ef4444" }
    ]
    
    property var quickActions: [
        { label: "Adicionar", icon: "userPlus", tabIndex: 0 },
        { label: "Add Chat", icon: "messageSquare", tabIndex: 1 },
        { label: "Entrar", icon: "logIn", tabIndex: 4 }
    ]
    
    ScrollView {
        anchors.fill: parent
        anchors.margins: 16
        contentWidth: availableWidth
        clip: true
        
        ColumnLayout {
            width: parent.width
            spacing: 12
            
            // Welcome Header
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 56
                color: Theme.card
                radius: 6
                
                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 14
                    anchors.rightMargin: 14
                    spacing: 12
                    
                    Rectangle {
                        Layout.preferredWidth: 36
                        Layout.preferredHeight: 36
                        radius: 18
                        color: Theme.primary
                        
                        Text {
                            anchors.centerIn: parent
                            text: user.name.charAt(0).toUpperCase()
                            font.pixelSize: 14
                            font.weight: Font.Bold
                            color: Theme.primaryForeground
                        }
                    }
                    
                    Text {
                        text: "Bem-vindo, " + user.name + "!"
                        font.pixelSize: 16
                        font.weight: Font.DemiBold
                        color: Theme.foreground
                    }
                    
                    Item { Layout.fillWidth: true }
                }
            }
            
            // Plan Status
            Rectangle {
                Layout.fillWidth: true
                color: Theme.card
                radius: 6
                implicitHeight: planCol.height
                
                ColumnLayout {
                    id: planCol
                    width: parent.width
                    spacing: 0
                    
                    Rectangle {
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
                                name: "shield"
                                size: 13
                                color: Theme.primary
                            }
                            
                            Text {
                                text: "Plano Atual"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                                color: Theme.foreground
                            }
                        }
                    }
                    
                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.margins: 12
                        spacing: 10
                        
                        RowLayout {
                            Layout.fillWidth: true
                            
                            RowLayout {
                                spacing: 8
                                
                                Text {
                                    text: "Plano " + user.plan
                                    font.pixelSize: 14
                                    font.weight: Font.Bold
                                    color: Theme.foreground
                                }
                                
                                Rectangle {
                                    width: activeText.width + 12
                                    height: 20
                                    radius: 4
                                    color: Qt.rgba(0.13, 0.77, 0.37, 0.15)
                                    
                                    Text {
                                        id: activeText
                                        anchors.centerIn: parent
                                        text: "Ativo"
                                        font.pixelSize: 10
                                        font.weight: Font.Medium
                                        color: "#22c55e"
                                    }
                                }
                            }
                            
                            Item { Layout.fillWidth: true }
                            
                            RowLayout {
                                spacing: 5
                                
                                Icon {
                                    name: "calendar"
                                    size: 12
                                    color: Theme.mutedForeground
                                }
                                
                                Text {
                                    text: "Expira em " + user.expiresAt
                                    font.pixelSize: 11
                                    color: Theme.mutedForeground
                                }
                            }
                        }
                        
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 5
                            
                            RowLayout {
                                Layout.fillWidth: true
                                
                                Text {
                                    text: "Tempo restante"
                                    font.pixelSize: 11
                                    color: Theme.mutedForeground
                                }
                                
                                Item { Layout.fillWidth: true }
                                
                                Text {
                                    text: user.daysRemaining + " dias restantes"
                                    font.pixelSize: 11
                                    font.weight: Font.Medium
                                    color: Theme.foreground
                                }
                            }
                            
                            Rectangle {
                                Layout.fillWidth: true
                                Layout.preferredHeight: 5
                                color: Qt.rgba(1, 1, 1, 0.06)
                                radius: 2
                                
                                Rectangle {
                                    width: parent.width * (progressPercentage / 100)
                                    height: parent.height
                                    radius: parent.radius
                                    color: Theme.primary
                                }
                            }
                        }
                    }
                }
            }
            
            // External Links Section
            Rectangle {
                Layout.fillWidth: true
                color: Theme.card
                radius: 6
                implicitHeight: linksCol.height
                
                ColumnLayout {
                    id: linksCol
                    width: parent.width
                    spacing: 0
                    
                    Rectangle {
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
                                name: "externalLink"
                                size: 13
                                color: Theme.primary
                            }
                            
                            Text {
                                text: "Links Externos"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                                color: Theme.foreground
                            }
                        }
                    }
                    
                    RowLayout {
                        Layout.fillWidth: true
                        Layout.margins: 12
                        spacing: 12
                        
                        // Ver Upgrade Button
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 44
                            color: upgradeMouseArea.containsMouse ? Qt.rgba(0.13, 0.77, 0.37, 0.15) : Qt.rgba(0.13, 0.77, 0.37, 0.1)
                            radius: 6
                            border.width: 1
                            border.color: Qt.rgba(0.13, 0.77, 0.37, 0.3)
                            
                            Behavior on color { ColorAnimation { duration: 150 } }
                            
                            MouseArea {
                                id: upgradeMouseArea
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: Qt.openUrlExternally("https://dlgconnect.com/comprar")
                            }
                            
                            RowLayout {
                                anchors.centerIn: parent
                                spacing: 8
                                
                                Icon {
                                    name: "zap"
                                    size: 16
                                    color: "#22c55e"
                                }
                                
                                Text {
                                    text: "Ver Upgrade"
                                    font.pixelSize: 13
                                    font.weight: Font.DemiBold
                                    color: "#22c55e"
                                }
                            }
                        }
                        
                        // Ir para Dashboard Button
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 44
                            color: dashMouseArea.containsMouse ? Qt.rgba(0, 0.5, 1, 0.15) : Qt.rgba(0, 0.5, 1, 0.1)
                            radius: 6
                            border.width: 1
                            border.color: Qt.rgba(0, 0.5, 1, 0.3)
                            
                            Behavior on color { ColorAnimation { duration: 150 } }
                            
                            MouseArea {
                                id: dashMouseArea
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: Qt.openUrlExternally("https://dlgconnect.com/dashboard")
                            }
                            
                            RowLayout {
                                anchors.centerIn: parent
                                spacing: 8
                                
                                Icon {
                                    name: "externalLink"
                                    size: 16
                                    color: Theme.primary
                                }
                                
                                Text {
                                    text: "Ir para Dashboard"
                                    font.pixelSize: 13
                                    font.weight: Font.DemiBold
                                    color: Theme.primary
                                }
                            }
                        }
                    }
                }
            }
            
            // Quick Actions
            Rectangle {
                Layout.fillWidth: true
                color: Theme.card
                radius: 6
                implicitHeight: actionsCol.height
                
                ColumnLayout {
                    id: actionsCol
                    width: parent.width
                    spacing: 0
                    
                    Rectangle {
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
                                name: "zap"
                                size: 13
                                color: Theme.accent
                            }
                            
                            Text {
                                text: "Ações Rápidas"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                                color: Theme.foreground
                            }
                        }
                    }
                    
                    RowLayout {
                        Layout.fillWidth: true
                        Layout.margins: 12
                        spacing: 10
                        
                        Repeater {
                            model: quickActions
                            
                            Rectangle {
                                Layout.fillWidth: true
                                Layout.preferredHeight: 56
                                color: actionMouse.containsMouse ? Qt.rgba(0, 0.5, 1, 0.08) : Qt.rgba(1, 1, 1, 0.02)
                                radius: 6
                                border.width: 1
                                border.color: actionMouse.containsMouse ? Qt.rgba(0, 0.5, 1, 0.3) : Qt.rgba(1, 1, 1, 0.05)
                                
                                Behavior on color { ColorAnimation { duration: 100 } }
                                Behavior on border.color { ColorAnimation { duration: 100 } }
                                
                                scale: actionMouse.pressed ? 0.97 : 1.0
                                Behavior on scale { NumberAnimation { duration: 80 } }
                                
                                ColumnLayout {
                                    anchors.centerIn: parent
                                    spacing: 6
                                    
                                    Icon {
                                        Layout.alignment: Qt.AlignHCenter
                                        name: modelData.icon
                                        size: 20
                                        color: Theme.primary
                                    }
                                    
                                    Text {
                                        Layout.alignment: Qt.AlignHCenter
                                        text: modelData.label
                                        font.pixelSize: 12
                                        font.weight: Font.Medium
                                        color: actionMouse.containsMouse ? Theme.foreground : Theme.mutedForeground
                                        
                                        Behavior on color { ColorAnimation { duration: 100 } }
                                    }
                                }
                                
                                MouseArea {
                                    id: actionMouse
                                    anchors.fill: parent
                                    hoverEnabled: true
                                    cursorShape: Qt.PointingHandCursor
                                    onClicked: root.navigateToActions(modelData.tabIndex)
                                }
                            }
                        }
                    }
                }
            }
            
            // Accounts Section
            Rectangle {
                Layout.fillWidth: true
                color: Theme.card
                radius: 6
                implicitHeight: accountsCol.height
                
                ColumnLayout {
                    id: accountsCol
                    width: parent.width
                    spacing: 0
                    
                    Rectangle {
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
                                name: "users"
                                size: 13
                                color: Theme.primary
                            }
                            
                            Text {
                                text: "Contas"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                                color: Theme.foreground
                            }
                            
                            Rectangle {
                                width: countText.width + 10
                                height: 18
                                radius: 9
                                color: Qt.rgba(0, 0.5, 1, 0.15)
                                
                                Text {
                                    id: countText
                                    anchors.centerIn: parent
                                    text: accounts.length
                                    font.pixelSize: 10
                                    font.weight: Font.Medium
                                    color: Theme.primary
                                }
                            }
                        }
                    }
                    
                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.margins: 10
                        spacing: 6
                        
                        Repeater {
                            model: accounts
                            
                            Rectangle {
                                Layout.fillWidth: true
                                Layout.preferredHeight: 40
                                color: accMouse.containsMouse ? Qt.rgba(1, 1, 1, 0.03) : "transparent"
                                radius: 4
                                
                                Behavior on color { ColorAnimation { duration: 100 } }
                                
                                RowLayout {
                                    anchors.fill: parent
                                    anchors.leftMargin: 10
                                    anchors.rightMargin: 10
                                    spacing: 10
                                    
                                    Rectangle {
                                        Layout.preferredWidth: 28
                                        Layout.preferredHeight: 28
                                        radius: 14
                                        color: Qt.rgba(0, 0.5, 1, 0.1)
                                        
                                        Icon {
                                            anchors.centerIn: parent
                                            name: "users"
                                            size: 14
                                            color: Theme.primary
                                        }
                                    }
                                    
                                    Text {
                                        Layout.fillWidth: true
                                        text: modelData.phone
                                        font.pixelSize: 12
                                        color: Theme.foreground
                                        elide: Text.ElideRight
                                    }
                                    
                                    Rectangle {
                                        width: floodText.width + 14
                                        height: 22
                                        radius: 4
                                        color: Qt.rgba(
                                            parseInt(modelData.floodColor.substr(1, 2), 16) / 255,
                                            parseInt(modelData.floodColor.substr(3, 2), 16) / 255,
                                            parseInt(modelData.floodColor.substr(5, 2), 16) / 255,
                                            0.15
                                        )
                                        
                                        Text {
                                            id: floodText
                                            anchors.centerIn: parent
                                            text: modelData.flood
                                            font.pixelSize: 10
                                            font.weight: Font.Medium
                                            color: modelData.floodColor
                                        }
                                    }
                                }
                                
                                MouseArea {
                                    id: accMouse
                                    anchors.fill: parent
                                    hoverEnabled: true
                                    cursorShape: Qt.PointingHandCursor
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
