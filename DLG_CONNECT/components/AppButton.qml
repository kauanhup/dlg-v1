import QtQuick 2.15
import QtQuick.Controls 2.15
import ".."

Button {
    id: root
    
    property string variant: "default" // "default", "primary", "destructive", "ghost"
    property bool loading: false
    
    implicitHeight: 32
    implicitWidth: contentItem.implicitWidth + 24
    
    background: Rectangle {
        radius: Theme.radiusMd
        color: {
            if (!root.enabled) return Theme.muted
            switch (root.variant) {
                case "primary": return root.pressed ? Theme.primaryHover : Theme.primary
                case "destructive": return root.pressed ? "#dc2626" : Theme.destructive
                case "ghost": return root.hovered ? Theme.muted : "transparent"
                default: return root.pressed ? Theme.borderLight : Theme.secondary
            }
        }
        border.width: root.variant === "default" ? 1 : 0
        border.color: Theme.border
        
        Behavior on color { ColorAnimation { duration: 150 } }
    }
    
    contentItem: Row {
        spacing: 6
        anchors.centerIn: parent
        
        // Loading spinner
        Rectangle {
            visible: root.loading
            width: 12
            height: 12
            radius: 6
            color: "transparent"
            border.width: 2
            border.color: root.variant === "primary" ? Theme.primaryForeground : Theme.foreground
            
            RotationAnimation on rotation {
                running: root.loading
                from: 0
                to: 360
                duration: 1000
                loops: Animation.Infinite
            }
        }
        
        Text {
            text: root.text
            font.pixelSize: Theme.fontSizeSm
            font.weight: Font.Medium
            color: {
                if (!root.enabled) return Theme.mutedForeground
                switch (root.variant) {
                    case "primary": return Theme.primaryForeground
                    case "destructive": return Theme.foreground
                    default: return Theme.foreground
                }
            }
            verticalAlignment: Text.AlignVCenter
        }
    }
    
    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: if (root.enabled && !root.loading) root.clicked()
    }
}
