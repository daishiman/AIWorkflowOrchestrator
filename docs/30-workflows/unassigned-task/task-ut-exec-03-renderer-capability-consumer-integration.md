# UT-EXEC-03 - Renderer capability selector/hook の Consumer 統合

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | UT-EXEC-03                                         |
| タスク名   | Renderer capability selector/hook の Consumer 統合 |
| 分類       | 未タスク（unassigned）                             |
| 出典       | Phase 2 Concern B/C                                |
| 優先度     | medium                                             |
| 担当       | Task03/Task04 スコープ                             |
| ステータス | 未着手                                             |
| 作成日     | 2026-03-20                                         |

## 目的

`resolveUiState()` / `resolveCtaContract()` を呼び出す selector/hook を実装し、Settings / Chat / Workspace の各 surface に接続することで、contract-matrix 準拠の CTA（Call to Action）表示を実現する。

Phase 2 設計審議にて Concern B（UI state 解決層の欠如）および Concern C（CTA contract の未接続）として識別された実装不足。現在は各 surface コンポーネントが capability を直接参照せず、表示ロジックがコンポーネント内でアドホックに実装されている。contract-matrix で定義された CTA の表示規則が enforcement されていない状態である。

UT-EXEC-02（RuntimePolicyResolver 4 状態化）が完了していることを前提とする。

## 実施内容

1. `resolveUiState(capability: AccessCapability): UiState` selector を実装する
2. `resolveCtaContract(capability: AccessCapability, surface: Surface): CtaContract` selector を実装する
3. Zustand store または React hook として上記 selector を公開する（P31/P48 準拠）
4. Settings surface を capability / uiState ベースの表示に切り替える
5. Chat surface を capability / uiState ベースの表示に切り替える
6. Workspace surface を capability / uiState ベースの表示に切り替える
7. contract-matrix に定義された全 CTA パターンをカバーするユニットテストを追加する

## 完了条件

- [ ] `resolveUiState()` selector が実装され、テストが PASS すること
- [ ] `resolveCtaContract()` selector が実装され、contract-matrix の全パターンをカバーするテストが PASS すること
- [ ] Settings / Chat / Workspace の各コンポーネントが capability / uiState を正しく参照していること
- [ ] 各 surface で contract-matrix 準拠の CTA が表示されること
- [ ] P31 / P48 準拠の selector 設計（useShallow 適用、合成 Hook 無限ループ回避）になっていること
- [ ] `pnpm typecheck` が通ること
- [ ] 既存テストが全 PASS すること

## 関連タスク

- 親タスク: TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001
- 前提タスク: UT-EXEC-02（RuntimePolicyResolver.ts の 4 状態化）
- 関連仕様: `docs/30-workflows/ai-runtime-execution-responsibility-realignment/`
- 関連ファイル: `packages/shared/src/types/execution-capability.ts`
- 関連ルール: `.claude/rules/03-state-management.md`（P31/P48 対策）
