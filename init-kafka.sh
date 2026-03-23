#!/bin/bash

echo "⏳ Waiting for Kafka to be ready..."

cub kafka-ready -b localhost:9092 1 20

echo "🚀 Creating topics..."

kafka-topics \
  --create \
  --if-not-exists \
  --topic sos.service \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1

kafka-topics \
  --create \
  --if-not-exists \
  --topic sos.worker \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 1

echo "✅ Topics created"