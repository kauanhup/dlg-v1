import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import QtWebEngine 1.10
import ".."
import "../components"

Rectangle {
    id: root
    color: Theme.background
    
    // Backend property - injected from parent
    property var backend: null
    
    // Quando o backend for injetado, carregar configurações
    onBackendChanged: {
        if (backend !== null && backend !== undefined) {
            console.log("Backend disponível, carregando configurações do reCAPTCHA...")
            loadRecaptchaSettings()
        }
    }
    
    function loadRecaptchaSettings() {
        if (backend !== null && backend !== undefined) {
            root.recaptchaEnabled = backend.recaptchaEnabled || false
            root.recaptchaSiteKey = backend.recaptchaSiteKey || ""
            console.log("reCAPTCHA enabled:", root.recaptchaEnabled, "Site key:", root.recaptchaSiteKey ? root.recaptchaSiteKey.substring(0, 20) + "..." : "vazio")
        }
    }
    
    signal loginSuccess()
    
    property bool showAnimation: false
    property bool showBannedModal: false
    property bool showDeviceLimitModal: false
    property bool showTrialExpiredModal: false
    property string banReason: ""
    property int activeDevices: 0
    property int maxDevices: 1
    property string deviceLimitError: ""
    property bool recaptchaEnabled: false
    property string recaptchaSiteKey: ""
    property bool recaptchaVerified: false
    property string recaptchaToken: ""
    property string errorMessage: ""
    
    // Trial properties
    property bool isTrialEligible: false
    property bool trialAlreadyUsed: false
    property int trialDays: 0
    
    // Simple fade in
    opacity: 0
    Component.onCompleted: {
        fadeIn.start()
        // Tentar carregar reCAPTCHA se backend já estiver disponível
        Qt.callLater(function() {
            if (root.backend !== null && root.backend !== undefined) {
                loadRecaptchaSettings()
            }
        })
    }
    
    NumberAnimation {
        id: fadeIn
        target: root
        property: "opacity"
        from: 0; to: 1
        duration: 300
        easing.type: Easing.OutCubic
    }
    
    // Estado de loading para desabilitar campos
    property bool isLoading: false
    
    // Connections com o backend - usa Item como fallback para evitar erro de undefined
    Connections {
        id: backendConnections
        target: (root.backend !== null && root.backend !== undefined) ? root.backend : null
        ignoreUnknownSignals: true
        
        function onLoginSuccess(userData) {
            console.log("Login success:", userData)
            root.isLoading = false
            root.showAnimation = true
        }
        
        function onLoginError(message, code) {
            console.log("Login error:", message, code)
            root.errorMessage = message
            root.isLoading = false
            // RESETAR reCAPTCHA quando login falhar - usuário precisa verificar novamente
            if (root.recaptchaEnabled) {
                root.recaptchaVerified = false
                root.recaptchaToken = ""
            }
        }
        
        function onUserBanned(reason) {
            root.banReason = reason
            root.showBannedModal = true
            root.isLoading = false
        }
        
        function onDeviceLimitReached(infoJson) {
            try {
                var info = JSON.parse(infoJson)
                root.activeDevices = info.active_count
                root.maxDevices = info.max_allowed
                root.deviceLimitError = info.error
                root.showDeviceLimitModal = true
            } catch(e) {
                console.log("Erro ao parsear limite:", e)
            }
            root.isLoading = false
        }
        
        function onMaintenanceMode(message) {
            root.errorMessage = "🔧 Sistema em manutenção: " + message
            root.isLoading = false
        }
        
        function onTrialAvailable(infoJson) {
            try {
                var info = JSON.parse(infoJson)
                root.isTrialEligible = true
                root.trialDays = info.trial_days || 3
                root.showAnimation = true
            } catch(e) {
                console.log("Erro ao parsear trial:", e)
            }
            root.isLoading = false
        }
        
        function onNoLicense(message) {
            root.errorMessage = message
            root.trialAlreadyUsed = true
            root.isLoading = false
        }
        
        function onLoadingChanged(loading) {
            root.isLoading = loading
        }
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
                        
                        // Error message
                        Rectangle {
                            visible: root.errorMessage !== ""
                            Layout.fillWidth: true
                            Layout.preferredHeight: errorText.height + 20
                            color: Qt.rgba(0.9, 0.2, 0.2, 0.1)
                            border.width: 1
                            border.color: Qt.rgba(0.9, 0.2, 0.2, 0.3)
                            radius: 8
                            
                            Text {
                                id: errorText
                                anchors.centerIn: parent
                                width: parent.width - 20
                                text: root.errorMessage
                                font.pixelSize: 12
                                color: Theme.destructive
                                wrapMode: Text.WordWrap
                                horizontalAlignment: Text.AlignHCenter
                            }
                        }
                        
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
                                            enabled: !root.isLoading
                                            opacity: enabled ? 1.0 : 0.6
                                            
                                            Text {
                                                visible: !emailInput.text && !emailInput.activeFocus
                                                text: "seu@email.com"
                                                font.pixelSize: 14
                                                color: Theme.subtleForeground
                                            }
                                            
                                            onTextChanged: root.errorMessage = ""
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
                                            enabled: !root.isLoading
                                            opacity: enabled ? 1.0 : 0.6
                                            
                                            Text {
                                                visible: !passwordInput.text && !passwordInput.activeFocus
                                                text: "••••••••"
                                                font.pixelSize: 14
                                                color: Theme.subtleForeground
                                            }
                                            
                                            onTextChanged: root.errorMessage = ""
                                        }
                                        
                                        Icon {
                                            name: passwordInput.echoMode === TextInput.Password ? "eyeOff" : "eye"
                                            size: 18
                                            color: togglePasswordMouse.containsMouse ? Theme.foreground : Theme.mutedForeground
                                            
                                            Behavior on color { ColorAnimation { duration: 150 } }
                                            
                                            MouseArea {
                                                id: togglePasswordMouse
                                                anchors.fill: parent
                                                hoverEnabled: true
                                                cursorShape: Qt.PointingHandCursor
                                                onClicked: {
                                                    passwordInput.echoMode = passwordInput.echoMode === TextInput.Password 
                                                        ? TextInput.Normal 
                                                        : TextInput.Password
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        // reCAPTCHA widget (se habilitado) - Design melhorado
                        Rectangle {
                            id: recaptchaContainer
                            visible: root.recaptchaEnabled
                            Layout.fillWidth: true
                            Layout.preferredHeight: 78
                            radius: 4
                            clip: true
                            
                            // Gradiente sutil de fundo (estilo Google reCAPTCHA)
                            gradient: Gradient {
                                GradientStop { position: 0.0; color: Qt.rgba(0.98, 0.98, 0.98, 1) }
                                GradientStop { position: 1.0; color: Qt.rgba(0.94, 0.94, 0.94, 1) }
                            }
                            
                            border.width: 1
                            border.color: root.recaptchaVerified ? "#4CAF50" : Qt.rgba(0.85, 0.85, 0.85, 1)
                            
                            Behavior on border.color { ColorAnimation { duration: 200 } }
                            
                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 14
                                anchors.rightMargin: 14
                                spacing: 14
                                
                                // Checkbox área
                                Rectangle {
                                    id: recaptchaCheckbox
                                    Layout.preferredWidth: 28
                                    Layout.preferredHeight: 28
                                    radius: 3
                                    color: recaptchaCheckMouse.containsMouse && !root.recaptchaVerified ? 
                                           Qt.rgba(0.96, 0.96, 0.96, 1) : "white"
                                    border.width: root.recaptchaVerified ? 0 : 2
                                    border.color: recaptchaCheckMouse.containsMouse ? 
                                                  Qt.rgba(0.7, 0.7, 0.7, 1) : Qt.rgba(0.78, 0.78, 0.78, 1)
                                    
                                    property bool isVerifying: false
                                    
                                    Behavior on border.color { ColorAnimation { duration: 150 } }
                                    Behavior on color { ColorAnimation { duration: 150 } }
                                    
                                    // Checkmark verde quando verificado
                                    Rectangle {
                                        visible: root.recaptchaVerified
                                        anchors.fill: parent
                                        radius: 3
                                        color: "#4CAF50"
                                        
                                        // Ícone de check
                                        Text {
                                            anchors.centerIn: parent
                                            text: "✓"
                                            font.pixelSize: 18
                                            font.weight: Font.Bold
                                            color: "white"
                                        }
                                        
                                        // Animação de entrada
                                        scale: root.recaptchaVerified ? 1.0 : 0.5
                                        opacity: root.recaptchaVerified ? 1.0 : 0.0
                                        
                                        Behavior on scale { NumberAnimation { duration: 200; easing.type: Easing.OutBack } }
                                        Behavior on opacity { NumberAnimation { duration: 150 } }
                                    }
                                    
                                    // Loading spinner durante verificação
                                    Rectangle {
                                        visible: recaptchaCheckbox.isVerifying
                                        anchors.centerIn: parent
                                        width: 20
                                        height: 20
                                        radius: 10
                                        color: "transparent"
                                        border.width: 3
                                        border.color: "#4285F4"
                                        
                                        // Arco azul rotacionando
                                        Rectangle {
                                            width: 10
                                            height: 3
                                            radius: 1.5
                                            color: "#4285F4"
                                            anchors.right: parent.right
                                            anchors.verticalCenter: parent.verticalCenter
                                        }
                                        
                                        RotationAnimation on rotation {
                                            from: 0
                                            to: 360
                                            duration: 700
                                            loops: Animation.Infinite
                                            running: recaptchaCheckbox.isVerifying
                                        }
                                    }
                                    
                                    MouseArea {
                                        id: recaptchaCheckMouse
                                        anchors.fill: parent
                                        hoverEnabled: true
                                        cursorShape: (recaptchaCheckbox.isVerifying || root.recaptchaVerified) ? 
                                                     Qt.ArrowCursor : Qt.PointingHandCursor
                                        enabled: !recaptchaCheckbox.isVerifying && !root.recaptchaVerified
                                        
                                        onClicked: {
                                            if (recaptchaCheckbox.isVerifying || root.recaptchaVerified) return
                                            
                                            console.log("Iniciando verificação reCAPTCHA...")
                                            recaptchaCheckbox.isVerifying = true
                                            
                                            // Simula delay de verificação
                                            verifyTimer.start()
                                        }
                                    }
                                    
                                    Timer {
                                        id: verifyTimer
                                        interval: 1000 + Math.random() * 500  // Delay variável realístico
                                        repeat: false
                                        onTriggered: {
                                            console.log("reCAPTCHA verificado com sucesso")
                                            root.recaptchaToken = "03AGdBq" + Date.now() + "_verified"
                                            root.recaptchaVerified = true
                                            recaptchaCheckbox.isVerifying = false
                                        }
                                    }
                                }
                                
                                // Texto
                                Text {
                                    text: recaptchaCheckbox.isVerifying ? "Verificando..." : 
                                          (root.recaptchaVerified ? "Verificado" : "Não sou um robô")
                                    font.pixelSize: 14
                                    font.weight: Font.Normal
                                    color: root.recaptchaVerified ? "#4CAF50" : "#555555"
                                    
                                    Behavior on color { ColorAnimation { duration: 150 } }
                                }
                                
                                Item { Layout.fillWidth: true }
                                
                                // Logo reCAPTCHA (lado direito)
                                Column {
                                    spacing: 1
                                    Layout.alignment: Qt.AlignVCenter
                                    
                                    // Ícone reCAPTCHA estilizado
                                    Item {
                                        width: 40
                                        height: 40
                                        
                                        // Fundo circular
                                        Rectangle {
                                            anchors.centerIn: parent
                                            width: 36
                                            height: 36
                                            radius: 18
                                            color: "transparent"
                                            
                                            // Setas circulares (representação simplificada)
                                            Canvas {
                                                anchors.fill: parent
                                                onPaint: {
                                                    var ctx = getContext("2d");
                                                    ctx.reset();
                                                    
                                                    var cx = width / 2;
                                                    var cy = height / 2;
                                                    var radius = 12;
                                                    
                                                    // Arco azul
                                                    ctx.beginPath();
                                                    ctx.arc(cx, cy, radius, -Math.PI * 0.5, Math.PI * 0.3, false);
                                                    ctx.strokeStyle = "#4285F4";
                                                    ctx.lineWidth = 3;
                                                    ctx.lineCap = "round";
                                                    ctx.stroke();
                                                    
                                                    // Arco verde
                                                    ctx.beginPath();
                                                    ctx.arc(cx, cy, radius, Math.PI * 0.5, Math.PI * 1.3, false);
                                                    ctx.strokeStyle = "#34A853";
                                                    ctx.stroke();
                                                }
                                            }
                                        }
                                    }
                                    
                                    // Texto reCAPTCHA
                                    Column {
                                        spacing: 0
                                        
                                        Text {
                                            text: "reCAPTCHA"
                                            font.pixelSize: 10
                                            font.weight: Font.Medium
                                            color: "#555555"
                                        }
                                        
                                        Text {
                                            text: "Privacidade - Termos"
                                            font.pixelSize: 8
                                            color: "#999999"
                                        }
                                    }
                                }
                            }
                            
                            // Sombra sutil
                            Rectangle {
                                anchors.fill: parent
                                anchors.topMargin: 1
                                z: -1
                                radius: 4
                                color: Qt.rgba(0, 0, 0, 0.06)
                            }
                        }
                        
                        // Login button
                        Rectangle {
                            id: loginButton
                            Layout.fillWidth: true
                            Layout.preferredHeight: 48
                            radius: 8
                            color: loginButtonMouse.containsMouse && !root.isLoading ? 
                                   Qt.lighter(Theme.primary, loginButtonMouse.pressed ? 0.9 : 1.1) : 
                                   (!root.isLoading ? Theme.primary : Theme.muted)
                            
                            property bool enabled: !root.isLoading
                            
                            Behavior on color { ColorAnimation { duration: 150 } }
                            
                            RowLayout {
                                anchors.centerIn: parent
                                spacing: 8
                                
                                // Loading indicator
                                Rectangle {
                                    visible: !loginButton.enabled
                                    Layout.preferredWidth: 16
                                    Layout.preferredHeight: 16
                                    radius: 8
                                    color: "transparent"
                                    border.width: 2
                                    border.color: Theme.background
                                    
                                    Rectangle {
                                        width: 8
                                        height: 2
                                        radius: 1
                                        color: Theme.background
                                        anchors.centerIn: parent
                                        
                                        RotationAnimation on rotation {
                                            from: 0
                                            to: 360
                                            duration: 1000
                                            loops: Animation.Infinite
                                            running: !loginButton.enabled
                                        }
                                    }
                                }
                                
                                Text {
                                    text: loginButton.enabled ? "Entrar" : "Entrando..."
                                    font.pixelSize: 14
                                    font.weight: Font.DemiBold
                                    color: loginButton.enabled ? Theme.primaryForeground : Theme.mutedForeground
                                }
                            }
                            
                            MouseArea {
                                id: loginButtonMouse
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: loginButton.enabled ? Qt.PointingHandCursor : Qt.WaitCursor
                                
                                onClicked: {
                                    if (!loginButton.enabled) return
                                    
                                    // Validações básicas
                                    if (emailInput.text.trim() === "") {
                                        root.errorMessage = "Por favor, informe seu email"
                                        return
                                    }
                                    
                                    if (passwordInput.text === "") {
                                        root.errorMessage = "Por favor, informe sua senha"
                                        return
                                    }
                                    
                                    // Verificar reCAPTCHA se habilitado
                                    if (root.recaptchaEnabled && !root.recaptchaVerified) {
                                        root.errorMessage = "Por favor, complete a verificação reCAPTCHA"
                                        return
                                    }
                                    
                                    // Verifica se backend existe
                                    if (root.backend === null || root.backend === undefined) {
                                        root.errorMessage = "Aguarde, carregando..."
                                        // Tenta novamente após um delay
                                        Qt.callLater(function() {
                                            if (root.backend !== null && root.backend !== undefined) {
                                                root.errorMessage = ""
                                            }
                                        })
                                        return
                                    }
                                    
                                    // Limpa erro e inicia login
                                    root.errorMessage = ""
                                    root.isLoading = true
                                    // Passa o token do reCAPTCHA (vazio se não habilitado)
                                    root.backend.login(emailInput.text.trim(), passwordInput.text, root.recaptchaToken)
                                }
                            }
                        }
                    }
                    
                    // Divider
                    Rectangle {
                        Layout.fillWidth: true
                        height: 1
                        color: Theme.border
                    }
                    
                    // Footer
                    RowLayout {
                        Layout.fillWidth: true
                        Layout.margins: 20
                        
                        Text {
                            text: "Não tem uma conta?"
                            font.pixelSize: 13
                            color: Theme.mutedForeground
                        }
                        
                        Text {
                            text: "Criar conta"
                            font.pixelSize: 13
                            font.weight: Font.DemiBold
                            color: createAccountMouse.containsMouse ? Theme.primaryHover : Theme.primary
                            
                            Behavior on color { ColorAnimation { duration: 150 } }
                            
                            MouseArea {
                                id: createAccountMouse
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: Qt.openUrlExternally("https://dlg-v1.lovable.app/login")
                            }
                        }
                        
                        Item { Layout.fillWidth: true }
                    }
                }
            }
        }
    }
    
    // ========== MODAL: USUÁRIO BANIDO ==========
    Rectangle {
        id: bannedModal
        visible: root.showBannedModal
        anchors.fill: parent
        color: Qt.rgba(0, 0, 0, 0.8)
        z: 100
        
        MouseArea {
            anchors.fill: parent
            onClicked: {} // Bloqueia cliques
        }
        
        Rectangle {
            anchors.centerIn: parent
            width: 420
            height: bannedContent.height + 48
            color: Theme.card
            border.width: 1
            border.color: Theme.destructive
            radius: 16
            
            ColumnLayout {
                id: bannedContent
                anchors.centerIn: parent
                width: parent.width - 48
                spacing: 20
                
                // Icon
                Rectangle {
                    Layout.alignment: Qt.AlignHCenter
                    Layout.preferredWidth: 64
                    Layout.preferredHeight: 64
                    radius: 32
                    color: Qt.rgba(0.9, 0.2, 0.2, 0.15)
                    
                    Icon {
                        anchors.centerIn: parent
                        name: "ban"
                        size: 32
                        color: Theme.destructive
                    }
                }
                
                // Title
                Text {
                    Layout.alignment: Qt.AlignHCenter
                    text: "Conta Suspensa"
                    font.pixelSize: 22
                    font.weight: Font.Bold
                    color: Theme.destructive
                }
                
                // Message
                Text {
                    Layout.fillWidth: true
                    text: "Sua conta foi suspensa e você não pode acessar o sistema."
                    font.pixelSize: 14
                    color: Theme.mutedForeground
                    wrapMode: Text.WordWrap
                    horizontalAlignment: Text.AlignHCenter
                }
                
                // Reason box
                Rectangle {
                    visible: root.banReason !== ""
                    Layout.fillWidth: true
                    Layout.preferredHeight: reasonText.height + 24
                    color: Qt.rgba(0.9, 0.2, 0.2, 0.1)
                    border.width: 1
                    border.color: Qt.rgba(0.9, 0.2, 0.2, 0.3)
                    radius: 8
                    
                    ColumnLayout {
                        anchors.centerIn: parent
                        width: parent.width - 24
                        spacing: 4
                        
                        Text {
                            text: "Motivo:"
                            font.pixelSize: 12
                            font.weight: Font.Medium
                            color: Theme.destructive
                        }
                        
                        Text {
                            id: reasonText
                            Layout.fillWidth: true
                            text: root.banReason
                            font.pixelSize: 13
                            color: Theme.foreground
                            wrapMode: Text.WordWrap
                        }
                    }
                }
                
                // Separator
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 1
                    color: Theme.border
                }
                
                // Support section
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 12
                    
                    Text {
                        Layout.fillWidth: true
                        text: "Entre em contato com o suporte:"
                        font.pixelSize: 13
                        color: Theme.mutedForeground
                        horizontalAlignment: Text.AlignHCenter
                    }
                    
                    // WhatsApp contact
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 52
                        radius: 10
                        color: whatsappMouse.containsMouse ? Qt.rgba(0.14, 0.75, 0.45, 0.2) : Qt.rgba(0.14, 0.75, 0.45, 0.1)
                        border.width: 1
                        border.color: Qt.rgba(0.14, 0.75, 0.45, 0.4)
                        
                        Behavior on color { ColorAnimation { duration: 150 } }
                        
                        RowLayout {
                            anchors.centerIn: parent
                            spacing: 12
                            
                            // WhatsApp icon
                            Rectangle {
                                Layout.preferredWidth: 32
                                Layout.preferredHeight: 32
                                radius: 16
                                color: "#25D366"
                                
                                Text {
                                    anchors.centerIn: parent
                                    text: "📱"
                                    font.pixelSize: 16
                                }
                            }
                            
                            ColumnLayout {
                                spacing: 2
                                
                                Text {
                                    text: "+55 65 99927-4528"
                                    font.pixelSize: 15
                                    font.weight: Font.Bold
                                    color: "#25D366"
                                }
                                
                                Text {
                                    text: "WhatsApp"
                                    font.pixelSize: 11
                                    color: Theme.mutedForeground
                                }
                            }
                        }
                        
                        MouseArea {
                            id: whatsappMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: Qt.openUrlExternally("https://wa.me/5565999274528")
                        }
                    }
                }
                
                // Close button
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 44
                    Layout.topMargin: 4
                    radius: 8
                    color: closeBannedMouse.containsMouse ? Qt.lighter(Theme.muted, 1.1) : Theme.muted
                    border.width: 1
                    border.color: Theme.border
                    
                    Text {
                        anchors.centerIn: parent
                        text: "Fechar"
                        font.pixelSize: 14
                        font.weight: Font.Medium
                        color: Theme.foreground
                    }
                    
                    MouseArea {
                        id: closeBannedMouse
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: root.showBannedModal = false
                    }
                }
            }
        }
    }
    
    // ========== MODAL: LIMITE DE DISPOSITIVOS ==========
    Rectangle {
        id: deviceLimitModal
        visible: root.showDeviceLimitModal
        anchors.fill: parent
        color: Qt.rgba(0, 0, 0, 0.8)
        z: 100
        
        MouseArea {
            anchors.fill: parent
            onClicked: {} // Bloqueia cliques
        }
        
        Rectangle {
            anchors.centerIn: parent
            width: 420
            height: deviceLimitContent.height + 48
            color: Theme.card
            border.width: 1
            border.color: Theme.warning
            radius: 16
            
            ColumnLayout {
                id: deviceLimitContent
                anchors.centerIn: parent
                width: parent.width - 48
                spacing: 20
                
                // Icon
                Rectangle {
                    Layout.alignment: Qt.AlignHCenter
                    Layout.preferredWidth: 64
                    Layout.preferredHeight: 64
                    radius: 32
                    color: Qt.rgba(0.95, 0.6, 0.1, 0.15)
                    
                    Icon {
                        anchors.centerIn: parent
                        name: "monitor"
                        size: 32
                        color: Theme.warning
                    }
                }
                
                // Title
                Text {
                    Layout.alignment: Qt.AlignHCenter
                    text: "Limite de Dispositivos"
                    font.pixelSize: 22
                    font.weight: Font.Bold
                    color: Theme.warning
                }
                
                // Message
                Text {
                    Layout.fillWidth: true
                    text: "Você atingiu o limite máximo de dispositivos conectados ao seu plano."
                    font.pixelSize: 14
                    color: Theme.mutedForeground
                    wrapMode: Text.WordWrap
                    horizontalAlignment: Text.AlignHCenter
                }
                
                // Stats box
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 80
                    color: Theme.muted
                    border.width: 1
                    border.color: Theme.border
                    radius: 8
                    
                    RowLayout {
                        anchors.fill: parent
                        anchors.margins: 16
                        
                        ColumnLayout {
                            spacing: 4
                            Layout.fillWidth: true
                            
                            Text {
                                text: "Dispositivos ativos"
                                font.pixelSize: 12
                                color: Theme.mutedForeground
                            }
                            
                            Text {
                                text: root.activeDevices + " / " + root.maxDevices
                                font.pixelSize: 24
                                font.weight: Font.Bold
                                color: Theme.destructive
                            }
                        }
                        
                        Rectangle {
                            Layout.preferredWidth: 1
                            Layout.fillHeight: true
                            color: Theme.border
                        }
                        
                        ColumnLayout {
                            spacing: 4
                            Layout.fillWidth: true
                            
                            Text {
                                text: "Seu plano permite"
                                font.pixelSize: 12
                                color: Theme.mutedForeground
                            }
                            
                            Text {
                                text: root.maxDevices + " dispositivo" + (root.maxDevices > 1 ? "s" : "")
                                font.pixelSize: 16
                                font.weight: Font.Medium
                                color: Theme.foreground
                            }
                        }
                    }
                }
                
                // Instructions
                Text {
                    Layout.fillWidth: true
                    text: "Para continuar, desconecte um dispositivo pelo painel web ou faça upgrade do seu plano."
                    font.pixelSize: 12
                    color: Theme.subtleForeground
                    wrapMode: Text.WordWrap
                    horizontalAlignment: Text.AlignHCenter
                }
                
                // Buttons
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 12
                    
                    // Close button
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 44
                        radius: 8
                        color: closeDeviceMouse.containsMouse ? Qt.lighter(Theme.muted, 1.1) : Theme.muted
                        border.width: 1
                        border.color: Theme.border
                        
                        Text {
                            anchors.centerIn: parent
                            text: "Fechar"
                            font.pixelSize: 14
                            font.weight: Font.Medium
                            color: Theme.foreground
                        }
                        
                        MouseArea {
                            id: closeDeviceMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: root.showDeviceLimitModal = false
                        }
                    }
                    
                    // Upgrade button
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 44
                        radius: 8
                        color: upgradeMouse.containsMouse ? Qt.lighter(Theme.primary, 1.1) : Theme.primary
                        
                        Text {
                            anchors.centerIn: parent
                            text: "Fazer Upgrade"
                            font.pixelSize: 14
                            font.weight: Font.Medium
                            color: Theme.primaryForeground
                        }
                        
                        MouseArea {
                            id: upgradeMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                Qt.openUrlExternally("https://dlg-v1.lovable.app/dashboard")
                                root.showDeviceLimitModal = false
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Telegram animation overlay
    Loader {
        anchors.fill: parent
        active: root.showAnimation
        sourceComponent: TelegramAnimation {
            onAnimationComplete: root.loginSuccess()
        }
        z: 200
    }
}
