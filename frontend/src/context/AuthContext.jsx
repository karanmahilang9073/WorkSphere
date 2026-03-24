import { createContext, useContext, useState, useEffect, Children } from "react"

const Authcontext = createContext()

export const AuthProvider = ({ Children }) => {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])
    const login = (data) => {
        setUser(data.user)
        localStorage.getItem("token", data.token)
        localStorage.getItem("user", JSON.stringify(data.user))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
    }

    return (
        <Authcontext.Provider value={{ user, login, logout }}>
            {Children}
        </Authcontext.Provider>
        
    )
}

export const useAuth = () => useContext(Authcontext)