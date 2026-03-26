import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user')
            if(storedUser) {
                setUser(JSON.parse(storedUser))
            }
            setLoading(false)
        } catch (error) {
            console.error('invalid user data in localStorage', error)
            localStorage.removeItem('user')
        }
    }, [])

    const login = (data) => {
        setUser(data.user)
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
        
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if(!context) {
        throw new Error('useauth must be used within  authprovider')
    }
}