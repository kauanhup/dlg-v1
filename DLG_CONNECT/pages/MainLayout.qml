import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import ".."
import "../components"

Rectangle {
    id: root
    color: Theme.background
    
    // Backend property - injected from parent
    property var backend: null
    
    property int currentPage: 0
    property int pendingActionTab: -1
    
    // Fade in animation
    opacity: 0
    Component.onCompleted: {
        fadeIn.start()
    }
    
    NumberAnimation {
        id: fadeIn
        target: root
        property: "opacity"
        from: 0
        to: 1
        duration: 300
        easing.type: Easing.OutQuad
    }
    
    RowLayout {
        anchors.fill: parent
        spacing: 0
        
        // Sidebar
        Sidebar {
            id: sidebar
            Layout.fillHeight: true
            Layout.preferredWidth: 180
            currentIndex: root.currentPage
            
            onMenuItemClicked: function(index) {
                root.currentPage = index
            }
        }
        
        // Main content area
        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: Theme.background
            
            StackLayout {
                anchors.fill: parent
                anchors.margins: 12
                currentIndex: root.currentPage
                
                Dashboard {
                    onNavigateToActions: function(tabIndex) {
                        actionsPage.activeTab = tabIndex
                        root.currentPage = 2
                        sidebar.currentIndex = 2
                    }
                }
                Accounts {}
                Actions {
                    id: actionsPage
                }
                Settings {}
            }
        }
    }
}
