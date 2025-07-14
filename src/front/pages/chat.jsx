import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "../styles/chat.css";


const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

const Chat = () => {
    console.log("Chat component mounted");
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");
    const [userId, setUserId] = useState("");
    const [userRole, setUserRole] = useState("");
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setUserId(sessionStorage.getItem("user_id"))
        setUserRole(sessionStorage.getItem("rol"))
        setUserName(sessionStorage.getItem("user_name") || "Usuario")
    }, [])

    useEffect(() => {
        const fetchChats = async () => {
            const userId = sessionStorage.getItem("user_id")
            const userRole = sessionStorage.getItem("rol")
            const userName = sessionStorage.getItem("user_name") || "Usuario"
            if (!userId || !userRole) return
            setLoading(true)
            try {
                const token = sessionStorage.getItem("token")
                const url = `${import.meta.env.VITE_BACKEND_URL}api/message/services/${userId}`
                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const services = response.ok ? await response.json() : []
                if (userRole === "professional") {
                    setChats(
                        services
                            .filter(service => (service.clients && service.clients.length > 0))
                            .flatMap(service =>
                                (service.clients || []).map(client => ({
                                    id: `${service.id}_${client.id}`,
                                    service_id: service.id,
                                    service_name: service.name,
                                    professional_id: service.user_id,
                                    user_id: client.id,
                                    user_name: client.name
                                }))
                            )
                    )
                } else {
                    setChats(
                        services
                            .filter(service => service.clients?.some(client => client.id == userId))
                            .map(service => {
                                const client = service.clients?.find(c => c.id == userId);
                                return {
                                    id: `${service.id}_${userId}`,
                                    service_id: service.id,
                                    service_name: service.name,
                                    professional_id: service.user_id,
                                    user_id: userId,
                                    user_name: client?.name || userName
                                }
                            })
                    )
                }
            } catch (error) {
                console.error("Error en fetchChats:", error);
                setChats([]);
            }
            setLoading(false)
        }
        fetchChats();
    }, [userId, userRole, userName])

    useEffect(() => {
        if (!selectedChat) return
        if (socket) {
            socket.disconnect()
        }
        const newSocket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: { token: sessionStorage.getItem("token") },
            reconnection: true,
            reconnectionAttempts: 5,
            timeout: 2000,
        })
        setSocket(newSocket)
        newSocket.emit("join_room", {
            service_id: selectedChat.service_id,
            professional_id: selectedChat.professional_id,
            user_id: selectedChat.user_id
        })
        newSocket.on("chat_history", (msgs) => {
            setMessages(msgs)
        })
        newSocket.on("new_message", (msg) => {
            setMessages(prev => [...prev, msg])
        })
        return () => {
            newSocket.disconnect()
        }
    }, [selectedChat])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleSend = () => {
        if (input.trim() !== "" && socket && socket.connected && selectedChat) {

            const room = `room_service_id_${selectedChat.service_id}_professional_id_${selectedChat.professional_id}_user_id_${selectedChat.user_id}`
            const msgObj = {
                user: userName,
                user_name: userName,
                sender_name: userName,
                text: input,
                service_id: selectedChat.service_id,
                professional_id: selectedChat.professional_id,
                user_id: selectedChat.user_id,
                sender_id: userId,
                sender_role: userRole,
                room
            }
            socket.emit("send_message", msgObj)
            setInput("")
        }
    }

    return (
        <div className="chat-page-container">
            <h2>Mis Chats</h2>
            {loading ? <div>Cargando chats...</div> : null}
            <ul className="chat-list">
                {chats.length === 0 && !loading ? <li>No tienes chats.</li> : null}
                {chats.map(chat => (
                    <li key={chat.id} className="chat-list-item">
                        <button
                            className="chat-list-btn btn btn-outline-primary w-100 mb-2"
                            onClick={() => setSelectedChat(chat)}
                        >
                            <span className="fw-semibold">{chat.service_name || chat.id}</span>
                            <span className="ms-2 text-muted small">Abrir chat</span>
                        </button>
                    </li>
                ))}
            </ul>
            {selectedChat && (
                <div className="chat-modal-overlay">
                    <div className="chat-modal-container">
                        <div className="floating-chat-header">
                            <span>Chat de servicio: {selectedChat.service_name || selectedChat.id}</span>
                            <button className="chat-close-btn" onClick={() => setSelectedChat(null)}>&times;</button>
                        </div>
                        <div className="floating-chat-body">
                            {messages && messages.length > 0 ? (
                                messages.map((msg, idx) => {
                                    let displayName = msg.sender_name || msg.user_name || msg.user || "Sin nombre";
                                    const isOwnMessage = msg.sender_id == userId;
                                    return (
                                        <div
                                            key={msg.id || idx}
                                            className={`mb-2 message-bubble ${isOwnMessage ? 'own-message' : 'received-message'}`}
                                        >
                                            <strong>{displayName}:</strong> {msg.content}
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-muted">No hay mensajes aún.</div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="floating-chat-footer">
                            <input
                                type="text"
                                className="form-control"
                                value={input}
                                onChange={event => setInput(event.target.value)}
                                onKeyDown={event => event.key === 'Enter' && handleSend()}
                                placeholder="Escribe un mensaje..."
                            />
                            <button type="button" className="btn btn-primary" onClick={handleSend}>
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Chat;
