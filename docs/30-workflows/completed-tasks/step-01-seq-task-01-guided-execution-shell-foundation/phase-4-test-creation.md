# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 4                                              |
| Phase名    | テスト作成                                     |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 1-3                                      |
| 後続Phase  | Phase 5（実装）                                |
| ステータス | spec_created                                   |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

route、shared action、front label、no-op 排除をテスト仕様へ落とし込む。

## 実行タスク

- Renderer route テストケース作成
- CTA wiring テストケース作成
- label regression テストケース作成
- no-op / fallback 不在テスト作成

## 参照資料

| 参照資料  | パス                                                      | 内容                |
| --------- | --------------------------------------------------------- | ------------------- |
| Phase 3   | `phase-3-design-review.md`                                | gate 条件           |
| Phase 2   | `phase-2-design.md`                                       | route / action 契約 |
| ChatPanel | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx` | handler 現状        |
| App       | `apps/desktop/src/renderer/App.tsx`                       | render view 現状    |

## 実行手順

### ステップ1: route case を作る

`setCurrentView("terminal")` 相当の後継 route が正しく動くケースを定義する。

### ステップ2: CTA case を作る

Chat / Workspace / Skill Creator のボタンが同じ action に収束するケースを定義する。

### ステップ3: negative case を作る

`agent` 代替や no-op を許容しない失敗ケースを定義する。

## 統合テスト連携

route 遷移、CTA click、label rendering を integration suite に入れる。

## 成果物

| 成果物           | パス                               | 説明                             |
| ---------------- | ---------------------------------- | -------------------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md`   | テストケース一覧                 |
| mock 戦略        | `outputs/phase-4/mock-strategy.md` | route / store / action mock 方針 |

## 完了条件

- [ ] happy path と negative path が両方定義されている
- [ ] 4 surface すべての CTA がテスト対象に含まれている
- [ ] no-op / fallback の禁止ケースがある
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md)
