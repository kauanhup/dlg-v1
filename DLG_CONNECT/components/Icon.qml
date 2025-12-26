import QtQuick 2.15

// Simple icon component using Canvas to draw SVG-like paths
Item {
    id: root
    
    property string name: "home"
    property color color: "#7b8a9e"
    property int size: 20
    
    width: size
    height: size
    
    Canvas {
        id: canvas
        
        // Use device pixel ratio for crisp rendering
        property real dpr: Screen.devicePixelRatio || 2.0
        property real scaleFactor: Math.max(dpr, 2.0)
        
        width: root.size * scaleFactor
        height: root.size * scaleFactor
        scale: 1.0 / scaleFactor
        transformOrigin: Item.TopLeft
        
        renderStrategy: Canvas.Cooperative
        antialiasing: true
        
        onPaint: {
            var ctx = getContext("2d")
            ctx.reset()
            ctx.strokeStyle = root.color
            ctx.fillStyle = "transparent"
            ctx.lineWidth = 2.0
            ctx.lineCap = "round"
            ctx.lineJoin = "round"
            
            var s = (root.size * scaleFactor) / 24  // Scale factor
            
            ctx.save()
            
            switch(root.name) {
                case "home":
                    ctx.beginPath()
                    ctx.moveTo(3*s, 9*s)
                    ctx.lineTo(12*s, 2*s)
                    ctx.lineTo(21*s, 9*s)
                    ctx.lineTo(21*s, 20*s)
                    ctx.quadraticCurveTo(21*s, 22*s, 19*s, 22*s)
                    ctx.lineTo(15*s, 22*s)
                    ctx.lineTo(15*s, 12*s)
                    ctx.lineTo(9*s, 12*s)
                    ctx.lineTo(9*s, 22*s)
                    ctx.lineTo(5*s, 22*s)
                    ctx.quadraticCurveTo(3*s, 22*s, 3*s, 20*s)
                    ctx.closePath()
                    ctx.stroke()
                    break
                    
                case "users":
                    // Main user
                    ctx.beginPath()
                    ctx.arc(9*s, 7*s, 4*s, 0, Math.PI * 2)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(17*s, 21*s)
                    ctx.lineTo(17*s, 19*s)
                    ctx.quadraticCurveTo(17*s, 15*s, 13*s, 15*s)
                    ctx.lineTo(5*s, 15*s)
                    ctx.quadraticCurveTo(1*s, 15*s, 1*s, 19*s)
                    ctx.lineTo(1*s, 21*s)
                    ctx.stroke()
                    // Second user hint
                    ctx.beginPath()
                    ctx.arc(19*s, 7*s, 3*s, -0.8, Math.PI * 0.6)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(21*s, 21*s)
                    ctx.quadraticCurveTo(23*s, 17*s, 20*s, 15*s)
                    ctx.stroke()
                    break
                    
                case "zap":
                    ctx.beginPath()
                    ctx.moveTo(13*s, 2*s)
                    ctx.lineTo(3*s, 14*s)
                    ctx.lineTo(12*s, 14*s)
                    ctx.lineTo(11*s, 22*s)
                    ctx.lineTo(21*s, 10*s)
                    ctx.lineTo(12*s, 10*s)
                    ctx.closePath()
                    ctx.stroke()
                    break
                    
                case "activity":
                    ctx.beginPath()
                    ctx.moveTo(22*s, 12*s)
                    ctx.lineTo(18*s, 12*s)
                    ctx.lineTo(15*s, 21*s)
                    ctx.lineTo(9*s, 3*s)
                    ctx.lineTo(6*s, 12*s)
                    ctx.lineTo(2*s, 12*s)
                    ctx.stroke()
                    break
                    
                case "settings":
                    // Inner circle
                    ctx.beginPath()
                    ctx.arc(12*s, 12*s, 3*s, 0, Math.PI * 2)
                    ctx.stroke()
                    // Gear outline
                    ctx.beginPath()
                    ctx.arc(12*s, 12*s, 7*s, 0, Math.PI * 2)
                    ctx.stroke()
                    // Gear teeth
                    for (var i = 0; i < 8; i++) {
                        var angle = (i * Math.PI / 4)
                        ctx.beginPath()
                        ctx.moveTo(12*s + Math.cos(angle) * 7*s, 12*s + Math.sin(angle) * 7*s)
                        ctx.lineTo(12*s + Math.cos(angle) * 9*s, 12*s + Math.sin(angle) * 9*s)
                        ctx.stroke()
                    }
                    break
                    
                case "logOut":
                    ctx.beginPath()
                    ctx.moveTo(9*s, 21*s)
                    ctx.lineTo(5*s, 21*s)
                    ctx.quadraticCurveTo(3*s, 21*s, 3*s, 19*s)
                    ctx.lineTo(3*s, 5*s)
                    ctx.quadraticCurveTo(3*s, 3*s, 5*s, 3*s)
                    ctx.lineTo(9*s, 3*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(16*s, 17*s)
                    ctx.lineTo(21*s, 12*s)
                    ctx.lineTo(16*s, 7*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(21*s, 12*s)
                    ctx.lineTo(9*s, 12*s)
                    ctx.stroke()
                    break
                    
                case "mail":
                    ctx.beginPath()
                    ctx.moveTo(4*s, 4*s)
                    ctx.lineTo(20*s, 4*s)
                    ctx.quadraticCurveTo(22*s, 4*s, 22*s, 6*s)
                    ctx.lineTo(22*s, 18*s)
                    ctx.quadraticCurveTo(22*s, 20*s, 20*s, 20*s)
                    ctx.lineTo(4*s, 20*s)
                    ctx.quadraticCurveTo(2*s, 20*s, 2*s, 18*s)
                    ctx.lineTo(2*s, 6*s)
                    ctx.quadraticCurveTo(2*s, 4*s, 4*s, 4*s)
                    ctx.closePath()
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(2*s, 6*s)
                    ctx.lineTo(12*s, 13*s)
                    ctx.lineTo(22*s, 6*s)
                    ctx.stroke()
                    break
                    
                case "lock":
                    ctx.beginPath()
                    ctx.moveTo(5*s, 11*s)
                    ctx.lineTo(19*s, 11*s)
                    ctx.quadraticCurveTo(21*s, 11*s, 21*s, 13*s)
                    ctx.lineTo(21*s, 20*s)
                    ctx.quadraticCurveTo(21*s, 22*s, 19*s, 22*s)
                    ctx.lineTo(5*s, 22*s)
                    ctx.quadraticCurveTo(3*s, 22*s, 3*s, 20*s)
                    ctx.lineTo(3*s, 13*s)
                    ctx.quadraticCurveTo(3*s, 11*s, 5*s, 11*s)
                    ctx.closePath()
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(7*s, 11*s)
                    ctx.lineTo(7*s, 7*s)
                    ctx.quadraticCurveTo(7*s, 2*s, 12*s, 2*s)
                    ctx.quadraticCurveTo(17*s, 2*s, 17*s, 7*s)
                    ctx.lineTo(17*s, 11*s)
                    ctx.stroke()
                    break
                    
                case "logIn":
                    ctx.beginPath()
                    ctx.moveTo(15*s, 3*s)
                    ctx.lineTo(19*s, 3*s)
                    ctx.quadraticCurveTo(21*s, 3*s, 21*s, 5*s)
                    ctx.lineTo(21*s, 19*s)
                    ctx.quadraticCurveTo(21*s, 21*s, 19*s, 21*s)
                    ctx.lineTo(15*s, 21*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(10*s, 17*s)
                    ctx.lineTo(15*s, 12*s)
                    ctx.lineTo(10*s, 7*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(15*s, 12*s)
                    ctx.lineTo(3*s, 12*s)
                    ctx.stroke()
                    break
                    
                case "shield":
                    ctx.beginPath()
                    ctx.moveTo(12*s, 22*s)
                    ctx.quadraticCurveTo(4*s, 18*s, 4*s, 12*s)
                    ctx.lineTo(4*s, 5*s)
                    ctx.lineTo(12*s, 2*s)
                    ctx.lineTo(20*s, 5*s)
                    ctx.lineTo(20*s, 12*s)
                    ctx.quadraticCurveTo(20*s, 18*s, 12*s, 22*s)
                    ctx.stroke()
                    // Checkmark inside shield
                    ctx.beginPath()
                    ctx.moveTo(9*s, 12*s)
                    ctx.lineTo(11*s, 14*s)
                    ctx.lineTo(15*s, 10*s)
                    ctx.stroke()
                    break
                    
                case "rocket":
                    ctx.beginPath()
                    ctx.moveTo(4.5*s, 16.5*s)
                    ctx.quadraticCurveTo(2.5*s, 19*s, 2.5*s, 21.5*s)
                    ctx.quadraticCurveTo(5*s, 21*s, 7.5*s, 19.5*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(12*s, 15*s)
                    ctx.lineTo(9*s, 12*s)
                    ctx.quadraticCurveTo(11*s, 6*s, 22*s, 2*s)
                    ctx.quadraticCurveTo(18*s, 13*s, 12*s, 15*s)
                    ctx.stroke()
                    // Flames
                    ctx.beginPath()
                    ctx.moveTo(9*s, 12*s)
                    ctx.lineTo(4*s, 8*s)
                    ctx.quadraticCurveTo(4*s, 11*s, 5*s, 12*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(12*s, 15*s)
                    ctx.lineTo(16*s, 20*s)
                    ctx.quadraticCurveTo(13*s, 20*s, 12*s, 19*s)
                    ctx.stroke()
                    break
                    
                case "layers":
                    ctx.beginPath()
                    ctx.moveTo(12*s, 2*s)
                    ctx.lineTo(2*s, 7*s)
                    ctx.lineTo(12*s, 12*s)
                    ctx.lineTo(22*s, 7*s)
                    ctx.closePath()
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(2*s, 12*s)
                    ctx.lineTo(12*s, 17*s)
                    ctx.lineTo(22*s, 12*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(2*s, 17*s)
                    ctx.lineTo(12*s, 22*s)
                    ctx.lineTo(22*s, 17*s)
                    ctx.stroke()
                    break
                    
                case "check":
                    ctx.beginPath()
                    ctx.moveTo(20*s, 6*s)
                    ctx.lineTo(9*s, 17*s)
                    ctx.lineTo(4*s, 12*s)
                    ctx.stroke()
                    break
                    
                case "plus":
                    ctx.beginPath()
                    ctx.moveTo(12*s, 5*s)
                    ctx.lineTo(12*s, 19*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(5*s, 12*s)
                    ctx.lineTo(19*s, 12*s)
                    ctx.stroke()
                    break
                    
                case "play":
                    ctx.beginPath()
                    ctx.moveTo(5*s, 3*s)
                    ctx.lineTo(19*s, 12*s)
                    ctx.lineTo(5*s, 21*s)
                    ctx.closePath()
                    ctx.stroke()
                    break
                    
                case "pause":
                    ctx.beginPath()
                    ctx.rect(6*s, 4*s, 4*s, 16*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.rect(14*s, 4*s, 4*s, 16*s)
                    ctx.stroke()
                    break
                    
                case "clock":
                    ctx.beginPath()
                    ctx.arc(12*s, 12*s, 10*s, 0, Math.PI * 2)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(12*s, 6*s)
                    ctx.lineTo(12*s, 12*s)
                    ctx.lineTo(16*s, 14*s)
                    ctx.stroke()
                    break
                    
                case "trendingUp":
                    ctx.beginPath()
                    ctx.moveTo(23*s, 6*s)
                    ctx.lineTo(13.5*s, 15.5*s)
                    ctx.lineTo(8.5*s, 10.5*s)
                    ctx.lineTo(1*s, 18*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(17*s, 6*s)
                    ctx.lineTo(23*s, 6*s)
                    ctx.lineTo(23*s, 12*s)
                    ctx.stroke()
                    break
                    
                case "barChart":
                    ctx.beginPath()
                    ctx.moveTo(12*s, 20*s)
                    ctx.lineTo(12*s, 10*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(18*s, 20*s)
                    ctx.lineTo(18*s, 4*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(6*s, 20*s)
                    ctx.lineTo(6*s, 16*s)
                    ctx.stroke()
                    break
                    
                case "search":
                    ctx.beginPath()
                    ctx.arc(11*s, 11*s, 8*s, 0, Math.PI * 2)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(21*s, 21*s)
                    ctx.lineTo(16.65*s, 16.65*s)
                    ctx.stroke()
                    break
                    
                case "filter":
                    ctx.beginPath()
                    ctx.moveTo(22*s, 3*s)
                    ctx.lineTo(2*s, 3*s)
                    ctx.lineTo(10*s, 12.46*s)
                    ctx.lineTo(10*s, 19*s)
                    ctx.lineTo(14*s, 21*s)
                    ctx.lineTo(14*s, 12.46*s)
                    ctx.closePath()
                    ctx.stroke()
                    break
                    
                case "checkCircle":
                    ctx.beginPath()
                    ctx.arc(12*s, 12*s, 10*s, 0, Math.PI * 2)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(9*s, 12*s)
                    ctx.lineTo(11*s, 14*s)
                    ctx.lineTo(15*s, 10*s)
                    ctx.stroke()
                    break
                    
                case "xCircle":
                    ctx.beginPath()
                    ctx.arc(12*s, 12*s, 10*s, 0, Math.PI * 2)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(15*s, 9*s)
                    ctx.lineTo(9*s, 15*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(9*s, 9*s)
                    ctx.lineTo(15*s, 15*s)
                    ctx.stroke()
                    break
                    
                case "alertCircle":
                    ctx.beginPath()
                    ctx.arc(12*s, 12*s, 10*s, 0, Math.PI * 2)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(12*s, 8*s)
                    ctx.lineTo(12*s, 12*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.arc(12*s, 16*s, 1*s, 0, Math.PI * 2)
                    ctx.fillStyle = root.color
                    ctx.fill()
                    break
                    
                case "edit":
                    ctx.beginPath()
                    ctx.moveTo(11*s, 4*s)
                    ctx.lineTo(4*s, 4*s)
                    ctx.quadraticCurveTo(2*s, 4*s, 2*s, 6*s)
                    ctx.lineTo(2*s, 20*s)
                    ctx.quadraticCurveTo(2*s, 22*s, 4*s, 22*s)
                    ctx.lineTo(18*s, 22*s)
                    ctx.quadraticCurveTo(20*s, 22*s, 20*s, 20*s)
                    ctx.lineTo(20*s, 13*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(17*s, 2*s)
                    ctx.lineTo(22*s, 7*s)
                    ctx.lineTo(12*s, 17*s)
                    ctx.lineTo(7*s, 17*s)
                    ctx.lineTo(7*s, 12*s)
                    ctx.closePath()
                    ctx.stroke()
                    break
                    
                case "trash":
                    ctx.beginPath()
                    ctx.moveTo(3*s, 6*s)
                    ctx.lineTo(21*s, 6*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(19*s, 6*s)
                    ctx.lineTo(19*s, 20*s)
                    ctx.quadraticCurveTo(19*s, 22*s, 17*s, 22*s)
                    ctx.lineTo(7*s, 22*s)
                    ctx.quadraticCurveTo(5*s, 22*s, 5*s, 20*s)
                    ctx.lineTo(5*s, 6*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(8*s, 6*s)
                    ctx.lineTo(8*s, 4*s)
                    ctx.quadraticCurveTo(8*s, 2*s, 10*s, 2*s)
                    ctx.lineTo(14*s, 2*s)
                    ctx.quadraticCurveTo(16*s, 2*s, 16*s, 4*s)
                    ctx.lineTo(16*s, 6*s)
                    ctx.stroke()
                    // Vertical lines inside
                    ctx.beginPath()
                    ctx.moveTo(10*s, 11*s)
                    ctx.lineTo(10*s, 17*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(14*s, 11*s)
                    ctx.lineTo(14*s, 17*s)
                    ctx.stroke()
                    break
                    
                case "refresh":
                    ctx.beginPath()
                    ctx.moveTo(23*s, 4*s)
                    ctx.lineTo(23*s, 10*s)
                    ctx.lineTo(17*s, 10*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(1*s, 20*s)
                    ctx.lineTo(1*s, 14*s)
                    ctx.lineTo(7*s, 14*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.arc(12*s, 12*s, 9*s, Math.PI * 0.1, Math.PI * 0.9)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.arc(12*s, 12*s, 9*s, Math.PI * 1.1, Math.PI * 1.9)
                    ctx.stroke()
                    break
                    
                case "phone":
                    ctx.beginPath()
                    ctx.moveTo(22*s, 16.92*s)
                    ctx.lineTo(22*s, 19.92*s)
                    ctx.quadraticCurveTo(22*s, 21*s, 20.5*s, 21*s)
                    ctx.quadraticCurveTo(4*s, 20*s, 3*s, 3.5*s)
                    ctx.quadraticCurveTo(3*s, 2*s, 4*s, 2*s)
                    ctx.lineTo(7*s, 2*s)
                    ctx.quadraticCurveTo(8*s, 2*s, 8.5*s, 3*s)
                    ctx.lineTo(9.5*s, 6*s)
                    ctx.quadraticCurveTo(10*s, 7*s, 9*s, 8*s)
                    ctx.lineTo(7*s, 10*s)
                    ctx.quadraticCurveTo(8*s, 14*s, 10*s, 16*s)
                    ctx.quadraticCurveTo(12*s, 18*s, 14*s, 17*s)
                    ctx.lineTo(16*s, 15*s)
                    ctx.quadraticCurveTo(17*s, 14*s, 18*s, 14.5*s)
                    ctx.lineTo(21*s, 15.5*s)
                    ctx.quadraticCurveTo(22*s, 16*s, 22*s, 16.92*s)
                    ctx.stroke()
                    break
                    
                case "list":
                    ctx.beginPath()
                    ctx.moveTo(8*s, 6*s)
                    ctx.lineTo(21*s, 6*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(8*s, 12*s)
                    ctx.lineTo(21*s, 12*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(8*s, 18*s)
                    ctx.lineTo(21*s, 18*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.arc(3.5*s, 6*s, 1*s, 0, Math.PI * 2)
                    ctx.fillStyle = root.color
                    ctx.fill()
                    ctx.beginPath()
                    ctx.arc(3.5*s, 12*s, 1*s, 0, Math.PI * 2)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.arc(3.5*s, 18*s, 1*s, 0, Math.PI * 2)
                    ctx.fill()
                    break
                    
                case "userPlus":
                    // User circle
                    ctx.beginPath()
                    ctx.arc(9*s, 7*s, 4*s, 0, Math.PI * 2)
                    ctx.stroke()
                    // User body
                    ctx.beginPath()
                    ctx.moveTo(17*s, 21*s)
                    ctx.lineTo(17*s, 19*s)
                    ctx.quadraticCurveTo(17*s, 15*s, 13*s, 15*s)
                    ctx.lineTo(5*s, 15*s)
                    ctx.quadraticCurveTo(1*s, 15*s, 1*s, 19*s)
                    ctx.lineTo(1*s, 21*s)
                    ctx.stroke()
                    // Plus sign
                    ctx.beginPath()
                    ctx.moveTo(20*s, 8*s)
                    ctx.lineTo(20*s, 14*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(17*s, 11*s)
                    ctx.lineTo(23*s, 11*s)
                    ctx.stroke()
                    break
                    
                default:
                    // Fallback: draw a question mark icon
                    ctx.beginPath()
                    ctx.arc(12*s, 12*s, 10*s, 0, Math.PI * 2)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(9*s, 9*s)
                    ctx.quadraticCurveTo(9*s, 6*s, 12*s, 6*s)
                    ctx.quadraticCurveTo(15*s, 6*s, 15*s, 9*s)
                    ctx.quadraticCurveTo(15*s, 11*s, 12*s, 12*s)
                    ctx.lineTo(12*s, 14*s)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.arc(12*s, 17*s, 1*s, 0, Math.PI * 2)
                    ctx.fillStyle = root.color
                    ctx.fill()
            }
            
            ctx.restore()
        }
        
        Connections {
            target: root
            function onColorChanged() { canvas.requestPaint() }
            function onNameChanged() { canvas.requestPaint() }
            function onSizeChanged() { canvas.requestPaint() }
        }
        
        Component.onCompleted: requestPaint()
    }
}
