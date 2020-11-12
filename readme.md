## Asana Task Repeater - Backend (API)

This application requires this front end repo: https://github.com/SeanDez/asana_task_repeater_frontend

Asana Task Repeater allows an Asana user to set repeat rules on certain tasks and have them automatically repeat. It uses cron job operations to do this twice per day.

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



