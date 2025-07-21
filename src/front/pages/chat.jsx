import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "../styles/chat.css";
import { Spinner } from "../components/Spinner";


const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

const Chat = () => {
    console.log("Chat component mounted");
    const [chats, setChats] = useState([]);
    const [unreadChats, setUnreadChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);


    const handleOpenChat = (chat) => {
        setSelectedChat(chat);
        setUnreadChats(prev => prev.filter(obj => !(obj.service_id === chat.service_id && obj.user_id == chat.user_id)));
    };


    const handleDeleteChat = async (chat) => {
        if (!window.confirm('¿Seguro que quieres eliminar este chat?')) return;
        try {
            const token = sessionStorage.getItem("token");
            const url = `${import.meta.env.VITE_BACKEND_URL}api/message/delete/${chat.service_id}/${chat.professional_id}/${chat.user_id}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                setChats(prev => prev.filter(c => !(c.service_id === chat.service_id && c.user_id == chat.user_id)));
                setUnreadChats(prev => prev.filter(obj => !(obj.service_id === chat.service_id && obj.user_id == chat.user_id)));
                if (selectedChat && selectedChat.service_id === chat.service_id && selectedChat.user_id == chat.user_id) {
                    setSelectedChat(null);
                }
            }
        } catch (error) {
            alert('Error al eliminar el chat');
        }
    }
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
                const services = response.ok ? await response.json() : [];
                const unread = [];
                services.forEach(service => {
                    if (userRole === "professional" && service.unread_by_client) {
                        console.log(`Servicio ${service.id} - unread_by_client:`, service.unread_by_client);
                        (service.clients || []).forEach(client => {
                            const unreadCount = service.unread_by_client[client.id];
                            console.log(`  Cliente ${client.id} (${client.name}) - unreadCount:`, unreadCount);
                            if (
                                unreadCount > 0 &&
                                client.id !== service.professional_id &&
                                service.id && client.id
                            ) {
                                unread.push({ service_id: service.id, user_id: client.id });
                            }
                        });
                    }
                    if (userRole !== "professional") {
                        console.log(`Servicio ${service.id} - unread_count:`, service.unread_count);
                        if (service.unread_count > 0 && service.id) {
                            unread.push({ service_id: service.id, user_id: userId });
                        }
                    }
                });
                console.log('Resultado final unreadChats:', unread);
                setUnreadChats(unread);
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
            timeout: 20000,
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
        const token = sessionStorage.getItem("token")
        fetch(`${import.meta.env.VITE_BACKEND_URL}api/message/read/${selectedChat.service_id}/${selectedChat.user_id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(() => {
                window.dispatchEvent(new Event('unreadChatsChanged'))
            })
            .catch(() => { })
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
            <h2 className="text-center mt-5">Mis Chats</h2>
            {loading ? <div className="d-flex justify-content-center align-items-center mt-5"><Spinner /></div> : null}
            <div className="d-flex justify-content-center">
                <ul className="chat-list">
                    {chats.length === 0 && !loading ? <li>No tienes chats.</li> : null}
                    {chats.map(chat => {
                        const isUnread = unreadChats.some(obj => obj.service_id === chat.service_id && obj.user_id == chat.user_id);
                        return (
                            <li key={chat.id} className="chat-list-item">
                                <button
                                    className={`chat-list-btn btn chat-btn flex-grow-1 mb-2 ${isUnread ? 'btn-custom-unread' : 'btn-custom-read'}`}
                                    onClick={() => handleOpenChat(chat)}
                                >
                                    <span className="fw-semibold">{chat.service_name || chat.id}</span>
                                    <span className="ms-2 text-muted small">Abrir chat</span>
                                    {isUnread && <span className="badge bg-danger ms-2">Nuevo</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
            {selectedChat && (
                <div className="chat-modal-overlay">
                    <div className="chat-modal-container">
                        <div className="floating-chat-header d-flex justify-content-between align-items-center">
                            <span>Chat de servicio: {selectedChat.service_name || selectedChat.id}</span>
                            <div>
                                <button
                                    className="btn btn chat-delete-btn me-2"
                                    title="Eliminar chat"
                                    onClick={() => handleDeleteChat(selectedChat)}
                                >
                                    🗑️
                                </button>
                                <button className="chat-close-btn" onClick={() => setSelectedChat(null)}>&times;</button>
                            </div>
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
