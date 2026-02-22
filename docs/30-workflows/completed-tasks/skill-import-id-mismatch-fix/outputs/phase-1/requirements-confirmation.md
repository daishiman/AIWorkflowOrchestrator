# Phase 1: 要件定義 — 確認レポート

## タスクID: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## 確認日: 2026-02-22

## 確認結果: PASS

### バグの根本原因

SkillImportDialog が `skill.id`（SHA-256ハッシュの先頭16文字）を `onImport` 経由で IPC ハンドラに渡しているが、ハンドラ側は `skill.name`（人間可読名）を `getSkillByName()` で検索するため、100%不一致でインポートが失敗する。

### データフロー確認

- 現状: `skill.id ("a478b3e7c728cd18")` → IPC → `getSkillByName()` → null → IMPORT_ERROR
- 修正後: `skill.name ("task-specification-creator")` → IPC → `getSkillByName()` → Skill → 成功

### 機能要件 (FR-1〜FR-6): 定義済み

- FR-1: `onImport` に渡す値を `skill.name` に統一する
- FR-2: `importedSkillIds` はIDのまま維持する
- FR-3: SkillImportDialog 内部状態はIDで保持する
- FR-4: AgentView の接続コード修正
- FR-5: 変換失敗時の安全動作を定義する
- FR-6: store / IPC 契約は変更しない

### 非機能要件 (NFR-1〜NFR-2): 定義済み

- NFR-1: 既存テスト47件互換性
- NFR-2: fireEvent使用、apps/desktopから実行

### 受け入れ基準 (AC-1〜AC-6): 定義済み

### スコープ: 確定

- スコープ内: SkillImportDialog, AgentView, テスト
- スコープ外: IPC ハンドラ, Preload, agentSlice

### 完了条件チェック

- [x] バグの根本原因が特定され、データフローが文書化されている
- [x] 機能要件 FR-1〜FR-6 が定義されている
- [x] 非機能要件 NFR-1〜NFR-2 が定義されている
- [x] 受け入れ基準 AC-1〜AC-6 が定義されている
- [x] スコープ内/外が明確に定義されている
- [x] 修正対象ファイルと変更内容が特定されている
- [x] 変更境界が Renderer（SkillImportDialog / AgentView）に限定されている
