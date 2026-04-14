# TASK-CRON-DOM-NULL-DEFAULT-001: VisualCronConfig.dayOfMonth null/undefined 既定値ルール明確化

## メタ情報

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | TASK-CRON-DOM-NULL-DEFAULT-001                                |
| タスク名     | VisualCronConfig.dayOfMonth null/undefined 既定値ルール明確化 |
| 分類         | 改善                                                          |
| 対象機能     | スケジュール設定 / cron設定型定義                             |
| 優先度       | **低**                                                        |
| 見積もり規模 | 小規模                                                        |
| ステータス   | 未着手                                                        |
| 発見元       | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 Phase 12 未タスク検出 |
| 発見日       | 2026-04-13                                                    |
| 依存タスク   | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001（完了済み）           |
| 関連Issue    | #2128                                                         |

## 1. なぜこのタスクが必要か（Why）

### 1-1. 問題の背景

`VisualCronConfig.dayOfMonth` は `number` 型（null非許容）で定義されているが、null/undefined が渡された場合の既定値ルールが未定義である。

`TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001` にて `dayOfMonth` の範囲チェック（1-31）を実装したが、null/undefined が渡された場合の処理は型定義の責務として別タスク化した経緯がある。

現在の `cronConverter.ts` では `Number.isInteger(dayOfMonth)` により null/undefined は弾かれる:

```typescript
// Number.isInteger の挙動
Number.isInteger(null); // false → ガードに引っかかる
Number.isInteger(undefined); // false → ガードに引っかかる
```

しかしこれは「偶然ガードが機能している」状態であり、「意図した設計」として明示されていない。呼び出し元がどの値を既定値として使うべきかのドキュメントが不足しているため、将来的な誤実装のリスクがある。

### 1-2. 影響範囲

- `VisualCronConfig.dayOfMonth` の型は `number`（null非許容）だが、TypeScript の型チェックを回避した JS ランタイム上での null/undefined 混入が起こりうる
- `visualConfigToCron` 関数の JSDoc に null/undefined 時の挙動の説明が存在しない
- 呼び出し元コンポーネント（UI初期化時など）が既定値として何を使うべきか判断できない
- 将来の担当者が `Number.isInteger()` によるガードを別の実装に変更した際、null/undefined の扱いが失われるリスクがある

### 1-3. 設計上の問題

`TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001` で確立した `dayOfMonth` のランタイムガードは以下の通りである:

```typescript
case "monthly": {
  if (dayOfMonth == null || dayOfMonth < 1 || dayOfMonth > 31) {
    return "";
  }
  return `${minute} ${hour} ${dayOfMonth} * *`;
}
```

`dayOfMonth == null` のチェックにより null/undefined を弾く設計にはなっているが、この挙動が JSDoc や型定義に明記されていない。型定義・ドキュメントと実装の間に乖離があり、設計意図が暗黙的になっている。

## 2. 何を達成するか（What）

### 2-1. 実装目標

`VisualCronConfig.dayOfMonth` の型定義と `visualConfigToCron` 関数の JSDoc に null/undefined 時の挙動・既定値ルールを明記し、必要に応じて型ガード関数を追加することで、設計意図を明示的にドキュメント化する。

ランタイム挙動は変更せず、ドキュメント・型定義の整備に留める。

### 2-2. 受け入れ条件（Acceptance Criteria）

| AC番号 | 条件                                                                                         | 検証方法       |
| ------ | -------------------------------------------------------------------------------------------- | -------------- |
| AC-1   | `VisualCronConfig.dayOfMonth` の型定義に null/undefined 時の挙動が JSDoc で明記されている    | コードレビュー |
| AC-2   | `visualConfigToCron` の JSDoc に null/undefined が渡された場合 `""` を返す旨が明記されている | コードレビュー |
| AC-3   | 既存テスト全件がパスする（ランタイム挙動の変更なし）                                         | vitest 実行    |

### 2-3. スコープ外

- ランタイム挙動の変更（既存のガード処理 `dayOfMonth == null` は変更しない）
- UIバリデーションロジックの変更
- `hour`・`minute` の null/undefined 対応（別タスクで対応する場合は `TASK-CRON-TIME-NULL-DEFAULT-001` として切り出す）
- `weekly` 分岐の `weekdays` null/undefined 対応（TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 にて対処済み）

## 3. どのように実行するか（How）

### 3-1. 実装方針

**変更対象1: `VisualCronConfig` 型定義の JSDoc 追記**

`apps/desktop/src/renderer/types/visualCronConfig.ts` の `dayOfMonth` フィールドに JSDoc を追記する:

```typescript
/**
 * 月次スケジュールの実行日（1-31）。
 *
 * @remarks
 * - TypeScript の型は `number`（null非許容）だが、JS ランタイムで null/undefined が
 *   渡された場合、`visualConfigToCron` は空文字 `""` を返す。
 * - 呼び出し元は UI 初期化時に `1`（月初め）を既定値として使用すること。
 * - null/undefined を明示的に渡すことは設計上想定していない。
 */
dayOfMonth: number;
```

**変更対象2: `visualConfigToCron` の JSDoc 更新**

`apps/desktop/src/renderer/utils/cronConverter.ts` の `visualConfigToCron` 関数の `@returns` と `@remarks` を更新する:

```typescript
/**
 * @returns cron 式文字列。
 *   - `frequency="weekly"` かつ `weekdays=[]` の場合は空文字 `""` を返す。
 *   - `frequency="monthly"` かつ `dayOfMonth` が範囲外（< 1 または > 31）の場合は空文字 `""` を返す。
 *   - `frequency="monthly"` かつ `dayOfMonth` が null/undefined の場合は空文字 `""` を返す。
 *
 * @remarks
 * 空曜日・不正な日付・null/undefined は有効な cron 式に変換できないため、
 * ガード処理では例外を投げず空文字を返す。
 * 呼び出し元は既存のバリデーションで空文字を無効入力として扱う。
 * `dayOfMonth` の既定値は `1`（月初め）を使用すること。
 */
```

**変更対象3（任意）: 型ガード関数の追加**

必要に応じて `cronConverter.ts` または `visualCronConfig.ts` に以下の型ガード関数を追加する:

```typescript
/**
 * 値が有効な dayOfMonth（1-31 の整数）であることを確認する型ガード。
 * null/undefined および範囲外の値は false を返す。
 */
export function isValidDayOfMonth(value: unknown): value is number {
  return (
    Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 31
  );
}
```

### 3-2. テスト追加方針

ランタイム挙動の変更がないため、新規テストケースの追加は必須ではない。ただし、型ガード関数 `isValidDayOfMonth` を追加した場合は対応するユニットテストを追加する。

型ガード追加時のテストケース（オプション）:

| TC番号 | 入力           | 期待値  | 説明               |
| ------ | -------------- | ------- | ------------------ |
| TC-O1  | `null`         | `false` | null は無効        |
| TC-O2  | `undefined`    | `false` | undefined は無効   |
| TC-O3  | `0`            | `false` | 範囲外（下限未満） |
| TC-O4  | `32`           | `false` | 範囲外（上限超過） |
| TC-O5  | `1`            | `true`  | 有効（境界最小値） |
| TC-O6  | `31`           | `true`  | 有効（境界最大値） |
| TC-O7  | `1.5`          | `false` | 整数でない値は無効 |
| TC-O8  | `"1"` (文字列) | `false` | 文字列は無効       |

### 3-3. 設計決定の明確化

以下の設計決定をドキュメントに明記する:

| 設計項目                   | 決定内容                       | 理由                                                   |
| -------------------------- | ------------------------------ | ------------------------------------------------------ |
| null/undefined 時の戻り値  | `""` を返す（既存実装に準拠）  | 呼び出し元が空文字を無効入力として扱う慣例に合わせる   |
| 呼び出し元の既定値         | `1`（月初め）を使用する        | UI の初期値として月初めが最も自然なデフォルト          |
| 型定義の変更有無           | `number` のまま変更しない      | null 許容への変更は breaking change となるため         |
| 型ガード関数の追加（任意） | `isValidDayOfMonth` を追加推奨 | 将来の呼び出し元が安全に検証できるユーティリティとして |

## 4. 実行手順 (Phase 1-13)

| Phase    | 名称             | 主な作業                                                                            |
| -------- | ---------------- | ----------------------------------------------------------------------------------- |
| Phase 1  | 要件確認         | AC の確定・スコープ明確化（JSDoc 追記のみ or 型ガード関数追加も含むか決定）         |
| Phase 2  | 設計             | 変更対象ファイルの特定・JSDoc 記述内容の草案作成                                    |
| Phase 3  | 設計レビュー     | `TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001` 実装との整合性確認                        |
| Phase 4  | テスト作成       | 型ガード関数を追加する場合は TC-O1〜TC-O8 を作成（Red フェーズ）                    |
| Phase 5  | 実装             | `visualCronConfig.ts` の JSDoc 追記・`cronConverter.ts` の JSDoc 更新・型ガード追加 |
| Phase 6  | テスト拡充       | 型ガード関数のエッジケーステスト（必要な場合）                                      |
| Phase 7  | カバレッジ確認   | `pnpm --filter @repo/desktop test` でカバレッジ計測                                 |
| Phase 8  | リファクタリング | JSDoc の記述スタイル統一・既存コメントとの一貫性確認                                |
| Phase 9  | 品質保証         | lint・typecheck・全テストの通過確認                                                 |
| Phase 10 | 最終レビュー     | AC 全件チェック                                                                     |
| Phase 11 | 手動テスト       | UI 上での monthly スケジュール設定動作確認（挙動が変わっていないことを確認）        |
| Phase 12 | ドキュメント更新 | 実装ガイド・未タスク検出・スキルフィードバック作成                                  |
| Phase 13 | PR 作成          | レビュー依頼・マージ                                                                |

## 5. 完了条件チェックリスト

- [ ] `apps/desktop/src/renderer/types/visualCronConfig.ts` の `dayOfMonth` フィールドに null/undefined 時の挙動が JSDoc で明記されている
- [ ] `apps/desktop/src/renderer/utils/cronConverter.ts` の `visualConfigToCron` の JSDoc に null/undefined が渡された場合 `""` を返す旨が明記されている
- [ ] AC-1: `VisualCronConfig.dayOfMonth` 型定義に既定値ルールが JSDoc で記載されている
- [ ] AC-2: `visualConfigToCron` の JSDoc に null/undefined 時の挙動説明が追記されている
- [ ] AC-3: 既存テスト全件がパスしている（ランタイム挙動の変更なし）
- [ ] `pnpm --filter @repo/desktop test` が全件グリーン
- [ ] `pnpm lint` が通過
- [ ] `pnpm typecheck` が通過

## 6. 検証方法

### 6-1. 単体テスト実行

```bash
# worktree ルートから実行
pnpm --filter @repo/desktop test

# テストファイルを直接指定して実行
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
```

### 6-2. 型チェック・Lint

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

### 6-3. 手動確認（Phase 11）

1. デスクトップアプリを起動する
2. スケジュール設定画面を開く
3. `monthly` 設定で `dayOfMonth` を正常値（1〜31）で設定する
4. 既存の挙動と変わらず cron 式が正しく生成・保存されることを確認する

## 7. リスクと対策

| リスク                                                    | 影響度 | 発生確率 | 対策                                                                                                   |
| --------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------ |
| esbuild mismatch による vitest 起動失敗                   | 高     | 中       | `pnpm install` を実行して解消する（発見元タスク実績あり）                                              |
| JSDoc 追記による型定義ファイルの構文エラー                | 中     | 低       | `pnpm --filter @repo/desktop typecheck` で変更直後に確認する                                           |
| 型ガード関数追加による既存テストへの影響                  | 低     | 低       | 型ガード関数は新規追加のみで既存コードを変更しないため影響は最小限                                     |
| `number` 型のまま維持することで将来の null 混入リスク残存 | 中     | 低       | JSDoc で「null は設計上想定外」と明記し、呼び出し元の規約を文書化することで予防する                    |
| JSDoc と実装の乖離（将来の実装変更時）                    | 中     | 低       | `isValidDayOfMonth` 型ガード関数を追加することで、ドキュメントに依存しない実行可能な仕様として維持する |

## 8. 参照情報

| 資料名                               | パス                                                          | 用途                                                            |
| ------------------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------- |
| 型定義ファイル                       | `apps/desktop/src/renderer/types/visualCronConfig.ts`         | `dayOfMonth: number` 定義・JSDoc 追記対象                       |
| 対象実装ファイル                     | `apps/desktop/src/renderer/utils/cronConverter.ts`            | JSDoc 更新・型ガード関数追加対象                                |
| テストファイル                       | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | 型ガード関数追加時のテスト追加先                                |
| 依存タスク仕様書                     | `docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001/`  | ランタイムガード実装の根拠・`dayOfMonth == null` チェックの文脈 |
| 発見元 Phase 12 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`               | 本タスクの発見経緯                                              |

## 9. 苦戦箇所・知見（発見元タスクより）

`TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001` の経験から得た以下の知見を本タスクに適用する:

1. **`Number.isInteger()` は null/undefined を弾く**: `Number.isInteger(null)` → `false`、`Number.isInteger(undefined)` → `false` なので、現状のガードは偶然 null/undefined も弾いている。しかしこれは「意図した設計」として明示されていない。本タスクでこの意図をドキュメント化する

2. **型 `number` は null/undefined を許容しない**: TypeScript の `number` 型では null/undefined は型エラーになるため、実際には JS のランタイムで紛れ込む場合のみ問題となる。型定義を `number | null | undefined` に変更することは breaking change となるため、`number` のまま維持し JSDoc で補足する方針が安全

3. **既定値の設計決定**: `dayOfMonth` の既定値を `1` とするか「設定なし=無効」として `""` を返すかは、UI の挙動設計（初期値が何か）に依存する。本タスクでは「既存実装に準拠して `""` を返す」ことをドキュメントに明記し、呼び出し元が `1` を既定値として設定する責務を担う設計とする

4. **環境ブロッカー**: esbuild mismatch により vitest が起動しないケースあり。`pnpm install` を実行することで解消する（発見元タスクで実績あり）

5. **JSDoc 主体の小規模タスク**: 本タスクはランタイム挙動の変更を伴わないため、実装量は最小限である。変更の価値はコードの「意図の明示化」にあり、将来の担当者が安全に実装を変更・拡張できる基盤を整える
