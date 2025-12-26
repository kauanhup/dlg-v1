import QtQuick 2.15
import QtQuick.Layouts 1.15
import ".."

Rectangle {
    id: root
    
    property int currentIndex: 0
    property var menuItems: [
        { label: "Dashboard", icon: "home", color: "#3b82f6" },
        { label: "Contas", icon: "users", color: "#10b981" },
        { label: "Ações", icon: "zap", color: "#f59e0b" },
        { label: "Configurações", icon: "settings", color: "#a855f7" }
    ]
    
    signal menuItemClicked(int index)
    signal logoutClicked()
    
    implicitWidth: 200
    color: Theme.card
    
    ColumnLayout {
        anchors.fill: parent
        spacing: 0
        
        // Logo Header
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 64
            color: "transparent"
            
            Rectangle {
                anchors.bottom: parent.bottom
                width: parent.width
                height: 1
                color: Qt.rgba(1, 1, 1, 0.06)
            }
            
            RowLayout {
                anchors.left: parent.left
                anchors.leftMargin: 14
                anchors.verticalCenter: parent.verticalCenter
                spacing: 10
                
                // Logo with white background
                Rectangle {
                    width: 36
                    height: 36
                    radius: 8
                    color: "white"
                    
                    Image {
                        anchors.centerIn: parent
                        source: "../assets/dlg-logo.png"
                        width: 22
                        height: 22
                        fillMode: Image.PreserveAspectFit
                    }
                }
                
                Text {
                    text: "DLG CONNECT"
                    font.pixelSize: 13
                    font.weight: Font.Bold
                    font.letterSpacing: 0.3
                    color: Theme.foreground
                }
            }
        }
        
        // Menu Label
        Text {
            Layout.leftMargin: 16
            Layout.topMargin: 16
            Layout.bottomMargin: 8
            text: "MENU"
            font.pixelSize: 10
            font.weight: Font.DemiBold
            font.letterSpacing: 1.2
            color: Qt.rgba(Theme.mutedForeground.r, Theme.mutedForeground.g, Theme.mutedForeground.b, 0.5)
        }
        
        // Navigation section
        ColumnLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            Layout.leftMargin: 10
            Layout.rightMargin: 10
            spacing: 4
            
            Repeater {
                model: root.menuItems
                
                Rectangle {
                    id: menuItem
                    Layout.fillWidth: true
                    Layout.preferredHeight: 42
                    radius: 8
                    
                    property bool isActive: index === root.currentIndex
                    property bool isHovered: mouseArea.containsMouse
                    property color itemColor: modelData.color
                    
                    color: isActive ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12) : 
                           (isHovered ? Qt.rgba(1, 1, 1, 0.04) : "transparent")
                    
                    Behavior on color { ColorAnimation { duration: 120; easing.type: Easing.OutCubic } }
                    
                    // Active indicator bar
                    Rectangle {
                        visible: menuItem.isActive
                        anchors.left: parent.left
                        anchors.verticalCenter: parent.verticalCenter
                        width: 3
                        height: 20
                        radius: 2
                        color: Theme.primary
                    }
                    
                    RowLayout {
                        anchors.left: parent.left
                        anchors.leftMargin: 12
                        anchors.right: parent.right
                        anchors.rightMargin: 12
                        anchors.verticalCenter: parent.verticalCenter
                        spacing: 10
                        
                        // Icon container
                        Rectangle {
                            width: 30
                            height: 30
                            radius: 6
                            color: menuItem.isActive ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.2) :
                                   Qt.rgba(1, 1, 1, 0.05)
                            
                            Behavior on color { ColorAnimation { duration: 120 } }
                            
                            Icon {
                                anchors.centerIn: parent
                                name: modelData.icon
                                size: 14
                                color: menuItem.isActive ? Theme.primary : menuItem.itemColor
                                
                                Behavior on color { ColorAnimation { duration: 120 } }
                            }
                        }
                        
                        Text {
                            Layout.fillWidth: true
                            text: modelData.label
                            font.pixelSize: 12
                            font.weight: menuItem.isActive ? Font.DemiBold : Font.Medium
                            color: menuItem.isActive ? Theme.primary : 
                                   (menuItem.isHovered ? Theme.foreground : Theme.mutedForeground)
                            
                            Behavior on color { ColorAnimation { duration: 120 } }
                        }
                        
                        // Active dot
                        Rectangle {
                            visible: menuItem.isActive
                            width: 5
                            height: 5
                            radius: 3
                            color: Theme.primary
                        }
                    }
                    
                    MouseArea {
                        id: mouseArea
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: {
                            root.currentIndex = index
                            root.menuItemClicked(index)
                        }
                    }
                }
            }
            
            Item { Layout.fillHeight: true }
        }
        
        // Footer / Logout
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 54
            color: "transparent"
            
            Rectangle {
                anchors.top: parent.top
                width: parent.width
                height: 1
                color: Qt.rgba(1, 1, 1, 0.06)
            }
            
            Rectangle {
                id: logoutBtn
                anchors.fill: parent
                anchors.margins: 10
                anchors.topMargin: 8
                radius: 8
                color: logoutMouse.containsMouse ? Qt.rgba(0.93, 0.27, 0.27, 0.12) : "transparent"
                
                Behavior on color { ColorAnimation { duration: 120; easing.type: Easing.OutCubic } }
                
                RowLayout {
                    anchors.left: parent.left
                    anchors.leftMargin: 12
                    anchors.verticalCenter: parent.verticalCenter
                    spacing: 10
                    
                    Rectangle {
                        width: 30
                        height: 30
                        radius: 6
                        color: Qt.rgba(1, 1, 1, 0.05)
                        
                        Icon {
                            anchors.centerIn: parent
                            name: "logOut"
                            size: 14
                            color: logoutMouse.containsMouse ? Theme.destructive : Theme.mutedForeground
                            
                            Behavior on color { ColorAnimation { duration: 120 } }
                        }
                    }
                    
                    Text {
                        text: "Sair"
                        font.pixelSize: 12
                        font.weight: Font.Medium
                        color: logoutMouse.containsMouse ? Theme.destructive : Theme.mutedForeground
                        
                        Behavior on color { ColorAnimation { duration: 120 } }
                    }
                }
                
                MouseArea {
                    id: logoutMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: root.logoutClicked()
                }
            }
        }
    }
}
