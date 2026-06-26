import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useThemeContext } from '@/hooks/useThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid h-10 w-10 place-items-center rounded-xl border border-[#E8E0D6] dark:border-white/12 text-muted transition-colors hover:text-[#211A14] dark:hover:text-white hover:border-accent-blue/50"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </motion.span>
    </button>
  )
}
