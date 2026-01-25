# TASK-3-1-C: PermissionRequest Hook 統合 - メインタスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| タスクID   | TASK-3-1-C                                                  |
| タイトル   | PermissionRequest Hook 統合                                 |
| フェーズ   | 3                                                           |
| 優先度     | high                                                        |
| 複雑度     | medium                                                      |
| 依存タスク | TASK-3-1-B, TASK-3-2                                        |
| 並列タスク | なし                                                        |
| ブロック   | TASK-4-2                                                    |
| タグ       | backend, main-process, service, sdk-integration, permission |
| ステータス | pending                                                     |
| 作成日     | 2026-01-25                                                  |

---

## 概要

Claude Agent SDK の PermissionRequest Hook を使用して、ユーザー権限確認フローを実装する。
Renderer Process への権限リクエスト送信と、ユーザー応答の待機・処理を含む。

---

## 目的

- ツール実行時にユーザーからの承認が必要な場合、Renderer に権限確認リクエストを送信
- ユーザーの承認/拒否に応じて実行を継続または停止
- タイムアウトやキャンセル処理の適切なハンドリング
- 機密情報のサニタイズにより安全な情報表示を実現

---

## 入力

| 入力元     | 内容                                                |
| ---------- | --------------------------------------------------- |
| TASK-3-1-B | PreToolUse/PostToolUse Hooks 実装済み SkillExecutor |
| TASK-3-2   | PermissionResolver クラス                           |

---

## 出力

| 成果物              | パス                                                    |
| ------------------- | ------------------------------------------------------- |
| SkillExecutor 修正  | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |
| IPCチャネル定義追加 | `packages/shared/src/ipc/channels.ts`                   |

---

## システム仕様参照（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                            | 内容                         |
| -------------------------- | ------------------------------------------------------------------------------- | ---------------------------- |
| Agent SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`     | PermissionRequest型、IPC定義 |
| セキュリティパターン定義   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | 引数サニタイズ・セキュリティ |

---

## Phase一覧

| Phase | 名称                 | ファイル                            |
| ----- | -------------------- | ----------------------------------- |
| 1     | 要件定義             | `phase-01-requirements.md`          |
| 2     | 設計                 | `phase-02-design.md`                |
| 3     | 設計レビューゲート   | `phase-03-design-review.md`         |
| 4     | テスト作成           | `phase-04-test-creation.md`         |
| 5     | 実装                 | `phase-05-implementation.md`        |
| 6     | テスト拡充           | `phase-06-test-expansion.md`        |
| 7     | テストカバレッジ確認 | `phase-07-coverage-verification.md` |
| 8     | リファクタリング     | `phase-08-refactoring.md`           |
| 9     | 品質保証             | `phase-09-quality-assurance.md`     |
| 10    | 最終レビューゲート   | `phase-10-final-review.md`          |
| 11    | 手動テスト検証       | `phase-11-manual-testing.md`        |
| 12    | ドキュメント更新     | `phase-12-documentation.md`         |
| 13    | PR作成               | `phase-13-pr-creation.md`           |

---

## 依存関係グラフ

```
TASK-3-1-B (Hooks実装)     TASK-3-2 (PermissionResolver)
         \                        /
          \                      /
           v                    v
         TASK-3-1-C (本タスク)
                  |
                  v
            TASK-4-2 (IPC Handlers)
```

---

## 完了条件

- [ ] PermissionRequest Hook が実装されている
- [ ] 権限リクエストが Renderer に送信される
- [ ] ユーザー応答を待機できる
- [ ] 承認時に実行が続行される
- [ ] 拒否時に実行が停止される
- [ ] タイムアウト処理が機能する
- [ ] 機密情報がサニタイズされる
- [ ] 全テストが通過する
- [ ] コードレビューが完了している

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
