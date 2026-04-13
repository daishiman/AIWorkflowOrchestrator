# Phase 2: 設計

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 2                                        |
| 機能名 | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 |
| 作成日 | 2026-04-12                               |

## 目的

空 `weekdays` ガード処理を「空文字を返す early return」として確定する。
`visualConfigToCron` の weekly 分岐で `weekdays.length === 0` を検出し、cron 文字列を組み立てずに空文字 `""` を返す。

---

## 実行タスク

- **タスク1**: 空文字退避方針の確定
- **タスク2**: `visualConfigToCron` 関数の型シグネチャ確認（戻り値 `string` は維持）
- **タスク3**: JSDoc 変更内容の設計（`@returns` と `@remarks`）
- **タスク4**: 呼び出し元影響の確認（既存バリデーションとの整合）
- **タスク5**: 変更ファイル一覧テーブル（Before/After）の作成

---

## 参照資料

| 資料名                           | パス                                                          | 説明                 |
| -------------------------------- | ------------------------------------------------------------- | -------------------- |
| Phase 1 受入基準                 | `outputs/phase-1/acceptance-criteria.md`                      | AC-1〜AC-5           |
| Phase 1 スコープ定義             | `outputs/phase-1/scope-definition.md`                         | 空文字退避方針の確認 |
| cronConverter 実装               | `apps/desktop/src/renderer/utils/cronConverter.ts`            | 修正対象関数         |
| cronConverter エッジケーステスト | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | テスト追加対象       |

---

## 実行手順（設計内容）

### ステップ1: 採用方針の確定

| 方針      | 実装内容                                                             | 採否   | 理由                                                                      |
| --------- | -------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| 採用方針  | `weekdays.length === 0` のとき `""` を返す early return              | 採用   | UI 側の既存バリデーションと整合し、意図しない曜日への自動補完を避けられる |
| 不採用案1 | `throw new Error("weekdays must not be empty for weekly frequency")` | 不採用 | 呼び出し元に追加の例外処理が必要になり、今回のスコープを広げる            |
| 不採用案2 | `weekdays: []` のとき日曜（0）を補完して cron 式を返す               | 不採用 | 意図しないスケジュールを作るため、改善目的に反する                        |

### ステップ2: 型シグネチャ（変更前/後）

**変更前（現状）**:

```typescript
/**
 * VisualConfig を cron 式文字列に変換する
 * @param config - スケジュール設定
 * @returns cron 式文字列
 */
export function visualConfigToCron(config: VisualCronConfig): string {
  // ...
  if (config.frequency === "weekly") {
    const weekdayField = config.weekdays.join(",");
    return `${config.minute} ${config.hour} * * ${weekdayField}`;
  }
  // ...
}
```

**変更後（採用方針）**:

```typescript
/**
 * VisualConfig を cron 式文字列に変換する
 *
 * @param config - スケジュール設定
 * @returns cron 式文字列。`frequency="weekly"` かつ `weekdays=[]` の場合は空文字 `""` を返す。
 *
 * @remarks
 * 空曜日は有効な cron 式に変換できないため、ガード処理では例外を投げず空文字を返す。
 * 呼び出し元は既存のバリデーションで空文字を無効入力として扱う。
 */
export function visualConfigToCron(config: VisualCronConfig): string {
  // ...
  if (config.frequency === "weekly") {
    if (config.weekdays.length === 0) {
      return "";
    }
    const weekdayField = [...new Set(config.weekdays)]
      .sort((a, b) => a - b)
      .join(",");
    return `${config.minute} ${config.hour} * * ${weekdayField}`;
  }
  // ...
}
```

### ステップ3: JSDoc 変更内容

`@throws` は追加しない。
`@returns` と `@remarks` で次を明示する。

- ガード処理の発動条件（`frequency="weekly"` かつ `weekdays=[]`）
- ガード処理の結果（空文字 `""` を返す）
- 呼び出し元への推奨事項（既存バリデーションで無効入力として扱う）

### ステップ4: 変更ファイル一覧テーブル（Before/After）

| ファイル                                                      | 変更種別 | Before                               | After                               |
| ------------------------------------------------------------- | -------- | ------------------------------------ | ----------------------------------- |
| `apps/desktop/src/renderer/utils/cronConverter.ts`            | 修正     | ガード処理なし（不正なcron式を生成） | 空文字退避のガード処理 + JSDoc 更新 |
| `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | 修正     | 空曜日ケースなし                     | TC-01〜TC-06 を追加                 |

**IPC 関連**: なし（`visualConfigToCron` は純粋関数のため、IPC ハンドラへの影響なし）

---

## 設計判断記録

| 決定事項             | 選択                                 | 理由                                                     |
| -------------------- | ------------------------------------ | -------------------------------------------------------- |
| 変更関数             | `visualConfigToCron` のみ            | 単一責務原則。他関数への影響なし                         |
| 空曜日時の戻り値     | 空文字 `""`                          | 意図しないスケジュールを作らず、既存バリデーションと整合 |
| 型シグネチャ変更     | なし（戻り値 `string` は変更しない） | 呼び出し元の型安全性を維持                               |
| JSDoc                | `@returns` + `@remarks`              | `throws` を増やさず仕様を明示                            |
| IPC 変更             | なし                                 | 純粋関数のため Renderer 内で完結                         |
| 追加インターフェース | なし                                 | スコープ外の型追加は不要                                 |

---

## 統合テスト連携

- `visualConfigToCron` は純粋関数のため統合テスト不要（単体テストのみ）
- 空文字退避は既存の `validateCronExpression` によって無効入力として扱われる
- テストシナリオ（TC-01〜TC-06）を Phase 4 テスト作成に引き継ぐ

---

## 多角的チェック観点（AIが判断）

### 純粋関数の設計原則

- `visualConfigToCron` は副作用なし・純粋関数であり、IPC や外部状態に影響しない
- ガード処理も関数内で完結し、呼び出し元の例外処理を増やさない

### 後方互換性の確認

- 型シグネチャは変えずに、空曜日時のみ空文字を返す
- 正常ケースの戻り値は従来どおり維持する

### concern 数による設計書分割基準

本タスクは 1 concern（空 weekdays ガード追加）のみ → 単一 `phase-2-design.md` に全記述（分割不要）

---

## サブタスク管理

| ID     | タスク名                      | ステータス |
| ------ | ----------------------------- | ---------- |
| T-02-1 | 空文字退避方針の確定          | 未実施     |
| T-02-2 | 型シグネチャ確認（変更前/後） | 未実施     |
| T-02-3 | JSDoc の設計                  | 未実施     |
| T-02-4 | 呼び出し元影響の確認          | 未実施     |
| T-02-5 | 変更ファイル一覧テーブル作成  | 未実施     |

---

## 成果物

| 成果物                 | 配置先                                 | 形式     |
| ---------------------- | -------------------------------------- | -------- |
| 設計決定記録           | `outputs/phase-2/design-decision.md`   | Markdown |
| コード変更差分イメージ | `outputs/phase-2/code-diff-preview.md` | Markdown |

---

## 完了条件

- [ ] 空文字退避の採用方針が決定・記録されていること（理由付き）
- [ ] `visualConfigToCron` 関数の変更前/後の差分が `outputs/phase-2/code-diff-preview.md` に記録されていること
- [ ] JSDoc の変更内容（`@returns` / `@remarks`）が確定していること
- [ ] 変更ファイル一覧テーブル（Before/After）が記録されていること
- [ ] `outputs/phase-2/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-02-1: 空文字退避方針を `outputs/phase-2/design-decision.md` に記録済み
- [ ] T-02-2: 型シグネチャ（変更前/後）を記録済み
- [ ] T-02-3: JSDoc の設計を記録済み
- [ ] T-02-4: 呼び出し元影響の確認を記録済み
- [ ] T-02-5: 変更ファイル一覧テーブルを `outputs/phase-2/design-decision.md` に記録済み

---

## 次Phase

**Phase 3: 設計レビューゲート** — 空文字退避方針の整合性・後方互換性・一貫性をレビューし、PASS/MINOR/MAJOR を判定する。

**ゲート条件**: Phase 1-2 の全完了条件を満たさない場合、Phase 3 へ進まないこと。
