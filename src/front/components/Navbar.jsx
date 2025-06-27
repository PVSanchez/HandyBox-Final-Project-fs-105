import { Link } from "react-router-dom";
import React from "react";
import "../style/Navbar.css";

export const Navbar = () => {
	return (
		<nav className="navbar">
			<div className="container justify-content-center">
				<div className="dropdown">
					<button className="custom-btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
						Páginas
					</button>
					<ul className="dropdown-menu justify-content-center" aria-labelledby="dropdownMenuButton">
						<li><Link className="dropdown-item justify-content-center" to="/">Home</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/login">Login</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/signup">Signup</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/modifyuser">Modificar Usuario</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/services">Servicios</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/payment/0/EUR">Pago</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/createService">Crear Servicio</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/services-pay">Servicios contratados</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/professional-services">Servicios contratados a mí</Link></li>
						<li><Link className="dropdown-item justify-content-center" to="/user-detail">Detalle de Usuario</Link></li>
					</ul>
				</div>
			</div>
		</nav>
	);
};