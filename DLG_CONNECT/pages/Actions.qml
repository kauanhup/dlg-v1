import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import ".."
import "../components"

Rectangle {
    id: root
    color: Theme.background
    
    property bool isRunning: false
    property int progress: 45
    property int processedCount: 4
    property int totalCount: 8
    property string currentAccount: "+55 11 98765-4321"
    property int activeTab: 0
    
    property var sessions: ({ ativas: 8, bloqueadas: 2, banidas: 1 })
    
    property var actionTypes: [
        { id: "add", label: "Adicionar", icon: "userPlus", color: "#3b82f6" },
        { id: "addchat", label: "Add Chat", icon: "messageSquare", color: "#22c55e" },
        { id: "message", label: "DM", icon: "send", color: "#60a5fa" },
        { id: "msggroup", label: "MSG Grupo", icon: "users", color: "#a855f7" },
        { id: "enter", label: "Entrar", icon: "logIn", color: "#22c55e" },
        { id: "leave", label: "Sair", icon: "logOut", color: "#ef4444" }
    ]
    
    property var logs: [
        { type: "success", message: "Sessões ativas: 8", time: "10:30:15" },
        { type: "warning", message: "Sessões bloqueadas: 2", time: "10:30:16" },
        { type: "error", message: "Sessões banidas: 1", time: "10:30:17" },
        { type: "info", message: "Usando 3 contas para a operação", time: "10:30:18" },
        { type: "success", message: "João Silva (@joao_s) adicionado", time: "10:31:05" }
    ]
    
    function getLogColor(type) {
        switch (type) {
            case "success": return "#22c55e"
            case "error": return "#ef4444"
            case "warning": return "#f59e0b"
            default: return Theme.primary
        }
    }
    
    ScrollView {
        anchors.fill: parent
        contentWidth: availableWidth
        clip: true
        
        Flickable {
            contentHeight: mainColumn.height + 32
            
            ColumnLayout {
                id: mainColumn
                width: parent.width
                spacing: 16
                
                // Header
                Rectangle {
                    Layout.fillWidth: true
                    Layout.leftMargin: 16
                    Layout.rightMargin: 16
                    Layout.topMargin: 16
                    Layout.preferredHeight: 50
                    color: "transparent"
                    
                    Text {
                        anchors.left: parent.left
                        anchors.verticalCenter: parent.verticalCenter
                        text: "Central de Ações"
                        font.pixelSize: 20
                        font.weight: Font.DemiBold
                        color: Theme.foreground
                    }
                    
                    Rectangle {
                        anchors.right: parent.right
                        anchors.verticalCenter: parent.verticalCenter
                        width: btnContent.width + 24
                        height: 40
                        radius: 8
                        color: isRunning ? "#ef4444" : Theme.primary
                        
                        Behavior on color { ColorAnimation { duration: 150 } }
                        
                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: isRunning = !isRunning
                        }
                        
                        Row {
                            id: btnContent
                            anchors.centerIn: parent
                            spacing: 8
                            
                            Icon {
                                anchors.verticalCenter: parent.verticalCenter
                                name: isRunning ? "pause" : "play"
                                size: 16
                                color: "white"
                            }
                            
                            Text {
                                anchors.verticalCenter: parent.verticalCenter
                                text: isRunning ? "Pausar" : "Executar"
                                font.pixelSize: 13
                                font.weight: Font.Medium
                                color: "white"
                            }
                        }
                    }
                }
                
                // Main Content - Responsive Layout
                Item {
                    Layout.fillWidth: true
                    Layout.leftMargin: 16
                    Layout.rightMargin: 16
                    Layout.preferredHeight: root.width > 800 ? Math.max(leftCol.height, rightCol.height) : (leftCol.height + rightCol.height + 12)
                    
                    property bool isWide: root.width > 800
                    
                    // Left Column
                    ColumnLayout {
                        id: leftCol
                        width: parent.isWide ? parent.width * 0.58 : parent.width
                        anchors.left: parent.left
                        spacing: 12
                        
                        // Action Tabs
                        Rectangle {
                            Layout.fillWidth: true
                            height: 70
                            color: Theme.card
                            radius: 8
                            
                            Row {
                                anchors.fill: parent
                                anchors.margins: 8
                                spacing: 6
                                
                                Repeater {
                                    model: actionTypes
                                    
                                    Rectangle {
                                        width: (parent.width - 30) / 6
                                        height: parent.height
                                        radius: 6
                                        
                                        property bool isActive: activeTab === index
                                        property color tabColor: modelData.color
                                        
                                        color: isActive ? Qt.rgba(Qt.color(tabColor).r, Qt.color(tabColor).g, Qt.color(tabColor).b, 0.15) : 
                                               (tabMouse.containsMouse ? Qt.rgba(1, 1, 1, 0.04) : "transparent")
                                        border.width: isActive ? 1 : 0
                                        border.color: Qt.rgba(Qt.color(tabColor).r, Qt.color(tabColor).g, Qt.color(tabColor).b, 0.4)
                                        
                                        MouseArea {
                                            id: tabMouse
                                            anchors.fill: parent
                                            cursorShape: Qt.PointingHandCursor
                                            hoverEnabled: true
                                            onClicked: activeTab = index
                                        }
                                        
                                        Column {
                                            anchors.centerIn: parent
                                            spacing: 6
                                            
                                            Icon {
                                                anchors.horizontalCenter: parent.horizontalCenter
                                                name: modelData.icon
                                                size: 18
                                                color: modelData.color
                                            }
                                            
                                            Text {
                                                anchors.horizontalCenter: parent.horizontalCenter
                                                text: modelData.label
                                                font.pixelSize: 10
                                                font.weight: Font.Medium
                                                color: parent.parent.isActive ? Theme.foreground : Theme.mutedForeground
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Form Panel
                        Rectangle {
                            Layout.fillWidth: true
                            color: Theme.card
                            radius: 8
                            implicitHeight: formContent.height + 16
                            
                            Column {
                                id: formContent
                                width: parent.width
                                spacing: 0
                                
                                // Header
                                Rectangle {
                                    width: parent.width
                                    height: 40
                                    color: Qt.rgba(1, 1, 1, 0.02)
                                    radius: 8
                                    
                                    Rectangle {
                                        anchors.bottom: parent.bottom
                                        width: parent.width
                                        height: 8
                                        color: parent.color
                                    }
                                    
                                    Row {
                                        anchors.left: parent.left
                                        anchors.leftMargin: 14
                                        anchors.verticalCenter: parent.verticalCenter
                                        spacing: 8
                                        
                                        Icon {
                                            anchors.verticalCenter: parent.verticalCenter
                                            name: actionTypes[activeTab].icon
                                            size: 14
                                            color: actionTypes[activeTab].color
                                        }
                                        
                                        Text {
                                            anchors.verticalCenter: parent.verticalCenter
                                            text: activeTab === 0 ? "Adicionar Membros" : 
                                                   activeTab === 1 ? "Add Chat" :
                                                   activeTab === 2 ? "Mensagem Direta" :
                                                   activeTab === 3 ? "Mensagem em Grupo" :
                                                   activeTab === 4 ? "Entrar em Grupo" : "Sair de Grupo"
                                            font.pixelSize: 12
                                            font.weight: Font.Medium
                                            color: Theme.foreground
                                        }
                                    }
                                }
                                
                                // Form fields
                                Column {
                                    width: parent.width - 28
                                    x: 14
                                    topPadding: 14
                                    bottomPadding: 14
                                    spacing: 14
                                    
                                    // Row 1 - Source/Target
                                    Row {
                                        width: parent.width
                                        spacing: 12
                                        
                                        Column {
                                            width: activeTab <= 1 ? (parent.width - 12) / 2 : parent.width
                                            spacing: 4
                                            
                                            Text { 
                                                text: activeTab <= 1 ? "Grupo Origem" : "Grupo/Chat"
                                                font.pixelSize: 11
                                                color: Theme.mutedForeground 
                                            }
                                            AppInput { 
                                                width: parent.width
                                                placeholderText: "@grupo_origem" 
                                            }
                                        }
                                        
                                        Column {
                                            visible: activeTab <= 1
                                            width: (parent.width - 12) / 2
                                            spacing: 4
                                            
                                            Text { 
                                                text: "Grupo Destino"
                                                font.pixelSize: 11
                                                color: Theme.mutedForeground 
                                            }
                                            AppInput { 
                                                width: parent.width
                                                placeholderText: "@grupo_destino" 
                                            }
                                        }
                                    }
                                    
                                    // Message field
                                    Column {
                                        visible: activeTab === 2 || activeTab === 3
                                        width: parent.width
                                        spacing: 4
                                        
                                        Text { 
                                            text: "Mensagem"
                                            font.pixelSize: 11
                                            color: Theme.mutedForeground 
                                        }
                                        
                                        Rectangle {
                                            width: parent.width
                                            height: 80
                                            color: Qt.rgba(1, 1, 1, 0.03)
                                            radius: 6
                                            border.width: 1
                                            border.color: Qt.rgba(1, 1, 1, 0.08)
                                            
                                            TextArea {
                                                anchors.fill: parent
                                                anchors.margins: 10
                                                placeholderText: "Digite sua mensagem..."
                                                placeholderTextColor: Qt.rgba(Theme.mutedForeground.r, Theme.mutedForeground.g, Theme.mutedForeground.b, 0.5)
                                                color: Theme.foreground
                                                font.pixelSize: 12
                                                wrapMode: TextArea.Wrap
                                                background: null
                                            }
                                        }
                                    }
                                    
                                    // Row 2 - Delay/Limit
                                    Row {
                                        width: parent.width
                                        spacing: 12
                                        
                                        Column {
                                            width: (parent.width - 12) / 2
                                            spacing: 4
                                            
                                            Text { 
                                                text: "Delay (seg)"
                                                font.pixelSize: 11
                                                color: Theme.mutedForeground 
                                            }
                                            AppInput { 
                                                width: parent.width
                                                placeholderText: "30"
                                                text: "30"
                                            }
                                        }
                                        
                                        Column {
                                            width: (parent.width - 12) / 2
                                            spacing: 4
                                            
                                            Text { 
                                                text: "Limite"
                                                font.pixelSize: 11
                                                color: Theme.mutedForeground 
                                            }
                                            AppInput { 
                                                width: parent.width
                                                placeholderText: "50"
                                                text: "50"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Progress Panel
                        Rectangle {
                            visible: isRunning
                            Layout.fillWidth: true
                            color: Theme.card
                            radius: 8
                            border.width: 1
                            border.color: Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.3)
                            implicitHeight: progressContent.height
                            
                            Column {
                                id: progressContent
                                width: parent.width
                                spacing: 0
                                
                                Rectangle {
                                    width: parent.width
                                    height: 40
                                    color: Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.1)
                                    radius: 8
                                    
                                    Rectangle {
                                        anchors.bottom: parent.bottom
                                        width: parent.width
                                        height: 8
                                        color: parent.color
                                    }
                                    
                                    Row {
                                        anchors.left: parent.left
                                        anchors.leftMargin: 14
                                        anchors.verticalCenter: parent.verticalCenter
                                        spacing: 8
                                        
                                        Icon {
                                            anchors.verticalCenter: parent.verticalCenter
                                            name: "zap"
                                            size: 14
                                            color: Theme.primary
                                        }
                                        
                                        Text {
                                            anchors.verticalCenter: parent.verticalCenter
                                            text: "Executando..."
                                            font.pixelSize: 12
                                            font.weight: Font.Medium
                                            color: Theme.primary
                                        }
                                    }
                                    
                                    Rectangle {
                                        anchors.right: parent.right
                                        anchors.rightMargin: 14
                                        anchors.verticalCenter: parent.verticalCenter
                                        width: accLabel.width + 12
                                        height: 22
                                        radius: 4
                                        color: Qt.rgba(1, 1, 1, 0.1)
                                        
                                        Text {
                                            id: accLabel
                                            anchors.centerIn: parent
                                            text: currentAccount
                                            font.pixelSize: 10
                                            font.family: "monospace"
                                            color: Theme.mutedForeground
                                        }
                                    }
                                }
                                
                                Column {
                                    width: parent.width - 28
                                    x: 14
                                    topPadding: 14
                                    bottomPadding: 14
                                    spacing: 10
                                    
                                    Item {
                                        width: parent.width
                                        height: 24
                                        
                                        Text {
                                            anchors.left: parent.left
                                            anchors.verticalCenter: parent.verticalCenter
                                            text: processedCount + " de " + totalCount
                                            font.pixelSize: 12
                                            color: Theme.mutedForeground
                                        }
                                        
                                        Text {
                                            anchors.right: parent.right
                                            anchors.verticalCenter: parent.verticalCenter
                                            text: progress + "%"
                                            font.pixelSize: 18
                                            font.weight: Font.Bold
                                            color: Theme.primary
                                        }
                                    }
                                    
                                    Rectangle {
                                        width: parent.width
                                        height: 8
                                        radius: 4
                                        color: Qt.rgba(1, 1, 1, 0.1)
                                        
                                        Rectangle {
                                            width: parent.width * (progress / 100)
                                            height: parent.height
                                            radius: parent.radius
                                            color: Theme.primary
                                            
                                            Behavior on width { NumberAnimation { duration: 300 } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // Right Column
                    ColumnLayout {
                        id: rightCol
                        width: parent.isWide ? parent.width * 0.38 : parent.width
                        anchors.right: parent.right
                        anchors.top: parent.isWide ? parent.top : leftCol.bottom
                        anchors.topMargin: parent.isWide ? 0 : 12
                        spacing: 12
                        
                        
                        // Logs Panel
                        Rectangle {
                            Layout.fillWidth: true
                            color: Theme.card
                            radius: 8
                            implicitHeight: logsContent.height
                            Layout.minimumHeight: 220
                            
                            Column {
                                id: logsContent
                                width: parent.width
                                spacing: 0
                                
                                // Header
                                Rectangle {
                                    width: parent.width
                                    height: 40
                                    color: Qt.rgba(1, 1, 1, 0.02)
                                    radius: 8
                                    
                                    Rectangle {
                                        anchors.bottom: parent.bottom
                                        width: parent.width
                                        height: 8
                                        color: parent.color
                                    }
                                    
                                    Row {
                                        anchors.left: parent.left
                                        anchors.leftMargin: 14
                                        anchors.verticalCenter: parent.verticalCenter
                                        spacing: 8
                                        
                                        Icon {
                                            anchors.verticalCenter: parent.verticalCenter
                                            name: "list"
                                            size: 14
                                            color: Theme.mutedForeground
                                        }
                                        
                                        Text {
                                            anchors.verticalCenter: parent.verticalCenter
                                            text: "Logs"
                                            font.pixelSize: 12
                                            font.weight: Font.Medium
                                            color: Theme.foreground
                                        }
                                    }
                                }
                                
                                // Log entries
                                Column {
                                    width: parent.width - 16
                                    x: 8
                                    topPadding: 8
                                    bottomPadding: 8
                                    spacing: 4
                                    
                                    Repeater {
                                        model: logs
                                        
                                        Rectangle {
                                            width: parent.width
                                            height: 36
                                            radius: 4
                                            color: Qt.rgba(Qt.color(getLogColor(modelData.type)).r, Qt.color(getLogColor(modelData.type)).g, Qt.color(getLogColor(modelData.type)).b, 0.08)
                                            
                                            Rectangle {
                                                anchors.left: parent.left
                                                anchors.leftMargin: 10
                                                anchors.verticalCenter: parent.verticalCenter
                                                width: 6
                                                height: 6
                                                radius: 3
                                                color: getLogColor(modelData.type)
                                            }
                                            
                                            Text {
                                                anchors.left: parent.left
                                                anchors.leftMargin: 24
                                                anchors.right: timeLabel.left
                                                anchors.rightMargin: 8
                                                anchors.verticalCenter: parent.verticalCenter
                                                text: modelData.message
                                                font.pixelSize: 11
                                                color: Theme.foreground
                                                elide: Text.ElideRight
                                            }
                                            
                                            Text {
                                                id: timeLabel
                                                anchors.right: parent.right
                                                anchors.rightMargin: 10
                                                anchors.verticalCenter: parent.verticalCenter
                                                text: modelData.time
                                                font.pixelSize: 9
                                                font.family: "monospace"
                                                color: Theme.mutedForeground
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                Item { height: 16 }
            }
        }
    }
}
