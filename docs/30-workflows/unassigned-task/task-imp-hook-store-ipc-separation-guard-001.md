# Hook内Store/IPC/UIState混在防止ガード - タスク指示書

## メタ情報

```yaml
issue_number: 1056
```

## メタ情報

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-IMP-HOOK-STORE-IPC-SEPARATION-GUARD-001                           |
| タスク名     | Hook内Store/IPC/UIState混在防止ガード                                |
| 分類         | 改善                                                                 |
| 対象機能     | React Hooks 設計パターン（Renderer層）                               |
| 優先度       | 中                                                                   |
| 見積もり規模 | 中規模（4-6時間）                                                    |
| ステータス   | 未実施                                                               |
| 発見元       | TASK-10A-F Store駆動ライフサイクル（useSkillAnalysisのテスト複雑性） |
| 発見日       | 2026-03-08                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-F で `useSkillAnalysis` hookをStore駆動に移行した際、1つのhook内にStore直結・IPC呼び出し・ローカルstateの3つの関心事が混在しており、テスト設計が困難であった。具体的には以下の3層が分離されていない:

- **Store state読み取り**: agentSlice からのスキル状態取得
- **IPC呼び出し**: `window.electronAPI.skill.analyze` 等の副作用
- **ローカルstate管理**: `isLoading`, `error`, `improvementResult` 等のUI状態

### 1.2 問題点・課題

- hookのテスト時にStore・IPC・ローカルstateの全てをモックする必要があり、モック境界が不明確
- 関心事が混在しているため、変更影響範囲の特定が困難
- P31（Zustand Store Hooks無限ループ）やP48（useShallow未適用による派生セレクタ無限ループ）の発生リスクが高まる
- 同様のパターンが他のhookにも存在する可能性がある

### 1.3 放置した場合の影響

- 新規hook追加時に同じ混在パターンが再生産される
- テストの複雑性が増大し、テストカバレッジの維持が困難になる
- P31/P48系のバグが新しいhookで再発するリスクが残存する

---

## 2. 何を達成するか（What）

### 2.1 目的

hookの設計ガイドライン（3層分離パターン）を策定し、既存の複合hookの混在度を評価・リファクタリング計画を策定する。

### 2.2 最終ゴール

- hook設計ガイドライン（3層分離パターン）がドキュメント化されている
- 既存の複合hookの調査結果（Store/IPC/UI混在度リスト）が作成されている
- 高リスクhookのリファクタリング計画が策定されている

### 2.3 スコープ

#### 含むもの

- hook設計ガイドライン（3層分離パターン）の `testing-component-patterns.md` への追加
- 既存の複合hookの調査・混在度評価
- 高リスクhookのリファクタリング計画策定
- `useSkillAnalysis` のリファクタリング対象としての明記

#### 含まないもの

- 実際のhookリファクタリング実装（計画策定まで）
- UIコンポーネントの変更
- Store/IPC層自体の設計変更

### 2.4 成果物

- 更新済み `testing-component-patterns.md`（hook設計ガイドライン追加）
- 複合hook調査結果レポート（混在度リスト）
- 高リスクhookリファクタリング計画

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-10A-F が完了していること（完了済み: 2026-03-07）

### 3.2 依存タスク

なし

### 3.3 必要な知識

- Zustand Store Slice設計（個別セレクタパターン）
- IPC呼び出しパターン（contextBridge経由）
- React Hooks設計原則（関心の分離）
- P31/P48 対策パターン

### 3.4 推奨アプローチ

1. `grep -rn "useAppStore\|useCallback\|useState" apps/desktop/src/renderer/components/*/hooks/` で複合hookを特定
2. 各hookの関心事を分類（Store読み取り / IPC呼び出し / ローカルstate）
3. 混在度が高いhookをリファクタリング対象としてリストアップ
4. hook設計ガイドライン（3層分離パターン）をドキュメント化

#### 3層分離パターン

```typescript
// Layer 1: Store セレクタ（純粋な状態取得）
const useSkillAnalysisState = () =>
  useAppStore((state) => ({
    skills: state.skills,
    selectedSkill: state.selectedSkill,
  }));

// Layer 2: IPC アクション（副作用の発生源）
const useSkillAnalysisActions = () => ({
  analyzeSkill: useCallback(async (skillName: string) => {
    return window.electronAPI.skill.analyze(skillName);
  }, []),
});

// Layer 3: UI ファサード（Layer 1+2を統合）
const useSkillAnalysis = () => {
  const state = useSkillAnalysisState();
  const actions = useSkillAnalysisActions();
  const [isLoading, setIsLoading] = useState(false);
  // ...
};
```

---

## 4. 実行手順

### Phase構成

中規模タスクのため Phase 1-4-5-9-12 の5フェーズ構成。

### Phase 1: 要件定義・調査

#### 目的

既存hookの混在度調査と高リスクhookの特定

#### 手順

1. `grep -rn "useAppStore\|useCallback\|useState" apps/desktop/src/renderer/components/*/hooks/` で複合hookを特定
2. 各hookの関心事を Store読み取り / IPC呼び出し / ローカルstate に分類
3. 混在度スコア（3種混在=高、2種混在=中、1種=低）で評価
4. 高リスクhookのリストを作成

#### 成果物

複合hook調査結果レポート

#### 完了条件

- 全hookの混在度リストが作成されている
- 高リスクhookが特定されている

### Phase 4-5: ガイドライン作成・リファクタリング計画

#### 目的

hook設計ガイドラインのドキュメント化とリファクタリング計画の策定

#### 手順

1. `testing-component-patterns.md` に3層分離パターンのガイドラインを追加
2. 各層のテスト戦略（モック境界）を明記
3. 高リスクhookごとのリファクタリング手順を策定
4. `useSkillAnalysis` をリファクタリング対象として明記

#### 成果物

- 更新済み `testing-component-patterns.md`
- リファクタリング計画

#### 完了条件

- 3層分離パターンがドキュメント化されている
- 各hookのリファクタリング手順が策定されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] hook設計ガイドライン（3層分離パターン）が `testing-component-patterns.md` に記載
- [ ] 複合hookの調査結果（Store/IPC/UI混在度リスト）が作成されている
- [ ] 高リスクhookのリファクタリング計画が策定されている
- [ ] `useSkillAnalysis` がリファクタリング対象として明記されている

### 品質要件

- [ ] ガイドラインにP31/P48対策が含まれている
- [ ] 各層のテスト戦略（モック境界）が明記されている

### ドキュメント要件

- [ ] `testing-component-patterns.md` に更新反映
- [ ] `lessons-learned.md` に教訓追記

---

## 6. 検証方法

### テストケース

- ガイドラインの3層分離パターンが実際のhookに適用可能であること
- 混在度リストが全hookを網羅していること

### 検証手順

```bash
# 複合hookの特定
grep -rn "useAppStore\|useCallback\|useState" apps/desktop/src/renderer/components/*/hooks/

# hook内のStore/IPC/UI混在確認
grep -rn "window.electronAPI" apps/desktop/src/renderer/components/*/hooks/
grep -rn "useAppStore" apps/desktop/src/renderer/components/*/hooks/
grep -rn "useState" apps/desktop/src/renderer/components/*/hooks/
```

---

## 7. リスクと対策

| リスク                                         | 影響度 | 発生確率 | 対策                                                 |
| ---------------------------------------------- | ------ | -------- | ---------------------------------------------------- |
| 3層分離パターンの過剰適用による複雑化          | 中     | 中       | 混在度が低いhookは分離不要とする基準を明記           |
| 既存hookのリファクタリングによる既存テスト破壊 | 中     | 低       | 本タスクは計画策定まで。実装は別タスクで段階的に実施 |
| 全hookの調査漏れ                               | 低     | 中       | grepパターンを複数使用し網羅性を確保                 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` - 「SkillAnalysisView Store統合テストの設計複雑性」セクション
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` - Store統合テストパターン
- `.claude/skills/skill-creator/references/patterns.md` - 「Store統合テスト分離パターン」

### 参考資料

- `.claude/rules/06-known-pitfalls.md` - P31（Zustand Store Hooks無限ループ）、P48（useShallow未適用による派生セレクタ無限ループ）
- `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` - 混在hookの実装例

---

## 9. 備考

### TASK-10A-F からの教訓（苦戦箇所）

- `useSkillAnalysis` hookがStore直結とIPC呼び出しとローカルstateを1つのhookで管理しており、テスト時のモック境界が不明確であった
- Store stateの読み取り（agentSlice）、IPC呼び出し（window.electronAPI.skill.analyze等）、ローカルstate管理（isLoading, error, improvementResult）の3つの関心事が混在
- Custom Hookの「関心の分離」原則が適用されていなかったことが根本原因
- hookが「UIコンポーネントのためのファサード」として設計されていたため、内部で複数の責務を引き受けていた

### 補足事項

- 優先度「中」: テスタビリティの低下だけでなく、P31/P48の発生リスクも高めるため、予防的対策として中優先度を設定
- 本タスクはガイドライン策定と調査・計画までが対象。実際のリファクタリング実装は別タスクとして起票する
