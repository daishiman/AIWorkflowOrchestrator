# Environment-Specific Implementation

## Node.js

```typescript
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
```

## Python

```python
import signal
import sys

def graceful_shutdown(signum, frame):
    print("Shutting down...")
    cleanup()
    sys.exit(0)

signal.signal(signal.SIGTERM, graceful_shutdown)
signal.signal(signal.SIGINT, graceful_shutdown)
```

## Docker

```dockerfile
# Use tini for proper signal handling
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
```

## Kubernetes

```yaml
spec:
  terminationGracePeriodSeconds: 60
  containers:
    - name: app
      lifecycle:
        preStop:
          exec:
            command: ["/bin/sh", "-c", "sleep 5"]
```

## Systemd

```ini
[Service]
Type=notify
TimeoutStopSec=30
KillMode=mixed
KillSignal=SIGTERM
```

## PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "app",
      script: "./app.js",
      kill_timeout: 30000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
```
