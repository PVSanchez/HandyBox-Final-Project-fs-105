import React from "react";
export const Footer = () => (
	<footer className="footer mt-auto py-3 bg-dark text-light text-center">
		<div className="container">
			<p className="mb-1 h5">
				Proyecto realizado por <span className="fw-bold text-warning">HandyBox</span>
			</p>
			<p className="mb-0">
				Creadores:
				<span className="ms-2">
					<i className="fa-solid fa-user-tie me-1 text-info"></i> Dario Otazu
				</span>
				<span className="ms-3">
					<i className="fa-solid fa-user-tie me-1 text-info"></i> Pedro Velez
				</span>
			</p>
		</div>
	</footer>
);
