# Phase 5: 実装（TDD Green フェーズ）

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 5                                       |
| Phase名    | 実装                                    |
| 前提Phase  | Phase 4（テスト作成・Red確認）          |
| 後続Phase  | Phase 6                                 |
| ステータス | 未実施                                  |
| 作成日     | 2026-04-13                              |
| 機能名     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 |

---

## 目的

TDD の Green フェーズとして、Phase 4 で Red になったテスト（TC-11〜TC-13）を
Green にする最小限の実装を `cronConverter.ts` に行う。
同時に JSDoc も更新し AC-7 に対応する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ガード処理実装

**目的**: `monthly` 分岐に `dayOfMonth` 範囲チェックのガード処理を追加する

**実行手順**:

1. `apps/desktop/src/renderer/utils/cronConverter.ts` を開く
2. `monthly` 分岐を以下のように変更する:

   **修正前**:

   ```typescript
   case "monthly":
     return `${minute} ${hour} ${dayOfMonth} * *`;
   ```

   **修正後**:

   ```typescript
   case "monthly": {
     if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
       return "";
     }
     return `${minute} ${hour} ${dayOfMonth} * *`;
   }
   ```

3. ファイルを保存する

**期待される成果物**:

- `apps/desktop/src/renderer/utils/cronConverter.ts` の変更（コード成果物）

---

### タスク2: JSDoc 更新

**目的**: AC-7 に対応するため `visualConfigToCron` 関数の JSDoc を更新する

**実行手順**:

1. `visualConfigToCron` 関数の JSDoc を確認する
2. `@returns` と `@remarks` に `monthly` ガード仕様を追記する:

   ```typescript
   /**
    * @returns cron 式文字列。
    *   - `frequency="weekly"` かつ `weekdays=[]` の場合は空文字 `""` を返す。
    *   - `frequency="monthly"` かつ `dayOfMonth` が非整数、または範囲外（< 1 または > 31）の場合は空文字 `""` を返す。
    *
    * @remarks
    * 空曜日・不正な日付は有効な cron 式に変換できないため、ガード処理では例外を投げず空文字を返す。
    * 呼び出し元は既存のバリデーションで空文字を無効入力として扱う。
    */
   ```

3. ファイルを保存する

**期待される成果物**:

- `apps/desktop/src/renderer/utils/cronConverter.ts` の JSDoc 更新（コード成果物）

---

### タスク3: Green 状態確認

**目的**: 実装後に TC-11〜TC-15 が全て Green になることを確認する

**実行手順**:

1. テストを実行する:
   ```bash
   pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
   ```
2. TC-11〜TC-15 が全て Green（Pass）であることを確認する
3. 既存テスト（TC-1〜TC-10等）が引き続き Green であることを確認する（AC-6）
4. 結果を記録する

**期待される成果物**:

- `outputs/phase-5/test-green-result.md`（テスト Green 確認レポート）

---

### タスク4: 実装サマリー作成

**目的**: 変更内容を記録する

**実行手順**:

1. 変更したファイルと変更内容を記録する:
   - `cronConverter.ts`: `monthly` 分岐のガード処理追加
   - `cronConverter.ts`: JSDoc 更新
2. 変更行数（差分）を記録する
3. `outputs/phase-5/implementation-summary.md` を作成する

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`（実装サマリー）
- `outputs/phase-5/test-green-result.md`（Green状態確認レポート）

---

## 参照資料

| 参照資料          | パス                                               | 内容          |
| ----------------- | -------------------------------------------------- | ------------- |
| 実装ファイル      | `apps/desktop/src/renderer/utils/cronConverter.ts` | 変更対象      |
| Phase 2 設計      | `outputs/phase-2/implementation-design.md`         | 実装方針      |
| Phase 2 JSDoc設計 | `outputs/phase-2/jsdoc-design.md`                  | JSDoc更新内容 |

---

## 成果物

| 成果物        | パス                                               | 内容                       |
| ------------- | -------------------------------------------------- | -------------------------- |
| 実装コード    | `apps/desktop/src/renderer/utils/cronConverter.ts` | ガード処理（コード成果物） |
| 実装サマリー  | `outputs/phase-5/implementation-summary.md`        | 変更内容の記録             |
| Green状態確認 | `outputs/phase-5/test-green-result.md`             | テスト全件グリーン確認     |

---

## 統合テスト連携

- TC-11〜TC-15 が全件 Green であることを確認する
- 既存テスト全件（TC-1〜）が引き続き Green であることを確認する

---

## TDD 検証（Phase 5）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
```

**確認項目**:

- [ ] TC-11〜TC-15 が全て Green（Pass）であることを確認

---

## 完了条件

- [ ] `cronConverter.ts` の `monthly` 分岐にガード処理が追加されている
- [ ] `!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31` のガードが実装されている
- [ ] JSDoc の `@returns` と `@remarks` に `monthly` ガード仕様が追記されている
- [ ] TC-11〜TC-15 が全て Green である
- [ ] 既存テスト（AC-6）が全て Green である
- [ ] `outputs/phase-5/implementation-summary.md` が作成されている
- [ ] `outputs/phase-5/test-green-result.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了し、Red 状態が確認されていること
- **後続**: Phase 6（テスト拡充）へ進む

---

## Phase実行記録（完了後に記録）

```markdown
## Phase 5 実行記録

### 実装内容

- 変更ファイル: apps/desktop/src/renderer/utils/cronConverter.ts
- 変更箇所: monthly 分岐にガード処理追加、JSDoc 更新
- 変更行数:

### TDD Green 状態確認

- TC-11: [Pass/Fail]
- TC-12: [Pass/Fail]
- TC-13: [Pass/Fail]
- TC-14: [Pass/Fail]
- TC-15: [Pass/Fail]
- 既存テスト全件: [Pass/Fail]

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001/phase-6-test-expansion.md`
