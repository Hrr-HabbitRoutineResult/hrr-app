#!/bin/sh

# gitignore로 인해 CI 빌드 전 직접 주입 필요
echo "$GOOGLE_SERVICE_INFO_PLIST" | base64 --decode > "$CI_PRIMARY_REPOSITORY_PATH/ios/GoogleService-Info.plist"