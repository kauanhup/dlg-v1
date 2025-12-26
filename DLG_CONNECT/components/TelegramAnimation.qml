import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import ".."

Rectangle {
    id: root
    color: "#0a0a0f"
    
    signal animationComplete()
    
    property int stage: 0
    property real progress: 0
    
    // Removed "Bem-vindo" - only 4 stages now
    readonly property var stageTexts: ["Inicializando", "Conectando", "Sincronizando", "Pronto"]
    
    Component.onCompleted: {
        progressTimer.start()
    }
    
    // Smooth progress timer
    Timer {
        id: progressTimer
        interval: 30
        repeat: true
        onTriggered: {
            if (progress < 100) {
                progress += 0.8
            }
        }
    }
    
    // Stage timers
    Timer {
        interval: 1200
        running: true
        onTriggered: stage = 1
    }
    
    Timer {
        interval: 2400
        running: true
        onTriggered: stage = 2
    }
    
    Timer {
        interval: 3600
        running: true
        onTriggered: {
            stage = 3
            progress = 100
            progressTimer.stop()
        }
    }
    
    // Complete after showing "Pronto" with check
    Timer {
        interval: 5000
        running: true
        onTriggered: animationComplete()
    }
    
    // Subtle gradient background
    Rectangle {
        anchors.centerIn: parent
        width: parent.width * 2
        height: parent.height * 1.6
        gradient: Gradient {
            GradientStop { position: 0.0; color: Qt.rgba(0.23, 0.51, 0.97, 0.15) }
            GradientStop { position: 0.5; color: "transparent" }
            GradientStop { position: 1.0; color: "transparent" }
        }
        
        SequentialAnimation on opacity {
            loops: Animation.Infinite
            NumberAnimation { from: 0.3; to: 0.5; duration: 2000; easing.type: Easing.InOutQuad }
            NumberAnimation { from: 0.5; to: 0.3; duration: 2000; easing.type: Easing.InOutQuad }
        }
    }
    
    // Main content
    ColumnLayout {
        anchors.centerIn: parent
        spacing: 0
        
        // Text container
        Item {
            Layout.alignment: Qt.AlignHCenter
            Layout.preferredWidth: 600
            Layout.preferredHeight: 120
            clip: true
            
            Text {
                id: mainText
                anchors.centerIn: parent
                text: stageTexts[stage]
                font.pixelSize: 72
                font.weight: Font.Black
                font.letterSpacing: -3
                color: "#ffffff"
                
                Behavior on text {
                    SequentialAnimation {
                        NumberAnimation {
                            target: mainText
                            property: "opacity"
                            to: 0
                            duration: 150
                            easing.type: Easing.InQuad
                        }
                        PropertyAction { target: mainText; property: "y"; value: mainText.parent.height / 2 + mainText.height / 2 }
                        PropertyAction { target: mainText; property: "text" }
                        ParallelAnimation {
                            NumberAnimation {
                                target: mainText
                                property: "y"
                                to: (mainText.parent.height - mainText.height) / 2
                                duration: 300
                                easing.type: Easing.OutCubic
                            }
                            NumberAnimation {
                                target: mainText
                                property: "opacity"
                                to: 1
                                duration: 300
                                easing.type: Easing.OutCubic
                            }
                        }
                    }
                }
            }
        }
        
        // Progress bar - hide when "Pronto" (stage 3)
        Item {
            Layout.alignment: Qt.AlignHCenter
            Layout.topMargin: 48
            Layout.preferredWidth: 320
            Layout.preferredHeight: 4
            visible: stage < 3
            opacity: stage < 3 ? 1 : 0
            
            Behavior on opacity {
                NumberAnimation { duration: 200 }
            }
            
            // Background
            Rectangle {
                anchors.fill: parent
                radius: 2
                color: Qt.rgba(1, 1, 1, 0.1)
            }
            
            // Progress fill
            Rectangle {
                id: progressBar
                width: parent.width * (root.progress / 100)
                height: parent.height
                radius: 2
                color: "#3b82f6"
                
                Rectangle {
                    anchors.fill: parent
                    radius: 2
                    gradient: Gradient {
                        orientation: Gradient.Horizontal
                        GradientStop { position: 0.0; color: "#3b82f6" }
                        GradientStop { position: 0.5; color: "#8b5cf6" }
                        GradientStop { position: 1.0; color: "#3b82f6" }
                    }
                }
            }
        }
        
        // Check mark for ready/welcome stages
        Item {
            id: checkContainer
            Layout.alignment: Qt.AlignHCenter
            Layout.topMargin: 40
            Layout.preferredWidth: 64
            Layout.preferredHeight: 64
            visible: stage >= 3
            
            transform: Scale {
                id: checkScale
                origin.x: 32
                origin.y: 32
                xScale: stage >= 3 ? 1 : 0
                yScale: stage >= 3 ? 1 : 0
                
                Behavior on xScale {
                    NumberAnimation { duration: 400; easing.type: Easing.OutBack; easing.overshoot: 1.5 }
                }
                Behavior on yScale {
                    NumberAnimation { duration: 400; easing.type: Easing.OutBack; easing.overshoot: 1.5 }
                }
            }
            
            // Green circle
            Rectangle {
                anchors.fill: parent
                radius: 32
                color: "#22c55e"
                
                // Check icon using Text with Unicode
                Text {
                    anchors.centerIn: parent
                    text: "✓"
                    font.pixelSize: 32
                    font.weight: Font.Bold
                    color: "#ffffff"
                }
            }
            
            // Glow ring
            Rectangle {
                anchors.centerIn: parent
                width: 80
                height: 80
                radius: 40
                color: "transparent"
                border.width: 8
                border.color: Qt.rgba(0.13, 0.77, 0.37, 0.3)
                z: -1
            }
        }
    }
}
