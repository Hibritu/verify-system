"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState("system")

  useEffect(() => {
    setMounted(true)
    setTheme(localStorage.getItem("theme") || "system")
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
    
    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-9 h-9">
        <div className="h-4 w-4" />
      </Button>
    )
  }

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 text-white dark:text-white"
      title={`Current theme: ${theme}`}
    >
      {theme === "light" && <span className="text-sm">☀️</span>}
      {theme === "dark" && <span className="text-sm">🌙</span>}
      {theme === "system" && <span className="text-sm">💻</span>}
    </Button>
  )
}
