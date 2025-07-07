import os
from flask_admin import Admin
from api.models.User import  User
from api.database.db import db 
from flask_admin.contrib.sqla import ModelView
from api.models.Service import Service
from api.models.Rol import Rol
from api.models.StripePay import StripePay
from api.models.Rate import Rate
from api.models.ServiceState import ServiceState
from api.models.UserDetail import UserDetail
from api.models.Message import Message


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3')

    
    # Add your models here, for example this is how we add a the User model to the admin
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(Rol, db.session))
    admin.add_view(ModelView(Service, db.session))
    admin.add_view(ModelView(StripePay, db.session))
    admin.add_view(ModelView(Rate, db.session))
    admin.add_view(ModelView(ServiceState, db.session))
    admin.add_view(ModelView(UserDetail, db.session))
    admin.add_view(ModelView(Message, db.session))


    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))