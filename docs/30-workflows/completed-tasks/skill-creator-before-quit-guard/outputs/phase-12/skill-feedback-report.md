# Phase 12: skill-feedback-report

## フィードバック

### task-specification-creator への改善提案

1. Phase 11 の manual test について、非 visual task では「実地操作不可」の代替記録テンプレートを標準化するとよい
2. Phase 7 の coverage 要件は、全ファイルではなく「対象範囲」を明記できるようにすると、今回のような局所検証に向いている
3. Phase 12 の system-spec update は、workflow-local 同期と global skill sync を分けて記録できると読みやすい

### 今回の学び

- 既存テストファイルに TC-B-04 / TC-B-05 を追記する方が、責務分離と保守性の両面で自然だった
- before-quit guard は UI 層より main process に閉じた方が、責務が明快になる
- `app.exit(0)` のような強制終了系は、コード上の実装だけでなく、文書上で「既知制限」として残すことが重要
