import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import QtWebEngine 1.10
import QtWebChannel 1.0
import ".."
import "../components"

Rectangle {
    id: root
    color: Theme.background
    
    // Backend property - injected from parent
    property var backend: null
    
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
    }
    
    NumberAnimation {
        id: fadeIn
        target: root
        property: "opacity"
        from: 0; to: 1
        duration: 300
        easing.type: Easing.OutCubic
    }
    
    // Connections com o backend
    Connections {
        target: root.backend
        enabled: root.backend !== null
        
        function onLoginSuccess(userData) {
            console.log("Login success:", userData)
            root.showAnimation = true
        }
        
        function onLoginError(message, code) {
            console.log("Login error:", message, code)
            root.errorMessage = message
            loginButton.enabled = true
        }
        
        function onUserBanned(reason) {
            root.banReason = reason
            root.showBannedModal = true
            loginButton.enabled = true
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
            loginButton.enabled = true
        }
        
        function onMaintenanceMode(message) {
            root.errorMessage = "🔧 Sistema em manutenção: " + message
            loginButton.enabled = true
        }
        
        function onTrialAvailable(infoJson) {
            try {
                var info = JSON.parse(infoJson)
                root.isTrialEligible = true
                root.trialDays = info.trial_days || 3
                // Mostra modal de trial disponível ou redireciona
                root.showAnimation = true  // Deixa entrar e mostrar opção de trial
            } catch(e) {
                console.log("Erro ao parsear trial:", e)
            }
            loginButton.enabled = true
        }
        
        function onNoLicense(message) {
            root.errorMessage = message
            root.trialAlreadyUsed = true
            loginButton.enabled = true
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
                        
                        // reCAPTCHA widget (se habilitado)
                        Rectangle {
                            visible: root.recaptchaEnabled
                            Layout.fillWidth: true
                            Layout.preferredHeight: root.recaptchaVerified ? 60 : 90
                            color: Theme.muted
                            border.width: 1
                            border.color: root.recaptchaVerified ? Theme.accent : Theme.border
                            radius: 8
                            clip: true
                            
                            Behavior on Layout.preferredHeight { NumberAnimation { duration: 200 } }
                            
                            // Estado verificado
                            RowLayout {
                                visible: root.recaptchaVerified
                                anchors.fill: parent
                                anchors.margins: 16
                                spacing: 12
                                
                                Rectangle {
                                    Layout.preferredWidth: 28
                                    Layout.preferredHeight: 28
                                    radius: 14
                                    color: Theme.accent
                                    
                                    Icon {
                                        anchors.centerIn: parent
                                        name: "check"
                                        size: 16
                                        color: Theme.background
                                    }
                                }
                                
                                Text {
                                    text: "Verificação concluída"
                                    font.pixelSize: 14
                                    font.weight: Font.Medium
                                    color: Theme.accent
                                }
                                
                                Item { Layout.fillWidth: true }
                                
                                Text {
                                    text: "✓"
                                    font.pixelSize: 18
                                    color: Theme.accent
                                }
                            }
                            
                            // WebView para reCAPTCHA
                            WebEngineView {
                                id: recaptchaWebView
                                visible: !root.recaptchaVerified && root.recaptchaEnabled
                                anchors.fill: parent
                                anchors.margins: 4
                                backgroundColor: "transparent"
                                
                                Component.onCompleted: {
                                    if (root.recaptchaEnabled && root.recaptchaSiteKey) {
                                        loadRecaptchaHtml()
                                    }
                                }
                                
                                function loadRecaptchaHtml() {
                                    var html = '<!DOCTYPE html>' +
                                        '<html><head>' +
                                        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                                        '<script src="https://www.google.com/recaptcha/api.js" async defer></script>' +
                                        '<style>' +
                                        'body { margin: 0; padding: 8px; background: transparent; display: flex; justify-content: center; }' +
                                        '.g-recaptcha { transform: scale(0.85); transform-origin: center; }' +
                                        '</style>' +
                                        '</head><body>' +
                                        '<div class="g-recaptcha" data-sitekey="' + root.recaptchaSiteKey + '" data-callback="onVerify" data-theme="dark"></div>' +
                                        '<script>' +
                                        'function onVerify(token) {' +
                                        '  window.recaptchaChannel.postMessage(token);' +
                                        '}' +
                                        '</script>' +
                                        '</body></html>';
                                    loadHtml(html)
                                }
                                
                                webChannel: WebChannel {
                                    id: recaptchaChannel
                                    registeredObjects: [recaptchaHandler]
                                }
                            }
                            
                            // Handler para receber o token do reCAPTCHA
                            QtObject {
                                id: recaptchaHandler
                                WebChannel.id: "recaptchaChannel"
                                
                                function postMessage(token) {
                                    console.log("reCAPTCHA token received")
                                    root.recaptchaToken = token
                                    root.recaptchaVerified = true
                                }
                            }
                            
                            // Fallback: botão manual caso WebView não funcione
                            Rectangle {
                                visible: !root.recaptchaVerified && !recaptchaWebView.visible
                                anchors.fill: parent
                                color: "transparent"
                                
                                RowLayout {
                                    anchors.centerIn: parent
                                    spacing: 12
                                    
                                    Rectangle {
                                        Layout.preferredWidth: 24
                                        Layout.preferredHeight: 24
                                        radius: 4
                                        color: "transparent"
                                        border.width: 2
                                        border.color: Theme.border
                                        
                                        MouseArea {
                                            anchors.fill: parent
                                            cursorShape: Qt.PointingHandCursor
                                            onClicked: {
                                                // Fallback: marca como verificado (para testes)
                                                root.recaptchaVerified = true
                                            }
                                        }
                                    }
                                    
                                    Text {
                                        text: "Não sou um robô"
                                        font.pixelSize: 14
                                        color: Theme.foreground
                                    }
                                    
                                    Item { Layout.fillWidth: true }
                                    
                                    Text {
                                        text: "reCAPTCHA"
                                        font.pixelSize: 10
                                        color: Theme.mutedForeground
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
                            color: loginButtonMouse.containsMouse && enabled ? 
                                   Qt.lighter(Theme.primary, loginButtonMouse.pressed ? 0.9 : 1.1) : 
                                   (enabled ? Theme.primary : Theme.muted)
                            
                            property bool enabled: true
                            
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
                                    
                                    // Limpa erro e inicia login
                                    root.errorMessage = ""
                                    loginButton.enabled = false
                                    root.backend.login(emailInput.text.trim(), passwordInput.text)
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
