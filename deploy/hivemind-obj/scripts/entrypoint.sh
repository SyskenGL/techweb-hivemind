#!/bin/sh

set -e

HOST="http://${MINIO_SERVICE_NAME}:${MINIO_PORT:-9000}"

/usr/bin/mc alias set hivemind "$HOST" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY"

if /usr/bin/mc ls hivemind/hivemind-users-media > /dev/null 2>&1; then
  echo "Bucket 'hivemind-users-media' already exists. Skipping restore."
else
  echo "Creating Bucket: hivemind-users-media"
  /usr/bin/mc mb hivemind/hivemind-users-media
  /usr/bin/mc policy set public hivemind/hivemind-users-media
fi

if [ -d "/buckets/hivemind-users-media" ] && [ "$(ls -A /buckets/hivemind-users-media)" ]; then
  echo "Restoring Bucket: hivemind-users-media"
  /usr/bin/mc mirror /buckets/hivemind-users-media hivemind/hivemind-users-media
else
  echo "No backup found. Skipping bucket restore."
fi