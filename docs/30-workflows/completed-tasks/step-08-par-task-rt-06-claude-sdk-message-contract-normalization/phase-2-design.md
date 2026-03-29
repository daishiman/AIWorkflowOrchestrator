# Phase 2: 設計

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 2                                         |
| 機能名 | claude-sdk-message-contract-normalization |
| 作成日 | 2026-03-29                                |

## 目的

`SDKMessage` を `SkillCreatorSdkEvent` へ変換する normalizer の設計、Facade 統合点、IPC payload 形状を設計する。

## 実行タスク

- 正規化イベント型を設計する
- normalizer の入力 / 出力を設計する
- Facade / IPC / renderer の受け渡し方式を設計する
- provenance と `session_id` の引き回しを設計する

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

## 成果物

| 成果物            | パス                                   | 説明         |
| ----------------- | -------------------------------------- | ------------ |
| normalizer design | `outputs/phase-2/normalizer-design.md` | 型と変換規則 |

## 完了条件

- [ ] 正規化イベント型が定義されている
- [ ] normalizer の責務が明確である
- [ ] Facade / IPC / renderer の境界が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
