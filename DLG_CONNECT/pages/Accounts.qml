import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import ".."
import "../components"

Rectangle {
    id: root
    color: Theme.background
    
    property string searchQuery: ""
    property int deleteIndex: -1
    property bool showDeleteDialog: false
    property bool showConnectDialog: false
    property string connectPhone: ""
    property string connectCode: ""
    property int connectStep: 0 // 0 = phone, 1 = code
    
    property var accounts: [
        { phone: "+55 11 98765-4321", flood: "Ativa", floodColor: "#22c55e", addedToday: 156, lastUsed: "2 min atrás" },
        { phone: "+55 21 91234-5678", flood: "Ativa", floodColor: "#22c55e", addedToday: 89, lastUsed: "15 min atrás" },
        { phone: "+55 11 95555-4444", flood: "Float 2d", floodColor: "#0080ff", addedToday: 0, lastUsed: "1 dia atrás" },
        { phone: "+55 19 97777-8888", flood: "Ativa", floodColor: "#22c55e", addedToday: 234, lastUsed: "5 min atrás" },
        { phone: "+55 48 92222-3333", flood: "7 dias", floodColor: "#f59e0b", addedToday: 0, lastUsed: "5 dias atrás" },
        { phone: "+55 85 96666-1111", flood: "Banida", floodColor: "#ef4444", addedToday: 0, lastUsed: "2 dias atrás" }
    ]
    
    property var filteredAccounts: {
        if (searchQuery.length === 0) return accounts
        var query = searchQuery.toLowerCase()
        return accounts.filter(function(a) {
            return a.phone.toLowerCase().indexOf(query) !== -1 || 
                   a.flood.toLowerCase().indexOf(query) !== -1
        })
    }
    
    function countByFlood(flood) {
        return accounts.filter(a => a.flood === flood).length
    }
    
    // Connect Dialog
    Rectangle {
        id: connectDialog
        anchors.fill: parent
        color: Qt.rgba(0, 0, 0, 0.7)
        visible: showConnectDialog
        opacity: showConnectDialog ? 1 : 0
        z: 100
        
        Behavior on opacity { NumberAnimation { duration: 200; easing.type: Easing.OutQuad } }
        
        MouseArea {
            anchors.fill: parent
            onClicked: {
                showConnectDialog = false
                connectStep = 0
                connectPhone = ""
                connectCode = ""
            }
        }
        
        Rectangle {
            anchors.centerIn: parent
            width: 380
            height: connectContent.height + 40
            color: Theme.card
            radius: 12
            border.width: 1
            border.color: Qt.rgba(1, 1, 1, 0.1)
            
            scale: showConnectDialog ? 1 : 0.9
            Behavior on scale { NumberAnimation { duration: 200; easing.type: Easing.OutBack } }
            
            MouseArea { anchors.fill: parent }
            
            ColumnLayout {
                id: connectContent
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.margins: 20
                spacing: 20
                
                // Header
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 12
                    
                    Rectangle {
                        width: 44
                        height: 44
                        radius: 22
                        color: Qt.rgba(0, 0.5, 1, 0.15)
                        
                        Icon {
                            anchors.centerIn: parent
                            name: "users"
                            size: 22
                            color: Theme.primary
                        }
                    }
                    
                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 2
                        
                        Text {
                            text: connectStep === 0 ? "Conectar Conta Telegram" : "Verificar Código"
                            font.pixelSize: 16
                            font.weight: Font.DemiBold
                            color: Theme.foreground
                        }
                        
                        Text {
                            text: connectStep === 0 ? "Digite seu número de telefone" : "Digite o código recebido no Telegram"
                            font.pixelSize: 12
                            color: Theme.mutedForeground
                        }
                    }
                    
                    // Close button
                    Rectangle {
                        width: 32
                        height: 32
                        radius: 16
                        color: closeMouse.containsMouse ? Qt.rgba(1, 1, 1, 0.1) : "transparent"
                        
                        Behavior on color { ColorAnimation { duration: 100 } }
                        
                        Icon {
                            anchors.centerIn: parent
                            name: "x"
                            size: 16
                            color: Theme.mutedForeground
                        }
                        
                        MouseArea {
                            id: closeMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                showConnectDialog = false
                                connectStep = 0
                                connectPhone = ""
                                connectCode = ""
                            }
                        }
                    }
                }
                
                // Phone Step
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 12
                    visible: connectStep === 0
                    
                    Text {
                        text: "Número de Telefone"
                        font.pixelSize: 12
                        font.weight: Font.Medium
                        color: Theme.foreground
                    }
                    
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 44
                        color: Qt.rgba(1, 1, 1, 0.04)
                        radius: 8
                        border.width: 1
                        border.color: phoneInput.activeFocus ? Theme.primary : Qt.rgba(1, 1, 1, 0.1)
                        
                        Behavior on border.color { ColorAnimation { duration: 150 } }
                        
                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 14
                            anchors.rightMargin: 14
                            spacing: 10
                            
                            Text {
                                text: "+55"
                                font.pixelSize: 14
                                color: Theme.mutedForeground
                            }
                            
                            Rectangle {
                                width: 1
                                height: 20
                                color: Qt.rgba(1, 1, 1, 0.1)
                            }
                            
                            TextInput {
                                id: phoneInput
                                Layout.fillWidth: true
                                font.pixelSize: 14
                                color: Theme.foreground
                                clip: true
                                onTextChanged: connectPhone = text
                                
                                Text {
                                    anchors.fill: parent
                                    text: "11 99999-9999"
                                    font.pixelSize: 14
                                    color: Qt.rgba(1, 1, 1, 0.3)
                                    visible: parent.text.length === 0 && !parent.activeFocus
                                }
                            }
                        }
                    }
                }
                
                // Code Step
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 12
                    visible: connectStep === 1
                    
                    Text {
                        text: "Código de Verificação"
                        font.pixelSize: 12
                        font.weight: Font.Medium
                        color: Theme.foreground
                    }
                    
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 44
                        color: Qt.rgba(1, 1, 1, 0.04)
                        radius: 8
                        border.width: 1
                        border.color: codeInput.activeFocus ? Theme.primary : Qt.rgba(1, 1, 1, 0.1)
                        
                        Behavior on border.color { ColorAnimation { duration: 150 } }
                        
                        TextInput {
                            id: codeInput
                            anchors.fill: parent
                            anchors.leftMargin: 14
                            anchors.rightMargin: 14
                            verticalAlignment: TextInput.AlignVCenter
                            font.pixelSize: 18
                            font.letterSpacing: 8
                            horizontalAlignment: TextInput.AlignHCenter
                            color: Theme.foreground
                            clip: true
                            maximumLength: 6
                            onTextChanged: connectCode = text
                            
                            Text {
                                anchors.centerIn: parent
                                text: "• • • • • •"
                                font.pixelSize: 18
                                font.letterSpacing: 8
                                color: Qt.rgba(1, 1, 1, 0.3)
                                visible: parent.text.length === 0 && !parent.activeFocus
                            }
                        }
                    }
                    
                    Text {
                        Layout.fillWidth: true
                        text: "Enviamos um código para +55 " + connectPhone
                        font.pixelSize: 11
                        color: Theme.mutedForeground
                        horizontalAlignment: Text.AlignHCenter
                    }
                }
                
                // Actions
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 12
                    
                    // Back/Cancel Button
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 42
                        color: backConnectMouse.containsMouse ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(1, 1, 1, 0.04)
                        radius: 8
                        border.width: 1
                        border.color: Qt.rgba(1, 1, 1, 0.1)
                        
                        Behavior on color { ColorAnimation { duration: 100 } }
                        
                        MouseArea {
                            id: backConnectMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                if (connectStep === 1) {
                                    connectStep = 0
                                } else {
                                    showConnectDialog = false
                                    connectPhone = ""
                                }
                            }
                        }
                        
                        Text {
                            anchors.centerIn: parent
                            text: connectStep === 1 ? "Voltar" : "Cancelar"
                            font.pixelSize: 13
                            font.weight: Font.Medium
                            color: Theme.foreground
                        }
                    }
                    
                    // Next/Connect Button
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 42
                        color: nextConnectMouse.containsMouse ? Qt.lighter(Theme.primary, 1.1) : Theme.primary
                        radius: 8
                        
                        Behavior on color { ColorAnimation { duration: 100 } }
                        
                        scale: nextConnectMouse.pressed ? 0.97 : 1
                        Behavior on scale { NumberAnimation { duration: 80 } }
                        
                        MouseArea {
                            id: nextConnectMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                if (connectStep === 0 && connectPhone.length > 0) {
                                    connectStep = 1
                                } else if (connectStep === 1 && connectCode.length === 6) {
                                    console.log("Connecting account:", connectPhone, connectCode)
                                    showConnectDialog = false
                                    connectStep = 0
                                    connectPhone = ""
                                    connectCode = ""
                                }
                            }
                        }
                        
                        RowLayout {
                            anchors.centerIn: parent
                            spacing: 8
                            
                            Text {
                                text: connectStep === 0 ? "Enviar Código" : "Conectar"
                                font.pixelSize: 13
                                font.weight: Font.Medium
                                color: Theme.primaryForeground
                            }
                            
                            Icon {
                                name: connectStep === 0 ? "arrowRight" : "check"
                                size: 16
                                color: Theme.primaryForeground
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Delete Confirmation Dialog
    Rectangle {
        id: deleteDialog
        anchors.fill: parent
        color: Qt.rgba(0, 0, 0, 0.7)
        visible: showDeleteDialog
        opacity: showDeleteDialog ? 1 : 0
        z: 100
        
        Behavior on opacity { NumberAnimation { duration: 200; easing.type: Easing.OutQuad } }
        
        MouseArea {
            anchors.fill: parent
            onClicked: showDeleteDialog = false
        }
        
        Rectangle {
            anchors.centerIn: parent
            width: 360
            height: dialogContent.height + 40
            color: Theme.card
            radius: 12
            border.width: 1
            border.color: Qt.rgba(1, 1, 1, 0.1)
            
            scale: showDeleteDialog ? 1 : 0.9
            Behavior on scale { NumberAnimation { duration: 200; easing.type: Easing.OutBack } }
            
            MouseArea { anchors.fill: parent }
            
            ColumnLayout {
                id: dialogContent
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.margins: 20
                spacing: 20
                
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 14
                    
                    Rectangle {
                        width: 48
                        height: 48
                        radius: 24
                        color: Qt.rgba(0.94, 0.27, 0.27, 0.15)
                        
                        Icon {
                            anchors.centerIn: parent
                            name: "alertCircle"
                            size: 24
                            color: "#ef4444"
                        }
                    }
                    
                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 4
                        
                        Text {
                            text: "Excluir Sessão"
                            font.pixelSize: 16
                            font.weight: Font.DemiBold
                            color: Theme.foreground
                        }
                        
                        Text {
                            text: deleteIndex >= 0 && deleteIndex < accounts.length ? accounts[deleteIndex].phone : ""
                            font.pixelSize: 13
                            color: Theme.mutedForeground
                        }
                    }
                }
                
                Text {
                    Layout.fillWidth: true
                    text: "Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita e você precisará reconectar a conta."
                    font.pixelSize: 13
                    color: Theme.mutedForeground
                    wrapMode: Text.WordWrap
                    lineHeight: 1.4
                }
                
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 12
                    
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 42
                        color: cancelMouse.containsMouse ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(1, 1, 1, 0.04)
                        radius: 8
                        border.width: 1
                        border.color: Qt.rgba(1, 1, 1, 0.1)
                        
                        Behavior on color { ColorAnimation { duration: 100 } }
                        
                        MouseArea {
                            id: cancelMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: showDeleteDialog = false
                        }
                        
                        Text {
                            anchors.centerIn: parent
                            text: "Cancelar"
                            font.pixelSize: 13
                            font.weight: Font.Medium
                            color: Theme.foreground
                        }
                    }
                    
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 42
                        color: confirmMouse.containsMouse ? Qt.lighter("#ef4444", 1.1) : "#ef4444"
                        radius: 8
                        
                        Behavior on color { ColorAnimation { duration: 100 } }
                        
                        scale: confirmMouse.pressed ? 0.97 : 1
                        Behavior on scale { NumberAnimation { duration: 80 } }
                        
                        MouseArea {
                            id: confirmMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                console.log("Deleted account:", deleteIndex)
                                showDeleteDialog = false
                                deleteIndex = -1
                            }
                        }
                        
                        RowLayout {
                            anchors.centerIn: parent
                            spacing: 8
                            
                            Icon {
                                name: "trash"
                                size: 16
                                color: "white"
                            }
                            
                            Text {
                                text: "Excluir"
                                font.pixelSize: 13
                                font.weight: Font.Medium
                                color: "white"
                            }
                        }
                    }
                }
            }
        }
    }
    
    ScrollView {
        anchors.fill: parent
        anchors.margins: 20
        contentWidth: availableWidth
        clip: true
        
        ColumnLayout {
            width: parent.width
            spacing: 16
            
            // Header
            RowLayout {
                Layout.fillWidth: true
                spacing: 12
                
                Text {
                    text: "Contas Telegram"
                    font.pixelSize: 20
                    font.weight: Font.DemiBold
                    color: Theme.foreground
                }
                
                Item { Layout.fillWidth: true }
                
                // Comprar Button
                Rectangle {
                    Layout.preferredWidth: 110
                    Layout.preferredHeight: 40
                    color: comprarMouse.containsMouse ? Qt.lighter(Theme.primary, 1.1) : Theme.primary
                    radius: 8
                    
                    Behavior on color { ColorAnimation { duration: 150 } }
                    
                    scale: comprarMouse.pressed ? 0.96 : 1.0
                    Behavior on scale { NumberAnimation { duration: 100; easing.type: Easing.OutQuad } }
                    
                    MouseArea {
                        id: comprarMouse
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: Qt.openUrlExternally("https://dlgconnect.com/dashboard")
                    }
                    
                    RowLayout {
                        anchors.centerIn: parent
                        spacing: 6
                        
                        Icon {
                            name: "plus"
                            size: 16
                            color: Theme.primaryForeground
                        }
                        
                        Text {
                            text: "Comprar"
                            font.pixelSize: 13
                            font.weight: Font.Medium
                            color: Theme.primaryForeground
                        }
                    }
                }
                
                // Conectar Button
                Rectangle {
                    Layout.preferredWidth: 110
                    Layout.preferredHeight: 40
                    color: conectarMouse.containsMouse ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(1, 1, 1, 0.04)
                    radius: 8
                    border.width: 1
                    border.color: Qt.rgba(1, 1, 1, 0.15)
                    
                    Behavior on color { ColorAnimation { duration: 150 } }
                    
                    scale: conectarMouse.pressed ? 0.96 : 1.0
                    Behavior on scale { NumberAnimation { duration: 100; easing.type: Easing.OutQuad } }
                    
                    MouseArea {
                        id: conectarMouse
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: showConnectDialog = true
                    }
                    
                    RowLayout {
                        anchors.centerIn: parent
                        spacing: 6
                        
                        Icon {
                            name: "link"
                            size: 16
                            color: Theme.foreground
                        }
                        
                        Text {
                            text: "Conectar"
                            font.pixelSize: 13
                            font.weight: Font.Medium
                            color: Theme.foreground
                        }
                    }
                }
            }
            
            // Stats Grid
            GridLayout {
                Layout.fillWidth: true
                columns: 4
                columnSpacing: 12
                rowSpacing: 12
                
                property var statsData: [
                    { label: "Ativas", value: countByFlood("Ativa"), color: "#22c55e" },
                    { label: "Float 2d", value: countByFlood("Float 2d"), color: "#0080ff" },
                    { label: "7 dias", value: countByFlood("7 dias"), color: "#f59e0b" },
                    { label: "Banidas", value: countByFlood("Banida"), color: "#ef4444" }
                ]
                
                Repeater {
                    model: parent.statsData
                    
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 70
                        color: Theme.card
                        radius: 10
                        
                        property bool hovered: statMouse.containsMouse
                        
                        scale: hovered ? 1.02 : 1
                        Behavior on scale { NumberAnimation { duration: 150; easing.type: Easing.OutQuad } }
                        
                        MouseArea {
                            id: statMouse
                            anchors.fill: parent
                            hoverEnabled: true
                        }
                        
                        RowLayout {
                            anchors.fill: parent
                            anchors.margins: 14
                            spacing: 14
                            
                            Rectangle {
                                Layout.preferredWidth: 6
                                Layout.fillHeight: true
                                radius: 3
                                color: modelData.color
                            }
                            
                            ColumnLayout {
                                Layout.fillWidth: true
                                spacing: 4
                                
                                Text {
                                    text: modelData.value.toString()
                                    font.pixelSize: 26
                                    font.weight: Font.Bold
                                    color: Theme.foreground
                                }
                                Text {
                                    text: modelData.label
                                    font.pixelSize: 12
                                    color: Theme.mutedForeground
                                }
                            }
                        }
                    }
                }
            }
            
            // Accounts Table
            Rectangle {
                Layout.fillWidth: true
                color: Theme.card
                radius: 10
                implicitHeight: tableCol.height
                
                ColumnLayout {
                    id: tableCol
                    width: parent.width
                    spacing: 0
                    
                    // Header with search
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 52
                        color: Qt.rgba(1, 1, 1, 0.02)
                        radius: 10
                        
                        Rectangle {
                            anchors.bottom: parent.bottom
                            anchors.left: parent.left
                            anchors.right: parent.right
                            height: 10
                            color: parent.color
                        }
                        
                        Rectangle {
                            anchors.bottom: parent.bottom
                            width: parent.width
                            height: 1
                            color: Qt.rgba(1, 1, 1, 0.06)
                        }
                        
                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 18
                            anchors.rightMargin: 18
                            spacing: 14
                            
                            Icon {
                                name: "list"
                                size: 18
                                color: Theme.primary
                            }
                            
                            Text {
                                text: "Lista de Contas"
                                font.pixelSize: 14
                                font.weight: Font.Medium
                                color: Theme.foreground
                            }
                            
                            Text {
                                text: "(" + filteredAccounts.length + " contas)"
                                font.pixelSize: 12
                                color: Theme.mutedForeground
                            }
                            
                            Item { Layout.fillWidth: true }
                            
                            // Search Field
                            Rectangle {
                                Layout.preferredWidth: 220
                                Layout.preferredHeight: 36
                                color: Qt.rgba(1, 1, 1, 0.04)
                                radius: 8
                                border.width: 1
                                border.color: searchInput.activeFocus ? Theme.primary : Qt.rgba(1, 1, 1, 0.1)
                                
                                Behavior on border.color { ColorAnimation { duration: 150 } }
                                
                                RowLayout {
                                    anchors.fill: parent
                                    anchors.leftMargin: 12
                                    anchors.rightMargin: 12
                                    spacing: 10
                                    
                                    Icon {
                                        name: "search"
                                        size: 16
                                        color: Theme.mutedForeground
                                    }
                                    
                                    TextInput {
                                        id: searchInput
                                        Layout.fillWidth: true
                                        font.pixelSize: 13
                                        color: Theme.foreground
                                        clip: true
                                        onTextChanged: searchQuery = text
                                        
                                        Text {
                                            anchors.fill: parent
                                            anchors.verticalCenter: parent.verticalCenter
                                            text: "Pesquisar contas..."
                                            font.pixelSize: 13
                                            color: Qt.rgba(1, 1, 1, 0.4)
                                            visible: parent.text.length === 0 && !parent.activeFocus
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // Table header row
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 42
                        color: "transparent"
                        
                        Rectangle {
                            anchors.bottom: parent.bottom
                            width: parent.width
                            height: 1
                            color: Qt.rgba(1, 1, 1, 0.06)
                        }
                        
                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 18
                            anchors.rightMargin: 18
                            spacing: 0
                            
                            Text { 
                                Layout.preferredWidth: parent.width * 0.30
                                text: "Telefone"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                                color: Theme.mutedForeground
                            }
                            Text { 
                                Layout.preferredWidth: parent.width * 0.18
                                text: "Status"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                                color: Theme.mutedForeground
                            }
                            Text { 
                                Layout.preferredWidth: parent.width * 0.15
                                text: "Add Hoje"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                                color: Theme.mutedForeground
                            }
                            Text { 
                                Layout.preferredWidth: parent.width * 0.25
                                text: "Último Uso"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                                color: Theme.mutedForeground
                            }
                            Text { 
                                Layout.fillWidth: true
                                text: "Ação"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                                color: Theme.mutedForeground
                                horizontalAlignment: Text.AlignRight
                            }
                        }
                    }
                    
                    // Table rows
                    Repeater {
                        model: filteredAccounts
                        
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 56
                            color: rowMouse.containsMouse ? Qt.rgba(1, 1, 1, 0.03) : "transparent"
                            
                            Behavior on color { ColorAnimation { duration: 150 } }
                            
                            Rectangle {
                                anchors.bottom: parent.bottom
                                width: parent.width
                                height: 1
                                color: Qt.rgba(1, 1, 1, 0.05)
                                visible: index < filteredAccounts.length - 1
                            }
                            
                            MouseArea {
                                id: rowMouse
                                anchors.fill: parent
                                hoverEnabled: true
                            }
                            
                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 18
                                anchors.rightMargin: 18
                                spacing: 0
                                
                                // Phone
                                RowLayout {
                                    Layout.preferredWidth: parent.width * 0.30
                                    spacing: 12
                                    
                                    Rectangle {
                                        Layout.preferredWidth: 36
                                        Layout.preferredHeight: 36
                                        radius: 18
                                        color: Qt.rgba(0, 0.5, 1, 0.1)
                                        
                                        Icon {
                                            anchors.centerIn: parent
                                            name: "users"
                                            size: 18
                                            color: Theme.primary
                                        }
                                    }
                                    
                                    Text {
                                        text: modelData.phone
                                        font.pixelSize: 13
                                        font.weight: Font.Medium
                                        color: Theme.foreground
                                    }
                                }
                                
                                // Flood Status
                                Item {
                                    Layout.preferredWidth: parent.width * 0.18
                                    Layout.preferredHeight: parent.height
                                    
                                    Rectangle {
                                        anchors.verticalCenter: parent.verticalCenter
                                        width: floodLabel.width + 18
                                        height: 28
                                        radius: 6
                                        color: Qt.rgba(Qt.color(modelData.floodColor).r, Qt.color(modelData.floodColor).g, Qt.color(modelData.floodColor).b, 0.12)
                                        
                                        Text {
                                            id: floodLabel
                                            anchors.centerIn: parent
                                            text: modelData.flood
                                            font.pixelSize: 12
                                            font.weight: Font.Medium
                                            color: modelData.floodColor
                                        }
                                    }
                                }
                                
                                // Added Today
                                Text {
                                    Layout.preferredWidth: parent.width * 0.15
                                    text: modelData.addedToday > 0 ? "+" + modelData.addedToday.toString() : "0"
                                    font.pixelSize: 14
                                    font.weight: Font.DemiBold
                                    color: modelData.addedToday > 0 ? "#22c55e" : Theme.mutedForeground
                                }
                                
                                // Last Used
                                Text {
                                    Layout.preferredWidth: parent.width * 0.25
                                    text: modelData.lastUsed
                                    font.pixelSize: 13
                                    color: Theme.mutedForeground
                                }
                                
                                // Actions - Only Delete button
                                Item {
                                    Layout.fillWidth: true
                                    Layout.preferredHeight: parent.height
                                    
                                    Rectangle {
                                        anchors.right: parent.right
                                        anchors.verticalCenter: parent.verticalCenter
                                        width: 36
                                        height: 36
                                        radius: 8
                                        color: deleteMouse.containsMouse ? Qt.rgba(0.94, 0.27, 0.27, 0.15) : "transparent"
                                        
                                        Behavior on color { ColorAnimation { duration: 150 } }
                                        
                                        scale: deleteMouse.pressed ? 0.9 : 1
                                        Behavior on scale { NumberAnimation { duration: 100 } }
                                        
                                        Icon {
                                            anchors.centerIn: parent
                                            name: "trash"
                                            size: 18
                                            color: deleteMouse.containsMouse ? "#ef4444" : Theme.mutedForeground
                                            
                                            Behavior on color { ColorAnimation { duration: 150 } }
                                        }
                                        
                                        MouseArea {
                                            id: deleteMouse
                                            anchors.fill: parent
                                            hoverEnabled: true
                                            cursorShape: Qt.PointingHandCursor
                                            onClicked: {
                                                deleteIndex = index
                                                showDeleteDialog = true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // Empty state
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 100
                        color: "transparent"
                        visible: filteredAccounts.length === 0
                        
                        ColumnLayout {
                            anchors.centerIn: parent
                            spacing: 10
                            
                            Icon {
                                Layout.alignment: Qt.AlignHCenter
                                name: "search"
                                size: 28
                                color: Theme.mutedForeground
                            }
                            
                            Text {
                                Layout.alignment: Qt.AlignHCenter
                                text: "Nenhuma conta encontrada"
                                font.pixelSize: 14
                                color: Theme.mutedForeground
                            }
                        }
                    }
                }
            }
        }
    }
}
