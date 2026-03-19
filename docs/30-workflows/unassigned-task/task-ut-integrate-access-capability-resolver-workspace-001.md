# AccessCapabilityResolver を WorkspaceChatPanel に統合

## メタ情報

```yaml
issue_number: 1359
```

## メタ情報

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | UT-INTEGRATE-ACCESS-CAPABILITY-RESOLVER-WORKSPACE-001                   |
| タスク名     | AccessCapabilityResolver を WorkspaceChatPanel に統合                   |
| 分類         | 実装                                                                    |
| 対象機能     | WorkspaceView / WorkspaceChatPanel / isModelBlocked 判定                |
| 優先度       | High                                                                    |
| 見積もり規模 | 中規模                                                                  |
| ステータス   | 未実施                                                                  |
| 依存タスク   | Task01（AccessCapabilityResolver 実装完了）                             |
| 発見元       | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 Phase 10 (MINOR-03, FR-10) |
| 発見日       | 2026-03-18                                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`WorkspaceChatPanel` では現在 `selectedModelId === null` という単純なローカル判定で `isModelBlocked` フラグを決定している。これは暫定実装であり、TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 Phase 10 MINOR-03 にて指摘された。`AccessCapabilityResolver` 実装完了後は、この判定をリゾルバー経由に切り替える必要がある。

### 1.2 問題点・課題

- `selectedModelId === null` のローカル判定では、AccessMode・AuthMode・providerStatus などの複合条件を考慮できない
- `GuidanceBlock` の表示条件が AccessCapability と連動しておらず、正確なブロック理由を伝えられない
- 既存テスト 38件の期待値が暫定ロジックに基づいているため、リゾルバー移行後に更新が必要

### 1.3 放置した場合の影響

| 影響領域   | 影響                                                             |
| ---------- | ---------------------------------------------------------------- |
| 機能正確性 | モデルが利用可能にもかかわらずブロック表示される誤検知が発生する |
| UX         | GuidanceBlock に不正確なブロック理由が表示される                 |
| テスト品質 | 暫定ロジックに基づいたテストが本来の動作を保証しない             |

---

## 2. 何を達成するか（What）

### 2.1 目的

`WorkspaceChatPanel` の `isModelBlocked` 判定を `AccessCapabilityResolver.resolve()` 経由に変更し、複合条件（AccessMode・AuthMode・providerStatus）に基づいた正確なブロック判定を実現する。

### 2.2 最終ゴール

- `isModelBlocked` が `AccessCapabilityResolver` 経由で判定されること
- `selectedModelId === null` のローカル判定が削除されていること
- `GuidanceBlock` の variant が AccessCapability に連動すること
- 既存テスト 38件の期待値が AccessCapability ベースに更新されていること

### 2.3 スコープ

**含むもの:**

- `WorkspaceChatPanel.tsx` および `useWorkspaceChatController.ts` の `isModelBlocked` 判定ロジック変更
- Store 経由での `AccessCapabilityResolver.resolve()` 結果取得
- `GuidanceBlock` の表示条件を AccessCapability に連動させる変更
- 既存テスト 38件の期待値更新

**含まないもの:**

- `AccessCapabilityResolver` 自体の実装（Task01 のスコープ）
- AccessCapability の新規 variant 追加
- 他のビューへの AccessCapabilityResolver 統合

### 2.4 成果物

| 種別   | 成果物                                    | 配置先                                                     |
| ------ | ----------------------------------------- | ---------------------------------------------------------- |
| 実装   | 更新済み `WorkspaceChatPanel.tsx`         | `apps/desktop/src/renderer/views/WorkspaceView/`           |
| 実装   | 更新済み `useWorkspaceChatController.ts`  | `apps/desktop/src/renderer/views/WorkspaceView/hooks/`     |
| テスト | 期待値更新済みテストファイル（既存 38件） | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Task01（`AccessCapabilityResolver` 実装）が完了していること
- `AccessCapabilityResolver.resolve()` の結果が Store に格納されていること
- vitest 実行環境が利用可能であること（esbuild アーキテクチャ一致環境）

### 3.2 依存タスク

| タスクID                                       | 関係性                                | ステータス |
| ---------------------------------------------- | ------------------------------------- | ---------- |
| Task01（AccessCapabilityResolver 実装）        | **ブロッカー**（先行して完了必須）    | 未実施     |
| TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001   | 親タスク                              | 完了       |
| UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001 | 先行推奨（Hook 分離後の方が変更容易） | 未実施     |

### 3.3 変更内容

1. `AccessCapabilityResolver.resolve()` の結果を Store 経由で取得
2. `isModelBlocked` の判定ロジックを `selectedModelId === null` から AccessCapability ベースに変更
3. `GuidanceBlock` の表示条件を AccessCapability に連動させる

### 3.4 推奨アプローチ

1. Task01 が完了した後、`AccessCapabilityResolver` の公開インターフェースと Store キーを確認する
2. `useWorkspaceChatController.ts` の `isModelBlocked` 算出箇所を特定し、リゾルバー結果に切り替える
3. `WorkspaceChatPanel.tsx` の `GuidanceBlock` 表示条件を更新する
4. 既存テスト 38件の期待値を AccessCapability ベースで更新する

---

## 4. 実行手順

### Phase 構成

| Phase | 名称                           | 内容                                                    |
| ----- | ------------------------------ | ------------------------------------------------------- |
| 1-3   | 要件・設計・レビュー           | AccessCapabilityResolver インターフェース確認・統合設計 |
| 4     | テスト作成                     | AccessCapability ベースの期待値設計                     |
| 5     | 実装                           | isModelBlocked 判定ロジック変更・既存テスト期待値更新   |
| 6-7   | テスト拡充・カバレッジ         | AccessCapability の各 variant テスト追加                |
| 8-10  | リファクタリング〜最終レビュー | コード品質検証                                          |
| 11-13 | 手動テスト〜完了               | 動作確認・ドキュメント更新・PR                          |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `isModelBlocked` が `AccessCapabilityResolver` 経由で判定されること
- [ ] `selectedModelId === null` のローカル判定が削除されていること
- [ ] `GuidanceBlock` の variant が AccessCapability に連動すること

### 品質要件

- [ ] 既存テスト 38件の期待値が AccessCapability ベースに更新されていること
- [ ] 全テストが PASS すること
- [ ] TypeScript 型エラーが 0件
- [ ] ESLint エラーが 0件

---

## 6. 検証方法

### 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/views/WorkspaceView
```

### 検証手順

1. 全テスト（既存 38件 + 新規追加分）が PASS すること
2. `selectedModelId === null` のローカル判定が `grep -n "selectedModelId === null"` で検出されないこと
3. 手動で AccessMode を切り替えて `GuidanceBlock` の variant が連動することを確認

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                                                                           |
| ----------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------- |
| Task01 の完了遅延によるブロック           | 高     | 中       | Task01 完了まで着手しない（依存関係を厳守する）                                                |
| 既存テスト 38件の期待値更新が大規模になる | 中     | 高       | UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001 完了後に着手し、Hook 分離でテスト容易性を高める |
| P62 DEFAULT_CONFIG への暗黙 fallback      | 中     | 低       | AccessCapability が未設定の場合はエラー表示に倒し、fallback しない                             |

---

## 8. 参照情報

### 関連ドキュメント

| 参照資料                         | パス                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| WorkspaceChatPanel 仕様書        | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-panel.md`                                       |
| AccessCapabilityResolver 仕様書  | `.claude/skills/aiworkflow-requirements/references/` 配下（Task01 完了後に確認）                                      |
| P62 DEFAULT_CONFIG fallback 禁止 | `.claude/rules/06-known-pitfalls.md#P62`                                                                              |
| 親タスク成果物                   | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment/` |

---

## 10. 実装時の苦戦箇所と教訓（親タスクからの知見）

> 以下は親タスク（TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001）の Phase 5-10 実行時に得られた教訓。同様の課題を回避するために参照すること。

### 10.1 P62 DEFAULT_CONFIG fallback 禁止の三層防御パターン

- **問題**: 既存コードに `selectedModelId ?? "gpt-4o"` という暗黙の fallback が1箇所存在していた
- **影響**: ユーザーが意図しない AI モデルでリクエストが送信される。本番環境と開発環境で動作が異なる。意図しない課金リスク
- **対策**: AccessCapabilityResolver 統合時も三層防御を維持する:
  1. **UI層**: `canSend` 条件に `accessCapability !== 'blocked'` を含める
  2. **Controller層**: `sendMessage` 内で `accessCapability` を検証し、`blocked` の場合は送信しない
  3. **Main Process層**: `handleStreamChat` の modelId P42 3段バリデーションを維持する
- **参照**: `.claude/rules/06-known-pitfalls.md#P62`, 親タスク Phase 10 FR-07

### 10.2 P50 既実装防御の発見と「検証・補完」モード

- **問題**: Phase 1 で `selectedModelId === null` の暫定ガードが既に実装済みであることが判明した
- **影響**: Phase 4-5 を「新規実装」前提で進めると、既存実装との重複や不整合が発生する
- **対策**: Phase 1 開始時に `git log` と現行コードを確認し、既実装箇所を特定する。AccessCapabilityResolver 統合時は既存の暫定ガードを **置換** する形で進める（追加ではなく置換）
- **参照**: `.claude/rules/06-known-pitfalls.md#P50`

### 10.3 38件のテスト期待値更新の大規模修正

- **問題**: `isModelBlocked` の判定ロジックを変更すると、既存テスト38件の mock 設定と期待値が全て影響を受ける
- **影響**: 一括修正時にテスト間の依存関係や mock のリセット漏れが発生しやすい（P9, P21）
- **対策**:
  1. 変更前に `pnpm --filter @repo/desktop exec vitest run src/renderer/views/WorkspaceView/hooks` で baseline を取得する
  2. テスト修正は1ファイルずつ行い、都度 PASS を確認する
  3. `beforeEach` で `mockAccessCapability` をリセットし、テスト間で状態を共有しない
  4. UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001 が先に完了していれば、Hook 分離でテスト容易性が大幅に向上する
- **参照**: `.claude/rules/06-known-pitfalls.md#P9`, `.claude/rules/06-known-pitfalls.md#P21`

### 10.4 design-audit-matrix の local 判定禁止方針

- **問題**: `design-audit-matrix.md` で「access capability の local 判定禁止」が明記されている。`selectedModelId === null` は local 判定そのもの
- **影響**: 仕様違反の暫定実装が残ると、他のビュー（SettingsView, AgentView）で同パターンが模倣されるリスクがある
- **対策**: AccessCapabilityResolver 統合時に `selectedModelId === null` の local 判定を **完全削除** し、`grep -rn "selectedModelId === null" apps/desktop/src/renderer/` で残存箇所がないことを確認する
- **参照**: `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`

---

## 11. システム仕様書参照（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                 | パス                                                                            | 確認内容                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | IPC 契約のインデックス。AccessCapability と llm:stream-chat の関係を確認する                 |
| llm-ipc-types            | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`            | AIChatRequest / StreamChatRequest 実型定義を確認する                                         |
| error-handling           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | AccessCapability=blocked 時の error policy（blocked 分類）を確認する                         |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | GuidanceBlock の variant（guidance / blocked / handoff）と AccessCapability の連動を確認する |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | AccessCapability の Store 配置（Zustand Store 新規 slice）を確認する                         |
| security-electron-ipc    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | AccessCapabilityResolver の結果が Main Process から安全に渡されることを確認する              |

### AccessCapabilityResolver 統合時の仕様整合チェックリスト

- [ ] `isModelBlocked` が `AccessCapabilityResolver.resolve()` の結果に基づいて判定される
- [ ] `selectedModelId === null` のローカル判定が **完全削除** されている
- [ ] `GuidanceBlock` の variant が AccessCapability の結果に連動する（`blocked` -> blocked variant, `guidance-only` -> guidance variant）
- [ ] P62 三層防御（UI / Controller / Main）が AccessCapability ベースでも維持される
- [ ] AccessCapability の Store 配置が `arch-state-management.md` の基準に準拠する
- [ ] `design-audit-matrix.md` の local 判定禁止方針に違反しない
- [ ] 既存テスト38件の期待値が AccessCapability ベースに更新されている
- [ ] `error-handling.md` の blocked 分類に準拠した GuidanceBlock メッセージが表示される

---

## 12. 備考

### 関連タスク

| タスクID                                       | 関係性                                                  |
| ---------------------------------------------- | ------------------------------------------------------- |
| UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001 | 先行推奨（Hook 分離後の方が isModelBlocked 変更が容易） |
| UT-INTEGRATE-COMPACT-LAYOUT-WORKSPACE-CHAT-001 | 独立して実施可能                                        |

### 補足事項

- Task01（AccessCapabilityResolver 実装）が完了するまで着手しないこと
- `UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001` の完了後に着手すると、Hook 分離により `isModelBlocked` の変更箇所が明確になり実装しやすくなる
