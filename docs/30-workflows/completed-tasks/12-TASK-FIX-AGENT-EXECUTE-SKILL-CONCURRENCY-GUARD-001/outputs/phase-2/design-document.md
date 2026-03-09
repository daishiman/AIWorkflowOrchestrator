# Phase 2: 設計 - 成果物

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 2                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-09                                         |

## Store層ガード設計

### 修正対象: `executeSkill` 関数（agentSlice.ts L742-797）

**現在のコード（問題箇所）:**

```typescript
executeSkill: async (prompt) => {
    const { selectedSkillName } = get();
    if (!selectedSkillName) return;
    // isExecuting チェックがない — ここが並行実行の根本原因
    // ... authKey事前検証 ...
    const tempExecutionId = generateExecutionId();
    set({
      isExecuting: true,  // 非同期処理後に初めてtrueになる
      // ...
    });
```

**修正後の設計:**

```typescript
executeSkill: async (prompt) => {
    const { selectedSkillName, isExecuting } = get();
    if (!selectedSkillName) return;

    // FR-01: 並行実行ガード — 既に実行中の場合は即座に拒否
    if (isExecuting) return;

    // ... 以降の処理は変更なし ...
```

### 設計判断

| 判断項目                 | 決定                             | 理由                                       |
| ------------------------ | -------------------------------- | ------------------------------------------ |
| ガード位置               | `selectedSkillName` チェック直後 | 最も早い段階で拒否し、副作用を防止         |
| ガードの戻り値           | `void`（暗黙的return）           | エラーを投げず静かに拒否（UXを損なわない） |
| `isExecuting` の取得方法 | `get()` で分割代入               | Zustandの同期的な状態取得で競合なし        |
| ログ出力                 | なし                             | P20準拠（テスト環境でのログ出力汚染防止）  |

### 変更量

- `get()` の分割代入に `isExecuting` を追加: 1行変更
- `if (isExecuting) return;` を追加: 1行追加
- 合計: **2行の変更**

## UI層回帰設計

### 対象コンポーネント

現行実装では、二重実行を直接防ぐUI面が既に複数存在する。今回の必須変更はStore層ガードであり、UI層は以下の既存挙動を回帰対象として扱う。

| コンポーネント           | 既存ガード面                                          | 回帰確認内容                                 |
| ------------------------ | ----------------------------------------------------- | -------------------------------------------- |
| `ExecuteButton.tsx`      | `isExecuting === true` でボタン非表示（null render）  | 実行中にボタンが表示されないこと             |
| `AgentExecutionView.tsx` | `AgentMessageInput` に `disabled={isExecuting}`       | 実行中に入力が無効化されること               |
| `ChatPanel.tsx`          | `skill-management-toggle` に `disabled={isExecuting}` | 実行中にトグルが無効化されること             |
| `ChatPanel.tsx`          | `SkillStreamingView` の条件表示                       | 実行中にストリーミングビューが表示されること |

### UI変更の方針

| 判断項目               | 決定                                       | 理由                                                                           |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| UI変更の必須性         | 原則なし                                   | 既存UI面が `isExecuting` を既に反映しているため、今回の必須変更はStore層ガード |
| `isExecuting` 参照方式 | 個別セレクタまたはプリミティブ直接セレクタ | P31は合成Hookで問題化するため、`useAppStore((s) => s.isExecuting)` は非違反    |
| disabled / hidden 制御 | 既存UI仕様を維持                           | ExecuteButton / AgentExecutionView / ChatPanel の既存挙動を回帰確認対象に固定  |

## 二重防御アーキテクチャ図

```
[ユーザークリック]
      |
      v
  +---------------+
  |  UI層ガード    |  <- 既存UIが disabled / hidden / streaming で実行中を表現
  |  (1st防御)     |     ExecuteButton: null render
  |                |     AgentExecutionView: input disabled
  |                |     ChatPanel: toggle disabled
  +-------+-------+
          | (disabledが効かない場合: プログラム的呼び出し等)
          v
  +---------------+
  | Store層ガード  |  <- if (isExecuting) return; で実行を拒否
  |  (2nd防御)     |     FR-01: 即座に早期return
  |                |     FR-04: streamingMessages / executionId を変更しない
  +-------+-------+
          | (両方通過した場合のみ)
          v
  +---------------+
  | 実行開始       |  <- set({ isExecuting: true, ... })
  |                |     executionId 生成
  |                |     IPC呼び出し開始
  +---------------+
```

**二重防御の必要性:**

1. UI層のみの防御では、テストやプログラム的な呼び出しで回避される
2. Store層のみの防御では、ユーザーに視覚的フィードバックが提供されない
3. 両方を独立に実装することで、どちらか一方が機能しなくても安全性が保たれる

## 案A vs 案B の比較と採用理由

| 比較軸               | 案A: Store層のみ最小修正 | 案B: Store + UI全面改修      |
| -------------------- | ------------------------ | ---------------------------- |
| 根本原因への到達     | 高い                     | 高い                         |
| 変更量               | 最小（2行）              | 大（複数コンポーネント改修） |
| 既存UI再利用         | 最大                     | 低い                         |
| 回帰リスク           | 低い                     | 高い                         |
| Phase 12 更新範囲    | 明確で小さい             | 広がりやすい                 |
| ブランチ実態への適合 | 高い                     | 低い                         |

**採用結論:** 案Aを採用する。

- 主変更は案Aを採用する
- ただしUX保証を弱めないため、UIは「未変更でよい」ではなく「既存ガード面を回帰対象として固定する」という監査方針を合わせて採用する
- これにより、実装変更量は最小化しつつ、受入基準 AC-04 / AC-05 を独立に満たせる

## 影響範囲分析

| ファイル                 | 変更内容                                        | リスク |
| ------------------------ | ----------------------------------------------- | ------ |
| `agentSlice.ts`          | `executeSkill` 冒頭にガード追加（2行）          | 低     |
| `ExecuteButton.tsx`      | 既存 `isExecuting` 連携の回帰確認               | 低     |
| `AgentExecutionView.tsx` | 既存 disabled 入力の回帰確認                    | 低     |
| `ChatPanel.tsx`          | 既存 toggle disabled / streaming 表示の回帰確認 | 低     |
| 既存テストファイル       | 新ガードに合わせたテストケース追加              | 低     |

### 変更量の見積もり

- Store層: 2行追加（`isExecuting` の分割代入追加 + `if` ガード追加）
- UI層: 原則コード変更なし（回帰確認のみ）
- テスト: Storeガード新規テスト + 既存UI回帰テスト拡張

## Listener復元経路の設計考慮

- `setupSkillListeners.ts` は `onComplete` / `onError` を Store の `_handleComplete` / `_handleError` に接続している
- 本タスクの受入は、`executeSkill` 冒頭の再入ガードだけでなく、完了・失敗後に `isExecuting` が正しく `false` に戻る経路まで含めて評価する
- Phase 6 と Phase 11 では、listener由来の状態復元が維持されていることを追加で確認する

## 完了条件チェック

- [x] Store層ガードの挿入位置と実装パターンが決定されている
- [x] UI層の回帰確認対象（ExecuteButton / AgentExecutionView / ChatPanel）が決定されている
- [x] 案A / 案B の比較と採用理由が明文化されている
- [x] 二重防御アーキテクチャ図が作成されている
- [x] 影響範囲分析で変更対象ファイルが特定されている
- [x] Listener復元経路の確認方針が設計に含まれている
- [x] P31/P48の適用境界が正しく整理されている
