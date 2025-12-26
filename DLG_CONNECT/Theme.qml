pragma Singleton
import QtQuick 2.15

QtObject {
    // Background colors (matching React index.css)
    readonly property color background: "#080a0f"      // hsl(220 20% 4%)
    readonly property color card: "#0d1117"            // hsl(220 20% 7%)
    readonly property color secondary: "#151b24"       // hsl(220 15% 12%)
    readonly property color muted: "#12171f"           // hsl(220 15% 10%)
    
    // Border colors
    readonly property color border: "#1c2330"          // hsl(220 15% 12%)
    readonly property color borderHover: "#2a3444"     // lighter border for hover
    
    // Text colors
    readonly property color foreground: "#e8edf5"      // hsl(210 40% 96%)
    readonly property color mutedForeground: "#7b8a9e" // hsl(215 20% 55%)
    readonly property color subtleForeground: "#5a6777" // even more muted
    
    // Accent colors (matching React exactly)
    readonly property color primary: "#0080ff"         // hsl(211 100% 50%) - BLUE
    readonly property color primaryForeground: "#f8fafc"
    readonly property color primaryHover: "#1a8fff"
    readonly property color primaryGlow: "#3399ff"
    readonly property color primaryDark: "#0066cc"
    
    readonly property color accent: "#22c55e"          // hsl(142 70% 45%) - GREEN
    readonly property color accentForeground: "#f8fafc"
    readonly property color accentGlow: "#4ade80"
    
    readonly property color warning: "#f59e0b"         // hsl(38 90% 50%)
    readonly property color destructive: "#ef4444"     // hsl(0 80% 55%)
    
    // Gradient colors
    readonly property color gradientStart: "#0080ff"
    readonly property color gradientEnd: "#00d4ff"
    
    // Spacing
    readonly property int spacingXs: 4
    readonly property int spacingSm: 8
    readonly property int spacingMd: 12
    readonly property int spacingLg: 16
    readonly property int spacingXl: 24
    readonly property int spacingXxl: 32
    
    // Border radius
    readonly property int radiusSm: 6
    readonly property int radiusMd: 8
    readonly property int radiusLg: 12
    readonly property int radiusXl: 16
    readonly property int radiusRound: 999
    
    // Font sizes
    readonly property int fontSizeXs: 11
    readonly property int fontSizeSm: 12
    readonly property int fontSizeMd: 13
    readonly property int fontSizeLg: 14
    readonly property int fontSizeXl: 16
    readonly property int fontSizeXxl: 20
    readonly property int fontSizeHero: 28
    readonly property int fontSizeDisplay: 36
    
    // Animation durations
    readonly property int animFast: 150
    readonly property int animNormal: 250
    readonly property int animSlow: 400
    readonly property int animVerySlow: 600
    
    // Shadow
    readonly property color shadowColor: "#000000"
    readonly property real shadowOpacity: 0.4
}
