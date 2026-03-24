# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 3                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 機能名   | w4b-2-sc-ui-runtime-connection   |
| 作成日   | 2026-03-22                       |
| 更新日   | 2026-03-24                       |

## 目的

Phase 2 で設計した UI フロー変更の後方互換性を検証し、Zustand 状態設計の P31/P48 対策が十分かを確認する。

## 実行タスク

- 後方互換性検証: AC-7（既存 skill:create フローの非破壊）を Phase 2 設計で検証する
- Zustand 状態設計確認: P31（合成 Hook 無限ループ）/ P48（派生セレクタ useShallow）対策の十分性を確認する
- UI フロー設計検証: TerminalHandoff 中の誤操作防止、planSkill 失敗時の UI フォールバックを検証する
- IPC 契約確認: P44/P45/P60 対策としてチャンネル名・引数形式・レスポンス wrapper の整合性を確認する
- セキュリティ検証: IPC チャンネルホワイトリスト登録、引数バリデーション、エラーサニタイズを検証する
- レビュー判定: PASS/MINOR/MAJOR/CRITICAL の判定を行い、改善推奨・未タスク候補を記録する

## 参照資料

| 資料名         | パス                                                                  | 説明                        |
| -------------- | --------------------------------------------------------------------- | --------------------------- |
| Phase 2 設計書 | `docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-02-design.md` | レビュー対象                |
| P31 対策       | `.claude/rules/06-known-pitfalls.md#P31`                              | 合成 Hook 無限ループ防止    |
| P44/P45 対策   | `.claude/rules/06-known-pitfalls.md#P44`                              | IPC インターフェース不整合  |
| P60 対策       | `.claude/rules/06-known-pitfalls.md#P60`                              | IPC レスポンス wrapper 形式 |

## 実行手順

### ステップ1: Phase 2 設計書の読み込み

Phase 2 の全設計（フロー設計、Zustand 状態設計、UI 設計、後方互換設計、エラーハンドリング設計）を通読する。

### ステップ2: 検証項目の逐次チェック

後方互換性（AC-7）、P31/P48 対策、UI フロー、IPC 契約、セキュリティの各観点でレビューを実施する。

### ステップ3: レビュー判定と記録

PASS/MINOR/MAJOR/CRITICAL の判定を行い、改善推奨事項（R-1〜R-3）と未タスク候補を記録する。

## レビュー結果

### 判定: PASS（軽微な改善推奨あり）

Phase 2 設計は要件を満たしており、Phase 4 への進行を承認する。

---

## 1. 後方互換性の検証（AC-7）: PASS

| 検証項目                                | 結果 | 理由                                                |
| --------------------------------------- | ---- | --------------------------------------------------- |
| 「スキルを生成する」ボタン維持          | OK   | handleCreate() は変更なし                           |
| SkillCreateWizard 4段階フロー維持       | OK   | 変更対象外                                          |
| AgentSlice.createSkill() 維持           | OK   | 変更なし                                            |
| detectMode API 未接続時のフォールバック | OK   | 既存の graceful degradation（"create"モード）を維持 |
| planSkill API 未接続時のフォールバック  | OK   | `!skillCreatorApi?.planSkill` チェックでエラー表示  |

**結論**: 既存フローへの影響なし。拡張のみ。

## 2. Zustand 状態設計の P31/P48 対策確認: PASS

### P31 対策（合成 Hook 無限ループ防止）

| 検証項目                   | 結果 | 理由                            |
| -------------------------- | ---- | ------------------------------- |
| 個別セレクタの定義         | OK   | 7個の個別セレクタが設計済み     |
| useEffect 依存配列の安全性 | OK   | アクション参照は Zustand で安定 |
| 合成 Hook の不使用         | OK   | 設計に合成 Hook は含まれない    |

### P48 対策（派生セレクタ無限ループ防止）

| 検証項目                                | 結果     | 理由                                           |
| --------------------------------------- | -------- | ---------------------------------------------- |
| `.filter()`/`.map()` を含む派生セレクタ | 該当なし | 全セレクタがプリミティブ値またはアクション参照 |
| useShallow の要否                       | 不要     | `currentPlanResult` はオブジェクトだが参照安定 |

**結論**: P31/P48 対策は十分。

## 3. UI フロー設計の検証: PASS（改善推奨1件）

| 検証項目                              | 結果 | 備考                                           |
| ------------------------------------- | ---- | ---------------------------------------------- |
| TerminalHandoff 中のユーザー操作制限  | OK   | `isGenerating=true` で「実行する」ボタン無効化 |
| plan 結果表示後の「キャンセル」フロー | OK   | `clearGenerationState()` で全状態クリア        |
| planSkill 失敗時の UI フォールバック  | OK   | `generationError` に設定、入力フォーム横に表示 |
| isGenerating 中の二重送信防止         | OK   | handlePlanSkill/handleExecutePlan 冒頭で設定   |

**改善推奨 R-1**: `handlePlanSkill` 冒頭に `isGenerating` ガードを追加すべき。現設計では `setIsGenerating(true)` のみで、既に `isGenerating=true` の場合の早期リターンがない。

```typescript
// 追加推奨
const handlePlanSkill = async (description: string) => {
  if (isGenerating) return; // 二重呼出防止
  setIsGenerating(true);
  // ...
};
```

→ Phase 5 実装時に対応。

## 4. IPC 呼び出しの契約確認（P44/P45 対策）: PASS

| 検証項目                                | 結果 | 理由                                                                     |
| --------------------------------------- | ---- | ------------------------------------------------------------------------ |
| planSkill チャンネル名の一致            | OK   | `skill-creator:plan` = `IPC_CHANNELS.SKILL_CREATOR_PLAN`                 |
| executePlan チャンネル名の一致          | OK   | `skill-creator:execute-plan` = `IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN` |
| planSkill 引数形式（Preload↔Handler）   | OK   | `(prompt, authMode?, apiKey?)` 形式で一致                                |
| executePlan 引数形式（Preload↔Handler） | OK   | `(planId, skillSpec, authMode?, apiKey?)` 形式で一致                     |
| 引数名のセマンティクス一致（P45）       | OK   | `prompt`=自然言語入力、`planId`=plan結果のID                             |
| レスポンス wrapper 形式（P60）          | OK   | `IpcResult<T>` で統一                                                    |

## 5. セキュリティ検証: PASS

| 検証項目                           | 結果 | 理由                                           |
| ---------------------------------- | ---- | ---------------------------------------------- |
| IPC チャンネルのホワイトリスト登録 | OK   | `ALLOWED_INVOKE_CHANNELS` に登録済み           |
| 引数バリデーション（P42 3段）      | OK   | RuntimeSkillCreatorFacade.plan() で実装済み    |
| エラーメッセージサニタイズ         | OK   | skillCreatorHandlers.ts で実装済み             |
| Renderer への内部情報漏洩防止      | OK   | sanitizeError でスタックトレース・パス除去済み |

## 6. 追加検討事項

### R-2: SkillCreateWizard への接続（未タスク候補）

Phase 2 設計では SkillCreateWizard への planSkill 接続をスコープ外とした。以下の理由で未タスク化を推奨:

- SkillCreateWizard は独立した4段階フロー
- plan 結果表示のために Step 構成の大幅変更が必要
- SkillLifecyclePanel での接続実績を踏まえた設計が合理的

### R-3: onProgress コールバックの活用（未タスク候補）

`SkillCreatorAPI.onProgress(callback)` が定義済みだが、Phase 2 設計では `generationProgress` を手動で「計画を生成中...」に設定している。executePlan 中の実リアルタイムプログレスには `onProgress` の接続が必要。

## 指摘事項まとめ

| ID  | 種別         | 内容                                                | 対応方針             |
| --- | ------------ | --------------------------------------------------- | -------------------- |
| R-1 | 改善推奨     | handlePlanSkill に isGenerating ガード追加          | Phase 5 実装時に対応 |
| R-2 | 未タスク候補 | SkillCreateWizard への planSkill 接続               | 未タスク仕様書で管理 |
| R-3 | 未タスク候補 | onProgress コールバックによるリアルタイムプログレス | 未タスク仕様書で管理 |

## 統合テスト連携

Phase 3（設計レビュー）では以下の統合テスト観点をレビューで検証する:

- handlePlanSkill の二重呼出防止ガード（R-1）がテスト可能な設計か確認
- IPC チャンネル名・引数形式の一致（P44/P45 対策）をテストで検証可能か確認
- 後方互換性（AC-7）のリグレッションテスト方針が Phase 4 で設計可能か確認

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                                               |
| ------------------ | -------- | -------------------------------------------------------------------------------------- |
| セキュリティ       | 該当     | IPC チャンネルホワイトリスト登録確認済み、P42 3段バリデーション実装済み                |
| UI/UX              | 該当     | TerminalHandoff 中の操作制限（isGenerating ロック）、plan 結果表示後のキャンセルフロー |
| アーキテクチャ     | 該当     | Zustand 個別セレクタ設計（P31 対策）、P48 useShallow 不要の判定根拠                    |
| エラーハンドリング | 該当     | 5つのエラーケースの UI 動作設計、graceful degradation 設計                             |

## サブタスク管理

Phase実行開始時にTaskCreateで以下のサブタスクを作成する:

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の実施
4. 成果物の作成
5. 完了条件の検証

## 成果物

| 成果物             | パス                                                                         | 説明       |
| ------------------ | ---------------------------------------------------------------------------- | ---------- |
| 設計レビュー報告書 | `docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-03-design-review.md` | 本ファイル |

## 完了条件

- [x] 既存 skill:create フローの後方互換性を検証した（AC-7）
- [x] Zustand 個別セレクタ設計を確認した（P31 対策）
- [x] 派生セレクタへの useShallow 適用要否を確認した（P48 対策: 不要）
- [x] TerminalHandoff 中の誤操作防止を確認した（isGenerating ロック）
- [x] planSkill エラー時の UI フォールバックを確認した
- [x] IPC チャンネル名・引数形式の整合性を確認した（P44/P45 対策）
- [x] レスポンス wrapper 形式の整合性を確認した（P60 対策）
- [x] レビュー判定を **PASS** で明記した
- [x] 改善推奨事項（R-1）と未タスク候補（R-2, R-3）を記録した

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了した
- [x] 各タスクの成果物が生成されている
- [x] 完了条件を全て満たしている

## 次のPhase

Phase 4: テスト作成
