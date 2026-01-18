# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| Phase名    | 要件定義                               |
| 前提Phase  | -                                      |
| 後続Phase  | Phase 2                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-17                             |
| 機能名     | skill-ipc-handlers-registration-bugfix |

---

## 目的

Agent画面の無限ローディング問題を分析し、バグの根本原因を特定する。
修正に必要な受け入れ基準を定義し、Phase 2以降の設計・実装の基盤を確立する。

## 背景

Agent画面を開くと無限ローディング状態になり、スキル一覧が表示されない問題が報告されている。
初期分析では以下の原因候補が特定されている:

1. preloadのskillAPIで配列を直接渡しているが、ハンドラー側はオブジェクト形式を期待
2. `registerSkillHandlers` が `registerAllIpcHandlers` から呼び出されていない可能性
3. ビルド未反映の可能性

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: バグ再現手順の確立

**目的**: 問題を確実に再現できる手順を確立する

**実行手順**:

1. Electronアプリをビルドして起動する: `pnpm --filter @repo/desktop build && pnpm --filter @repo/desktop start`
2. Agent画面に遷移する
3. 無限ローディング状態を確認する
4. 開発者ツール（DevTools）のコンソールでエラーを確認する
5. ネットワークタブでIPCリクエストの状態を確認する

**期待される成果物**:

- `outputs/phase-1/bug-reproduction-steps.md`: 再現手順ドキュメント

---

### タスク2: 原因候補の検証

**目的**: 3つの原因候補を検証し、真の原因を特定する

**実行手順**:

1. `apps/desktop/src/renderer/preload/index.ts` を確認し、skillAPI の引数形式を確認
2. `apps/desktop/src/main/ipc/skillHandlers.ts` を確認し、期待される引数形式を確認
3. `apps/desktop/src/main/ipc/index.ts` で `registerSkillHandlers` の呼び出しを確認
4. 各原因候補の検証結果を記録する

**確認すべきコード箇所**:

| ファイル                                     | 確認項目                                   |
| -------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/renderer/preload/index.ts` | `import`, `remove`, `getDetail` の引数形式 |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | ハンドラーが期待する引数形式               |
| `apps/desktop/src/main/ipc/index.ts`         | `registerSkillHandlers` の呼び出し有無     |

**期待される成果物**:

- `outputs/phase-1/root-cause-analysis.md`: 原因分析レポート

---

### タスク3: 受け入れ基準の定義

**目的**: バグ修正完了の基準を明確に定義する

**実行手順**:

1. 機能要件（正常動作）を定義する
2. 非機能要件（パフォーマンス、エラーハンドリング）を定義する
3. テスト要件を定義する
4. 受け入れ基準を文書化する

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`: 受け入れ基準ドキュメント

---

## 参照資料

| 参照資料               | パス                                                                               | 内容                      |
| ---------------------- | ---------------------------------------------------------------------------------- | ------------------------- |
| 元のバグ報告書         | `docs/30-workflows/unassigned-task/task-skill-ipc-handlers-registration-bugfix.md` | 問題の症状と原因候補      |
| IPC Handler Pattern    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`       | IPCハンドラー登録パターン |
| スキル管理サービス仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`       | SkillService設計          |

---

## 成果物

| 成果物           | パス                                        | 内容               |
| ---------------- | ------------------------------------------- | ------------------ |
| バグ再現手順     | `outputs/phase-1/bug-reproduction-steps.md` | 確実な再現手順     |
| 原因分析レポート | `outputs/phase-1/root-cause-analysis.md`    | 根本原因の特定結果 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`    | 修正完了の判定基準 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 1の統合テスト連携アクション**:

- IPC通信要件を要件に明記
- preload ⇔ mainプロセス間の引数形式要件を定義
- エラーハンドリング要件を定義

---

## 完了条件

- [ ] バグが確実に再現できる手順が確立されている
- [ ] 3つの原因候補がすべて検証されている
- [ ] 真の根本原因が特定されている
- [ ] 受け入れ基準が明確に定義されている
- [ ] 全成果物が `outputs/phase-1/` に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-ipc-handlers-registration-bugfix/phase-2-design.md`
