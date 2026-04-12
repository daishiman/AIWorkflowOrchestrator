# Phase 5: 実装

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 5                                        |
| タスクID   | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 |
| 機能名     | cronConverter 空曜日ガード処理追加       |
| 前提Phase  | Phase 4（テスト作成完了・Red確認済み）   |
| 後続Phase  | Phase 6                                  |
| 作成日     | 2026-04-12                               |
| ステータス | pending                                  |

## 目的

`visualConfigToCron` 関数に空文字退避のガード処理を追加し、`weekdays: []` かつ
`frequency: "weekly"` の組み合わせで不正な cron 式（`"0 9 * * "`）が生成される
問題を解消する。Phase 4 で作成したテストがすべて Green になることを確認する。

## 実行タスク

1. `visualConfigToCron` 関数に空文字退避のガード処理を追加する
2. JSDoc に `@returns` と `@remarks` で空文字退避仕様を記載する
3. 型チェックを実行して型エラーがないことを確認する
4. Phase 4 のテストが Green になることを確認する

## 実装計画

### 修正ファイル一覧

| ファイルパス                                       | 変更種別 | 変更内容                                                      |
| -------------------------------------------------- | -------- | ------------------------------------------------------------- |
| `apps/desktop/src/renderer/utils/cronConverter.ts` | 修正     | `visualConfigToCron` に空文字退避のガード処理追加、JSDoc 更新 |

### 新規作成ファイル

なし（既存ファイルへの追記のみ）

### ガード処理の実装方針

```typescript
if (config.frequency === "weekly" && config.weekdays.length === 0) {
  return "";
}
```

### JSDoc 更新方針

- `@returns` に `weekly` かつ `weekdays=[]` の場合は空文字を返す旨を記載する
- `@remarks` に、呼び出し元は既存バリデーションで空文字を無効入力として扱う旨を記載する

## 参照資料

| 資料名               | パス                                               | 用途                         |
| -------------------- | -------------------------------------------------- | ---------------------------- |
| Phase 2 設計決定記録 | `outputs/phase-2/design-decision.md`               | 空文字退避方針の確定内容確認 |
| Phase 3 設計レビュー | `outputs/phase-3/design-review-result.md`          | 設計確定内容確認             |
| Phase 4 テストケース | `outputs/phase-4/test-matrix.md`                   | 追加テスト内容確認           |
| cronConverter 本体   | `apps/desktop/src/renderer/utils/cronConverter.ts` | 実装対象ファイル             |

## 実行手順

### Step 1: 実装対象箇所の特定

`cronConverter.ts` の `visualConfigToCron` 関数内で `frequency === "weekly"`
の分岐ブロックを特定する。

### Step 2: ガード処理の追加

`weekdays.length === 0` のときは空文字を返し、それ以外は既存の文字列生成を維持する。
ガード処理は `frequency === "weekly"` の分岐の先頭に配置し、既存の処理フローへの影響を最小化する。

### Step 3: JSDoc 更新

`@returns` と `@remarks` を追記し、空曜日時の動作仕様を明示する。

### Step 4: 型チェック実行

```bash
pnpm --filter @repo/desktop typecheck
```

型エラーが 0 件であることを確認する。

### Step 5: テスト実行（Green 確認）

```bash
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
```

Phase 4 で作成したテストケース（空曜日ケースを含む）がすべて PASS することを確認する。

## 統合テスト連携

本 Phase での変更は `cronConverter.ts` 単体に閉じており、他モジュールへの
副作用は発生しない。空文字退避は既存の `validateCronExpression` によって無効入力として扱われる。

## サブタスク管理

| #   | サブタスク                | 担当   | 状態    |
| --- | ------------------------- | ------ | ------- |
| 1   | ガード処理コーディング    | 実装者 | pending |
| 2   | JSDoc 更新                | 実装者 | pending |
| 3   | 型チェック通過確認        | 実装者 | pending |
| 4   | Phase 4 テスト Green 確認 | 実装者 | pending |

## 成果物

| 成果物            | パス                                       | 説明                                      |
| ----------------- | ------------------------------------------ | ----------------------------------------- |
| 実装結果レポート  | `outputs/phase-5/implementation-result.md` | 変更内容・Before/After を記録したレポート |
| Green確認レポート | `outputs/phase-5/green-confirmation.md`    | テスト実行ログ・全件 PASS の証跡          |

## codeArtifacts

- `apps/desktop/src/renderer/utils/cronConverter.ts`

## 完了条件

- [ ] `visualConfigToCron` に空文字退避のガード処理が追加されていること
- [ ] JSDoc が更新され、ガード処理の動作仕様が明示されていること
- [ ] `pnpm --filter @repo/desktop typecheck` が 0 エラーであること
- [ ] Phase 4 で作成したテストケースがすべて Green（PASS）であること
- [ ] `outputs/phase-5/implementation-result.md` が作成されていること
- [ ] `outputs/phase-5/green-confirmation.md` が作成されていること

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 6: テスト拡充
