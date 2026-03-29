# Phase 2: 設計

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| Phase名    | 設計                                      |
| 対象機能   | claude-sdk-message-contract-normalization |
| 前提Phase  | Phase 1（要件定義）                       |
| 後続Phase  | Phase 3（設計レビュー）                   |
| ステータス | completed                                 |
| 作成日     | 2026-03-29                                |

## 目的

`SDKMessage` を `SkillCreatorSdkEvent` へ変換する normalizer の設計、Facade 統合点、IPC payload 形状を設計する。

## 背景

Phase 1 で固定した要件（message 種別・保持ルール・最小契約）を満たす変換ロジックの設計を行う。normalizer を Facade の内部に配置し、SDK 生メッセージへの依存を IPC / renderer から排除する。

## 実行タスク

### Task 1: 正規化イベント型の設計

**目的**: 正規化イベント型を設計し、下流が依存する唯一の型契約を確定する。

**実行手順**:

1. Phase 1 の必須項目を型定義に落とし込む
2. `SkillCreatorSdkEventType` の union と `SkillCreatorSdkEvent` interface を定義する

**期待される成果物**:

- TypeScript 型定義

### Task 2: normalizer の入出力設計

**目的**: normalizer の入力 / 出力を設計し、変換責務を明確にする。

**実行手順**:

1. SDK 生 message を 1 件ずつ受ける入力インターフェースを定義する
2. lane event への変換ルールを整理する
3. 欠損項目の warning 扱いを定義する

**期待される成果物**:

- normalizer 入出力仕様

### Task 3: 統合点の設計

**目的**: Facade / IPC / renderer の受け渡し方式を設計する。

**実行手順**:

1. Facade が normalizer の owner となる配置を決定する
2. IPC payload の形状を定義する
3. renderer の消費パターンを定義する

**期待される成果物**:

- 統合点設計書

### Task 4: provenance と session_id の引き回し設計

**目的**: provenance と `session_id` の引き回しを設計する。

**実行手順**:

1. `session_id` のライフサイクルを整理する
2. provenance の伝播経路を定義する

**期待される成果物**:

- 引き回し設計書

## 参照資料

| 資料名       | パス                                                                  | 説明     |
| ------------ | --------------------------------------------------------------------- | -------- |
| Phase 1 要件 | `phase-1-requirements.md`                                             | 要件固定 |
| Facade       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 統合点   |
| 型定義       | `packages/shared/src/types/skillCreator.ts`                           | 共有型   |

## 実行手順

### ステップ1: 正規化イベント型を設計する

```typescript
type SkillCreatorSdkEventType = "init" | "assistant" | "result" | "error";

interface SkillCreatorSdkEvent {
  eventType: SkillCreatorSdkEventType;
  sessionId?: string;
  resultSubtype?: string;
  text?: string;
  permissionDenials?: string[];
  sourceProvenance?: {
    sourceRoot: string;
    manifestHash?: string;
  };
}
```

### ステップ2: normalizer を設計する

- SDK 生 message を 1 件ずつ受ける
- lane event へ変換する
- 欠損項目は warning として扱う

### ステップ3: 統合点を設計する

- Facade が normalizer の owner
- IPC は `SkillCreatorSdkEvent[]` または stream payload を返す
- renderer は lane event のみを読む

### normalizer 変換フロー

```mermaid
graph LR
    SDK[SDKMessage Stream] --> N[normalizer]
    N --> E[SkillCreatorSdkEvent]
    E --> F[RuntimeSkillCreatorFacade]
    F --> IPC[creatorHandlers IPC]
    IPC --> R[renderer / UI]

    subgraph 正規化レイヤー
        N
        E
    end

    subgraph 既存主線（不変）
        SDK
        F
    end
```

## 成果物

| 成果物            | パス                                   | 説明         |
| ----------------- | -------------------------------------- | ------------ |
| normalizer design | `outputs/phase-2/normalizer-design.md` | 型と変換規則 |

## 統合テスト連携

normalizer と Facade と IPC の統合ポイントと型契約を設計に反映する。

## 完了条件

- [ ] 正規化イベント型が定義されている
- [ ] normalizer の責務が明確である
- [ ] Facade / IPC / renderer の境界が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-3-design-review.md`
