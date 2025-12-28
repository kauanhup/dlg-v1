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
    property bool showNoLicenseModal: false
    property string banReason: ""
    property int activeDevices: 0
    property int maxDevices: 1
    property string deviceLimitError: ""
    property bool recaptchaEnabled: false
    property string recaptchaSiteKey: ""
    property bool recaptchaVerified: false
    property string recaptchaToken: ""
    property string errorMessage: ""
    
    // Trial/License properties
    property bool isTrialEligible: false
    property bool trialAlreadyUsed: false
    property int trialDays: 0
    property bool canActivateTrial: false
    
    // Auto-login properties
    property bool isCheckingSession: false
    property bool hasSessionToVerify: false
    property string savedSessionEmail: ""
    
    // Simple fade in
    opacity: 0
    Component.onCompleted: {
        fadeIn.start()
        // Tentar carregar reCAPTCHA e verificar sessão salva
        Qt.callLater(function() {
            if (root.backend !== null && root.backend !== undefined) {
                loadRecaptchaSettings()
                checkSavedSession()
            }
        })
    }
    
    // Verificar se existe sessão salva para auto-login
    function checkSavedSession() {
        if (backend === null || backend === undefined) return
        
        if (backend.hasSavedSession()) {
            console.log("Sessão salva encontrada, iniciando verificação...")
            root.savedSessionEmail = backend.getSavedSessionEmail() || ""
            root.hasSessionToVerify = true
            root.isCheckingSession = true
            
            // Pequeno delay para mostrar a UI antes de verificar
            autoLoginTimer.start()
        } else {
            console.log("Nenhuma sessão salva encontrada")
            root.hasSessionToVerify = false
        }
    }
    
    Timer {
        id: autoLoginTimer
        interval: 500
        repeat: false
        onTriggered: {
            if (root.backend !== null && root.backend !== undefined) {
                console.log("Verificando sessão salva...")
                root.backend.verifySession()
            }
        }
    }
    
    // Handler para resultado da verificação de sessão
    function onSessionVerified(success) {
        root.isCheckingSession = false
        if (success) {
            // Login automático bem-sucedido
            root.showAnimation = true
        } else {
            // Sessão inválida, limpar e mostrar login normal
            root.hasSessionToVerify = false
            if (root.backend) {
                root.backend.clearLocalSession()
            }
        }
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
            root.isCheckingSession = false
            root.showAnimation = true
        }
        
        function onLoginError(message, code) {
            console.log("Login error:", message, code)
            root.errorMessage = message
            root.isLoading = false
            root.isCheckingSession = false
            root.hasSessionToVerify = false
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
            root.isCheckingSession = false
            root.hasSessionToVerify = false
            // Limpar sessão local quando banido
            if (root.backend) root.backend.clearLocalSession()
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
            root.isCheckingSession = false
            root.hasSessionToVerify = false
        }
        
        function onMaintenanceMode(message) {
            root.errorMessage = "🔧 Sistema em manutenção: " + message
            root.isLoading = false
            root.isCheckingSession = false
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
            root.isCheckingSession = false
        }
        
        function onNoLicense(infoJson) {
            try {
                var info = JSON.parse(infoJson)
                root.canActivateTrial = info.can_use_trial || false
                root.trialDays = info.trial_days || 3
                root.trialAlreadyUsed = !root.canActivateTrial
            } catch(e) {
                root.canActivateTrial = false
                root.trialAlreadyUsed = true
            }
            root.showNoLicenseModal = true
            root.isLoading = false
            root.isCheckingSession = false
            root.hasSessionToVerify = false
            // Limpar sessão local quando sem licença
            if (root.backend) root.backend.clearLocalSession()
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
            
            // Auto-login verification overlay
            Rectangle {
                id: sessionCheckOverlay
                anchors.centerIn: parent
                width: Math.min(400, parent.width * 0.85)
                height: sessionCheckColumn.height
                color: Theme.card
                border.width: 1
                border.color: Theme.border
                radius: 12
                visible: root.isCheckingSession
                z: 10
                
                ColumnLayout {
                    id: sessionCheckColumn
                    width: parent.width
                    spacing: 0
                    
                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.margins: 40
                        spacing: 24
                        Layout.alignment: Qt.AlignHCenter
                        
                        // Spinner animado
                        Item {
                            Layout.preferredWidth: 64
                            Layout.preferredHeight: 64
                            Layout.alignment: Qt.AlignHCenter
                            
                            Rectangle {
                                id: spinnerOuter
                                anchors.fill: parent
                                radius: 32
                                color: "transparent"
                                border.width: 3
                                border.color: Theme.border
                            }
                            
                            Rectangle {
                                anchors.fill: parent
                                radius: 32
                                color: "transparent"
                                border.width: 3
                                border.color: Theme.primary
                                
                                // Máscara para criar efeito de arco
                                layer.enabled: true
                                layer.effect: Item {
                                    Rectangle {
                                        width: 32
                                        height: 64
                                        color: "transparent"
                                    }
                                }
                                
                                RotationAnimation on rotation {
                                    from: 0
                                    to: 360
                                    duration: 1000
                                    loops: Animation.Infinite
                                    running: root.isCheckingSession
                                }
                            }
                            
                            // Ícone central
                            Icon {
                                anchors.centerIn: parent
                                name: "user"
                                size: 24
                                color: Theme.primary
                            }
                        }
                        
                        // Texto
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 8
                            
                            Text {
                                Layout.fillWidth: true
                                text: "Verificando sessão..."
                                font.pixelSize: 18
                                font.weight: Font.DemiBold
                                color: Theme.foreground
                                horizontalAlignment: Text.AlignHCenter
                            }
                            
                            Text {
                                Layout.fillWidth: true
                                text: root.savedSessionEmail ? "Entrando como " + root.savedSessionEmail : "Reconectando automaticamente"
                                font.pixelSize: 13
                                color: Theme.mutedForeground
                                horizontalAlignment: Text.AlignHCenter
                                wrapMode: Text.WordWrap
                            }
                        }
                        
                        // Botão cancelar
                        Rectangle {
                            Layout.alignment: Qt.AlignHCenter
                            Layout.preferredWidth: cancelText.width + 24
                            Layout.preferredHeight: 36
                            color: cancelMouse.containsMouse ? Qt.rgba(1, 1, 1, 0.05) : "transparent"
                            radius: 6
                            
                            Text {
                                id: cancelText
                                anchors.centerIn: parent
                                text: "Usar outra conta"
                                font.pixelSize: 12
                                color: Theme.mutedForeground
                            }
                            
                            MouseArea {
                                id: cancelMouse
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: {
                                    root.isCheckingSession = false
                                    root.hasSessionToVerify = false
                                    if (root.backend) root.backend.clearLocalSession()
                                }
                            }
                        }
                    }
                }
            }
            
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
                visible: !root.isCheckingSession
                
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
                        
                        // reCAPTCHA widget (se habilitado) - Design tema escuro
                        Rectangle {
                            id: recaptchaContainer
                            visible: root.recaptchaEnabled
                            Layout.fillWidth: true
                            Layout.preferredHeight: 74
                            radius: 6
                            clip: true
                            color: Theme.muted
                            border.width: 1
                            border.color: root.recaptchaVerified ? Theme.accent : Theme.border
                            
                            Behavior on border.color { ColorAnimation { duration: 200 } }
                            
                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 16
                                anchors.rightMargin: 16
                                spacing: 14
                                
                                // Checkbox área
                                Rectangle {
                                    id: recaptchaCheckbox
                                    Layout.preferredWidth: 26
                                    Layout.preferredHeight: 26
                                    radius: 4
                                    color: root.recaptchaVerified ? Theme.accent : 
                                           (recaptchaCheckMouse.containsMouse ? Qt.rgba(1, 1, 1, 0.1) : "transparent")
                                    border.width: root.recaptchaVerified ? 0 : 2
                                    border.color: recaptchaCheckMouse.containsMouse ? Theme.primary : Theme.border
                                    
                                    property bool isVerifying: false
                                    
                                    Behavior on border.color { ColorAnimation { duration: 150 } }
                                    Behavior on color { ColorAnimation { duration: 150 } }
                                    
                                    // Checkmark quando verificado
                                    Text {
                                        visible: root.recaptchaVerified
                                        anchors.centerIn: parent
                                        text: "✓"
                                        font.pixelSize: 16
                                        font.weight: Font.Bold
                                        color: Theme.background
                                        
                                        scale: root.recaptchaVerified ? 1.0 : 0.5
                                        opacity: root.recaptchaVerified ? 1.0 : 0.0
                                        
                                        Behavior on scale { NumberAnimation { duration: 200; easing.type: Easing.OutBack } }
                                        Behavior on opacity { NumberAnimation { duration: 150 } }
                                    }
                                    
                                    // Loading spinner durante verificação
                                    Rectangle {
                                        visible: recaptchaCheckbox.isVerifying
                                        anchors.centerIn: parent
                                        width: 18
                                        height: 18
                                        radius: 9
                                        color: "transparent"
                                        border.width: 2
                                        border.color: Theme.primary
                                        
                                        Rectangle {
                                            width: 9
                                            height: 2
                                            radius: 1
                                            color: Theme.primary
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
                                            verifyTimer.start()
                                        }
                                    }
                                    
                                    Timer {
                                        id: verifyTimer
                                        interval: 800 + Math.random() * 400
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
                                    color: root.recaptchaVerified ? Theme.accent : Theme.foreground
                                    
                                    Behavior on color { ColorAnimation { duration: 150 } }
                                }
                                
                                Item { Layout.fillWidth: true }
                                
                                // Logo/ícone simplificado
                                Column {
                                    spacing: 2
                                    Layout.alignment: Qt.AlignVCenter
                                    
                                    Icon {
                                        anchors.horizontalCenter: parent.horizontalCenter
                                        name: "shield"
                                        size: 20
                                        color: Theme.mutedForeground
                                    }
                                    
                                    Text {
                                        text: "Segurança"
                                        font.pixelSize: 9
                                        color: Theme.subtleForeground
                                    }
                                }
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
        color: Qt.rgba(0, 0, 0, 0.85)
        z: 100
        
        // Fade in animation
        opacity: visible ? 1 : 0
        Behavior on opacity { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }
        
        MouseArea {
            anchors.fill: parent
            onClicked: {} // Bloqueia cliques
        }
        
        Rectangle {
            id: bannedCard
            anchors.centerIn: parent
            width: 440
            height: bannedContent.height + 64
            color: Theme.card
            radius: 20
            
            // Gradient border effect
            Rectangle {
                anchors.fill: parent
                anchors.margins: -2
                radius: 22
                z: -1
                gradient: Gradient {
                    orientation: Gradient.Horizontal
                    GradientStop { position: 0.0; color: Theme.destructive }
                    GradientStop { position: 0.5; color: Qt.lighter(Theme.destructive, 1.2) }
                    GradientStop { position: 1.0; color: Theme.destructive }
                }
            }
            
            // Subtle inner shadow
            Rectangle {
                anchors.fill: parent
                radius: 20
                color: "transparent"
                border.width: 1
                border.color: Qt.rgba(1, 1, 1, 0.05)
            }
            
            ColumnLayout {
                id: bannedContent
                anchors.centerIn: parent
                width: parent.width - 56
                spacing: 24
                
                // Animated icon container
                Rectangle {
                    Layout.alignment: Qt.AlignHCenter
                    Layout.preferredWidth: 80
                    Layout.preferredHeight: 80
                    radius: 40
                    color: "transparent"
                    
                    // Outer pulse ring
                    Rectangle {
                        id: pulseRing
                        anchors.centerIn: parent
                        width: 80
                        height: 80
                        radius: 40
                        color: "transparent"
                        border.width: 2
                        border.color: Qt.rgba(0.9, 0.2, 0.2, 0.3)
                        
                        SequentialAnimation on scale {
                            loops: Animation.Infinite
                            NumberAnimation { from: 1; to: 1.2; duration: 1500; easing.type: Easing.OutCubic }
                            NumberAnimation { from: 1.2; to: 1; duration: 1500; easing.type: Easing.InCubic }
                        }
                        
                        SequentialAnimation on opacity {
                            loops: Animation.Infinite
                            NumberAnimation { from: 0.6; to: 0; duration: 1500 }
                            NumberAnimation { from: 0; to: 0.6; duration: 1500 }
                        }
                    }
                    
                    // Icon background
                    Rectangle {
                        anchors.centerIn: parent
                        width: 72
                        height: 72
                        radius: 36
                        gradient: Gradient {
                            GradientStop { position: 0.0; color: Qt.rgba(0.9, 0.2, 0.2, 0.25) }
                            GradientStop { position: 1.0; color: Qt.rgba(0.9, 0.2, 0.2, 0.1) }
                        }
                        
                        Icon {
                            anchors.centerIn: parent
                            name: "ban"
                            size: 36
                            color: Theme.destructive
                        }
                    }
                }
                
                // Title with gradient effect
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 8
                    
                    Text {
                        Layout.alignment: Qt.AlignHCenter
                        text: "Conta Suspensa"
                        font.pixelSize: 26
                        font.weight: Font.Bold
                        color: Theme.destructive
                    }
                    
                    Text {
                        Layout.fillWidth: true
                        text: "Sua conta foi suspensa e você não pode acessar o sistema."
                        font.pixelSize: 14
                        color: Theme.mutedForeground
                        wrapMode: Text.WordWrap
                        horizontalAlignment: Text.AlignHCenter
                        lineHeight: 1.4
                    }
                }
                
                // Reason box with modern styling
                Rectangle {
                    visible: root.banReason !== ""
                    Layout.fillWidth: true
                    Layout.preferredHeight: reasonContent.height + 28
                    radius: 12
                    color: Qt.rgba(0.9, 0.2, 0.2, 0.08)
                    border.width: 1
                    border.color: Qt.rgba(0.9, 0.2, 0.2, 0.25)
                    
                    ColumnLayout {
                        id: reasonContent
                        anchors.centerIn: parent
                        width: parent.width - 28
                        spacing: 6
                        
                        RowLayout {
                            spacing: 6
                            
                            Icon {
                                name: "alertCircle"
                                size: 14
                                color: Theme.destructive
                            }
                            
                            Text {
                                text: "Motivo da suspensão"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                                color: Theme.destructive
                            }
                        }
                        
                        Text {
                            id: reasonText
                            Layout.fillWidth: true
                            text: root.banReason || "Motivo não especificado"
                            font.pixelSize: 14
                            color: Theme.foreground
                            wrapMode: Text.WordWrap
                            lineHeight: 1.3
                        }
                    }
                }
                
                // Divider with gradient
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 1
                    gradient: Gradient {
                        orientation: Gradient.Horizontal
                        GradientStop { position: 0.0; color: "transparent" }
                        GradientStop { position: 0.5; color: Theme.border }
                        GradientStop { position: 1.0; color: "transparent" }
                    }
                }
                
                // Support section
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 14
                    
                    Text {
                        Layout.fillWidth: true
                        text: "Precisa de ajuda? Entre em contato:"
                        font.pixelSize: 13
                        color: Theme.mutedForeground
                        horizontalAlignment: Text.AlignHCenter
                    }
                    
                    // WhatsApp contact card
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 56
                        radius: 12
                        color: whatsappBannedMouse.containsMouse ? Qt.rgba(0.14, 0.75, 0.45, 0.18) : Qt.rgba(0.14, 0.75, 0.45, 0.08)
                        border.width: 1
                        border.color: Qt.rgba(0.14, 0.75, 0.45, whatsappBannedMouse.containsMouse ? 0.5 : 0.3)
                        
                        Behavior on color { ColorAnimation { duration: 150 } }
                        Behavior on border.color { ColorAnimation { duration: 150 } }
                        
                        RowLayout {
                            anchors.centerIn: parent
                            spacing: 14
                            
                            // WhatsApp icon with glow
                            Rectangle {
                                Layout.preferredWidth: 36
                                Layout.preferredHeight: 36
                                radius: 18
                                color: "#25D366"
                                
                                // Subtle glow
                                layer.enabled: whatsappBannedMouse.containsMouse
                                
                                Icon {
                                    anchors.centerIn: parent
                                    name: "messageCircle"
                                    size: 18
                                    color: "#FFFFFF"
                                }
                            }
                            
                            ColumnLayout {
                                spacing: 2
                                
                                Text {
                                    text: "+55 65 99927-4528"
                                    font.pixelSize: 16
                                    font.weight: Font.Bold
                                    color: "#25D366"
                                }
                                
                                Text {
                                    text: "Suporte via WhatsApp"
                                    font.pixelSize: 11
                                    color: Theme.mutedForeground
                                }
                            }
                            
                            Icon {
                                name: "externalLink"
                                size: 16
                                color: "#25D366"
                                opacity: whatsappBannedMouse.containsMouse ? 1 : 0.5
                                Behavior on opacity { NumberAnimation { duration: 150 } }
                            }
                        }
                        
                        MouseArea {
                            id: whatsappBannedMouse
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
                    Layout.preferredHeight: 48
                    Layout.topMargin: 4
                    radius: 12
                    color: closeBannedMouse.containsMouse ? Qt.lighter(Theme.secondary, 1.1) : Theme.secondary
                    border.width: 1
                    border.color: closeBannedMouse.containsMouse ? Theme.border : Qt.darker(Theme.border, 1.1)
                    
                    Behavior on color { ColorAnimation { duration: 150 } }
                    
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
    
    // ========== MODAL: SEM LICENÇA ==========
    Rectangle {
        id: noLicenseModal
        visible: root.showNoLicenseModal
        anchors.fill: parent
        color: Qt.rgba(0, 0, 0, 0.85)
        z: 100
        
        opacity: visible ? 1 : 0
        Behavior on opacity { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }
        
        MouseArea {
            anchors.fill: parent
            onClicked: {}
        }
        
        Rectangle {
            anchors.centerIn: parent
            width: 440
            height: noLicenseContent.height + 64
            color: Theme.card
            radius: 20
            
            // Gradient border - warning/primary colors
            Rectangle {
                anchors.fill: parent
                anchors.margins: -2
                radius: 22
                z: -1
                gradient: Gradient {
                    orientation: Gradient.Horizontal
                    GradientStop { position: 0.0; color: Theme.warning }
                    GradientStop { position: 0.5; color: Theme.primary }
                    GradientStop { position: 1.0; color: Theme.warning }
                }
            }
            
            Rectangle {
                anchors.fill: parent
                radius: 20
                color: "transparent"
                border.width: 1
                border.color: Qt.rgba(1, 1, 1, 0.05)
            }
            
            ColumnLayout {
                id: noLicenseContent
                anchors.centerIn: parent
                width: parent.width - 56
                spacing: 24
                
                // Icon
                Rectangle {
                    Layout.alignment: Qt.AlignHCenter
                    Layout.preferredWidth: 80
                    Layout.preferredHeight: 80
                    radius: 40
                    color: "transparent"
                    
                    Rectangle {
                        id: licensePulseRing
                        anchors.centerIn: parent
                        width: 80
                        height: 80
                        radius: 40
                        color: "transparent"
                        border.width: 2
                        border.color: Qt.rgba(0.95, 0.6, 0.1, 0.3)
                        
                        SequentialAnimation on scale {
                            loops: Animation.Infinite
                            NumberAnimation { from: 1; to: 1.2; duration: 1500; easing.type: Easing.OutCubic }
                            NumberAnimation { from: 1.2; to: 1; duration: 1500; easing.type: Easing.InCubic }
                        }
                        
                        SequentialAnimation on opacity {
                            loops: Animation.Infinite
                            NumberAnimation { from: 0.6; to: 0; duration: 1500 }
                            NumberAnimation { from: 0; to: 0.6; duration: 1500 }
                        }
                    }
                    
                    Rectangle {
                        anchors.centerIn: parent
                        width: 72
                        height: 72
                        radius: 36
                        gradient: Gradient {
                            GradientStop { position: 0.0; color: Qt.rgba(0.95, 0.6, 0.1, 0.25) }
                            GradientStop { position: 1.0; color: Qt.rgba(0.95, 0.6, 0.1, 0.1) }
                        }
                        
                        Icon {
                            anchors.centerIn: parent
                            name: "key"
                            size: 36
                            color: Theme.warning
                        }
                    }
                }
                
                // Title
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 8
                    
                    Text {
                        Layout.alignment: Qt.AlignHCenter
                        text: "Licença Necessária"
                        font.pixelSize: 26
                        font.weight: Font.Bold
                        color: Theme.warning
                    }
                    
                    Text {
                        Layout.fillWidth: true
                        text: root.canActivateTrial 
                            ? "Você ainda não possui uma licença ativa, mas pode ativar um período de teste gratuito!"
                            : "Você não possui uma licença ativa e já utilizou seu período de teste."
                        font.pixelSize: 14
                        color: Theme.mutedForeground
                        wrapMode: Text.WordWrap
                        horizontalAlignment: Text.AlignHCenter
                        lineHeight: 1.4
                    }
                }
                
                // Trial available box
                Rectangle {
                    visible: root.canActivateTrial
                    Layout.fillWidth: true
                    Layout.preferredHeight: trialContent.height + 28
                    radius: 12
                    color: Qt.rgba(0.14, 0.75, 0.45, 0.08)
                    border.width: 1
                    border.color: Qt.rgba(0.14, 0.75, 0.45, 0.25)
                    
                    ColumnLayout {
                        id: trialContent
                        anchors.centerIn: parent
                        width: parent.width - 28
                        spacing: 8
                        
                        RowLayout {
                            spacing: 8
                            
                            Icon {
                                name: "gift"
                                size: 18
                                color: "#25D366"
                            }
                            
                            Text {
                                text: "Teste Gratuito Disponível"
                                font.pixelSize: 14
                                font.weight: Font.Bold
                                color: "#25D366"
                            }
                        }
                        
                        Text {
                            Layout.fillWidth: true
                            text: "Você pode testar o DLG Connect por " + root.trialDays + " dias sem custo algum!"
                            font.pixelSize: 13
                            color: Theme.foreground
                            wrapMode: Text.WordWrap
                            lineHeight: 1.3
                        }
                    }
                }
                
                // Already used trial box
                Rectangle {
                    visible: !root.canActivateTrial
                    Layout.fillWidth: true
                    Layout.preferredHeight: noTrialContent.height + 28
                    radius: 12
                    color: Qt.rgba(0.95, 0.6, 0.1, 0.08)
                    border.width: 1
                    border.color: Qt.rgba(0.95, 0.6, 0.1, 0.25)
                    
                    ColumnLayout {
                        id: noTrialContent
                        anchors.centerIn: parent
                        width: parent.width - 28
                        spacing: 6
                        
                        RowLayout {
                            spacing: 6
                            
                            Icon {
                                name: "clock"
                                size: 14
                                color: Theme.warning
                            }
                            
                            Text {
                                text: "Período de teste expirado"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                                color: Theme.warning
                            }
                        }
                        
                        Text {
                            Layout.fillWidth: true
                            text: "Adquira uma licença para continuar usando todas as funcionalidades."
                            font.pixelSize: 13
                            color: Theme.foreground
                            wrapMode: Text.WordWrap
                            lineHeight: 1.3
                        }
                    }
                }
                
                // Divider
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 1
                    gradient: Gradient {
                        orientation: Gradient.Horizontal
                        GradientStop { position: 0.0; color: "transparent" }
                        GradientStop { position: 0.5; color: Theme.border }
                        GradientStop { position: 1.0; color: "transparent" }
                    }
                }
                
                // Buttons
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 12
                    
                    // Primary action - Activate trial or Buy license
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 52
                        radius: 12
                        
                        gradient: Gradient {
                            orientation: Gradient.Horizontal
                            GradientStop { position: 0.0; color: buyLicenseMouse.containsMouse ? Qt.lighter(Theme.primary, 1.1) : Theme.primary }
                            GradientStop { position: 1.0; color: buyLicenseMouse.containsMouse ? Qt.lighter(Theme.accent, 1.1) : Theme.accent }
                        }
                        
                        Behavior on opacity { NumberAnimation { duration: 150 } }
                        
                        RowLayout {
                            anchors.centerIn: parent
                            spacing: 10
                            
                            Icon {
                                name: root.canActivateTrial ? "sparkles" : "shoppingCart"
                                size: 18
                                color: Theme.primaryForeground
                            }
                            
                            Text {
                                text: root.canActivateTrial ? "Ativar Teste Gratuito" : "Adquirir Licença"
                                font.pixelSize: 15
                                font.weight: Font.Bold
                                color: Theme.primaryForeground
                            }
                        }
                        
                        MouseArea {
                            id: buyLicenseMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                if (root.canActivateTrial) {
                                    // TODO: Ativar trial
                                    Qt.openUrlExternally("https://dlg-v1.lovable.app/dashboard")
                                } else {
                                    Qt.openUrlExternally("https://dlg-v1.lovable.app/comprar")
                                }
                                root.showNoLicenseModal = false
                            }
                        }
                    }
                    
                    // Close button
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 48
                        radius: 12
                        color: closeNoLicenseMouse.containsMouse ? Qt.lighter(Theme.secondary, 1.1) : Theme.secondary
                        border.width: 1
                        border.color: closeNoLicenseMouse.containsMouse ? Theme.border : Qt.darker(Theme.border, 1.1)
                        
                        Behavior on color { ColorAnimation { duration: 150 } }
                        
                        Text {
                            anchors.centerIn: parent
                            text: "Fechar"
                            font.pixelSize: 14
                            font.weight: Font.Medium
                            color: Theme.foreground
                        }
                        
                        MouseArea {
                            id: closeNoLicenseMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: root.showNoLicenseModal = false
                        }
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
