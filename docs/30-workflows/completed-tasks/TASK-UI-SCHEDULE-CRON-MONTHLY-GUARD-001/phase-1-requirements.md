# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 1                                       |
| Phase名    | 要件定義                                |
| 前提Phase  | -                                       |
| 後続Phase  | Phase 2                                 |
| ステータス | 未実施                                  |
| 作成日     | 2026-04-13                              |
| 機能名     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 |

---

## 目的

`cronConverter.ts` の `monthly` frequency において `dayOfMonth` 値の有効範囲チェックが欠如している問題の
要件境界を固定し、受け入れ基準（AC）を確定する。

## 背景

`weekly` 分岐では TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 にて空 `weekdays` ガードが実装済みである。
対称性の観点から、`monthly` 分岐にも `dayOfMonth` 範囲外ガードが必要であるが未実装の状態である。

現在の問題のある実装:

```typescript
case "monthly":
  return `${minute} ${hour} ${dayOfMonth} * *`;
  // dayOfMonth=0 → "0 9 0 * *" (無効)
  // dayOfMonth=32 → "0 9 32 * *" (無効)
```

## 論点整理

- 真の論点: `monthly` の cron 生成で、整数 1-31 以外を不正 cron に変換しないこと
- 依存境界: UI の入力制御と `visualConfigToCron` の純粋関数ガードを分離すること
- 価値とコスト: 1 つの小さなガードでランタイム障害を防げるため、最小差分で最大効果を狙うこと
- 改善優先順位: 1) ガード追加 2) テスト追加 3) JSDoc 更新 4) 仕様同期
- 4条件評価: 矛盾なし・漏れなし・整合性あり・依存関係整合が全て満たされること

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: P50チェック（既実装確認）

**目的**: 重複実装を防ぐため、対象ファイルの現状実装を確認する

**実行手順**:

1. `git log --oneline -10 -- apps/desktop/src/renderer/utils/cronConverter.ts` で変更履歴を確認する
2. 対象ファイル `cronConverter.ts` を読み込み、`monthly` 分岐の現状実装を確認する
3. `dayOfMonth` ガードが既に実装されているか `grep -n "dayOfMonth" apps/desktop/src/renderer/utils/cronConverter.ts` で確認する
4. テストファイル `cronConverter.edge.test.ts` に `monthly dayOfMonth` 関連のテストが既に存在するか確認する

**期待される成果物**:

- 現状実装の確認結果（ガード未実装であることの確認）
- 対象ファイルパスの確定

---

### タスク2: 要件抽出

**目的**: 機能要件と非機能要件を確定する

**実行手順**:

1. 既存仕様書 `docs/30-workflows/unassigned-task/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001.md` を読み込む
2. `weekly` ガード実装の参考として `TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001` の仕様書を参照する
3. 以下の機能要件を確定する:
   - `dayOfMonth` の有効範囲（1-31）
   - ガード条件（`< 1` または `> 31`）
   - ガード時の戻り値（空文字 `""`）
   - `NaN`/小数など非整数値の扱い
4. 非機能要件を確定する:
   - 既存テスト全件グリーン維持
   - 型チェック・Lint 通過
   - JSDoc 更新

**期待される成果物**:

- `outputs/phase-1/requirements.md` （要件定義書）

---

### タスク3: 受け入れ基準確定

**目的**: AC-1〜AC-7 を番号付きで明確に定義する

**実行手順**:

1. 以下の受け入れ基準を確定する:

| AC番号 | 条件                                                                 | 検証方法       |
| ------ | -------------------------------------------------------------------- | -------------- |
| AC-1   | `dayOfMonth=0` のとき `""` を返す                                    | 単体テスト     |
| AC-2   | `dayOfMonth=32` のとき `""` を返す                                   | 単体テスト     |
| AC-3   | `dayOfMonth=-1` のとき `""` を返す                                   | 単体テスト     |
| AC-4   | `dayOfMonth=1` のとき `"0 9 1 * *"` を返す（正常ケース・境界最小）   | 単体テスト     |
| AC-5   | `dayOfMonth=31` のとき `"0 9 31 * *"` を返す（正常ケース・境界最大） | 単体テスト     |
| AC-6   | 既存テスト（`cronConverter.edge.test.ts` 全件）がパスする            | vitest 実行    |
| AC-7   | JSDoc の `@returns` と `@remarks` にガード仕様が追記されている       | コードレビュー |

2. スコープ外事項を明確化する:
   - `hour`/`minute` の範囲チェックはスコープ外
   - UIバリデーションロジックの変更はスコープ外
   - `weekly` 分岐の変更はスコープ外
   - `dayOfMonth: null` の既定値ルールは別タスクで扱う

3. `outputs/phase-1/acceptance-criteria.md` に整理する

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md` （受け入れ基準一覧）

---

### タスク4: spec-extraction-map 作成

**目的**: aiworkflow-requirements 正本と実装コードの対応を固定する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` を確認する
2. スケジュール/cron関連の仕様がどのドキュメントに記載されているか確認する
3. 対応マップを `outputs/phase-1/spec-extraction-map.md` に作成する

**期待される成果物**:

- `outputs/phase-1/spec-extraction-map.md` （仕様抽出マップ）

---

## 参照資料

| 参照資料                | パス                                                                           | 内容                 |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------- |
| 対象実装ファイル        | `apps/desktop/src/renderer/utils/cronConverter.ts`                             | ガード処理追加対象   |
| テストファイル          | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`                  | テスト追加対象       |
| 型定義ファイル          | `apps/desktop/src/renderer/types/visualCronConfig.ts`                          | dayOfMonth型定義確認 |
| 発見元仕様書            | `docs/30-workflows/unassigned-task/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001.md` | 元仕様               |
| weeklyガード参考        | `docs/30-workflows/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001/`                  | 対称パターン参考     |
| aiworkflow-requirements | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`               | 仕様正本             |

---

## 成果物

| 成果物         | パス                                     | 内容                |
| -------------- | ---------------------------------------- | ------------------- |
| 要件定義書     | `outputs/phase-1/requirements.md`        | 機能/非機能要件一覧 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-7 一覧     |
| 仕様抽出マップ | `outputs/phase-1/spec-extraction-map.md` | 正本対応マップ      |

---

## 統合テスト連携

- 本Phase では実装を行わないため、統合テストの追加は不要
- AC-1〜AC-6 が Phase 4（テスト作成）の Red テスト起点となる

---

## 完了条件

- [ ] `cronConverter.ts` の `monthly` 分岐に `dayOfMonth` ガードが存在しないことを確認済み
- [ ] AC-1〜AC-7 が全て定義されている
- [ ] スコープ外事項が明確化されている
- [ ] `outputs/phase-1/requirements.md` が作成されている
- [ ] `outputs/phase-1/acceptance-criteria.md` が作成されている
- [ ] `outputs/phase-1/spec-extraction-map.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2（設計）へ進む
- **Gate**: Phase 1 完了前に Phase 4 以降へ進まないこと

---

## Phase実行記録（完了後に記録）

```markdown
## Phase 1 実行記録

### 実行タスク

- タスク1: P50チェック - [結果]
- タスク2: 要件抽出 - [結果]
- タスク3: 受け入れ基準確定 - [結果]
- タスク4: spec-extraction-map作成 - [結果]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001/phase-2-design.md`
