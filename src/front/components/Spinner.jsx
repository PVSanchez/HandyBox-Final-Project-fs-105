import React from "react";
import { Link } from "react-router-dom"


export const Spinner = () => {
    return (
        <>
            <div className="spinner-border text-primary m-auto" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </>
    )

}