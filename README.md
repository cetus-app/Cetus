# Cetus
Cetus is a WIP ranking service.

# Server configuration
1. Ensure that the postgreSQL database is installed and that the following query has been run to configure it:
`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`





# Notes
## Free tier
A group is in the "free" tier if it does not have a stripe payment key set.
These groups have a request limit of 150 requests per calendar month.





Copyright 2020 Neztore & EirikFA.
