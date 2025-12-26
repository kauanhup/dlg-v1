import QtQuick 2.15
import ".."

Rectangle {
    id: root
    
    property string title: ""
    property string icon: ""
    property alias content: contentArea.children
    
    color: Theme.card
    border.width: 1
    border.color: Theme.border
    radius: Theme.radiusMd
    
    Column {
        anchors.fill: parent
        spacing: 0
        
        // Header
        Rectangle {
            visible: root.title !== ""
            width: parent.width
            height: 32
            color: Theme.secondary
            
            Rectangle {
                anchors.bottom: parent.bottom
                width: parent.width
                height: 1
                color: Theme.border
            }
            
            Row {
                anchors.verticalCenter: parent.verticalCenter
                anchors.left: parent.left
                anchors.leftMargin: Theme.spacingMd
                spacing: Theme.spacingSm
                
                // Icon placeholder (use Image or custom icon component)
                Rectangle {
                    visible: root.icon !== ""
                    width: 14
                    height: 14
                    radius: 2
                    color: Theme.primary
                }
                
                Text {
                    text: root.title
                    font.pixelSize: Theme.fontSizeSm
                    font.weight: Font.Medium
                    color: Theme.foreground
                }
            }
        }
        
        // Content area
        Item {
            id: contentArea
            width: parent.width
            height: parent.height - (root.title !== "" ? 32 : 0)
        }
    }
}
