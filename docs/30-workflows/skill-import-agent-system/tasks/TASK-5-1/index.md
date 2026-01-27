# TASK-5-1: SkillAPI 実装（Preload）

## 概要

| 項目       | 値                       |
| ---------- | ------------------------ |
| タスクID   | TASK-5-1                 |
| タイトル   | SkillAPI 実装（Preload） |
| フェーズ   | 5                        |
| 依存タスク | TASK-4-1, TASK-4-2       |
| ブロック   | TASK-6-1                 |
| ステータス | pending                  |
| 優先度     | high                     |
| 複雑度     | medium                   |
| タグ       | preload, renderer, api   |

## 目的

Renderer プロセスから安全に IPC 通信を行うための Preload API を実装する。
既存の `safeInvoke` / `safeOn` パターンに準拠する。

## 成果物

| ファイル                                | 説明                            |
| --------------------------------------- | ------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` | SkillAPI インターフェース・実装 |
| `apps/desktop/src/preload/index.ts`     | window.skillAPI への公開        |

---

## Phase構成

| Phase | 名称                                                        | 説明                   |
| ----- | ----------------------------------------------------------- | ---------------------- |
| 1     | [要件定義](phase-1-requirements.md)                         | 機能・非機能要件の定義 |
| 2     | [設計](phase-2-design.md)                                   | API・セキュリティ設計  |
| 3     | [設計レビューゲート](phase-3-design-review.md)              | 設計の妥当性検証       |
| 4     | [テスト作成（TDD: Red）](phase-4-test-creation.md)          | ユニットテスト作成     |
| 5     | [実装（TDD: Green）](phase-5-implementation.md)             | SkillAPI 実装          |
| 6     | [テスト拡充](phase-6-test-enhancement.md)                   | カバレッジ向上         |
| 7     | [テストカバレッジ確認](phase-7-coverage-check.md)           | 基準達成確認           |
| 8     | [リファクタリング（TDD: Refactor）](phase-8-refactoring.md) | コード品質改善         |
| 9     | [品質保証](phase-9-quality-assurance.md)                    | 品質ゲート検証         |
| 10    | [最終レビューゲート](phase-10-final-review.md)              | 全体品質確認           |
| 11    | [手動テスト検証](phase-11-manual-test.md)                   | 実環境動作確認         |
| 12    | [ドキュメント更新](phase-12-documentation.md)               | ドキュメント整備       |
| 13    | [PR作成](phase-13-pr-creation.md)                           | PR作成・CI確認         |

---

## 技術スタック

- **言語**: TypeScript
- **フレームワーク**: Electron (Preload Script)
- **テスト**: Vitest
- **パターン**: safeInvoke / safeOn

## 関連タスク

| タスクID | タイトル          | 関係     |
| -------- | ----------------- | -------- |
| TASK-4-1 | IPCチャネル定義   | 依存     |
| TASK-4-2 | IPCハンドラー実装 | 依存     |
| TASK-6-1 | SkillSlice実装    | ブロック |

## 参照資料

- [元タスク仕様書](../task-5-1-skill-api.md)
- [システム仕様書](../../specification.md)
- [IPC永続化パターン](/.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md)
