from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import os


def send_email(to_email, subject, body):
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    email_from = os.getenv('SMTP_EMAIL')
    password = os.getenv('SMTP_PASSWORD')

    msg = MIMEMultipart()
    msg['From'] = email_from
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(email_from, password)
        server.send_message(msg)
