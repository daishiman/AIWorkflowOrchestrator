# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 10                                        |
| Phase名    | 最終レビューゲート                        |
| 前提Phase  | Phase 9 (品質保証)                        |
| 後続Phase  | Phase 11 (手動テスト検証)                 |
| ステータス | 未実施                                    |
| 作成日     | 2026-02-09                                |
| タスクID   | TASK-FIX-6-1-STATE-CENTRALIZATION         |
| タスク名   | スキル状態管理のZustand集約（仕様書準拠） |

---

## 目的

全体品質・整合性を検証し、手動テストに進む前の最終確認を行う。

## 背景

skillSliceの削除とagentSliceへの統合が完了し、品質保証を経た状態で、要件との整合性と全体品質を最終確認する。

---

## レビュー観点

### 1. 仕様書準拠

**確認項目**:

- [ ] agentSlice単一で全スキル状態を管理している
- [ ] skillSliceが完全に削除されている
- [ ] 状態管理の設計原則（03-state-management.md）に準拠している
- [ ] Zustand Slice設計原則に従っている

**検証コマンド**:

```bash
# skillSlice参照が残っていないことを確認
grep -rn "skillSlice" apps/desktop/src/renderer/ --include="*.ts" --include="*.tsx" | grep -v "test"

# 期待結果: マッチなし
```

### 2. 型安全性

**確認項目**:

- [ ] 型定義に`any`型が使用されていない
- [ ] 型アサーション（`as`）の使用が最小限
- [ ] Generics/Unionが適切に使用されている
- [ ] Store型定義（AppStore）が正しく構成されている

**検証コマンド**:

```bash
# 型エラーなし確認
pnpm typecheck
```

### 3. パフォーマンス

**確認項目**:

- [ ] 不要な再レンダリングが発生していない
- [ ] セレクタが適切に分割されている（必要なフィールドのみ取得）
- [ ] メモ化が適切に使用されている

**検証ポイント**:

```typescript
// 良い例: 個別セレクタで必要なフィールドのみ取得
const selectedSkill = useAppStore((state) => state.selectedSkill);
const executionState = useAppStore((state) => state.executionState);

// 悪い例: Store全体を一括取得（避けるべき）
const { selectedSkill, executionState, ...rest } = useAppStore();
```

### 4. 後方互換性

**確認項目**:

- [ ] useSkillExecutionの戻り値インターフェースが維持されている
- [ ] useSkillStoreの戻り値が既存コードで使用可能
- [ ] 既存コンポーネント（AgentView, ChatPanel等）が変更なしで動作

**検証方法**:

1. 既存のコンポーネントテストが全てPASS
2. useSkillExecutionを使用するコンポーネントが正常動作
3. import文の変更が不要

### 5. コード品質

**確認項目**:

- [ ] コーディング規約（02-code-quality.md）に準拠
- [ ] 命名規則が一貫している
- [ ] エラーハンドリングが適切
- [ ] コメント・JSDocが適切

### 6. ドキュメント整合性

**確認項目**:

- [ ] 状態管理仕様書との整合性が保たれている
- [ ] 削除したファイルが仕様書に記載されている
- [ ] 変更点がリファクタリング記録に文書化されている

---

## 統合テスト連携【必須】

最終レビューで統合テスト結果を確認:

| レビュー項目  | 確認内容                              |
| ------------- | ------------------------------------- |
| 全テスト結果  | ユニット/統合/E2E全て成功             |
| カバレッジ    | Line 80%+, Branch 60%+, Function 80%+ |
| IPC接続テスト | skill.\* チャンネル全て疎通確認       |
| 状態同期      | agentSlice単一ソースで全状態管理      |

---

## agentSlice vs skillSlice 比較確認

### 機能マッピング表

| 機能                     | skillSlice（削除前）       | agentSlice（統合後）               | 確認 |
| ------------------------ | -------------------------- | ---------------------------------- | ---- |
| スキル一覧取得           | `fetchSkills`              | `setSkills`                        | [ ]  |
| スキル選択               | `selectSkillByName`        | `selectSkill`                      | [ ]  |
| スキル実行               | `executeSkill`             | `startExecution`                   | [ ]  |
| 実行中断                 | `abortExecution`           | `stopExecution`                    | [ ]  |
| 権限リクエスト           | `pendingPermission`        | `executionState.pendingPermission` | [ ]  |
| 権限応答                 | `respondToSkillPermission` | `respondToPermission`              | [ ]  |
| エラー状態               | `skillError`               | `error`                            | [ ]  |
| ローディング状態         | `isLoadingSkills`          | `isLoading`                        | [ ]  |
| ストリーミングメッセージ | `streamingMessages`        | `executionState.messages`          | [ ]  |
| 実行ステータス           | `skillExecutionStatus`     | `executionState.status`            | [ ]  |

### 移行確認

- [ ] 全機能がagentSliceで実現可能
- [ ] データ構造の変換が適切
- [ ] 状態遷移ロジックが維持されている

---

## 参照資料

| 参照資料             | パス                                                          | 内容         |
| -------------------- | ------------------------------------------------------------- | ------------ |
| タスク指示書         | （元の未タスク仕様書）                                        | 機能要件     |
| 状態管理仕様         | `aiworkflow-requirements/references/arch-state-management.md` | 状態配置原則 |
| agentSlice           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`        | 統合後コード |
| 品質レポート         | `outputs/phase-9/quality-report.md`                           | 品質検証結果 |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                          | 変更記録     |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                   | 内容            |
| ---------------- | -------------------------------------- | --------------- |
| 状態管理ルール   | `.claude/rules/03-state-management.md` | Zustand設計原則 |
| コード品質ルール | `.claude/rules/02-code-quality.md`     | 品質基準        |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`   | 注意事項        |

---

## 成果物

| 成果物           | パス                                                                                          | 内容                   |
| ---------------- | --------------------------------------------------------------------------------------------- | ---------------------- |
| 最終レビュー結果 | `docs/30-workflows/TASK-FIX-6-1-STATE-CENTRALIZATION/outputs/phase-10/final-review-result.md` | レビュー判定・指摘事項 |

---

## レビュー結果判定

### 判定基準

| 判定     | 条件                                         | 次のアクション                      |
| -------- | -------------------------------------------- | ----------------------------------- |
| PASS     | 全レビュー観点で問題なし                     | Phase 11 へ進行                     |
| MINOR    | 軽微な指摘あり（動作に影響なし）             | 未タスク仕様書に変換後、Phase 11 へ |
| MAJOR    | 重大な問題あり（機能・設計に影響）           | 影響範囲に応じて戻る                |
| CRITICAL | 致命的な問題あり（要件未充足・セキュリティ） | Phase 1 へ戻りユーザー確認          |

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| 実装の問題       | Phase 5（実装）       |
| リファクタの問題 | Phase 8（リファクタ） |

### MINOR指摘の処理

**重要**: MINOR指摘は**全て**未タスク仕様書に変換すること（「機能影響なし」でも省略不可）

1. 指摘内容を未タスク仕様書に記載
2. `unassigned-task/`に指示書を作成
3. `task-workflow.md`残課題テーブルに登録
4. 関連仕様書に参照リンク追加

---

## 最終レビューチェックリスト

### 仕様書準拠

- [ ] agentSlice単一で全状態管理（skillSlice削除済み）
- [ ] 状態管理設計原則に準拠
- [ ] Zustand Slice設計原則に準拠

### 型安全性

- [ ] any型不使用
- [ ] 型アサーション最小限
- [ ] Store型定義正常

### パフォーマンス

- [ ] 不要な再レンダリングなし
- [ ] セレクタ適切分割
- [ ] メモ化適切使用

### 後方互換性

- [ ] useSkillExecutionインターフェース維持
- [ ] 既存コンポーネント変更不要
- [ ] テスト全PASS

### コード品質

- [ ] コーディング規約準拠
- [ ] 命名規則統一
- [ ] エラーハンドリング適切

### ドキュメント

- [ ] 変更点文書化
- [ ] 仕様書整合性確認

---

## 完了条件

- [ ] 全レビュー観点がチェックされている
- [ ] 機能マッピングが確認されている
- [ ] レビュー結果が文書化されている
- [ ] 判定結果（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR指摘は未タスク仕様書に変換済み
- [ ] **本Phase内の全作業を100%完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 8, 9 が完了していること
- **後続**: Phase 11 へ進む（PASS/MINOR判定の場合）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### レビュー結果

- 判定: {{PASS/MINOR/MAJOR/CRITICAL}}
- 指摘事項数: {{数}}

### レビュー観点別結果

| 観点           | 結果     | 備考 |
| -------------- | -------- | ---- |
| 仕様書準拠     | {{結果}} |      |
| 型安全性       | {{結果}} |      |
| パフォーマンス | {{結果}} |      |
| 後方互換性     | {{結果}} |      |
| コード品質     | {{結果}} |      |
| ドキュメント   | {{結果}} |      |

### 機能マッピング確認

- skillSlice機能の完全移行: {{PASS/FAIL}}
- 欠落機能: {{なし/あり（詳細）}}

### 指摘事項一覧

| No  | 観点 | 指摘内容 | 重要度 | 対応状況 |
| --- | ---- | -------- | ------ | -------- |
| 1   |      |          |        |          |

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

`docs/30-workflows/TASK-FIX-6-1-STATE-CENTRALIZATION/phase-11-manual-testing.md`
