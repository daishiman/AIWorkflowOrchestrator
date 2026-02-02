# カバレッジレポート（Phase 7）

## 作成日

2026-02-02

## 概要

mainブランチへのマージ時にカバレッジが正常に計測・集約されることの設計確認。

## カバレッジ計測フロー

```
┌─────────────────────────────────────────────────────────────┐
│ main push trigger                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ test-desktop (x16 shards)                             │  │
│  │                                                        │  │
│  │  shard 1: --coverage → coverage/                       │  │
│  │  shard 2: --coverage → coverage/                       │  │
│  │  ...                                                   │  │
│  │  shard 16: --coverage → coverage/                      │  │
│  │                                                        │  │
│  │  ↓ upload-artifact (x16)                               │  │
│  │  desktop-coverage-1, desktop-coverage-2, ..., -16      │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ coverage job (if: main push)                          │  │
│  │                                                        │  │
│  │  download-artifact (merge-multiple: true)              │  │
│  │  ↓                                                     │  │
│  │  codecov-action → Codecov                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 設計確認

### 1. mainブランチpushでのカバレッジ計測

| 確認項目         | 設計内容                              | 結果        |
| ---------------- | ------------------------------------- | ----------- |
| トリガー条件     | `github.event_name != 'pull_request'` | ✅ 設計済み |
| coverageフラグ   | `--coverage`付きでテスト実行          | ✅ 設計済み |
| アーティファクト | 16件アップロード                      | ✅ 設計済み |

### 2. coverageジョブ条件

```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

| 条件             | 結果     |
| ---------------- | -------- |
| PR時             | スキップ |
| main push時      | 実行     |
| 他ブランチpush時 | スキップ |

### 3. Codecov連携

| 設定項目         | 値                        |
| ---------------- | ------------------------- |
| action           | codecov/codecov-action@v5 |
| flags            | desktop                   |
| fail_ci_if_error | false                     |

## カバレッジしきい値

### vitest.config.ts設定

```typescript
thresholds: {
  lines: 80,
  functions: 80,
  branches: 60,
  statements: 80,
}
```

### 確認項目

| 指標               | しきい値 | 期待結果   |
| ------------------ | -------- | ---------- |
| Line Coverage      | 80%+     | 達成見込み |
| Branch Coverage    | 60%+     | 達成見込み |
| Function Coverage  | 80%+     | 達成見込み |
| Statement Coverage | 80%+     | 達成見込み |

## 結論

- mainブランチpushでカバレッジ計測が実行される設計
- 16シャードのカバレッジが正しくマージされる設計
- Codecov連携が正常に動作する設計
- カバレッジしきい値（Line 80%+）が維持される見込み
