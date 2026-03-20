# Phase 2 成果物: 設計書

## 1. SkillExecutionStatus テーブル追記内容

### 現行テーブル（6値）- interfaces-agent-sdk-integration.md L310-319

| 値                   | 説明       |
| -------------------- | ---------- |
| `idle`               | 待機中     |
| `running`            | 実行中     |
| `permission_pending` | 権限待ち   |
| `completed`          | 完了       |
| `cancelled`          | キャンセル |
| `error`              | エラー     |

### 追記する3値（Task12 phase-2-design.md 設計確定値）

| 値              | 説明                             | 遷移元      | 遷移先                          |
| --------------- | -------------------------------- | ----------- | ------------------------------- |
| `review`        | レビュー中（品質評価待ち）       | `completed` | `improve_ready` / `reuse_ready` |
| `improve_ready` | 改善準備完了（改善サイクル入り） | `review`    | `running` / `idle`              |
| `reuse_ready`   | 再利用準備完了                   | `review`    | `idle`                          |

### 更新後テーブル（9値）

| 値                   | 説明                             | 遷移元                           | 遷移先                              |
| -------------------- | -------------------------------- | -------------------------------- | ----------------------------------- |
| `idle`               | 待機中                           | -                                | `running`                           |
| `running`            | 実行中                           | `idle` / `improve_ready`         | `completed` / `error` / `cancelled` |
| `permission_pending` | 権限待ち                         | `running`                        | `running` / `cancelled`             |
| `completed`          | 完了                             | `running`                        | `review` / `idle`                   |
| `cancelled`          | キャンセル                       | `running` / `permission_pending` | `idle`                              |
| `error`              | エラー                           | `running`                        | `idle`                              |
| `review`             | レビュー中（品質評価待ち）       | `completed`                      | `improve_ready` / `reuse_ready`     |
| `improve_ready`      | 改善準備完了（改善サイクル入り） | `review`                         | `running` / `idle`                  |
| `reuse_ready`        | 再利用準備完了                   | `review`                         | `idle`                              |

## 2. 状態配置ルール設計

### 配置先

arch-state-management-core.md に以下のセクションを追記する:

```markdown
## SkillExecutionStatus 拡張状態の配置ルール（UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001）

### 新規追加状態

| 状態            | 配置先             | 理由                                     |
| --------------- | ------------------ | ---------------------------------------- |
| `review`        | Zustand agentSlice | executionStatus フィールドの値として管理 |
| `improve_ready` | Zustand agentSlice | executionStatus フィールドの値として管理 |
| `reuse_ready`   | Zustand agentSlice | executionStatus フィールドの値として管理 |

### セレクタ

- 既存セレクタ `useSkillExecutionStatus()` がそのまま使用可能（型が拡張されるため）
- P48 対策: 派生セレクタで `.filter()` を使う場合は `useShallow` を適用
```

### 配置根拠

arch-state-management-reference.md L321 に既存の定義あり:
`executionStatus: SkillExecutionStatus | null` (agentSlice)

新3値は同じ `executionStatus` フィールドの値域拡張であるため、新規 Slice は不要。

## 3. P32 準拠更新順序チェックリスト

| 順序 | ファイル                                       | 更新内容                           | 必須/確認 |
| ---- | ---------------------------------------------- | ---------------------------------- | --------- |
| 1    | `interfaces-agent-sdk-integration.md` L310-319 | テーブルを6値→9値に拡張            | 必須      |
| 2    | `arch-state-management-core.md` 末尾追記       | 拡張状態の配置ルールセクション追加 | 必須      |
| 3    | `ui-ux-feature-components-advanced.md` L151    | DisplayableStatus テーブル確認     | 確認      |
| 4    | topic-map.md 再生成                            | `node scripts/generate-index.js`   | 必須      |

## 4. blocked 時の対応

skill.ts に3値が未追加のため blocked 状態。以下の方針で先行実施:

1. 仕様書テーブルには Task12 設計確定値で追記する
2. 仕様書内に「P65注記: Task12 Phase 5 完了後に skill.ts の実スペルと照合すること」を付記する
3. topic-map.md は仕様書編集後に再生成する

## Phase 2 完了ステータス

- [x] 更新後テーブル（9値 + 遷移条件）確定
- [x] 状態配置ルール設計完了
- [x] P32 準拠更新順序チェックリスト作成
- [x] blocked 時の対応方針決定
- [x] DisplayableStatus 影響分析完了（→ impact-analysis.md）
