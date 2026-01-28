"use client"

import * as React from "react"
import { Sun } from "lucide-react"
import { useUI } from "@/context/UIContext"

export function ThemeToggle() {
    const { showToast } = useUI()

    return (
        <button
            onClick={() => showToast("Dark Mode Coming Soon! 🌙", "info")}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            title="Dark Mode Coming Soon"
            aria-label="Theme toggle (coming soon)"
        >
            <Sun className="h-5 w-5 text-slate-600" />
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
