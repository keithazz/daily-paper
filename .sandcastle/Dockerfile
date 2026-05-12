# Sandcastle sandbox image
#
# This image runs the AFK coding agent (Pi) in isolation. Customise the
# project-specific sections (TODO markers) for your language and toolchain.
#
# Build with:  npx sandcastle docker build-image
# Or:          docker build -f .sandcastle/Dockerfile -t sandcastle:local .

FROM node:22-bookworm-slim

# Base system dependencies — required by Sandcastle and the agent.
# Do not remove git, curl, or jq.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    jq \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# GitHub CLI — required for the agent to read issue context.
RUN type -p curl >/dev/null \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        | gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
        | tee /etc/apt/sources.list.d/github-cli.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends gh \
    && rm -rf /var/lib/apt/lists/*

# Pi coding agent.
# Pinning to a specific version is recommended once you have a working setup.
RUN npm install -g @mariozechner/pi-coding-agent

# ---------------------------------------------------------------------------
# TODO: project-specific toolchain.
# Add the language runtime, package manager, and any system packages your
# tests need to run inside the sandbox. A few examples:
#
# Python:
#   RUN apt-get update && apt-get install -y --no-install-recommends \
#       python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*
#   RUN pip3 install --break-system-packages uv
#
# Rust:
#   RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
#   ENV PATH="/root/.cargo/bin:${PATH}"
#
# Go:
#   RUN curl -fsSL https://go.dev/dl/go1.22.0.linux-amd64.tar.gz \
#       | tar -C /usr/local -xz
#   ENV PATH="/usr/local/go/bin:${PATH}"
#
# Replace the comment block below with the toolchain you actually need.
# ---------------------------------------------------------------------------

# TODO: install project toolchain here.

# Non-root user for the agent.
# Sandcastle's bind-mount expects a user that maps cleanly to the host owner;
# the default `agent` user (uid 1000) is a sensible starting point.
RUN useradd -m -u 1000 -s /bin/bash agent
USER agent
WORKDIR /workspace

# Pi configuration directory.
# Mount a host-side models.json into ~/.pi/agent/models.json at run time
# (via Sandcastle's mount support) so the agent can reach LM Studio.
RUN mkdir -p /home/agent/.pi/agent
