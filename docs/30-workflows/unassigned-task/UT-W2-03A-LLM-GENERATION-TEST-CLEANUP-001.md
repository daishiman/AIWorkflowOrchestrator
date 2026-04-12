# SkillCreateWizard LLM生成フロー describe.skip クリーンアップ - タスク指示書

## メタ情報

```yaml
issue_number: 2102
task_id: UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001
status: open
priority: low
scale: small
task_type: CLEANUP
```

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001                    |
| タスク名     | SkillCreateWizard LLM生成フロー describe.skip クリーンアップ |
| 分類         | クリーンアップ / テスト改善                                  |
| 対象機能     | SkillCreateWizard / LLM生成テスト                            |
| 優先度       | 低（`priority:low`）                                         |
| 見積もり規模 | 小規模（`scale:small`）                                      |
| ステータス   | 未実施（`status:open`）                                      |
| 発見元       | W2-seq-03a Phase 12（describe.skip内のTODOコメント）         |
| 発見日       | 2026-04-12                                                   |
| タスク分類   | CLEANUP タスク（テストファイルのみ変更、視覚差分なし）       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

W2-seq-03a の実装において、`SkillCreateWizard` から `generationMode`（テンプレート/LLM 切替ラジオボタン）が完全削除された。これに伴い、旧 TASK-SC-07 で実装された `planSkill` / `executePlan` の二段階フローも廃止された。

その結果、`SkillCreateWizard.llm-generation.test.tsx` に記述されていた 30 件のテストは、存在しない UI 要素（`generationMode` ラジオボタン）を操作しようとするため、すべて `describe.skip` でスキップされている。

ファイル冒頭の TODO コメントには以下が記載されている：

```
// TODO(W2-seq-03a): TASK-SC-07の planSkill/executePlan フローは W2-seq-03a で削除済み。
// generationMode ラジオボタン UI が存在しないため全テストをスキップ。
// 新フロー（createSkill ベース）は SkillCreateWizard.test.tsx でカバー済み。
```

新フロー（`createSkill` ベース）は `SkillCreateWizard.test.tsx` の 29 テストでカバー済みであるため、スキップ状態の 30 テストはメンテナンス負荷のみを生み出している状態にある。

### 1.2 問題点・課題

1. **デッドコードの蓄積**: `describe.skip` 内の 30 テストは削除済みの `planSkill`/`executePlan` API を前提とするコードであり、現在の実装と完全に乖離している。

2. **将来的な CI 信頼性の低下**: `describe.skip` を誤って外した場合、存在しない UI 要素への参照が原因で 30 テストすべてが一斉に失敗する。

3. **新規参入者の混乱**: コードを読む開発者が「なぜ 30 件ものテストがスキップされているのか」を理解するためにコンテキスト調査が必要になる。

4. **エッジケースカバレッジの欠落**: IPC 失敗・`createSkill` 空文字返却などのエッジケースが新フロー用テストとして書かれておらず、カバレッジに空白がある。

### 1.3 放置した場合の影響

- ファイルが長期にわたってデッドコードとして残り、テストスイートの可読性が下がる
- エッジケースカバレッジの欠落により、将来のバグ検出が遅れる可能性がある
- `skip` が外れた際の大量テスト失敗が、原因特定に余分なコストをかける

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreateWizard.llm-generation.test.tsx` の `describe.skip` ブロックを整理し、テストスイートを現行の `createSkill` ベースフローと整合した状態にする。

### 2.2 選択肢と推奨方針

#### 選択肢A: ファイルを完全削除

`planSkill`/`executePlan` フローが再実装される見込みがない場合、ファイルごと削除する。最もシンプルだが、将来 LLM 生成フローが復活した際にテストがゼロになる。

#### 選択肢B: describe.skip 内テストを新 createSkill フロー用に書き直す（推奨）

スキップされた 30 テストのうち、新フローにも適用可能なエッジケーステストを選別し、`createSkill` ベースで書き直して `SkillCreateWizard.test.tsx` へ移植または本ファイルに残す。

**推奨: 選択肢B（部分再利用）**

以下のエッジケースは新フローのテストとして価値がある：

| 旧テストID | エッジケース内容                                    | 新フローでの対応                |
| ---------- | --------------------------------------------------- | ------------------------------- |
| F-2        | IPC API（`createSkill`）が undefined のときのガード | `window.skillCreatorAPI` 未設定 |
| F-3        | IPC 呼び出し失敗（例外スロー）のエラー処理          | `createSkill` 例外ケース        |
| E-4        | 失敗後に `setIsGenerating(false)` が呼ばれること    | 生成状態のリセット確認          |
| W-8b       | キャンセル後に遅延した生成結果が返っても遷移しない  | 非同期キャンセル競合防止        |

### 2.3 受入条件（AC）

| AC   | 内容                                                                      |
| ---- | ------------------------------------------------------------------------- |
| AC-1 | `describe.skip` 状態のテストが 0 件になっている（削除または書き直し済み） |
| AC-2 | 選択肢B を採用した場合、新フロー用エッジケーステストが追加されている      |
| AC-3 | `pnpm --filter @repo/desktop test:run` が PASS する                       |
| AC-4 | `pnpm --filter @repo/desktop typecheck` が PASS する                      |
| AC-5 | TODO コメント（`// TODO(W2-seq-03a)`）が削除されている                    |

### 2.4 スコープ

#### 含むもの

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` の整理
  - 選択肢A: ファイル削除
  - 選択肢B: `describe.skip` ブロック内テストの書き直しと `describe.skip` 解除
- 選択肢B の場合、新フロー用エッジケーステストの `SkillCreateWizard.test.tsx` への移植

#### 含まないもの

- `SkillCreateWizard.tsx` 本体の変更
- `planSkill`/`executePlan` フローの再実装
- `describe.skip` 以外のテストへの変更

### 2.5 成果物

| 種別           | ファイルパス                                                                                     | 変更内容                            |
| -------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------- |
| 削除または修正 | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | describe.skip 解除 or ファイル削除  |
| 修正（任意）   | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | エッジケーステスト追加（選択肢B時） |

---

## 3. 苦戦箇所（W2-seq-03a の実装経験から）

W2-seq-03a の実装で発生した以下の 3 つの苦戦箇所は、本クリーンアップタスクを実施する際の参考知見として記録する。

### 3.1 二重呼び出し防止: handleGenerate の async 競合問題

**問題**: `handleGenerate(method)` の async 処理中に再度ボタンが押されると、`createSkill` が複数回呼ばれる競合が発生する。

**発生メカニズム**: React の状態更新は非同期であるため、`setIsGenerating(true)` の反映前に次のクリックイベントが処理された場合、ガードが機能しない。

**解決策**: `generationLockRef`（`useRef`）+ `isGenerating` の 2 段階ガードを採用した。

```typescript
// useRef による即時ロック（React の再レンダリングを待たない）
if (generationLockRef.current) return;
generationLockRef.current = true;

// store の isGenerating による二重防止（レンダリング後のガード）
if (isGenerating) return;
```

**本タスクへの示唆**: 新フロー用エッジケーステスト（`G-1` 相当）として、`isGenerating=true` 中に `createSkill` が呼ばれないことを検証するテストは価値がある。

### 3.2 inferSmartDefaults の大小文字判定問題

**問題**: ユーザー入力の purpose が `"Slack"`/`"SLACK"`/`"slack"` など混在した場合に、`inferSmartDefaults` の外部連携判定が一致しないケースが発生した。

**解決策**: `purpose.toLowerCase().includes()` で統一し、大小文字を無視した判定に変更。13 テストケースで全パターンを検証済み。

**本タスクへの示唆**: 旧テストの一部（`M-1`, `M-3` 相当のモード切替テスト）は新フローには不要だが、`inferSmartDefaults` の大小文字判定テストは `SkillCreateWizard.test.tsx` に既に存在する。重複を避けるため、本ファイルへの移植は不要。

### 3.3 handleRetry の部分リセット境界設計問題

**問題**: リトライ時に `formData`（ユーザー入力）は保持しつつ、`answers`/`smartDefaults` 等は初期化する必要があり、どの状態をどのタイミングでリセットするかの境界設計が複雑だった。

**発生メカニズム**: 親コンポーネントがどのスコープの状態を「リセット対象」と「保持対象」に分類するかが不明瞭で、リセット後に古い `answers` が残存するバグが発生。

**解決策**: 親コンポーネントで「フォームデータは保持、生成結果・回答・スマートデフォルトはリセット」と状態の保持期間を明示的に定義し、`handleRetry` 内で `answers`, `smartDefaults`, `generationError`, `generationProgress` を一括リセットするように実装。

**本タスクへの示唆**: 新フロー用エッジケーステスト（`W-8b` 相当）としてキャンセル後の遅延結果無視テストを残す場合、リトライ後の部分リセットも検証対象として追加することを推奨する。

---

## 4. 実行手順（Phase 1〜13）

### Phase 構成

| Phase | 名称             | ステータス | 概要                                                       |
| ----- | ---------------- | ---------- | ---------------------------------------------------------- |
| 1     | 要件定義         | open       | describe.skip 内テスト 30 件の内容精査・方針決定（A or B） |
| 2     | 設計             | open       | 移植するテストケースの選別・新フロー用テスト設計           |
| 3     | 設計レビュー     | open       | 方針決定・Phase 4 進行可否確認                             |
| 4     | テスト作成       | open       | 選択肢B の場合、新フロー用エッジケーステストの草案作成     |
| 5     | 実装             | open       | describe.skip 解除またはファイル削除・新テスト追加         |
| 6     | テスト拡充       | open       | 追加テストの動作確認・足りないカバレッジの補完             |
| 7     | カバレッジ確認   | open       | 変更前後のカバレッジ変化実測                               |
| 8     | リファクタリング | open       | TODO コメント削除・不要インポート除去                      |
| 9     | 品質検証         | open       | typecheck / lint / test 全通過確認                         |
| 10    | 最終レビュー     | open       | AC-1〜AC-5 の充足確認                                      |
| 11    | 手動テスト       | open       | CLEANUP タスクのため省略可（自動テストで代替）             |
| 12    | ドキュメント更新 | open       | 実装ガイド・未タスク検出・フィードバックレポート           |
| 13    | PR 作成          | open       | ユーザー明示承認後のみ実施                                 |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: `describe.skip` 状態のテストが 0 件になっている
- [ ] AC-2: 新フロー用エッジケーステストが追加されている（選択肢B 採用時）
- [ ] AC-5: TODO コメント（`// TODO(W2-seq-03a)`）が削除されている

### 品質要件

- [ ] AC-3: `pnpm --filter @repo/desktop test:run` が PASS する
- [ ] AC-4: `pnpm --filter @repo/desktop typecheck` が PASS する
- [ ] `pnpm --filter @repo/desktop lint` が PASS する

---

## 6. 検証方法

```bash
# describe.skip の残存確認
grep -r "describe\.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx

# TODO コメントの残存確認
grep -r "TODO(W2-seq-03a)" apps/desktop/src/renderer/components/skill/__tests__/

# 全テスト実行
pnpm --filter @repo/desktop test:run

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

---

## 7. リスクと対策

| リスク                                                 | 影響度 | 発生確率 | 対策                                                                           |
| ------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------ |
| 新フロー用テストで mock の設定が旧フローと異なる       | 中     | 高       | `SkillCreateWizard.test.tsx` の mock パターンを参考に統一する                  |
| describe.skip 解除後に残留するテストが新規エラーを出す | 高     | 高       | 選択肢B では必ず書き直し後に実行確認してから describe.skip を外す              |
| エッジケーステストが既存テストと重複する               | 低     | 中       | 追加前に `SkillCreateWizard.test.tsx` の既存テスト一覧と照合して重複を除外する |

---

## 8. 参照情報

| ドキュメント                               | パス                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 対象テストファイル（describe.skip 含む）   | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` |
| 新フロー用テストファイル（カバー済み）     | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                |
| W2-seq-03a タスク仕様書                    | `docs/30-workflows/W2-seq-03a-skill-create-wizard/`                                              |
| 外部連携定数化タスク（関連）               | `docs/30-workflows/unassigned-task/UT-W2-03A-RESOLVE-INTEGRATION-CONST-001.md`                   |
| Phase 12 未タスク検出レポート              | `outputs/phase-12/unassigned-task-detection.md`                                                  |
| 類似クリーンアップタスクの参考フォーマット | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001.md`              |

---

## 9. 備考

### 苦戦箇所【記録必須】

| 項目     | 内容                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| 発見経緯 | W2-seq-03a Phase 12 での describe.skip 状態の 30 テストと TODO コメントの存在から検出                                      |
| 重要度   | 非ブロッカー（CI には影響なし、将来的な信頼性リスク）                                                                      |
| 対応方針 | 選択肢B（部分再利用）を推奨。IPC 失敗・キャンセル競合・生成状態リセットの 3 エッジケースは新フローテストとして価値がある。 |
