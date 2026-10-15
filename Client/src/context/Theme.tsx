import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface ThemeContextType{
    theme : "light" | "dark"
    toggleTheme : () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({children} : {children : ReactNode}) => {
    const [theme, setTheme] = useState<ThemeContextType["theme"]>("light")

    const toggleTheme = () => {
        setTheme((prev) => prev === "light" ? "dark" : "light")
    }

    return(
        <ThemeContext.Provider value={{
            theme, toggleTheme
        }}>
            <div className={`theme-root ${theme}`} >
                {children}
            </div>
        </ThemeContext.Provider>
    )
    
}

// The hook intentionally lives beside the provider so consumers import one theme API.
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context){
        throw new Error("Use theme must be within theme provider ")
    }

    return context
}
