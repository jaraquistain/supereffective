#!/bin/bash

# Get the latest commit hash from GitHub API
MD5=$(curl -s "https://api.github.com/repos/itsjavi/supereffective-assets/commits/main" | grep -m1 -o '"sha": "[^"]*"' | cut -d'"' -f4)
MD5_SDK=$(curl -s "https://api.github.com/repos/itsjavi/supereffective-sdk/commits/main" | grep -m1 -o '"sha": "[^"]*"' | cut -d'"' -f4)

# Write the MD5 hash to the file
echo "Using data from https://github.com/itsjavi/supereffective-assets/commit/$MD5"
echo "https://github.com/itsjavi/supereffective-assets/commit/$MD5" > data.head

echo "Using data from https://github.com/itsjavi/supereffective-sdk/commit/$MD5_SDK"
echo "https://github.com/itsjavi/supereffective-sdk/commit/$MD5_SDK" >> data.head
