FROM mcr.microsoft.com/devcontainers/python:3.13-bookworm

ENV POETRY_VERSION=1.8.2 \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    PATH="/root/.local/bin:$PATH"

ARG USERNAME=vscode
ARG WORKDIR=/agentic-advisor

# Update the expired Yarn GPG key
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /usr/share/keyrings/yarn.gpg >/dev/null \
    && echo "deb [signed-by=/usr/share/keyrings/yarn.gpg] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# System Dependencies
RUN rm -f /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install --no-install-recommends -y \
    curl \
    ca-certificates \
    libicu-dev \
    git \
    curl \
    sudo \
    wget \
    jq \
    apt-transport-https \
    lsb-release \
    gnupg \
    software-properties-common

# Cleaning cache
RUN rm -rf /var/lib/apt/lists/* \
    && apt-get purge -y --auto-remove \
    && apt-get autoremove \
    && apt-get clean -y

RUN echo "${USERNAME}:${USERNAME}" | chpasswd \
    && adduser ${USERNAME} sudo \
    && echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Create docker group and add vscode user to it
RUN if ! getent group docker; then groupadd docker; fi && usermod -aG docker vscode

USER  $USERNAME

# Install pre-commit globally (for repo-wide git hooks)
RUN pip install pre-commit

# Installing `poetry` package manager:
# https://github.com/python-poetry/poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# add the local bin to the PATH for the non-root user
ENV PATH="/home/${USERNAME}/.local/bin:${PATH}"

# copy the project files into the container and set ownership
COPY --chown=${USERNAME}:${USERNAME} . ${WORKDIR}

# Set default shell to bash
SHELL ["/bin/bash", "-c"]

# Add this line at the end:
CMD [ "sleep", "infinity" ]
