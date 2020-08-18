## Asana Task Repeater - Backend (API)

Do you duplicate a lot of tasks on Asana manually? This project will allow you to select a task and set a repeat interval. It will then do a daily scan of tasks that are set to be due in two weeks or less, and auto-duplicate them if they are not already created.

# Currently in pre-Alpha status

### Setup instructions

Setup a postgres database and user

Setup your .env file with the following variables:

```
# Express Server
SERVER_PORT
SESSION_SECRET

# Asana
ASANA_CLIENT_ID
ASANA_CLIENT_SECRET
DOMAIN

# Database
PGHOST
PGPORT
PGDATABASE
PGUSER
PGPASSWORD
```

Setup crontab on the server to run the script(s) located inside the cronjobs folder. Recommended interval is every hour


