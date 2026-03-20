# Phase 3: 設計レビュー

## メタ情報

| 項目          | 内容                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| Phase番号     | 3                                                                                                          |
| 機能名        | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE)                                                        |
| 作成日        | 2026-03-20                                                                                                 |
| 担当          | -                                                                                                          |
| ステータス    | 未着手                                                                                                     |
| 前Phase成果物 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-2-design.md` |

## 目的

Phase 2 で作成した設計を多角的にレビューし、安全性・整合性・セキュリティ面での問題がないかを検証する。レビュー結果に基づいてPASS/MINOR/MAJORを判定し、次のフェーズへ進む条件を確認する。

## 実行タスク

### レビュー観点1: persist migration安全性

**確認項目**:

- [ ] `migrate` 関数でv1→v2への移行時に既存フィールド（`currentView`, `userProfile`, `autoSyncEnabled`）が失われないことを確認する
- [ ] `version` 番号が既存のpersist設定と矛盾しないことを確認する（現行versionを `grep -n "version" apps/desktop/src/renderer/store/index.ts` で確認）
- [ ] `migrate` 関数が存在しない場合のZustandのデフォルト動作（store全体リセット）について、UXへの影響を評価する
- [ ] migration実行時に不正なデータ（例: `persistedState` が null / undefined）が渡された場合の安全性を確認する

**チェックコマンド**:

```bash
# 現行のpersist version確認
grep -n "version" apps/desktop/src/renderer/store/index.ts

# persist storageキー名確認
grep -n "name:" apps/desktop/src/renderer/store/index.ts
```

**合格基準**: migrateで既存フィールドが保持され、不正データにも安全に対処できること

---

### レビュー観点2: セキュリティ — APIキーのpersist対象外確認

**確認項目**:

- [ ] Phase 2 設計のpartialize関数に `apiKey`, `token`, `secret`, `password` 等の認証情報が含まれていないことを確認する
- [ ] `selectedProviderId` と `selectedModelId` の値がAPIキー等の機密情報ではなく、単なる識別子文字列であることを確認する
- [ ] electron-storeの保存先（ユーザーデータディレクトリ）が適切に保護されているかを確認する

**セキュリティルール参照**: `.claude/rules/04-electron-security.md` の「認証セキュリティ」セクション

**チェックコマンド**:

```bash
# LLMスライスのAPIキー関連フィールド確認
grep -n "apiKey\|token\|secret\|password" apps/desktop/src/renderer/store/slices/llmSlice.ts
```

**合格基準**: partializeに機密情報が含まれていないこと

---

### レビュー観点3: 既存persistフィールドとの競合確認

**確認項目**:

- [ ] `selectedProviderId` が既存のpersistフィールド名と重複していないことを確認する
- [ ] `selectedModelId` が既存のpersistフィールド名と重複していないことを確認する
- [ ] 既存のstoreスライス（authSlice, agentSliceなど）に同名フィールドがないことを確認する
- [ ] Zustand devtoolsでのデバッグ時に新フィールドが適切に表示されることを想定する

**チェックコマンド**:

```bash
# 既存フィールド名との重複確認
grep -rn "selectedProviderId\|selectedModelId" apps/desktop/src/renderer/store/

# 既存スライス一覧確認
ls apps/desktop/src/renderer/store/slices/
```

**合格基準**: フィールド名の重複がなく、型定義が明確であること

---

### レビュー観点4: バリデーションロジックの堅牢性

**確認項目**:

- [ ] Phase 2 のバリデーション疑似コードがP62対策（DEFAULT_CONFIG fallback禁止）を正しく実装しているか確認する
- [ ] `availableProviders` が空配列の場合（APIエラー等）に永続化値が誤ってnullクリアされないかを確認する
- [ ] fetchProviders失敗時にバリデーションを実行すべきか否かの判断が設計に含まれているか確認する
- [ ] バリデーション結果（有効/無効）がUIにフィードバックされる手段があるか確認する

**合格基準**: バリデーションがエッジケースを網羅し、誤ったnullクリアが発生しないこと

---

### レビュー観点5: 同期タイミングの競合リスク

**確認項目**:

- [ ] Zustand hydrate完了前に `syncSelectedConfigToMain()` が呼ばれる競合が発生しないか確認する
- [ ] providers fetchが完了する前にユーザーがLLMを使用しようとした場合の動作を確認する
- [ ] `syncSelectedConfigToMain()` が二重呼び出しされた場合に副作用がないことを確認する

**合格基準**: 同期フローに競合リスクがなく、非機能要件（3秒以内）を満たす設計であること

---

### レビュー判定

以下の基準でレビュー結果を判定する:

| 判定              | 基準                                                    |
| ----------------- | ------------------------------------------------------- |
| PASS              | すべてのレビュー観点が合格基準を満たす                  |
| MINOR             | 軽微な指摘事項あり（機能影響なし）、指摘対応後Phase 4へ |
| MAJOR（設計問題） | 設計に根本的な問題あり → Phase 2 へ戻る                 |
| MAJOR（要件問題） | 要件の解釈に誤りあり → Phase 1 へ戻る                   |

**レビュー結果**: （Phase 3 実行時に記入）

| 項目                                 | 結果 | 指摘内容 |
| ------------------------------------ | ---- | -------- |
| persist migration安全性              | -    | -        |
| セキュリティ（APIキーpersist対象外） | -    | -        |
| 既存persistフィールドとの競合        | -    | -        |
| バリデーションロジックの堅牢性       | -    | -        |
| 同期タイミングの競合リスク           | -    | -        |
| **総合判定**                         | -    | -        |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名              | パス                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------- |
| Zustand persist設計 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| セキュリティ考慮    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

### プロジェクトルール

| 資料名             | パス                                    |
| ------------------ | --------------------------------------- |
| セキュリティルール | `.claude/rules/04-electron-security.md` |
| コード品質ルール   | `.claude/rules/02-code-quality.md`      |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`    |

### 前Phase成果物

| 資料名           | パス                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-1-requirements.md` |
| Phase 2 設計     | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-2-design.md`       |

## 実行手順

1. **Phase 2 設計書の確認**: `phase-2-design.md` を精読し、設計内容を把握する
2. **各レビュー観点の実施**: 上記5つの観点を順番にチェックし、チェックボックスをすべて確認する
3. **チェックコマンドの実行**: 各観点のチェックコマンドを実行し、実際のコードと設計の整合性を確認する
4. **レビュー結果テーブルの記入**: 各観点の結果を判定テーブルに記入する
5. **総合判定の決定**: PASS/MINOR/MAJORを決定し、次のアクションを確定する
6. **MINOR指摘の未タスク化**: MINOR判定の場合、指摘事項を未タスク仕様書に変換する（省略不可）

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                              | 説明             |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------- |
| Phase 3 仕様書（本ファイル） | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-3-design-review.md` | 設計レビュー結果 |

## 完了条件

- [ ] すべてのレビュー観点（5項目）のチェックボックスを確認した
- [ ] 各観点のチェックコマンドを実行し、結果を確認した
- [ ] レビュー結果テーブルに各観点の判定を記入した
- [ ] 総合判定（PASS/MINOR/MAJOR）を決定した
- [ ] MINOR判定の場合、指摘事項を未タスク仕様書に変換した
- [ ] MAJOR判定の場合、戻り先Phase（Phase 1 または Phase 2）を明記した

## 次Phase

- PASS / MINOR（指摘対応後）: Phase 4: テスト作成
- MAJOR（設計問題）: Phase 2: 設計 へ戻る
- MAJOR（要件問題）: Phase 1: 要件定義 へ戻る
