# Phase 2: 設計

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 2                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

Phase 1で定義した要件（FR-01〜FR-04, NFR-01〜NFR-03）を満たすための技術設計を行う。Store層のガードパターンとUI層のdisabled制御の二重防御アーキテクチャを設計する。

## 実行タスク

- Store層ガード設計: `executeSkill` 関数冒頭の `isExecuting` ガードパターンを設計
- UI層ガード設計: スキル実行ボタンのdisabled制御と視覚的フィードバックを設計
- 二重防御アーキテクチャ: Store層 + UI層の防御が独立に機能する設計を策定

## 参照資料

| 資料名                 | パス                                                                                              | 説明                        |
| ---------------------- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 1 要件定義       | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-1-requirements.md` | FR/NFR/AC定義               |
| agentSlice実装         | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                            | 現在のexecuteSkill実装      |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                      | Zustand Store設計の正本仕様 |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`       | 並行制御の実装パターン      |

### システム仕様（aiworkflow-requirements）

- `arch-state-management.md`: Zustand Storeの状態更新パターン
- `architecture-implementation-patterns.md`: ガードパターンのリファレンス実装

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### ステップ1: Store層ガード設計

#### 修正対象: `executeSkill` 関数（agentSlice.ts 742行目付近）

**現在のコード（問題箇所）:**

```typescript
executeSkill: async (prompt) => {
    const { selectedSkillName } = get();
    if (!selectedSkillName) return;
    // ← isExecuting チェックがない
    // ... authKey事前検証 ...
    const tempExecutionId = generateExecutionId();
    set({
      isExecuting: true,  // ← 非同期処理後に初めてtrueになる
      // ...
    });
```

**修正後の設計:**

```typescript
executeSkill: async (prompt) => {
    const { selectedSkillName, isExecuting } = get();
    if (!selectedSkillName) return;

    // 並行実行ガード: 既に実行中の場合は即座に拒否
    if (isExecuting) return;

    // ... 以降の処理は変更なし ...
```

**設計判断:**

| 判断項目                 | 決定                             | 理由                                       |
| ------------------------ | -------------------------------- | ------------------------------------------ |
| ガード位置               | `selectedSkillName` チェック直後 | 最も早い段階で拒否し、副作用を防止         |
| ガードの戻り値           | `void`（暗黙的return）           | エラーを投げず静かに拒否（UXを損なわない） |
| `isExecuting` の取得方法 | `get()` で分割代入               | Zustandの同期的な状態取得で競合なし        |
| ログ出力                 | なし                             | P20準拠（テスト環境でのログ出力汚染防止）  |

### ステップ2: UI層ガード設計

#### 対象コンポーネントの特定

`apps/desktop/src/renderer/components/agent/` 配下で `executeSkill` を呼び出しているコンポーネントを特定し、以下の制御を追加する:

**ボタンのdisabled制御:**

```typescript
// 個別セレクタでisExecutingを取得（P31対策: 合成Hookを避ける）
const isExecuting = useIsExecuting();

<button
  disabled={isExecuting}
  onClick={handleExecuteSkill}
  className={isExecuting ? "opacity-50 cursor-not-allowed" : ""}
>
  {isExecuting ? "実行中..." : "実行"}
</button>
```

**設計判断:**

| 判断項目             | 決定                                   | 理由                                |
| -------------------- | -------------------------------------- | ----------------------------------- |
| `isExecuting` の取得 | 個別セレクタ `useIsExecuting()` を使用 | P31対策（合成Hookの無限ループ防止） |
| disabled制御方式     | `disabled` 属性 + CSS opacity          | HTML標準のアクセシビリティ対応      |
| テキスト変更         | 「実行」→「実行中...」                 | ユーザーに現在の状態を明示的に伝達  |

### ステップ3: 二重防御アーキテクチャ

```
[ユーザークリック]
      │
      ▼
  ┌─────────────┐
  │  UI層ガード  │  ← disabled={isExecuting} でクリック自体を防止
  │  (1st防御)   │
  └──────┬──────┘
         │ (disabledが効かない場合: プログラム的呼び出し等)
         ▼
  ┌─────────────┐
  │ Store層ガード│  ← if (isExecuting) return; で実行を拒否
  │  (2nd防御)   │
  └──────┬──────┘
         │ (両方通過した場合のみ)
         ▼
  ┌─────────────┐
  │ 実行開始     │  ← set({ isExecuting: true, ... })
  └─────────────┘
```

**二重防御の必要性:**

1. UI層のみの防御では、テストやプログラム的な呼び出しで回避される
2. Store層のみの防御では、ユーザーに視覚的フィードバックが提供されない
3. 両方を独立に実装することで、どちらか一方が機能しなくても安全性が保たれる

### ステップ4: 影響範囲分析

| ファイル                    | 変更内容                               | リスク |
| --------------------------- | -------------------------------------- | ------ |
| `agentSlice.ts`             | `executeSkill` 冒頭にガード追加（1行） | 低     |
| agent配下のUIコンポーネント | ボタンにdisabled制御追加               | 低     |
| 既存テストファイル          | 新ガードに合わせたテストケース追加     | 低     |

**変更量の見積もり:**

- Store層: 2行追加（`isExecuting` の分割代入追加 + `if` ガード追加）
- UI層: コンポーネントあたり3-5行変更（disabled属性 + スタイル + テキスト）
- テスト: 10-15行追加（ガード検証テストケース）

## 統合テスト連携（Phase 1〜11は必須）

- Store層ガードの単体テスト設計を策定（Phase 4で実装）
- UI層disabled制御のコンポーネントテスト設計を策定（Phase 4で実装）
- 二重防御の結合テスト設計を策定（Phase 6で実装）

## 多角的チェック観点（AIが判断）

| 観点             | 適用 | チェック内容                                           |
| ---------------- | ---- | ------------------------------------------------------ |
| 状態管理         | 該当 | `get().isExecuting` の同期取得が競合しないことを確認   |
| UI/UX            | 該当 | disabled状態の視覚的フィードバックがHIG準拠であること  |
| アクセシビリティ | 該当 | disabled属性がスクリーンリーダーで正しく認識されること |

## 成果物

| 成果物 | パス                                                                                        | 説明           |
| ------ | ------------------------------------------------------------------------------------------- | -------------- |
| 設計書 | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-2-design.md` | 本ドキュメント |

## 完了条件

- [ ] Store層ガードの挿入位置と実装パターンが決定されている
- [ ] UI層のdisabled制御方式が決定されている
- [ ] 二重防御アーキテクチャ図が作成されている
- [ ] 影響範囲分析で変更対象ファイルが特定されている
- [ ] P31/P48に抵触しない設計であることが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビュー
