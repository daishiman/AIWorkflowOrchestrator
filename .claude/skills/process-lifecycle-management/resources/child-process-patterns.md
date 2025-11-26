# 子プロセス管理パターン

## Node.js子プロセスAPI

### spawn

**用途**: 長時間実行コマンド、ストリーム処理

```javascript
const { spawn } = require('child_process');

// 基本使用
const child = spawn('ls', ['-la']);

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
```

**オプション**:
```javascript
spawn('command', ['args'], {
  cwd: '/path/to/directory',
  env: { ...process.env, CUSTOM_VAR: 'value' },
  stdio: ['pipe', 'pipe', 'pipe'],
  detached: false,
  shell: false
});
```

### fork

**用途**: Node.jsプロセス間通信（IPC）

```javascript
const { fork } = require('child_process');

// 親プロセス
const child = fork('./worker.js');

child.on('message', (msg) => {
  console.log('Message from child:', msg);
});

child.send({ type: 'START', data: { task: 'process' } });

child.on('exit', (code) => {
  console.log(`Worker exited with code ${code}`);
});
```

```javascript
// worker.js (子プロセス)
process.on('message', (msg) => {
  if (msg.type === 'START') {
    // 処理実行
    const result = doWork(msg.data);
    process.send({ type: 'RESULT', data: result });
  }
});
```

### exec

**用途**: 短時間コマンド、出力をバッファリング

```javascript
const { exec } = require('child_process');

exec('git status', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

// Promiseラッパー
const util = require('util');
const execPromise = util.promisify(exec);

async function runCommand() {
  const { stdout, stderr } = await execPromise('ls -la');
  return stdout;
}
```

## ゾンビプロセス回避

### ゾンビプロセスとは

```
親プロセス  ──fork──►  子プロセス
     │                    │
     │                    │ exit()
     │                    ▼
     │              ┌──────────┐
     │              │  Zombie  │  ← waitpidされるまでゾンビ
     │              └──────────┘
     │                    │
wait()────────────────────┘
     │
     ▼
子プロセスのリソース解放
```

### 回避パターン

**1. exit/closeイベントの処理**:
```javascript
const child = spawn('command', ['args']);

// 必ずexitイベントを処理
child.on('exit', (code, signal) => {
  console.log(`Child exited: code=${code}, signal=${signal}`);
});

// closeイベントも処理
child.on('close', (code) => {
  // stdio がすべて閉じられた
});
```

**2. 子プロセスの追跡**:
```javascript
class ChildProcessManager {
  constructor() {
    this.children = new Map();
  }

  spawn(command, args, options) {
    const child = spawn(command, args, options);
    const id = child.pid;

    this.children.set(id, child);

    child.on('exit', () => {
      this.children.delete(id);
    });

    return child;
  }

  async killAll() {
    const promises = [];
    for (const [pid, child] of this.children) {
      promises.push(new Promise((resolve) => {
        child.on('exit', resolve);
        child.kill('SIGTERM');
      }));
    }
    await Promise.all(promises);
  }
}
```

**3. detachedプロセスの切り離し**:
```javascript
const child = spawn('long-running-process', [], {
  detached: true,
  stdio: 'ignore'
});

// 親プロセスを終了しても子は継続
child.unref();
```

## プロセスプールパターン

### ワーカープール実装

```javascript
const { fork } = require('child_process');

class WorkerPool {
  constructor(size, workerPath) {
    this.size = size;
    this.workerPath = workerPath;
    this.workers = [];
    this.queue = [];
    this.freeWorkers = [];

    this.initializeWorkers();
  }

  initializeWorkers() {
    for (let i = 0; i < this.size; i++) {
      this.createWorker();
    }
  }

  createWorker() {
    const worker = fork(this.workerPath);

    worker.on('message', (msg) => {
      if (msg.type === 'READY') {
        this.freeWorkers.push(worker);
        this.processQueue();
      } else if (msg.type === 'RESULT') {
        msg.callback(null, msg.data);
        this.freeWorkers.push(worker);
        this.processQueue();
      }
    });

    worker.on('exit', () => {
      const index = this.workers.indexOf(worker);
      if (index > -1) {
        this.workers.splice(index, 1);
        this.createWorker();  // 自動復旧
      }
    });

    this.workers.push(worker);
    worker.send({ type: 'INIT' });
  }

  async execute(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        callback: (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      });
      this.processQueue();
    });
  }

  processQueue() {
    if (this.queue.length === 0 || this.freeWorkers.length === 0) {
      return;
    }

    const worker = this.freeWorkers.shift();
    const { task, callback } = this.queue.shift();

    worker.send({ type: 'TASK', data: task });
    worker.callback = callback;
  }

  async shutdown() {
    for (const worker of this.workers) {
      worker.kill('SIGTERM');
    }
  }
}
```

## エラーハンドリング

### 子プロセスエラーの捕捉

```javascript
const child = spawn('nonexistent-command');

child.on('error', (err) => {
  console.error('Failed to start child process:', err);
});

child.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Child process failed: code=${code}, signal=${signal}`);
  }
});
```

### タイムアウト処理

```javascript
function spawnWithTimeout(command, args, timeout) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let output = '';

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Process timed out after ${timeout}ms`));
    }, timeout);

    child.stdout.on('data', (data) => {
      output += data;
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
```

## PM2との連携

### PM2のクラスタモード

```javascript
// ecosystem.config.js
{
  exec_mode: 'cluster',
  instances: 4
}
```

PM2が内部でCluster APIを使用:
- マスタープロセス: PM2
- ワーカープロセス: アプリケーション

### PM2での子プロセス管理

```javascript
// メインアプリが子プロセスを生成する場合
const child = spawn('worker', ['task']);

// 親プロセス終了時に子も終了
process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  process.exit(0);
});
```
