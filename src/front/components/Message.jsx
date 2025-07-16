import React, { useRef } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import "../styles/Message.css";


const SOCKET_URL = import.meta.env.VITE_BACKEND_URL

const Message = ({ show, serviceId, professionalId, userId, userName, roomUserId, roomUserName }) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const senderId = userId;
    const senderName = userName;

    useEffect(() => {
        if (!show || !serviceId || !roomUserId) return

        if (socketRef.current) {
            socketRef.current.disconnect()
        }

        const token = sessionStorage.getItem("token")
        fetch(`${import.meta.env.VITE_BACKEND_URL}api/message/read/${serviceId}/${roomUserId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(() => {
                window.dispatchEvent(new Event('unreadChatsChanged'))
            })
            .catch(() => { })

        socketRef.current = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: {
                token: sessionStorage.getItem("token"),
            },
            reconnection: true,
            reconnectionAttempts: 5,
            timeout: 2000,
        });
        socketRef.current.on("connect", () => {
            console.log("Conexión socket.io exitosa")
        })
        socketRef.current.on("disconnect", (reason) => {
            console.warn("Socket desconectado:", reason)
        })

        socketRef.current.emit("join_room", { service_id: serviceId, professional_id: professionalId, user_id: roomUserId })

        const addMessages = (newMessages) => {
            setMessages(previousMessages => {
                return [...previousMessages, ...newMessages]
            })
        }

        socketRef.current.on("chat_history", (msgs) => {
            setMessages(msgs)
        })

        socketRef.current.on("new_message", (msg) => {
            addMessages([msg])
        })

        socketRef.current.on("connect_error", (err) => {
            console.error("Socket connection error:", err)
        })
        socketRef.current.on("error", (err) => {
            console.error("Socket error:", err)
        })

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
            }
        }
    }, [show, serviceId, professionalId, roomUserId])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleSend = () => {
        if (input.trim() !== "") {
            const msgObj = {
                user: senderName,
                user_name: senderName,
                sender_name: senderName,
                content: input,
                service_id: serviceId,
                professional_id: professionalId,
                user_id: senderId,
                sender_id: senderId,
                room_user_id: roomUserId
            }
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit("send_message", msgObj)
            } else {
                console.error("No conectado al chat, mensaje no enviado.")
            }
            setInput("")
        }
    }

    const [open, setOpen] = useState(show)
    useEffect(() => { setOpen(show); }, [show])

    if (!show) return null

    return (
        <div className="chat-modal-content">
            <div className="floating-chat-header">
                <span>Chat</span>
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
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <strong>{displayName}:</strong> {msg.content}
                            </div>
                        );
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
                    style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-primary" onClick={handleSend}>
                    Enviar
                </button>
            </div>
        </div>
    );
};

Message.propTypes = {
    show: PropTypes.bool.isRequired,
    serviceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    professionalId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    userName: PropTypes.string.isRequired,
    roomUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    roomUserName: PropTypes.string
}

export default Message;

