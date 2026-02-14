# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 10                             |
| Phase名    | 最終レビュー                   |
| 機能名     | ipc-response-unwrap            |
| タスクID   | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| 前提Phase  | Phase 9 (品質検証)             |
| 後続Phase  | Phase 11 (手動テスト)          |
| ステータス | 未実施                         |
| 作成日     | 2026-02-14                     |

---

## 目的

多角的品質・整合性検証を実施し、PASS / MINOR / MAJOR / CRITICAL の判定を行う。Phase 4-9 の全成果物を対象に、コード品質・セキュリティ・受入基準充足・既知 Pitfall 対策・テスト品質の5観点でレビューする。

---

## 実行タスク

| タスク | 内容                    |
| ------ | ----------------------- |
| Task 1 | コードレビュー          |
| Task 2 | セキュリティレビュー    |
| Task 3 | 受入基準の充足確認      |
| Task 4 | 既知 Pitfall 対策の確認 |
| Task 5 | テスト品質レビュー      |

---

## 参照資料

| 種別             | パス                                                                   | 内容                           |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------ |
| Phase 1 成果物   | `outputs/phase-1/requirements-analysis.md`                             | 要件定義結果                   |
| Phase 2 成果物   | `outputs/phase-2/design-document.md`                                   | 設計結果                       |
| Phase 4 成果物   | `outputs/phase-4/`                                                     | テストケース設計・テストコード |
| Phase 5 成果物   | `outputs/phase-5/`                                                     | 実装コード                     |
| Phase 6 成果物   | `outputs/phase-6/`                                                     | 拡充テスト                     |
| Phase 7 成果物   | `outputs/phase-7/`                                                     | カバレッジレポート             |
| Phase 8 成果物   | `outputs/phase-8/`                                                     | リファクタリング結果           |
| Phase 9 成果物   | `outputs/phase-9/`                                                     | 品質検証レポート               |
| Preload API      | `apps/desktop/src/preload/skill-api.ts`                                | 修正対象ファイル               |
| 既存テスト       | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                 | テストファイル                 |
| IPC ハンドラ     | `apps/desktop/src/main/ipc/skillHandlers.ts`                           | IPC ハンドラ（参照用）         |
| Store Slice      | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                 | Store 層（参照用）             |
| クラッシュ箇所   | `apps/desktop/src/renderer/views/AgentView/index.tsx:151`              | 元バグ発生箇所                 |
| レビュー判定基準 | `.claude/skills/aiworkflow-requirements/references/review-criteria.md` | レビュー判定基準               |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                              | 内容                 |
| ---------------- | --------------------------------------------------------------------------------- | -------------------- |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | Preload セキュリティ |
| Skill IPC 仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill IPC 仕様       |
| SkillAPI 型定義  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | SkillAPI 型定義      |

---

## 実行手順

### Task 1: コードレビュー

以下の観点で `safeInvokeUnwrap` 関数と4メソッドの修正内容をレビューする。

#### 1-1. `safeInvokeUnwrap` 関数の実装品質

- [ ] 関数シグネチャの型パラメータ `<T>` が正しく定義されている
- [ ] `{ success, data }` ラッパーの展開ロジックが正確
- [ ] `success === false` の場合にエラーが throw される
- [ ] `success === true` の場合に `data` のみが返却される
- [ ] `data` が `undefined` / `null` の場合のハンドリングが存在する

#### 1-2. 4メソッドの修正確認

| メソッド        | 期待する戻り値型  | 確認事項                            |
| --------------- | ----------------- | ----------------------------------- |
| `list()`        | `SkillMetadata[]` | `safeInvokeUnwrap` で呼び出している |
| `getImported()` | `ImportedSkill[]` | `safeInvokeUnwrap` で呼び出している |
| `import()`      | `ImportedSkill`   | `safeInvokeUnwrap` で呼び出している |
| `rescan()`      | `SkillMetadata[]` | `safeInvokeUnwrap` で呼び出している |

#### 1-3. エラーハンドリングの網羅性

- [ ] IPC 通信失敗（チャンネル未登録、タイムアウト）のハンドリング
- [ ] Main Process 側のエラー（ファイルアクセス失敗、パース失敗）のハンドリング
- [ ] レスポンス形式不正（`success` フィールドがない、`data` フィールドがない）のハンドリング

#### 1-4. 型安全性

- [ ] `any` 型を使用していない
- [ ] 型アサーション（`as`）が最小限（使用している場合は理由コメントが付与されている）
- [ ] `IpcResult<T>` 型が仕様どおり定義されている

---

### Task 2: セキュリティレビュー

#### 2-1. チャンネルホワイトリスト検証

- [ ] `safeInvokeUnwrap` 内部で `safeInvoke` を呼び出しており、チャンネルホワイトリスト検証が維持されている
- [ ] ホワイトリストをバイパスする経路が存在しない

#### 2-2. エラーメッセージのサニタイズ

- [ ] エラーメッセージにスタックトレースが含まれていない
- [ ] エラーメッセージにファイルパスが含まれていない
- [ ] エラーメッセージに内部実装の詳細が含まれていない
- [ ] ユーザー向けのエラーメッセージが一般化されている

#### 2-3. P19 対策: 実行時バリデーション

- [ ] `safeInvokeUnwrap` の戻り値に対して実行時型チェックが実装されている
- [ ] `typeof` / `Array.isArray()` による実行時検証が行われている
- [ ] 型アサーション（`as`）で実行時検証をバイパスしていない

---

### Task 3: 受入基準の充足確認

7つの受入基準を1つずつ検証し、PASS / FAIL を判定する。

| #   | 受入基準                                                                 | 判定 |
| --- | ------------------------------------------------------------------------ | ---- |
| 1   | `window.electronAPI.skill.getImported()` が `ImportedSkill[]` を直接返す | -    |
| 2   | `window.electronAPI.skill.list()` が `SkillMetadata[]` を直接返す        | -    |
| 3   | `window.electronAPI.skill.import()` が `ImportedSkill` を直接返す        | -    |
| 4   | `window.electronAPI.skill.rescan()` が `SkillMetadata[]` を直接返す      | -    |
| 5   | AgentView で `importedSkills.forEach` が正常動作する                     | -    |
| 6   | 型注釈と実行時の値が一致する                                             | -    |
| 7   | 既存テストが全て PASS する                                               | -    |

- [ ] 受入基準 7 項目全てが PASS

---

### Task 4: 既知 Pitfall 対策の確認

#### P19: 型キャスト（as）による実行時検証バイパス

- [ ] `as` による型キャストで実行時検証をバイパスしていない
- [ ] IPC レスポンスに対して実行時バリデーションが実装されている
- [ ] `unknown` 型で受け取り、バリデーション後に型を確定するパターンが使われている

#### P23: API 二重定義の型管理

- [ ] `SkillAPI` インターフェースの型定義と `skill-api.ts` の実装が一致している
- [ ] `preload/types.ts` の型定義と `preload/types.d.ts` の型宣言が一致している
- [ ] 型定義ファイルと実装ファイルの戻り値型が全て一致している

#### P24: Store 型定義と Preload 型定義の不統一

- [ ] `agentSlice.ts` の `Skill` 型と `preload/types.ts` の `ImportedSkill` 型の不整合が今回の修正で悪化していないことを確認
- [ ] `as unknown as Skill[]` 型キャスト除去は別タスク（UT-FIX-5-1-001）のスコープであることを確認

---

### Task 5: テスト品質レビュー

#### 5-1. テストケースの網羅性

- [ ] 正常系: 4メソッド全ての正常レスポンス展開テスト
- [ ] 異常系: `success: false` レスポンスのエラーハンドリングテスト
- [ ] エッジケース: `data` が空配列・`null`・`undefined` のテスト
- [ ] エッジケース: レスポンス形式不正のテスト

#### 5-2. テスト間の独立性（P9 対策）

- [ ] テスト間で状態を共有していない
- [ ] `beforeEach` でモック・状態がリセットされている
- [ ] テスト実行順序に依存していない

#### 5-3. カバレッジ基準の達成状況

| 指標              | 最低基準 | 推奨基準 | 達成状況 |
| ----------------- | -------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      | -        |
| Branch Coverage   | 60%      | 70%      | -        |
| Function Coverage | 80%      | 90%      | -        |

---

## レビューゲート判定基準

| 判定     | 条件                                     | 次のアクション                                     |
| -------- | ---------------------------------------- | -------------------------------------------------- |
| PASS     | 全 Task の全項目がクリア                 | Phase 11 へ進む                                    |
| MINOR    | 軽微な課題あり（機能動作に影響なし）     | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な課題あり（機能動作に影響あり）     | 影響範囲に応じて Phase 1-5 へ戻る                  |
| CRITICAL | 要件レベルの問題（受入基準を満たせない） | Phase 1 へ戻り要件再確認                           |

### 戻り先決定基準

| 問題の種類   | 戻り先                |
| ------------ | --------------------- |
| 要件の問題   | Phase 1（要件定義）   |
| 設計の問題   | Phase 2（設計）       |
| 実装の問題   | Phase 5（実装）       |
| テストの問題 | Phase 4（テスト作成） |
| 品質の問題   | Phase 8（リファクタ） |

---

## 統合テスト連携

### Phase 10 での必須アクション

- [ ] Preload 層 → Main Process 間の IPC 通信が正常に動作していることをテスト結果から確認
- [ ] Store Slice が Preload API の戻り値を正しく処理していることを確認
- [ ] AgentView が Store の状態を正しく描画していることを確認

---

## 多角的チェック観点

| 観点           | 確認内容                                                        |
| -------------- | --------------------------------------------------------------- |
| 後方互換性     | `skill.execute()` と Permission API が影響を受けていないこと    |
| パフォーマンス | `safeInvokeUnwrap` のオーバーヘッドが無視できるレベルであること |
| 保守性         | 新規メソッド追加時の手順が明確であること                        |
| テスタビリティ | モック差し替えが容易であること                                  |

---

## 成果物

| 成果物           | パス                                      | 内容                             |
| ---------------- | ----------------------------------------- | -------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | レビュー判定・指摘事項・改善勧告 |

---

## 完了条件

- [ ] コードレビュー完了（Task 1 全項目チェック済み）
- [ ] セキュリティレビュー完了（Task 2 全項目チェック済み）
- [ ] 受入基準 7 項目全て PASS（Task 3）
- [ ] Pitfall 対策確認完了（Task 4 全項目チェック済み）
- [ ] テスト品質レビュー完了（Task 5 全項目チェック済み）
- [ ] レビューゲート判定: PASS または MINOR（MINOR の場合は未タスク仕様書作成済み）
- [ ] 最終レビュー結果が `outputs/phase-10/final-review-result.md` に文書化されている

---

## Phase 末端アクション

- [ ] 本 Phase 内の全作業を 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 4, 5, 6, 7, 8, 9 が完了していること
- **後続**: Phase 11 へ進む（PASS / MINOR 判定の場合）

---

## スキルフィードバック記録

Phase 完了後、以下を記録すること:

```markdown
## Phase 10 実行記録

### レビュー結果

- 判定: {{PASS/MINOR/MAJOR/CRITICAL}}
- 指摘事項数: {{数}}

### Task 別結果

| Task   | 内容                 | 結果              |
| ------ | -------------------- | ----------------- |
| Task 1 | コードレビュー       | {{PASS/指摘あり}} |
| Task 2 | セキュリティレビュー | {{PASS/指摘あり}} |
| Task 3 | 受入基準充足確認     | {{7/7 PASS}}      |
| Task 4 | Pitfall 対策確認     | {{PASS/指摘あり}} |
| Task 5 | テスト品質レビュー   | {{PASS/指摘あり}} |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後、以下のファイルを実行すること:

`docs/30-workflows/ipc-response-unwrap/phase-11-manual-testing.md`
