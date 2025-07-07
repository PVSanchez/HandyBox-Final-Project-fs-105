<<<<<<< HEAD
import { Link } from "react-router-dom";
import React from "react";
import "../style/Navbar.css";
=======

import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "../style/Navbar.css";



function getUserRole() {
	try {
		const user = JSON.parse(sessionStorage.getItem("user"));
		if (user && user.rol && user.rol.type) {
			return user.rol.type
		}
		return null
	} catch {
		return null
	}
}


>>>>>>> d6af2b7a0566a30d647ccd2dbe01516154f58009

export const Navbar = () => {
	const [userRole, setUserRole] = React.useState(getUserRole())
	const [cartCount, setCartCount] = React.useState(() => {
		const cart = JSON.parse(localStorage.getItem('cart') || '[]')
		return Array.isArray(cart) ? cart.length : 0
	})
	const [dropdownOpen, setDropdownOpen] = useState(false)
	const navigate = useNavigate()


	let user = null
	try {
		user = JSON.parse(sessionStorage.getItem("user"))
	} catch { }
	const userImg = user?.img || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

	React.useEffect(() => {
		const handleStorage = () => {
			setUserRole(getUserRole())
			const cart = JSON.parse(localStorage.getItem('cart') || '[]')
			setCartCount(Array.isArray(cart) ? cart.length : 0)
		}
		window.addEventListener('storage', handleStorage);
		window.addEventListener('userChanged', handleStorage);
		const cartListener = () => {
			const cart = JSON.parse(localStorage.getItem('cart') || '[]')
			setCartCount(Array.isArray(cart) ? cart.length : 0)
		};
		window.addEventListener('cartChanged', cartListener)
		return () => {
			window.removeEventListener('storage', handleStorage)
			window.removeEventListener('userChanged', handleStorage)
			window.removeEventListener('cartChanged', cartListener)
		}
	}, []);


	let userOptions = []
	if (!userRole) {
		userOptions = [
			{ to: "/login", label: "Login" },
			{ to: "/signup", label: "Signup" }
		];
	} else if (userRole === "client") {
		userOptions = [
			{ to: "/modifyuser", label: "Modificar Usuario" },
			{ to: "/services", label: "Servicios" },
			{ to: "/services-pay", label: "Servicios contratados" },
			{ to: "/login", label: "Logout" }
		]
	} else if (userRole === "professional") {
		userOptions = [
			{ to: "/modifyuser", label: "Modificar Usuario" },
			{ to: "/services", label: "Servicios" },
			{ to: "/createService", label: "Crear Servicio" },
			{ to: "/professional-services", label: "Servicios contratados a mí" },
			{ to: "/create-user-detail", label: "Crear Detalle de Usuario" },
			{ to: "/login", label: "Logout" }
		]
	}


	const cart = JSON.parse(localStorage.getItem('cart') || '[]');
	let cartCurrency = "EUR"
	if (cart[0] && cart[0].currency) cartCurrency = cart[0].currency
	const totalAmount = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0)
	const showCart = cartCount > 0 && (userRole === "client" || userRole === "professional")


	const handleCartClick = () => {
		if (showCart) {
			navigate(`/payment/${totalAmount}/${cartCurrency}`)
		}
	}

	return (
<<<<<<< HEAD
		<nav className="navbar">
			<div className="container justify-content-center">
				<div className="dropdown">
					<button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
						Páginas
					</button>
					<ul className="dropdown-menu justify-content-center" aria-labelledby="dropdownMenuButton">
						<li><Link className="dropdown-item justify-content-center" to="/">Home</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/login">Login</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/signup">Signup</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/modifyuser">Modificar Usuario</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/services">Servicios</Link></li>
					</ul>
=======
		<nav className="navbar navbar-responsive d-flex justify-content-between align-items-center px-3">
			<div className="navbar-left">
				<Link to="/" className="navbar-logo navbar-logo-flex">
					<img src="https://res.cloudinary.com/dqwccz9vp/image/upload/e_background_removal/logo_sin_letras_rzkjbl" alt="Logo HandyBox" className="navbar-logo-img" />
					<span className="navbar-logo-text">HandyBox</span>
				</Link>
			</div>
			<div className="navbar-center d-none d-md-flex"></div>
			<div className="navbar-right d-flex align-items-center gap-3">
				<div
					className={`navbar-cart-container d-flex align-items-center${showCart ? '' : ' navbar-cart-disabled'}`}
					onClick={handleCartClick}
				>
					<span
						className={`navbar-cart-emoji${showCart ? '' : ' navbar-cart-emoji-disabled'}`}
						role="img"
						aria-label="carrito"
					>
						🛒
					</span>
					{cartCount > 0 && (
						<span className="navbar-cart-count">
							{cartCount}
						</span>
					)}
					<span className="ms-2">Mi carrito</span>
				</div>
				<div className="dropdown navbar-avatar-dropdown d-flex align-items-center ms-3 navbar-avatar-container">
					<img
						src={userImg}
						alt="imagen de usuario"
						className="rounded-circle border border-2 navbar-avatar-img"
						width={44}
						height={44}
						onClick={() => setDropdownOpen((dropdownAbierto) => !dropdownAbierto)}
					/>
					<span className="ms-2 navbar-avatar-label">Mi cuenta</span>
					{dropdownOpen && (
						<ul className="dropdown-menu show navbar-dropdown-menu">
							{userOptions.map((opcion) => (
								<li key={opcion.to}>
									<Link className="dropdown-item" to={opcion.to} onClick={() => setDropdownOpen(false)}>{opcion.label}</Link>
								</li>
							))}
						</ul>
					)}
>>>>>>> d6af2b7a0566a30d647ccd2dbe01516154f58009
				</div>
			</div>
		</nav>
	);
}