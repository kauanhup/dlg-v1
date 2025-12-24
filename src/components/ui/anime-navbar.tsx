"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  isPage?: boolean
  onClick?: () => void
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  defaultActive?: string
}

export function AnimeNavBar({ items, className, defaultActive = "Home" }: NavBarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>(defaultActive)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle hash scrolling after navigation
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const element = document.querySelector(location.hash)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [location])

  // Update active tab based on scroll position for anchor links
  useEffect(() => {
    if (location.pathname !== '/') return

    const handleScroll = () => {
      const sections = ['features', 'download', 'pricing', 'faq']
      const scrollPosition = window.scrollY + 150

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const offsetTop = element.offsetTop
          const offsetHeight = element.offsetHeight
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            const item = items.find(i => i.url === `#${sectionId}`)
            if (item && activeTab !== item.name) {
              setActiveTab(item.name)
            }
            return
          }
        }
      }

      // If at top of page, set to Início
      if (window.scrollY < 100) {
        const homeItem = items.find(i => i.url === '/')
        if (homeItem && activeTab !== homeItem.name) {
          setActiveTab(homeItem.name)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [items, activeTab, location.pathname])

  // Update active tab based on current route
  useEffect(() => {
    const currentItem = items.find(item => item.url === location.pathname)
    if (currentItem) {
      setActiveTab(currentItem.name)
    }
  }, [location.pathname, items])

  if (!mounted) return null

  // Separate navigation items from action items (pages)
  const navItems = items.filter(item => !item.isPage)
  const actionItems = items.filter(item => item.isPage)

  const handleAnchorClick = (e: React.MouseEvent, item: NavItem) => {
    e.preventDefault()
    setActiveTab(item.name)
    
    if (location.pathname === '/') {
      // Already on homepage, just scroll
      const element = document.querySelector(item.url)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Navigate to homepage with hash
      navigate('/' + item.url)
    }
  }

  const handleHomeClick = (e: React.MouseEvent, item: NavItem) => {
    setActiveTab(item.name)
    if (location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-[9999]", className)}>
      <div className={cn(
        "flex justify-center px-2 sm:px-4 transition-all duration-300",
        isScrolled ? "pt-2" : "pt-3 sm:pt-4"
      )}>
        <motion.div 
          className="flex items-center gap-0.5 sm:gap-1 border backdrop-blur-lg px-1.5 sm:px-2 rounded-full shadow-lg bg-background/90 border-border"
          initial={{ y: -20, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            scale: isScrolled ? 0.85 : 1,
            paddingTop: isScrolled ? 4 : 8,
            paddingBottom: isScrolled ? 4 : 8
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name
            const isHovered = hoveredTab === item.name
            const isAnchor = item.url.startsWith('#')
            const isHome = item.url === '/'

            const linkContent = (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/15 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <Icon className="w-4 h-4 sm:hidden" strokeWidth={2.5} />
                <span className="hidden sm:inline text-sm">{item.name}</span>
              </>
            )

            const linkClasses = cn(
              "relative cursor-pointer font-medium rounded-full transition-colors duration-200 flex items-center justify-center text-sm px-3 sm:px-4 py-2",
              "text-muted-foreground hover:text-foreground",
              isActive && "text-foreground"
            )

            if (isAnchor) {
              return (
                <a
                  key={item.name}
                  href={item.url}
                  onClick={(e) => handleAnchorClick(e, item)}
                  onMouseEnter={() => setHoveredTab(item.name)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={linkClasses}
                >
                  {linkContent}
                </a>
              )
            }

            return (
              <Link
                key={item.name}
                to={item.url}
                onClick={(e) => isHome ? handleHomeClick(e, item) : setActiveTab(item.name)}
                onMouseEnter={() => setHoveredTab(item.name)}
                onMouseLeave={() => setHoveredTab(null)}
                className={linkClasses}
              >
                {linkContent}
              </Link>
            )
          })}

          {/* Divider */}
          <div className="w-[1px] h-5 bg-gradient-to-b from-transparent via-border to-transparent mx-2 sm:mx-3" />

          {/* Action Items (Pages) */}
          {actionItems.map((item) => {
            const Icon = item.icon
            const isComprar = item.name === "Comprar"

            const content = (
              <>
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline text-sm">{item.name}</span>
              </>
            )

            const classes = cn(
              "relative cursor-pointer font-medium rounded-full transition-colors duration-200 flex items-center gap-1.5 text-sm px-3 sm:px-4 py-2",
              isComprar 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )

            if (item.onClick) {
              return (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={classes}
                >
                  {content}
                </button>
              )
            }

            return (
              <Link
                key={item.name}
                to={item.url}
                className={classes}
              >
                {content}
              </Link>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
