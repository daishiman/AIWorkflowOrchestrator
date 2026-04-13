# TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001: cronConverter monthly 空dayOfMonth ガード処理追加

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001                        |
| タスク名     | cronConverter monthly 空dayOfMonth ガード処理追加              |
| 分類         | バグ修正                                                       |
| 対象機能     | スケジュール設定 / cron式変換                                  |
| 優先度       | **中**                                                         |
| 見積もり規模 | 小規模                                                         |
| ステータス   | 未着手                                                         |
| 発見元       | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 Phase 12 未タスク検出 |
| 発見日       | 2026-04-12                                                     |

## 1. なぜこのタスクが必要か（Why）

### 1-1. 問題の背景

`cronConverter.ts` の `monthly` frequency において、`dayOfMonth` に不正値（0 や 32 以上）が渡された場合、無効な cron 式が生成される。

現在の実装は以下の通りである:

```typescript
case "monthly":
  return `${minute} ${hour} ${dayOfMonth} * *`;
```

この実装では入力値の検証を行わないため、以下のような不正な cron 式が生成される:

| 入力値          | 生成される cron 式 | 問題                    |
| --------------- | ------------------ | ----------------------- |
| `dayOfMonth=0`  | `"0 9 0 * *"`      | 無効（日付は 1 始まり） |
| `dayOfMonth=32` | `"0 9 32 * *"`     | 無効（月の最大日は 31） |
| `dayOfMonth=-1` | `"0 9 -1 * *"`     | 無効（負の値）          |

### 1-2. 影響範囲

- `VisualCronConfig.dayOfMonth` の型定義では `1-31` と仕様コメントが記載されているが、型は `number` のため不正値の混入が起こりうる
- UIバリデーションでガードされているとしても、純粋関数 `visualConfigToCron` レベルでのガードが不在である
- `weekly` の空 `weekdays` ガード（TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 で対処済み）と対称性がなく、設計の一貫性が欠けている

### 1-3. 設計上の問題

`weekly` 分岐では TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 にて以下のガードが実装済みである:

```typescript
case "weekly": {
  if ((weekdays ?? []).length === 0) {
    return "";
  }
  const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
  return `${minute} ${hour} * * ${sorted.join(",")}`;
}
```

対称性の観点から、`monthly` 分岐にも同様のガードが必要である。

## 2. 何を達成するか（What）

### 2-1. 実装目標

`cronConverter.ts` の `monthly` 分岐に `dayOfMonth` の有効範囲チェックを追加し、不正値（`dayOfMonth < 1` または `dayOfMonth > 31`）の場合に空文字 `""` を返すガード処理を実装する。

### 2-2. 受け入れ条件（Acceptance Criteria）

| AC番号 | 条件                                                               | 検証方法       |
| ------ | ------------------------------------------------------------------ | -------------- |
| AC-1   | `dayOfMonth=0` のとき `""` を返す                                  | 単体テスト     |
| AC-2   | `dayOfMonth=32` のとき `""` を返す                                 | 単体テスト     |
| AC-3   | `dayOfMonth=-1` のとき `""` を返す                                 | 単体テスト     |
| AC-4   | `dayOfMonth=1` のとき `"0 9 1 * *"` を返す（正常ケース）           | 単体テスト     |
| AC-5   | `dayOfMonth=31` のとき `"0 9 31 * *"` を返す（正常ケース・境界値） | 単体テスト     |
| AC-6   | 既存テスト（`cronConverter.edge.test.ts` 全件）が引き続きパスする  | vitest 実行    |
| AC-7   | JSDoc の `@returns` にガード仕様が追記されている                   | コードレビュー |

### 2-3. スコープ外

- `hour`・`minute` の値の範囲チェック（別タスクで対応する場合は `TASK-CRON-ALL-FREQUENCY-GUARD-001` として切り出す）
- UIバリデーションロジックの変更
- `weekly` 分岐の変更（TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 にて対処済み）

## 3. どのように実行するか（How）

### 3-1. 実装方針

`weekly` ガードパターンを対称的に踏襲し、`monthly` 分岐の先頭に早期リターンを追加する。

**修正前:**

```typescript
case "monthly":
  return `${minute} ${hour} ${dayOfMonth} * *`;
```

**修正後:**

```typescript
case "monthly": {
  if (dayOfMonth == null || dayOfMonth < 1 || dayOfMonth > 31) {
    return "";
  }
  return `${minute} ${hour} ${dayOfMonth} * *`;
}
```

### 3-2. テスト追加方針

`apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` に `monthly` dayOfMonth ガードのテストブロックを追加する。

追加するテストケース（TC-11〜TC-15）:

| TC番号 | 入力                          | 期待値         | 対応AC |
| ------ | ----------------------------- | -------------- | ------ |
| TC-11  | `dayOfMonth=0`                | `""`           | AC-1   |
| TC-12  | `dayOfMonth=32`               | `""`           | AC-2   |
| TC-13  | `dayOfMonth=-1`               | `""`           | AC-3   |
| TC-14  | `dayOfMonth=1`（境界最小値）  | `"0 9 1 * *"`  | AC-4   |
| TC-15  | `dayOfMonth=31`（境界最大値） | `"0 9 31 * *"` | AC-5   |

### 3-3. JSDoc 更新

`visualConfigToCron` の `@returns` と `@remarks` に monthly ガード仕様を追記する:

```typescript
/**
 * @returns cron 式文字列。
 *   - `frequency="weekly"` かつ `weekdays=[]` の場合は空文字 `""` を返す。
 *   - `frequency="monthly"` かつ `dayOfMonth` が範囲外（< 1 または > 31）の場合は空文字 `""` を返す。
 *
 * @remarks
 * 空曜日・不正な日付は有効な cron 式に変換できないため、ガード処理では例外を投げず空文字を返す。
 * 呼び出し元は既存のバリデーションで空文字を無効入力として扱う。
 */
```

## 4. 実行手順 (Phase 1-13)

Phase 1〜13 の要約（主要 Phase のみ記載）

| Phase    | 名称             | 主な作業                                                                 |
| -------- | ---------------- | ------------------------------------------------------------------------ |
| Phase 1  | 要件確認         | AC の確定・スコープ明確化                                                |
| Phase 2  | 設計             | ガード実装方針・テスト設計の確定                                         |
| Phase 3  | 設計レビュー     | 既存 weekly ガードとの対称性確認                                         |
| Phase 4  | テスト作成       | TC-11〜TC-15 を `cronConverter.edge.test.ts` に追加（Red フェーズ）      |
| Phase 5  | 実装             | `cronConverter.ts` の `monthly` 分岐にガード処理を追加（Green フェーズ） |
| Phase 6  | テスト拡充       | 境界値・NULL・undefined 等の追加テスト検討                               |
| Phase 7  | カバレッジ確認   | `pnpm --filter @repo/desktop test` でカバレッジ計測                      |
| Phase 8  | リファクタリング | コードの簡潔さ・対称性の最終確認                                         |
| Phase 9  | 品質保証         | lint・typecheck・全テストの通過確認                                      |
| Phase 10 | 最終レビュー     | AC 全件チェック                                                          |
| Phase 11 | 手動テスト       | UI 上での monthly スケジュール設定動作確認                               |
| Phase 12 | ドキュメント更新 | 実装ガイド・未タスク検出・スキルフィードバック作成                       |
| Phase 13 | PR 作成          | レビュー依頼・マージ                                                     |

## 5. 完了条件チェックリスト

- [ ] `apps/desktop/src/renderer/utils/cronConverter.ts` に `monthly` ガード処理が実装されている
- [ ] AC-1: `dayOfMonth=0` で `""` が返る
- [ ] AC-2: `dayOfMonth=32` で `""` が返る
- [ ] AC-3: `dayOfMonth=-1` で `""` が返る
- [ ] AC-4: `dayOfMonth=1` で `"0 9 1 * *"` が返る
- [ ] AC-5: `dayOfMonth=31` で `"0 9 31 * *"` が返る
- [ ] AC-6: 既存テスト全件（`cronConverter.edge.test.ts`）がパスしている
- [ ] AC-7: JSDoc に `monthly` ガード仕様が追記されている
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
3. `monthly` 設定で `dayOfMonth` を UI から入力できない不正値に相当する操作を試みる
4. バリデーションが適切に働き、不正な cron 式が生成・保存されないことを確認する

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                                                                                     |
| ---------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------- |
| esbuild mismatch による vitest 起動失敗              | 高     | 中       | `pnpm install` を実行して解消する（発見元タスク実績あり）                                                |
| `dayOfMonth` が `undefined` の場合のランタイムエラー | 中     | 低       | `dayOfMonth == null` チェックをガード先頭に含める                                                        |
| 既存テストの回帰破壊                                 | 高     | 低       | Phase 4（テスト作成）は Red フェーズとし、Phase 5 実装後に Green を確認する                              |
| `VisualCronConfig` の型定義変更による影響            | 中     | 低       | 型定義ファイル（`visualCronConfig.ts`）は変更しない。`number` 型のまま維持し、ランタイムガードで対応する |

## 8. 参照情報

| 資料名                               | パス                                                          | 用途                                         |
| ------------------------------------ | ------------------------------------------------------------- | -------------------------------------------- |
| 対象実装ファイル                     | `apps/desktop/src/renderer/utils/cronConverter.ts`            | ガード処理追加対象                           |
| テストファイル                       | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | テスト追加対象                               |
| 型定義ファイル                       | `apps/desktop/src/renderer/types/visualCronConfig.ts`         | `dayOfMonth: number` 定義・1-31 コメント確認 |
| 発見元タスク仕様書                   | `docs/30-workflows/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001/` | 実装パターンの参考・対称設計の根拠           |
| 発見元 Phase 12 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`               | 本タスクの発見経緯                           |

## 9. 苦戦箇所・知見（発見元タスクより）

同タスク (TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001) の経験:

- **環境ブロッカー**: esbuild mismatch により vitest が起動しないケースあり。`pnpm install` を実行することで解消する
- **テスト方針**: エッジケーステストを `cronConverter.edge.test.ts` に追加するパターンが確立済み。同ファイルの末尾に追記する形で統一する
- **実装は 3 行以下のシンプルなガード処理**: 早期リターンで空文字を返すだけのシンプルな変更であり、複雑な処理は不要
- **TDD サイクルの厳守**: Phase 4（テスト Red）→ Phase 5（実装 Green）の順序を守ることでガード漏れを防ぐ
- **JSDoc の更新忘れ注意**: AC-7 で要求されるため、実装と同時に `@returns` と `@remarks` の更新を行う
