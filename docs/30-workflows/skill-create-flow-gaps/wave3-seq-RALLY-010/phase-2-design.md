# Phase 2: 設計

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 2                        |
| タスクID   | TASK-RALLY-010           |
| 機能名     | ラリー完了状態UI表示追加 |
| 前提Phase  | Phase 1                  |
| 後続Phase  | Phase 3                  |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

Phase 1 で確定した受け入れ基準を満たすための実装設計を固定する。
`isRallyCompleted` 判定ロジックと3分岐レンダリングの具体的な変更箇所・変更内容を定義する。

## 直列/並列情報

- **本タスク（RALLY-010）はRALLY-002完了後の直列実行**
- 後続のRALLY-011も同一ファイルのため、本タスク完了まで着手不可

## 変更箇所設計

**対象ファイル**: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

### 1. `isRallyCompleted` 判定ロジックの追加

Phase 1 の型調査結果を踏まえ、`workflowSnapshot` の完了フェーズを判定する変数を追加する。

```tsx
// workflowSnapshot の phase/status から完了状態を導出する
// 完了フェーズの具体的な値は Phase 1 型調査で確定した値を使用する
const isRallyCompleted =
  workflowSnapshot?.phase === "completed" ||
  workflowSnapshot?.status === "completed";
```

型定義が `phase` / `status` どちらのフィールドを持つかは Phase 1 P50チェックで確認後に最終確定する。

### 2. レンダリング分岐の変更（`pendingRequest` がない場合）

変更前（waiting のみ）:

```tsx
) : (
  <div
    className="border-t border-[var(--border-primary)] px-5 py-4 text-center text-sm text-[var(--text-secondary)]"
    data-testid="interview-waiting"
  >
    質問を待っています...
  </div>
)}
```

変更後（完了/待機の2分岐）:

```tsx
) : isRallyCompleted ? (
  <div
    className="border-t border-[var(--border-primary)] px-5 py-4 text-center"
    data-testid="interview-completed"
  >
    <p className="text-sm font-medium text-[var(--status-success)]">
      ラリーが完了しました
    </p>
    <p className="mt-1 text-xs text-[var(--text-secondary)]">
      スキルの仕様が揃いました。次のステップへ進んでください。
    </p>
  </div>
) : (
  <div
    className="border-t border-[var(--border-primary)] px-5 py-4 text-center text-sm text-[var(--text-secondary)]"
    data-testid="interview-waiting"
  >
    次の質問を準備しています...
  </div>
)}
```

### 3. 全体レンダリング分岐の構造

```
pendingRequest が存在する
  → 入力エリア（data-testid="interview-input-area"）
isRallyCompleted が true
  → 完了UI（data-testid="interview-completed"）
それ以外
  → 待機UI（data-testid="interview-waiting"）
```

## 検証方法

1. `workflowSnapshot` の `phase` が完了フェーズの値をモックして `data-testid="interview-completed"` 要素が表示されることをユニットテストで確認
2. `workflowSnapshot` の `phase` が進行中の値のとき `data-testid="interview-waiting"` が表示されることを確認
3. `pendingRequest` が存在するとき完了UIが表示されないことを確認

## 参照資料

| 資料名                 | パス                                         | 説明           |
| ---------------------- | -------------------------------------------- | -------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| workflowSnapshot型調査 | `outputs/phase-1/snapshot-type-analysis.md`  | Phase 1 成果物 |

## 成果物

| 成果物       | パス                                    | 説明                     |
| ------------ | --------------------------------------- | ------------------------ |
| UI設計書     | `outputs/phase-2/ui-design.md`          | 3分岐レンダリング設計    |
| 変更差分設計 | `outputs/phase-2/change-diff-design.md` | 変更前後のコード差分設計 |

## 完了条件

- [ ] `isRallyCompleted` 判定ロジックが設計されていること
- [ ] 3分岐レンダリングの変更箇所と変更内容が明確であること
- [ ] `data-testid` 命名が全分岐に定義されていること
- [ ] Phase 1 の AC-1〜AC-6 すべてをカバーする設計であること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p10-seq-RALLY-010
```

## 次のPhase

Phase 3: 設計レビューゲート
