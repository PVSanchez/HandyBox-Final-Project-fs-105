import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

export const PaymentPage = () => {
    const { totalAmount, currency } = useParams()
    console.log(totalAmount)

    const [clientSecret, setClientSecret] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!totalAmount || !currency) return

        setLoading(true)

       
        const token = sessionStorage.getItem('token');

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/create-payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` })
            },
            body: JSON.stringify({ amount: Number(totalAmount) * 100, currency }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.client_secret) {
                    setClientSecret(data.client_secret)
                } else {
                    console.error("Error: clientSecret no recibido", data)
                }
            })
            .catch(error => console.error("Error en la petición:", error))
            .finally(() => setLoading(false))
    }, [totalAmount, currency])

    if (loading) return <p>Generando pago...</p>
    if (!clientSecret) return <p>Error: No se pudo obtener el clientSecret</p>

    const appearance = {
        theme: 'night', 
        labels: 'floating'
    }

    return (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
            <CheckoutForm clientSecret={clientSecret} />
        </Elements>
    )
}