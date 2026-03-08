# Store統合テストパターン全コンポーネント展開 - タスク指示書

## メタ情報

```yaml
issue_number: 1060
```

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-IMP-STORE-INTEGRATION-TEST-ROLLOUT-001                    |
| タスク名     | Store統合テストパターン全コンポーネント展開                  |
| 分類         | 改善                                                         |
| 対象機能     | テスト基盤（Renderer層のStore統合テスト）                    |
| 優先度       | 低                                                           |
| 見積もり規模 | 中規模（4-8時間）                                            |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-10A-F / TASK-UI-03（Store統合テスト分離パターンの確立） |
| 発見日       | 2026-03-08                                                   |
| 依存         | UT-IMP-HOOK-STORE-IPC-SEPARATION-GUARD-001                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-F および TASK-UI-03 で SkillAnalysisView と SkillCreateWizard に対して Store統合テスト（`.store-integration.test.tsx`）パターンを確立した。このパターンにより、UIテストとStore操作テストを分離し、テスト失敗時の原因特定を容易にする設計が実現された。しかし、他のStore依存コンポーネントにはまだこのパターンが適用されていない。

### 1.2 問題点・課題

- AgentView, SettingsView, LLMSelectorPanel 等がStore直結のhookを使用しているが、Store統合テストが存在しない
- UIテスト内でStore操作のテストが混在しており、テスト失敗時の原因特定が困難
- P31回帰テスト（`.p31-regression.test.ts`）が agentSlice にのみ存在し、他のSlice（navigationSlice, settingsSlice 等）には未適用
- セレクタの参照安定性テスト（`.selectors.test.ts`）も一部Sliceにしか存在しない

### 1.3 放置した場合の影響

- P31（無限ループ）やP48（useShallow未適用）のリグレッションリスクが、テスト未適用のSlice/コンポーネントで検出されない
- UIテストとStore操作テストの混在により、テスト保守コストが増加
- 新規コンポーネント追加時にテスト設計の指針が不明確なまま残る

---

## 2. 何を達成するか（What）

### 2.1 目的

確立済みのStore統合テストパターンを全Store依存コンポーネントに展開し、P31/P48リグレッション防止の網を広げる。

### 2.2 最終ゴール

- 全Store依存コンポーネントに `.store-integration.test.tsx` が存在する
- agentSlice 以外のSliceにも `.p31-regression.test.ts` が存在する
- テスト実行コマンドとカバレッジ基準が文書化されている

### 2.3 スコープ

#### 含むもの

- Store依存コンポーネントの一覧作成と優先度付け
- 高優先度コンポーネントへの `.store-integration.test.tsx` 新設
- agentSlice 以外のSliceへの `.p31-regression.test.ts` 新設
- 各Sliceへの `.selectors.test.ts` 新設（未存在の場合）
- テスト実行コマンドとカバレッジ基準の文書化

#### 含まないもの

- 既存UIテストの書き換え（Store操作テストの「移動」ではなく「追加」）
- コンポーネントの実装変更
- 新規セレクタの追加

### 2.4 成果物

- Store依存コンポーネント一覧ドキュメント
- 各コンポーネントの `.store-integration.test.tsx`
- 各Sliceの `.p31-regression.test.ts`
- 各Sliceの `.selectors.test.ts`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-10A-F が完了していること（完了済み: 2026-03-07）
- UT-IMP-HOOK-STORE-IPC-SEPARATION-GUARD-001 が完了していること

### 3.2 依存タスク

| タスクID                                   | 内容                             | ステータス |
| ------------------------------------------ | -------------------------------- | ---------- |
| TASK-10A-F                                 | スキルライフサイクルUI Store移行 | 完了       |
| UT-IMP-HOOK-STORE-IPC-SEPARATION-GUARD-001 | Hook/Store/IPC分離ガード         | 未実施     |

### 3.3 必要な知識

- Zustand Store Slice設計（agentSlice, navigationSlice, settingsSlice の構造）
- P31/P48 対策パターン（個別セレクタ、useShallow）
- Store統合テスト分離パターン（`.store-integration.test.tsx` の設計思想）
- `@testing-library/react` の `renderHook` API

### 3.4 推奨アプローチ

1. `grep -rn "useAppStore\|use.*Store" apps/desktop/src/renderer/components/ --include="*.tsx" | grep -v test | grep -v __tests__` で対象コンポーネントを特定
2. 優先度付けして段階的に展開（Phase 1: 高リスク, Phase 2: 中リスク, Phase 3: 低リスク）
3. 各テストファイルは既存の `SkillAnalysisView.store-integration.test.tsx` をテンプレートとして使用

### 3.5 展開対象コンポーネント（優先度順）

| 優先度 | コンポーネント   | 理由                             |
| ------ | ---------------- | -------------------------------- |
| 高     | SettingsView     | 認証・APIキー等のStore依存が多い |
| 高     | LLMSelectorPanel | Provider選択のStore操作が複雑    |
| 中     | ChatPanel        | メッセージ送受信のStore連携      |
| 中     | EditorView       | ファイル編集状態のStore管理      |
| 低     | SidebarNav       | ナビゲーション状態のStore連携    |

### 3.6 テンプレート構造

```typescript
// <Component>.store-integration.test.tsx
import { renderHook, act } from "@testing-library/react";
import { useAppStore } from "../../store";

describe("<Component> Store Integration", () => {
  beforeEach(() => {
    useAppStore.setState(initialState); // Store リセット
  });

  describe("Store state reading", () => {
    it("should read correct state from store", () => {
      /* ... */
    });
  });

  describe("Store action dispatching", () => {
    it("should dispatch actions correctly", () => {
      /* ... */
    });
  });

  describe("IPC integration", () => {
    it("should call IPC and update store", () => {
      /* ... */
    });
  });
});
```

---

## 4. 実行手順

### Phase構成

中規模タスクのため Phase 1-4-5-6-7-9-12 の7フェーズ構成。

### Phase 1: 要件定義

#### 目的

Store依存コンポーネントの全量調査と優先度付け

#### 手順

1. `grep -rn "useAppStore\|use.*Store" apps/desktop/src/renderer/components/ --include="*.tsx" | grep -v test | grep -v __tests__` で対象コンポーネントを特定
2. 各コンポーネントのStore依存度（使用セレクタ数、アクション数）を調査
3. P31/P48リスクの高いコンポーネントを優先度「高」に分類
4. 展開対象コンポーネント一覧を確定

#### 成果物

Store依存コンポーネント一覧（優先度付き）

### Phase 4-5: テスト作成・実装

#### 目的

各コンポーネントにStore統合テストを新設

#### 手順

1. 高優先度コンポーネント（SettingsView, LLMSelectorPanel）の `.store-integration.test.tsx` を作成
2. agentSlice 以外のSlice（navigationSlice, settingsSlice 等）の `.p31-regression.test.ts` を作成
3. 未存在のSliceに `.selectors.test.ts` を作成
4. 中優先度コンポーネント（ChatPanel, EditorView）の `.store-integration.test.tsx` を作成
5. 低優先度コンポーネント（SidebarNav）の `.store-integration.test.tsx` を作成

#### 成果物

各テストファイル

#### 完了条件

- 全対象コンポーネントに `.store-integration.test.tsx` が存在する
- agentSlice 以外のSliceに `.p31-regression.test.ts` が存在する
- テスト全PASS

### Phase 6-7: テスト拡充・カバレッジ確認

#### 目的

カバレッジ基準の充足確認とテスト追加

#### 手順

1. カバレッジレポートを取得
2. Line 80% / Branch 60% 未満のファイルにテストを追加
3. 再度カバレッジを確認

### Phase 9: 品質検証

#### 目的

Lint・型チェック・全テスト実行

#### 手順

1. `pnpm lint` 実行
2. `pnpm typecheck` 実行
3. `cd apps/desktop && pnpm vitest run` で全テスト実行

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Store依存コンポーネント一覧が作成されている
- [ ] 高優先度コンポーネントに `.store-integration.test.tsx` が作成されている
- [ ] 中優先度コンポーネントに `.store-integration.test.tsx` が作成されている
- [ ] 低優先度コンポーネントに `.store-integration.test.tsx` が作成されている
- [ ] agentSlice 以外のSliceに `.p31-regression.test.ts` が作成されている
- [ ] 未存在Sliceに `.selectors.test.ts` が作成されている

### 品質要件

- [ ] テスト全PASS
- [ ] TypeScript型チェック PASS
- [ ] Lint PASS
- [ ] カバレッジが Line 80% / Branch 60% 以上を維持

### ドキュメント要件

- [ ] テスト実行コマンドとカバレッジ基準が文書化されている
- [ ] testing-component-patterns.md に展開結果を反映

---

## 6. 検証方法

### テストケース

- 各 `.store-integration.test.tsx` でStore state読み取りが正しく動作すること
- 各 `.store-integration.test.tsx` でStore action dispatchが正しく動作すること
- 各 `.store-integration.test.tsx` でIPC連携が正しく動作すること
- 各 `.p31-regression.test.ts` でセレクタ参照安定性が確認されること
- 各 `.selectors.test.ts` で純粋なセレクタロジックが検証されること

### 検証手順

```bash
# 全Store統合テストを実行
cd apps/desktop && pnpm vitest run src/renderer/components/**/*.store-integration.test.tsx

# 全P31回帰テストを実行
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/*.p31-regression.test.ts

# 全セレクタテストを実行
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/*.selectors.test.ts

# カバレッジ確認
cd apps/desktop && pnpm vitest run --coverage
```

---

## 7. リスクと対策

| リスク                                         | 影響度 | 発生確率 | 対策                                                                   |
| ---------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------- |
| テスト数の大幅増加によるCI実行時間の増加       | 中     | 高       | Store統合テストを独立ファイルにし、並列実行を活用                      |
| 既存UIテストとの重複によるメンテナンスコスト増 | 中     | 中       | Store操作テストは `.store-integration.test.tsx` に集約する方針を明確化 |
| コンポーネント構造の変更によるテスト修正       | 低     | 低       | Store操作のみをテストし、UIレンダリングに依存しない設計                |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` - TASK-043D セクション
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` - セクション15
- `.claude/skills/skill-creator/references/patterns.md` - 「Store統合テスト分離パターン」「P31回帰テストパターン」
- `.claude/rules/06-known-pitfalls.md` - P31, P48

### 参考資料

- `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx` - テンプレート実装例
- `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.p31-regression.test.ts` - P31回帰テスト実装例

---

## 9. 備考

### 苦戦箇所（同種課題の簡潔解決に必須）

**問題**: SkillAnalysisView と SkillCreateWizard で Store統合テスト（`.store-integration.test.tsx`）パターンを確立したが、他のStore依存コンポーネントにはまだ適用されていない。

- AgentView, SettingsView, LLMSelectorPanel 等がStore直結のhookを使用
- UIテスト内でStore操作のテストが混在し、テスト失敗時の原因特定が困難
- P31回帰テストが agentSlice にのみ存在し、他のSliceには未適用

**根本原因**: Store統合テストパターンが確立されたのが今回のブランチで初めてであり、パターンの横展開が行われていない。

**解決策**: 以下の3種のテストファイルを各Store依存コンポーネントに展開する。

1. `.store-integration.test.tsx` - Store操作とIPC連携のテスト
2. `.p31-regression.test.ts` - セレクタ参照安定性の回帰テスト
3. `.selectors.test.ts` - 純粋なセレクタロジックのテスト

### 補足事項

- 優先度「低」: 現時点でP31/P48のリグレッションが発生していないため、予防的な改善タスク
- 段階的展開: 高優先度コンポーネントから着手し、効果を確認しながら展開範囲を拡大する
- 既存テストとの関係: UIテストからStore操作テストを「移動」するのではなく、Store統合テストを「追加」する方針。既存テストの安定性を維持する
