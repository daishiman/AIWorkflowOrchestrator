# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 8                           |
| 機能名 | UT-STORE-HOOKS-REFACTOR-001 |
| 作成日 | 2026-02-11                  |

## 目的

動作を変えずに、既存コンポーネントのuseRefガードを削除し、個別セレクタベースの実装に移行することでコード品質を改善する。

## 実行タスク

- useRefガード削除: 既存コンポーネントの一時的なuseRefガードを削除
- useEffect依存配列正規化: ESLint exhaustive-deps警告を解消
- 合成Hook非推奨化: 合成Hookに@deprecated JSDocタグを追加
- コードスメル検出: 問題のあるコードパターンの特定と修正

## 参照資料

| 資料名             | パス                                     | 説明                  |
| ------------------ | ---------------------------------------- | --------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`     | Phase 7成果物         |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md#P31` | Zustand無限ループ問題 |
| 状態管理ルール     | `.claude/rules/03-state-management.md`   | Zustand設計原則       |
| コード品質ルール   | `.claude/rules/02-code-quality.md`       | コーディング規約      |

## 実行手順

### 1. 既存コンポーネントのuseRefガード削除

Phase 5（短期対策）で追加したuseRefガードを、個別セレクタ使用に置き換える。

#### 対象コンポーネント一覧

| コンポーネント   | ファイルパス                                             | 修正内容                    |
| ---------------- | -------------------------------------------------------- | --------------------------- |
| SettingsView     | `src/renderer/components/views/SettingsView.tsx`         | useRefガード → 個別セレクタ |
| AgentView        | `src/renderer/components/views/AgentView.tsx`            | useRefガード → 個別セレクタ |
| LLMSelector      | `src/renderer/components/organisms/LLMSelector.tsx`      | useRefガード → 個別セレクタ |
| AuthModeSelector | `src/renderer/components/organisms/AuthModeSelector.tsx` | useRefガード → 個別セレクタ |

#### 修正パターン

**Before（useRefガード）:**

```typescript
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []);
```

**After（個別セレクタ）:**

```typescript
const initializeAuthMode = useInitializeAuthMode();
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]);
```

### 2. useEffect依存配列の正規化

ESLint exhaustive-deps警告を解消する。

```bash
# exhaustive-deps警告の確認
pnpm --filter @repo/desktop lint -- --rule "react-hooks/exhaustive-deps: warn"
```

### 3. 合成Hookに@deprecated JSDocタグを追加

後方互換性を維持しつつ、将来的な移行を促す。

#### authModeSlice.ts

```typescript
/**
 * @deprecated 個別セレクタ（useAuthMode, useSetAuthMode等）の使用を推奨。
 * この合成Hookは後方互換性のために残されていますが、新規コードでは個別セレクタを使用してください。
 * 理由: useEffectの依存配列に含めると無限ループが発生するため（P31参照）。
 */
export const useAuthModeStore = () => {
  // ...
};
```

#### llmSlice.ts

```typescript
/**
 * @deprecated 個別セレクタ（useLLMProvider, useSetLLMProvider等）の使用を推奨。
 * この合成Hookは後方互換性のために残されていますが、新規コードでは個別セレクタを使用してください。
 * 理由: useEffectの依存配列に含めると無限ループが発生するため（P31参照）。
 */
export const useLLMStore = () => {
  // ...
};
```

#### agentSlice.ts

```typescript
/**
 * @deprecated 個別セレクタ（useSelectedSkill, useSetSelectedSkill等）の使用を推奨。
 * この合成Hookは後方互換性のために残されていますが、新規コードでは個別セレクタを使用してください。
 * 理由: useEffectの依存配列に含めると無限ループが発生するため（P31参照）。
 */
export const useAgentStore = () => {
  // ...
};
```

### 4. コードスメル検出と修正

```bash
# TODO/FIXME/HACKコメントの検出
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/renderer/store/slices/
```

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test -- --grep "integration"
```

## リファクタリングチェックリスト

| #   | 項目                                  | 確認 |
| --- | ------------------------------------- | ---- |
| 1   | useRefガードが全て削除されている      | [ ]  |
| 2   | 全てのuseEffectが正しい依存配列を持つ | [ ]  |
| 3   | ESLint exhaustive-deps警告がない      | [ ]  |
| 4   | 合成Hookに@deprecatedタグがある       | [ ]  |
| 5   | 既存テストが全てパスする              | [ ]  |
| 6   | 無限ループが発生しないことを確認      | [ ]  |

## 成果物

| 成果物               | パス                                     | 説明           |
| -------------------- | ---------------------------------------- | -------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`     | 変更内容の記録 |
| コード品質レポート   | `outputs/phase-8/code-quality-report.md` | 品質改善の結果 |

## 完了条件

- [ ] 全てのuseRefガードが削除されている
- [ ] 全てのuseEffectが正しい依存配列を持つ
- [ ] ESLint exhaustive-deps警告が0件
- [ ] 合成Hookに@deprecated JSDocタグが追加されている
- [ ] 全テストが継続成功（Green状態維持）
- [ ] 統合テストが継続成功
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
# - [ ] 無限ループが発生しないことを確認（ブラウザDevToolsで確認）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. useRefガード削除（コンポーネント単位）
3. useEffect依存配列の正規化
4. 合成Hookへの@deprecatedタグ追加
5. コードスメル検出と修正
6. 統合テスト実行
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001 --phase 8
```

## 次のPhase

Phase 9: 品質保証
