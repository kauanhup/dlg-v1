"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  isPage?: boolean
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  defaultActive?: string
}

export function AnimeNavBar({ items, className, defaultActive = "Home" }: NavBarProps) {
  const location = useLocation()
  const [mounted, setMounted] = useState(false)
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>(defaultActive)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update active tab based on scroll position for anchor links
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['features', 'pricing', 'faq']
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
  }, [items, activeTab])

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

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-[9999]", className)}>
      <div className="flex justify-center pt-3 px-2 sm:pt-4 sm:px-4">
        <motion.div 
          className="flex items-center gap-0.5 sm:gap-1 bg-background/80 border border-border backdrop-blur-lg py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-full shadow-lg relative"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          {/* Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name
            const isHovered = hoveredTab === item.name
            const isAnchor = item.url.startsWith('#')

            const handleClick = (e: React.MouseEvent) => {
              setActiveTab(item.name)
              if (isAnchor) {
                e.preventDefault()
                const element = document.querySelector(item.url)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }
            }

            const linkContent = (
              <>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full -z-10 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0.3, 0.5, 0.3],
                      scale: [1, 1.03, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="absolute inset-0 bg-primary/25 rounded-full blur-md" />
                  </motion.div>
                )}

                <Icon className="w-4 h-4 sm:hidden" strokeWidth={2.5} />
                <span className="hidden sm:inline relative z-10">{item.name}</span>
        
                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                    />
                  )}
                </AnimatePresence>
              </>
            )

            const linkClasses = cn(
              "relative cursor-pointer text-xs sm:text-sm font-medium px-2.5 sm:px-4 py-2 rounded-full transition-all duration-300 flex items-center justify-center",
              "text-muted-foreground hover:text-foreground",
              isActive && "text-foreground"
            )

            if (isAnchor) {
              return (
                <a
                  key={item.name}
                  href={item.url}
                  onClick={handleClick}
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
                onClick={handleClick}
                onMouseEnter={() => setHoveredTab(item.name)}
                onMouseLeave={() => setHoveredTab(null)}
                className={linkClasses}
              >
                {linkContent}
              </Link>
            )
          })}

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-1 sm:mx-2" />

          {/* Action Items (Pages) */}
          {actionItems.map((item) => {
            const Icon = item.icon
            const isComprar = item.name === "Comprar"

            return (
              <Link
                key={item.name}
                to={item.url}
                className={cn(
                  "relative cursor-pointer text-xs sm:text-sm font-medium px-2.5 sm:px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5",
                  isComprar 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
