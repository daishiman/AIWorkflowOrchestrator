# Phase 9: 品質検証

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| 機能名   | terminal-handoff-adapter-placement        |
| Phase    | 9 - 品質検証                              |
| 作成日   | 2026-03-22                                |
| 前Phase  | Phase 8（リファクタリング）               |
| 次Phase  | Phase 10（最終レビュー）                  |
| タスクID | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 |

## 目的

Lint・型チェック・全テスト実行の 3 つの品質ゲートを通過させ、Phase 8 までの成果物がプロジェクトの品質基準を満たしていることを検証する。

## 前提条件

- Phase 8 のリファクタリングが完了済み
- 既存テストが全 PASS している状態
- 本タスクは UI 変更を伴わない（HandoffBlock.tsx の型 import のみ変更）

## 品質ゲート

### Gate 1: Lint チェック

### Gate 2: 型チェック

### Gate 3: テスト実行

### Gate 4: IPC 契約ドリフト検証（該当する場合）

## 実行手順

### Task 1: Lint チェック

1. プロジェクト全体の Lint を実行:

```bash
pnpm lint
```

2. adapters/handoff/ 関連ファイルに Lint エラーがないことを確認

3. 確認項目:
   - [ ] ESLint エラーが 0 件
   - [ ] ESLint ワーニングを確認（許容可能なものか判断）
   - [ ] `no-unused-vars` 違反がない
   - [ ] `@typescript-eslint/no-explicit-any` 違反がない
   - [ ] import 順序が規約に従っている

### Task 2: 型チェック

1. プロジェクト全体の TypeScript 型チェックを実行:

```bash
pnpm typecheck
```

2. 確認項目:
   - [ ] TypeScript コンパイルエラーが 0 件
   - [ ] `any` 型の使用がない（`strict: true` 準拠）
   - [ ] `@ts-ignore` / `@ts-expect-error` の使用がない
   - [ ] 型アサーション（`as`）による安全性バイパスがない（P19/P48 準拠）

3. import サイクル検証:

```bash
cd apps/desktop && grep -rn "from.*adapters/handoff" src/main/ | grep -v __tests__ | grep -v node_modules
cd apps/desktop && grep -rn "from.*runtime/TerminalHandoffBuilder" src/main/adapters/ | grep -v __tests__
```

- [ ] adapters/handoff → runtime/TerminalHandoffBuilder への循環参照がない
- [ ] HandoffBlock.tsx の型 import が型のみの import（`import type`）であること

### Task 3: テスト実行

1. adapters/handoff/ のテストを実行:

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts
```

2. TerminalHandoffBuilder 関連テストを実行（既存テストの影響確認）:

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose 2>&1 | grep -i "handoff"
```

3. desktop パッケージ全体のテストを実行:

```bash
cd apps/desktop && pnpm vitest run
```

4. 確認項目:
   - [ ] toHandoffGuidance テストが全 PASS
   - [ ] TerminalHandoffBuilder 関連テストが全 PASS
   - [ ] desktop パッケージ全体のテストが全 PASS
   - [ ] テスト間の状態リークがない（P9 準拠）
   - [ ] タイマーテストの無限ループがない（P13 準拠）

### Task 4: IPC 契約ドリフト検証

本タスクは adapters 層の追加であり、IPC ハンドラの変更は伴わないが、将来の IPC 統合に備えて以下を確認する:

1. HandoffGuidance 型が IPC 経由で送受信される場合の structured clone 互換性:

```bash
grep -rn "HandoffGuidance" apps/desktop/src/preload/ apps/desktop/src/main/handlers/
```

2. 確認項目:
   - [ ] HandoffGuidance 型に関数プロパティが含まれていない（structured clone 制約）
   - [ ] HandoffGuidance 型に Symbol プロパティが含まれていない
   - [ ] 既存の IPC チャンネルに影響を与えていない

### Task 5: 統合テスト連携確認

1. adapters/handoff/ と runtime/TerminalHandoffBuilder の統合テスト:

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose 2>&1 | grep -E "(handoff|adapter)" -i
```

2. 確認項目:
   - [ ] adapters 層のテストと runtime 層のテストが独立して PASS
   - [ ] 共有型（HandoffGuidance 等）の変更が両テストスイートで正しく反映されている
   - [ ] barrel export（index.ts）経由のインポートが正常に動作

## 品質レポート

測定結果を `outputs/phase-9/quality-report.md` に記録する:

```markdown
# 品質検証レポート

## 検証日時

YYYY-MM-DD HH:MM

## Gate 1: Lint チェック

- 結果: PASS / FAIL
- エラー数: 0
- ワーニング数: 0
- 詳細: （該当する場合）

## Gate 2: 型チェック

- 結果: PASS / FAIL
- エラー数: 0
- import サイクル: なし / あり（詳細）
- 詳細: （該当する場合）

## Gate 3: テスト実行

- 結果: PASS / FAIL
- toHandoffGuidance テスト: X/X PASS
- TerminalHandoffBuilder テスト: X/X PASS
- desktop 全体テスト: X/X PASS
- 詳細: （該当する場合）

## Gate 4: IPC 契約ドリフト検証

- 結果: PASS / N/A
- 詳細: （該当する場合）

## 総合判定

PASS / FAIL（差し戻し先Phase: ）
```

## 判定フロー

```
Gate 1: Lint → FAIL → 修正して再実行
  ↓ PASS
Gate 2: 型チェック → FAIL → 修正して再実行
  ↓ PASS
Gate 3: テスト → FAIL → Phase 5 or 8 に差し戻し
  ↓ PASS
Gate 4: IPC 契約 → FAIL → 修正して再実行
  ↓ PASS
Phase 10 へ
```

## 成果物

| 成果物       | パス                                |
| ------------ | ----------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                               | 仕様参照先                                          |
| -------------- | -------------------------------------- | --------------------------------------------------- |
| アーキテクチャ | 品質検証対象が正しい層に配置されている | `aiworkflow-requirements: architecture-overview.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                           | 仕様参照先                                          |
| -------------------- | ---------------------------------- | --------------------------------------------------- |
| バックエンド（Main） | adapter 品質検証は Main Process 層 | `aiworkflow-requirements: architecture-overview.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. Lint実行
3. TypeCheck実行
4. テスト実行
5. IPC契約検証
6. 品質レポート作成
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/terminal-handoff-adapter-placement --phase 9
```

## 完了条件

- [ ] `pnpm lint` が PASS した（エラー 0 件）
- [ ] `pnpm typecheck` が PASS した（エラー 0 件）
- [ ] import サイクルがないことを確認した
- [ ] HandoffBlock.tsx の型 import が `import type` であることを確認した
- [ ] toHandoffGuidance テストが全 PASS した
- [ ] TerminalHandoffBuilder 関連テストが全 PASS した（影響なし確認）
- [ ] desktop パッケージ全体のテストが全 PASS した
- [ ] IPC 契約ドリフト検証を実施した（該当する場合）
- [ ] 統合テスト連携確認が全項目 PASS した
- [ ] 品質レポートが `outputs/phase-9/quality-report.md` に記録された
- [ ] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 10: 最終レビュー（`phase-10-final-review.md`）
