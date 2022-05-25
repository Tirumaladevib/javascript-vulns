# Merit Data Cleanup Tool

[Technical Design Doc](https://claimyourmerit.atlassian.net/wiki/spaces/INTG/pages/1629978642/Data+Cleanup+Tool+DCT)

[JIRA Epic](https://claimyourmerit.atlassian.net/browse/INTG-490)

**Tech Stack:**

Infra:
- GCP
- Single VM instance (for V1, and we can move to MIG to scale in the future)
- Github actions for CI/CD
- GCP Secrets for secrets management
- Postgres

Backend (all written in Typescript):
- NodeJS
- Fastify 
- typeORM
- Mocha, Sinon, Chai for test suite

Frontend (all written in Typescript):
- ReactJS w/ Typescript
- antd

## Development

### Initial Setup

1. Make sure you have created 2 databases for your dev and test environment:
	```bash
	# Create dev db
	createdb dct

	# Create test db
	createdb dct_test
	```
2. Create a `.env` and a `env.test` file in the project root directory
	```bash
	cp .env.sample .env
	cp .env.sample .env.test
	``` 
	And adjust the values appropriate to your local machine

3. Create a `ormconfig.json` and a `ormconfig-test.json` file in the project root directory
	```bash
	cp ormconfig.sample.json ormconfig.json
	cp ormconfig.sample.json ormconfig-test.json
	```
	and adjust the values appropriate to your local machine

4. Install project dependencies by running `yarn`
5. Build the project, run `yarn build`. The project needs to be built first in order to create schemas
6. Create db schemas on both dev and test DBs:
	```bash
	yarn run typeorm:schema:sync
	```

*note*: You will need to re-run `yarn run typeorm:schema:sync` every time there is a change in schema.

To start the typescript compiler while you develop, run:
```bash
yarn dev
```

To build the project, run:
```bash
yarn build
```

## Test environment
TBD

## Deployment
TBD

