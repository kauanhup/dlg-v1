import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import ".."

TextField {
    id: root
    
    property string label: ""
    property bool hasIcon: false
    
    implicitHeight: 32
    leftPadding: hasIcon ? 32 : 10
    rightPadding: 10
    
    font.pixelSize: Theme.fontSizeSm
    color: Theme.foreground
    placeholderTextColor: Theme.mutedForeground
    selectionColor: Theme.primary
    selectedTextColor: Theme.primaryForeground
    
    background: Rectangle {
        radius: Theme.radiusMd
        color: Theme.muted
        border.width: 1
        border.color: root.activeFocus ? Theme.primary : Theme.border
        
        Behavior on border.color { ColorAnimation { duration: 150 } }
    }
}
