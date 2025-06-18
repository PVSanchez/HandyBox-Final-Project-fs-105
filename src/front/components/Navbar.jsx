import { Link } from "react-router-dom";
import React from "react";

export const Navbar = () => {
	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container justify-content-center">
				<div className="dropdown">
					<button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
						Páginas
					</button>
					<ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
						<li><Link className="dropdown-item" to="/">Home</Link></li>
						<li><Link className="dropdown-item" to="/login">Login</Link></li>
						<li><Link className="dropdown-item" to="/signup">Signup</Link></li>
						<li><Link className="dropdown-item" to="/modifyuser">Modificar Usuario</Link></li>
						<li><Link className="dropdown-item" to="/services">Servicios</Link></li>
					</ul>
				</div>
			</div>
		</nav>
	);
};