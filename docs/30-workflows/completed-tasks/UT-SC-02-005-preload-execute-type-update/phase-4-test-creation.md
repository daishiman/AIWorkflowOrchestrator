# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 4                                        |
| 機能名 | UT-SC-02-005-preload-execute-type-update |
| 作成日 | 2026-03-25                               |

## 目的

型変更に対応するテストケースを作成し、RED 状態を確認する。Preload API の `executePlan` 戻り値型が `RuntimeSkillCreatorExecuteResponse` であること、および Renderer 側で `terminal_handoff` レスポンス受信時の型ナロイング動作を検証するテストを TDD の Red フェーズとして作成する。

## 背景

Phase 2 の設計に基づき、Preload 層の型修正と Renderer 側の型ナロイング追加に対するテストを先行作成する。実装前にテストを書くことで、修正の意図を明確にし、回帰検出の基盤を構築する。IPC レスポンスは `{ success: true, data: T }` パターンで統一されている。

## 実行タスク

- タスク1: Preload API テストで `executePlan` の戻り値型が `RuntimeSkillCreatorExecuteResponse` であることを検証
- タスク2: Renderer テストで `terminal_handoff` レスポンス受信時の型ナロイング動作を検証

---

### タスク1: Preload API テスト作成

**目的**: `skill-creator-api.ts` の `executePlan` 戻り値型が `RuntimeSkillCreatorExecuteResponse`（Union 型）であることをテストで検証する。

**テスト対象**: `apps/desktop/src/preload/skill-creator-api.ts`

**テスト内容**:

- `executePlan` が通常の `RuntimeSkillCreatorExecuteResult` を返す場合、`skillName` プロパティにアクセスできること
- `executePlan` が `terminal_handoff` レスポンスを返す場合、`type === "terminal_handoff"` で判定できること
- 型レベルの検証として `pnpm typecheck` が PASS すること

**事前確認**:

```bash
# IPC レスポンス形式の確認（{ success: true, data: T } パターン）
grep -n "IpcResult" packages/shared/src/types/ipc.ts
grep -n "executePlan" apps/desktop/src/preload/skill-creator-api.ts
```

---

### タスク2: Renderer 型ナロイングテスト作成

**目的**: `SkillLifecyclePanel.tsx` の `handleExecutePlan` で `terminal_handoff` レスポンスを受信した場合の型ナロイング動作を検証する。

**テスト対象**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**テスト内容**:

- `terminal_handoff` レスポンス受信時に `fetchSkills` が呼ばれないこと（早期リターン）
- `terminal_handoff` レスポンス受信時に `selectSkillByName` が呼ばれないこと
- 通常の `ExecuteResult` レスポンス受信時は従来通り `fetchSkills` → `selectSkillByName` が呼ばれること

---

## テストケーステーブル

| #   | テストケース                                  | 期待結果                                 | 種別       |
| --- | --------------------------------------------- | ---------------------------------------- | ---------- |
| 1   | `executePlan` が通常の `ExecuteResult` を返す | `skillName` にアクセス可能               | ユニット   |
| 2   | `executePlan` が `terminal_handoff` を返す    | `type === "terminal_handoff"` で判定可能 | ユニット   |
| 3   | `pnpm typecheck` が PASS                      | 型エラー 0件                             | 型チェック |

## テスト実行コマンド

```bash
# テスト実行
pnpm --filter @repo/desktop exec vitest run

# 型チェック
pnpm typecheck
```

## TDD 検証: Red 状態の確認

テスト作成後、実装変更前の状態でテストを実行し、テストが失敗すること（Red 状態）を確認する。

```bash
# Red 状態の確認
pnpm --filter @repo/desktop exec vitest run --reporter=verbose 2>&1 | tail -20
```

**期待される Red 状態**:

- Preload API テスト: 型不一致による TypeScript コンパイルエラーまたはランタイムエラー
- Renderer テスト: `terminal_handoff` 型ナロイング未実装による動作不整合

## 参照資料

| 参照資料         | パス                       | 内容                    |
| ---------------- | -------------------------- | ----------------------- |
| Phase 2 設計書   | `phase-2-design.md`        | 変更内容の詳細設計      |
| Phase 1 要件     | `phase-1-requirements.md`  | 受け入れ基準 AC-1〜AC-4 |
| Phase 3 レビュー | `phase-3-design-review.md` | 設計レビュー結果        |

## 統合テスト連携【必須】

テスト作成時に統合ポイントを網羅:

| 統合ポイント               | テスト内容                                                      | ステータス |
| -------------------------- | --------------------------------------------------------------- | ---------- |
| Preload → Main IPC 通信    | `executePlan` の戻り値型が `RuntimeSkillCreatorExecuteResponse` | 未実施     |
| Renderer → Preload API呼出 | `terminal_handoff` 受信時の早期リターン動作                     | 未実施     |
| 型契約の一貫性             | `pnpm typecheck` で IPC 3層の型整合性を確認                     | 未実施     |

## 成果物

| 成果物       | パス                                        | 説明               |
| ------------ | ------------------------------------------- | ------------------ |
| テストコード | `apps/desktop/src/**/*.test.ts`             | Union 型対応テスト |
| Red 状態ログ | `outputs/phase-4/red-state-verification.md` | Red 状態の確認結果 |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| アーキテクチャ     | 適用     | `aiworkflow-requirements: architecture-*.md`           |
| API設計            | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| エラーハンドリング | 適用     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 非適用   | -                                                      |
| データ整合性       | 非適用   | -                                                      |
| パフォーマンス     | 非適用   | -                                                      |
| アクセシビリティ   | 非適用   | -                                                      |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断 | 仕様参照先                                             |
| -------------------------- | -------- | ------------------------------------------------------ |
| IPC通信                    | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| フロントエンド（Renderer） | 適用     | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | 非適用   | -                                                      |
| ローカルストレージ         | 非適用   | -                                                      |

## 完了条件

- [ ] Preload API テスト（`executePlan` 戻り値型検証）が作成されている
- [ ] Renderer テスト（`terminal_handoff` 型ナロイング動作検証）が作成されている
- [ ] テストケーステーブルの全 3件がテストコードに反映されている
- [ ] Red 状態（テスト失敗）が確認されている
- [ ] IPC レスポンス形式（`{ success: true, data: T }` パターン）が事前確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

- [ ] タスク1: Preload API テスト作成完了
- [ ] タスク2: Renderer 型ナロイングテスト作成完了
- [ ] テスト実行で Red 状態確認完了
- [ ] テストケーステーブル全件の反映確認完了

## 次Phase

Phase 5: 実装（TDD: Green）
