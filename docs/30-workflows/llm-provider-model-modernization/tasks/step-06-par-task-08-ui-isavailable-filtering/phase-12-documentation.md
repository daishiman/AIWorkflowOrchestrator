# Phase 12: ドキュメント更新 -- UI isAvailable フィルタリング実装

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 12                       |
| 機能名     | ui-isavailable-filtering |
| タスクID   | TASK-LLM-MOD-08          |
| 作成日     | 2026-03-23               |
| ステータス | 実施済み                 |
| 依存 Phase | Phase 11（手動テスト）   |

## 目的

TASK-LLM-MOD-08 の実装内容を実装ガイド・システム仕様書に反映し、未タスクの検出を行う。

## 実行タスク

### Task 1: 実装ガイド

#### Part 1: 概念説明（中学生レベル -- 日常例え必須）

**レストランのメニューのアナロジー**

レストランのメニューに載っている料理は、実際にシェフが作れる料理だけです。材料（APIキー）が揃っていない料理はメニューに載せません。そうすれば、お客さん（ユーザー）が注文（モデル選択）した時に「作れません」という問題が起きません。

- **チャット画面のモデルセレクター（InlineModelSelector）**: お客さんに見せるメニュー。作れる料理だけが載っている。材料が足りない料理は最初から見えない
- **設定画面（ProviderSelector）**: 厨房の棚。全ての材料が見える場所。ここで新しい材料（APIキー）を追加できる。材料がない棚にはラベル（「未設定」バッジ）が貼ってある
- **LLMSelectorPanel**: 厨房の棚の詳細ビュー。ProviderSelector と同じ見え方

なぜメニューから消すのか？ もし材料がない料理がメニューに載っていて、お客さんが注文してしまったら、「すみません、作れません」と断るしかありません。それはお客さんにとって嫌な体験です。最初からメニューに載せなければ、そもそもその問題は起きません。

#### Part 2: 技術者レベル実装詳細

**isAvailable フラグの決定フロー**:

```
Main Process (handleGetProviders)
  -> SecureStorage から APIキーを取得
  -> 各プロバイダーについて APIキーが存在するか判定
  -> isAvailable: true/false を設定
  -> IPC 経由で Renderer に送信

Renderer (InlineModelSelector)
  -> Store または props からプロバイダー一覧を取得
  -> allProviders.filter((p) => p.isAvailable) でフィルタ
  -> フィルタ後の providers を表示
```

**InlineModelSelector のフィルタ実装（L333-335）**:

```typescript
// Props override Store (for standalone usage / testing)
// APIキー設定済みのプロバイダーのみ表示（P62: 未設定プロバイダーは非表示）
const allProviders = providersProp ?? storeProviders ?? [];
const providers = allProviders.filter((p) => p.isAvailable);
```

**ProviderSelector との使い分け設計**:

| 設計判断                         | 理由                                                                      |
| -------------------------------- | ------------------------------------------------------------------------- |
| フィルタをコンポーネント側で実施 | コンポーネントごとの表示要件が異なるため、Store 側でのフィルタは不適切    |
| useMemo を使用しない             | プロバイダー数が最大5-6件で O(n) 軽量。メモ化のオーバーヘッドの方が大きい |
| ProviderSelector は変更なし      | 設定画面では全プロバイダーの可視性が必要（設定可能性の確保）              |

**P62 との関連性**:

P62（DEFAULT_CONFIG への暗黙 fallback 禁止）は、ユーザーが明示的に選択していないプロバイダー/モデルでリクエストが送信されることを禁止する原則。本タスクでは、APIキー未設定プロバイダーをチャット画面の選択肢から完全に除外することで、この原則をUIレベルで強制した。

### Task 2: タスク完了記録

#### Step 1-A: タスク完了記録

- [x] タスク仕様書（index.md）のステータスを「実装済み」に更新済み
- [x] `aiworkflow-requirements/LOGS.md` 更新対象（親タスク TASK-LLM-MOD の Phase 12 で一括更新）
- [x] `task-specification-creator/LOGS.md` 更新対象（親タスク TASK-LLM-MOD の Phase 12 で一括更新）

#### Step 1-B: 実装状況テーブル

本タスクは親タスク（TASK-LLM-MOD）の step-06-par-task-08 として管理されている。親タスクの実装状況テーブルで進捗を追跡する。

#### Step 1-C: 関連タスクテーブル

`TASK-LLM-MOD-08` に関連する仕様書を検索し、必要に応じて更新した。

#### Step 1-D: topic-map.md 再生成

親タスク（TASK-LLM-MOD）の Phase 12 で一括再生成する。

### Task 3: documentation-changelog

本タスクでの変更:

| 変更対象                       | 変更内容                                      |
| ------------------------------ | --------------------------------------------- |
| `InlineModelSelector.tsx`      | isAvailable フィルタ追加（1行 + コメント1行） |
| `InlineModelSelector.test.tsx` | T-01〜T-09 のテストケース追加                 |
| Phase 4-13 仕様書              | 実施済み記録として作成                        |

### Task 4: 未タスク検出

本タスクのスコープ内で検出された未タスク: **0件**

理由:

- 変更対象が InlineModelSelector.tsx の1行追加のみ
- ProviderSelector, LLMSelectorPanel は変更不要
- Store 側のフィルタリングロジック追加は設計上不要（コンポーネント側での責務）
- P62 対策として十分な実装が完了

### Task 5: SKILL.md 変更履歴

親タスク（TASK-LLM-MOD）の Phase 12 で一括更新する。

## 参照資料

| 資料名               | パス                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Phase 11 手動テスト  | `docs/30-workflows/llm-provider-model-modernization/tasks/step-06-par-task-08-ui-isavailable-filtering/phase-11-manual-testing.md` |
| タスク概要           | `docs/30-workflows/llm-provider-model-modernization/tasks/step-06-par-task-08-ui-isavailable-filtering/index.md`                   |
| spec-update-workflow | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`                                                        |
| 既知の落とし穴 P62   | `.claude/rules/06-known-pitfalls.md`（DEFAULT_CONFIG fallback 禁止）                                                               |

## 成果物

| 成果物               | パス       | 形式     |
| -------------------- | ---------- | -------- |
| ドキュメント更新記録 | 本ファイル | Markdown |

## 完了条件

- [x] Part 1（中学生レベル概念説明 -- レストランメニューのアナロジー）を作成した
- [x] Part 2（技術者レベル実装詳細 -- isAvailable フラグ決定フロー、フィルタ実装、使い分け設計）を作成した
- [x] Task 2（タスク完了記録）: 親タスクでの一括更新方針を記録した
- [x] Task 3（documentation-changelog）: 変更内容を記録した
- [x] Task 4（未タスク検出）: 検出 0 件を確認した
- [x] Task 5（SKILL.md 変更履歴）: 親タスクでの一括更新方針を記録した

## 次の Phase

Phase 13: 完了（`phase-13-completion.md`）
