import os

# Database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(basedir, "database.sqlite3")
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Security settingsa
SECRET_KEY = "you-will-never-guess"
SECURITY_PASSWORD_SALT = "146585145368132386173505678016728509634"
SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"

# Disable CSRF for APIs
WTF_CSRF_ENABLED = False

# Static files configuration
IMAGES_PATH = os.path.join(basedir, "static/images")

# Redis caching configuration
CACHE_TYPE = "RedisCache"
CACHE_REDIS_HOST = "localhost"
CACHE_REDIS_PORT = 6379
CACHE_REDIS_DB = 3
