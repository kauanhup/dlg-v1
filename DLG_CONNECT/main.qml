import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import QtQuick.Window 2.15
import DLGConnect 1.0
import "pages"
import "components"

ApplicationWindow {
    id: mainWindow
    visible: true
    width: 1000
    height: 600
    minimumWidth: 800
    minimumHeight: 500
    title: "DLG Connect v2.0.1"
    color: "#080a0f"
    
    // Backend instance - accessible to all pages
    property alias appBackend: backendInstance
    
    Backend {
        id: backendInstance
    }

    // Stack view for navigation
    StackView {
        id: stackView
        anchors.fill: parent
        initialItem: loginPage
        
        // Smooth fade + slide transition
        pushEnter: Transition {
            ParallelAnimation {
                PropertyAnimation {
                    property: "opacity"
                    from: 0
                    to: 1
                    duration: 300
                    easing.type: Easing.OutCubic
                }
                PropertyAnimation {
                    property: "x"
                    from: 30
                    to: 0
                    duration: 300
                    easing.type: Easing.OutCubic
                }
            }
        }
        pushExit: Transition {
            ParallelAnimation {
                PropertyAnimation {
                    property: "opacity"
                    from: 1
                    to: 0
                    duration: 300
                    easing.type: Easing.OutCubic
                }
                PropertyAnimation {
                    property: "x"
                    from: 0
                    to: -30
                    duration: 300
                    easing.type: Easing.OutCubic
                }
            }
        }
        replaceEnter: Transition {
            ParallelAnimation {
                PropertyAnimation {
                    property: "opacity"
                    from: 0
                    to: 1
                    duration: 350
                    easing.type: Easing.OutCubic
                }
                PropertyAnimation {
                    property: "scale"
                    from: 0.95
                    to: 1
                    duration: 350
                    easing.type: Easing.OutCubic
                }
            }
        }
        replaceExit: Transition {
            ParallelAnimation {
                PropertyAnimation {
                    property: "opacity"
                    from: 1
                    to: 0
                    duration: 350
                    easing.type: Easing.OutCubic
                }
                PropertyAnimation {
                    property: "scale"
                    from: 1
                    to: 1.02
                    duration: 350
                    easing.type: Easing.OutCubic
                }
            }
        }
    }

    // Login page component
    Component {
        id: loginPage
        Login {
            backend: mainWindow.appBackend
            onLoginSuccess: mainWindow.navigateToMain()
        }
    }

    // Main app component (after login)
    Component {
        id: mainApp
        MainLayout {
            backend: mainWindow.appBackend
        }
    }

    // Navigation function
    function navigateToMain() {
        stackView.replace(mainApp)
    }

    function navigateToLogin() {
        stackView.replace(loginPage)
    }
}
