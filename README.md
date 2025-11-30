[![CI/CD Pipeline](https://github.com/cmgomes5/capstone_proj/actions/workflows/workflow.yml/badge.svg)](https://github.com/cmgomes5/capstone_proj/actions/workflows/workflow.yml)

# Virtual DM

A companion tool for DMs who like to play in person, 
but hate managing turn order on pencil and paper.

# Running Locally

## Dependencies

- Node.js
- Docker
- Task
- Tilt
- K3d

If you are using a Mac environment you can install these
dependencies using Homebrew and the command `brew bundle`

## Running

Running with Manifests using Tilt use `task tilt`

To run for local development you can use `task run-dev`

For a proper build of the Docker container you can use `task docker-run`

If you want to avoid installing Docker, Task, Tilt, and K3d you can use `npm run dev`
or `npm build && npm run start`

## Testing

Tests can be run with `task test`.

Testing uses Playwright.
