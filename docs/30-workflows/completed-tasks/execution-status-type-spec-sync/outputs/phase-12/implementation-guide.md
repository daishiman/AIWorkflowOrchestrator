# 実装ガイド: SkillExecutionStatus 9値型仕様同期

> タスクID: UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001
> 作成日: 2026-03-20

---

## Part 1: 概念説明（中学生レベル）

### 料理のレシピの状態管理で考えよう

AIがスキル（お仕事）を実行するとき、「今どうなっているか」を表す状態があります。これを料理で例えてみましょう。

| 状態                 | 料理でいうと           | 意味                       |
| -------------------- | ---------------------- | -------------------------- |
| `idle`               | レシピを選んでいない   | 何もしていない待機状態     |
| `running`            | 料理中                 | AIがスキルを実行中         |
| `permission_pending` | 材料の確認待ち         | ユーザーの許可を待っている |
| `completed`          | 料理が完成             | スキル実行が正常に完了     |
| `cancelled`          | 作るのをやめた         | ユーザーが中止した         |
| `error`              | 料理失敗               | 実行中にエラーが発生       |
| `review`             | 味見中（品質チェック） | 完成品の品質を評価中       |
| `improve_ready`      | 味付け調整の準備OK     | 改善サイクルに入る準備完了 |
| `reuse_ready`        | レシピとして保存OK     | 成果物を再利用可能な状態   |

### なぜ新しい3つの状態が必要なのか

元々は「完成しました（completed）」で終わりでした。でもそれだと:

- 「完成したけど、品質はどうだろう？」 → 味見（review）が必要
- 「味見した結果、もう少し改善したい」 → 味付け調整（improve_ready）が必要
- 「これは良い出来だ、レシピとして保存しよう」 → レシピ保存（reuse_ready）が必要

つまり、「完成」の後の**品質チェックと改善のサイクル**を追跡できるようにしたのです。

### 状態の流れ

```
[idle] --> [running] --> [completed] --> [review]
              |              |              |
              v              |         +---------+
           [error]           |         |         |
              |              v    [improve_ready] [reuse_ready]
              v          [cancelled]    |              |
           [idle]           |           v              v
                            v        [running]       [idle]
                          [idle]     (もう一度)
```

---

## Part 2: 開発者向け実装詳細

### 1. SkillExecutionStatus 9値定義テーブル

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

### 2. 状態遷移図（テキスト形式）

```
                         +--- permission_pending ---+
                         |          |               |
                    (権限要求)  (許可/拒否)    (キャンセル)
                         |          |               |
idle ---(実行開始)---> running --+--+--- cancelled ---> idle
  ^                      |         |
  |                 (正常完了)  (エラー)
  |                      |         |
  |                      v         v
  +--- reuse_ready <--- review    error ---> idle
  |        ^              |
  |        |         (評価結果)
  |        |           /    \
  |   (再利用OK)  (改善要)
  |        |         |
  |        |         v
  +--------+    improve_ready ---(再実行)---> running
  |                  |
  +---(中止)--------+
```

### 3. Zustand agentSlice 配置

新3値は既存の `executionStatus` フィールドの値域拡張として管理される。

**配置先**: `agentSlice.executionStatus: SkillExecutionStatus | null`

| 状態            | 配置先             | 理由                                     |
| --------------- | ------------------ | ---------------------------------------- |
| `review`        | Zustand agentSlice | executionStatus フィールドの値として管理 |
| `improve_ready` | Zustand agentSlice | executionStatus フィールドの値として管理 |
| `reuse_ready`   | Zustand agentSlice | executionStatus フィールドの値として管理 |

新規 Slice は不要。既存の agentSlice 内で完結する。

### 4. セレクタ: useSkillExecutionStatus()

既存セレクタがそのまま使用可能（型が拡張されるため）。

```typescript
// 既存セレクタ - 変更不要
const status = useSkillExecutionStatus();
```

**P48 対策**: 派生セレクタで `.filter()` を使う場合は `useShallow` を適用する。

```typescript
// P48 準拠: useShallow で shallow 比較を適用
import { useShallow } from "zustand/react/shallow";
const activeStatuses = useAppStore(
  useShallow((state) =>
    Object.values(state.agents).filter(
      (a) => a.executionStatus === "running" || a.executionStatus === "review",
    ),
  ),
);
```

**P31 対策**: アクション関数は個別セレクタで取得し、合成Store Hookの戻り値を useEffect 依存配列に含めない。

### 5. 更新ファイル一覧

| ファイル                                         | 変更内容                                        |
| ------------------------------------------------ | ----------------------------------------------- |
| `interfaces-agent-sdk-integration.md` (L310-322) | SkillExecutionStatus テーブルを6値から9値に拡張 |
| `arch-state-management-core.md` (L504-527)       | 拡張状態の配置ルールセクションを追記            |
| `topic-map.md`                                   | generate-index.js による自動再生成              |
| `keywords.json`                                  | generate-index.js による自動再生成              |

### 6. P65 注記

本タスクは Task12（TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001）の Phase 5 完了前に仕様書を先行更新している。Task12 Phase 5 完了後に `packages/shared/src/types/skill.ts` の実スペルと照合し、差異があれば修正すること。
