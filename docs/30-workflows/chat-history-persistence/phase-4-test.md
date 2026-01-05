# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 4                      |
| Phase名    | テスト作成             |
| 前提Phase  | Phase 3                |
| 後続Phase  | Phase 5                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-04             |
| 機能名     | チャット履歴永続化機能 |

---

## 目的

TDDのRed状態を達成する。設計に基づいて失敗するテストを先に作成し、実装の仕様を明確化する。

## 背景

テスト駆動開発（TDD）のRed-Green-Refactorサイクルの最初のステップ。テストを先に書くことで、実装の目標が明確になる。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: tdd-red-green-refactor

**パス**: `.claude/skills/tdd-red-green-refactor/SKILL.md`

**Trigger条件**:
テスト駆動開発サイクルの開始

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. Red状態（失敗するテスト作成）のセクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 失敗するユニットテスト
- 失敗する統合テスト

---

### スキル2: test-doubles

**パス**: `.claude/skills/test-doubles/SKILL.md`

**Trigger条件**:
テストダブル（モック、スタブ）の選定・実装が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- Repositoryモック
- 外部依存のスタブ

---

### スキル3: frontend-testing

**パス**: `.claude/skills/frontend-testing/SKILL.md`

**Trigger条件**:
フロントエンドコンポーネントのテスト設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- Reactコンポーネントテスト（RTL）
- UIインタラクションテスト

---

## 参照資料

| 参照資料      | パス                                                          | 内容         |
| ------------- | ------------------------------------------------------------- | ------------ |
| Phase 2成果物 | `docs/30-workflows/chat-history-persistence/outputs/phase-2/` | 設計成果物   |
| Phase 3成果物 | `docs/30-workflows/chat-history-persistence/outputs/phase-3/` | レビュー結果 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                                    | 内容       |
| ---------- | ----------------------------------------------------------------------- | ---------- |
| テスト方針 | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md` | テスト戦略 |

---

## 成果物

| 成果物                        | パス                                                                        | 内容                   |
| ----------------------------- | --------------------------------------------------------------------------- | ---------------------- |
| ChatHistoryRepository.test.ts | `packages/shared/src/__tests__/repositories/`                               | Repository層テスト     |
| ChatHistoryService.test.ts    | `packages/shared/src/__tests__/services/`                                   | Service層テスト        |
| ChatHistoryList.test.tsx      | `apps/desktop/src/__tests__/components/`                                    | UIコンポーネントテスト |
| テスト設計書                  | `docs/30-workflows/chat-history-persistence/outputs/phase-4/test-design.md` | テスト設計             |

---

## 完了条件

- [ ] Repository層のテストが作成されている（全テスト失敗）
- [ ] Service層のテストが作成されている（全テスト失敗）
- [ ] UIコンポーネントのテストが作成されている（全テスト失敗）
- [ ] テストダブルが適切に設計されている
- [ ] テスト実行時に全テストが失敗する（Red状態）

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-red-green-refactor: {{result}}
- test-doubles: {{result}}
- frontend-testing: {{result}}

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

`docs/30-workflows/chat-history-persistence/phase-5-implementation.md`
