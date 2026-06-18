# Contributing to Scholarship Finder AI

First off, thank you for considering contributing to Scholarship Finder AI! It's people like you that make this tool better for everyone.

## Development Setup
1. Fork the repo and create your branch from `main`.
2. Follow the [README.md](README.md) instructions to spin up the local Docker environment and start the servers.
3. If you've added code that should be tested, add tests in `backend/tests/` or `frontend/src/tests/`.
4. Ensure the test suite passes (`pytest` and `npm run test`).
5. Run the linters (`npm run lint` / `flake8`).

## Pull Request Process
1. Update the README.md with details of changes to the interface, if applicable.
2. Ensure any new environment variables are documented.
3. Your PR will be reviewed by maintainers, who may request changes.
4. Once approved, your PR will be merged!

## Adding a New Scraper (Spider)
If you want to add a new scholarship website to scrape:
1. Create a new file in `backend/scraper/spiders/`.
2. Inherit from `BaseScholarshipSpider`.
3. Add it to `CELERYBEAT_SCHEDULE` in `backend/celery_app.py` if it should be run automatically.

Thank you for contributing!
