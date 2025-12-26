import QtQuick 2.15
import QtQuick.Layouts 1.15
import ".."

// StatsCard matching React app-panel style
Rectangle {
    id: root
    
    property string label: ""
    property string value: "0"
    property color accentColor: Theme.primary
    
    implicitHeight: 64
    color: Theme.card
    border.width: 1
    border.color: Theme.border
    
    // app-panel-content flex items-center gap-3
    RowLayout {
        anchors.fill: parent
        anchors.margins: 12  // p-3
        spacing: 12  // gap-3
        
        // Icon container (h-8 w-8 rounded bg-muted)
        Rectangle {
            Layout.preferredWidth: 32
            Layout.preferredHeight: 32
            radius: 4
            color: Theme.muted
            
            Rectangle {
                anchors.centerIn: parent
                width: 16
                height: 16
                radius: 2
                color: root.accentColor
            }
        }
        
        // Text content
        ColumnLayout {
            spacing: 0
            
            Text {
                text: root.value
                font.pixelSize: 18  // text-lg
                font.weight: Font.Bold
                color: root.accentColor
            }
            
            Text {
                text: root.label
                font.pixelSize: 10  // text-[10px]
                color: Theme.mutedForeground
            }
        }
        
        Item { Layout.fillWidth: true }
    }
}
