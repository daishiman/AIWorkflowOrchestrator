# スキルインポートエージェントシステム

## 概要

`~/.claude/skills/` 配下のスキルをスキャンし、配下の全情報（agents/, references/, scripts/等）を取得してシステムにインポートする機能。

## ドキュメント構成

| ドキュメント                                   | 内容                                  |
| ---------------------------------------------- | ------------------------------------- |
| [仕様書](./specification.md)                   | 機能仕様、UI/UX仕様、バックエンド仕様 |
| [技術選定・設計判断](./technical-decisions.md) | SDK選定、永続化方式、セキュリティ設計 |
| [実行計画](./execution-plan.md)                | タスク分解、依存関係、実行順序        |
| [タスク一覧](./tasks/index.md)                 | 個別タスク仕様書（21タスク）          |

## クイックスタート

### 並列実行可能なフェーズ

```
Phase 2 (サービス層):
  2A: SkillScanner      ─┐
  2B: SkillImportStore   ├── 同時実行可能
  2C: Security Patterns ─┘

Phase 7 (UIコンポーネント):
  7A: SkillSelector      ─┐
  7B: SkillImportDialog   ├── 同時実行可能
  7C: PermissionDialog   ─┘

Phase 9 (スキル管理拡張):
  9A: SkillEditor        ─┐
  9B: skill-creator       ├── 同時実行可能
  9C: SkillImprover      ─┘
```

### 依存関係チェーン

```
Phase 1 (型定義)
    ↓
Phase 2 (サービス層) ※並列可
    ↓
Phase 3 (実行エンジン)
    ↓
Phase 4 (IPC層)
    ↓
Phase 5 (Preload API)
    ↓
Phase 6 (Zustand)
    ↓
Phase 7 (UIコンポーネント) ※並列可
    ↓
Phase 8 (テスト) ※並列可
    ↓
Phase 9 (スキル管理拡張) ※並列可
    ↓
Phase 10 (ライフサイクル管理)
```

## 実装チェックリスト

### Phase 1: 型定義

- [ ] [TASK-1-1](./tasks/task-1-1-type-definitions.md): 共通型定義

### Phase 2: サービス層（並列実行可能）

- [ ] [TASK-2A](./tasks/task-2a-skill-scanner.md): SkillScanner
- [ ] [TASK-2B](./tasks/task-2b-skill-import-store.md): SkillImportStore
- [ ] [TASK-2C](./tasks/task-2c-security-patterns.md): セキュリティパターン

### Phase 3: 実行エンジン

- [ ] [TASK-3-1](./tasks/task-3-1-skill-executor.md): SkillExecutor
- [ ] [TASK-3-2](./tasks/task-3-2-permission-resolver.md): PermissionResolver

### Phase 4: IPC層

- [ ] [TASK-4-1](./tasks/task-4-1-ipc-channels.md): チャネル定義
- [ ] [TASK-4-2](./tasks/task-4-2-ipc-handlers.md): ハンドラー

### Phase 5: Preload API

- [ ] [TASK-5-1](./tasks/task-5-1-skill-api.md): SkillAPI

### Phase 6: 状態管理

- [ ] [TASK-6-1](./tasks/task-6-1-skill-slice.md): SkillSlice

### Phase 7: UIコンポーネント（7A-7C並列実行可能）

- [ ] [TASK-7A](./tasks/task-7a-skill-selector.md): SkillSelector
- [ ] [TASK-7B](./tasks/task-7b-skill-import-dialog.md): SkillImportDialog
- [ ] [TASK-7C](./tasks/task-7c-permission-dialog.md): PermissionDialog
- [ ] [TASK-7D](./tasks/task-7d-chat-panel-integration.md): ChatPanel統合

### Phase 8: テスト（並列実行可能）

- [ ] [TASK-8A](./tasks/task-8a-unit-tests.md): 単体テスト
- [ ] [TASK-8B](./tasks/task-8b-component-tests.md): コンポーネントテスト
- [ ] [TASK-8C](./tasks/task-8c-integration-tests.md): 統合テスト

### Phase 9: スキル管理拡張（並列実行可能）

- [ ] [TASK-9A](./tasks/task-9a-skill-editor.md): SkillEditor（GUI編集）
- [ ] [TASK-9B](./tasks/task-9b-skill-creator.md): skill-creator メタスキル
- [ ] [TASK-9C](./tasks/task-9c-skill-improver.md): SkillImprover（AI分析・改善）

### Phase 10: ライフサイクル管理

- [ ] [TASK-10A](./tasks/task-10a-skill-lifecycle.md): 統合管理UI

## 関連リソース

- 既存スキル: `~/.claude/skills/`
- 参照実装: `apps/desktop/src/main/services/agent/AgentExecutor.ts`
- SDK: `@anthropic-ai/claude-agent-sdk`
