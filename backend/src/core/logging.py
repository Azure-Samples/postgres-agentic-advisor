import logging
import sys

logger = logging.getLogger("agentic_shop")

formatter = logging.Formatter(
    fmt="[%(asctime)s] [PID:%(process)d] [%(levelname)s] [%(name)s] %(message)s",
)

stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setFormatter(formatter)

logger.handlers = [stream_handler]
logger.propagate = False
logger.setLevel(logging.INFO)
