# Phase 5: 実装

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 5                                         |
| Phase名    | 実装                                      |
| 対象機能   | claude-sdk-message-contract-normalization |
| 前提Phase  | Phase 4（テスト作成）                     |
| 後続Phase  | Phase 6（テスト拡充）                     |
| ステータス | pending                                   |
| 作成日     | 2026-03-29                                |

## 目的

型追加、normalizer 実装、Facade / IPC 統合を実施する。

## 背景

Phase 4 で Red 状態のテストが用意されているため、それらを Green にする実装を行う。型定義の追加、normalizer 本体の実装、Facade への統合、IPC payload の更新を段階的に進める。

## 実行タスク

### Task 1: 正規化イベント型の追加

**目的**: 正規化イベント型を追加し、共有型パッケージに配置する。

**実行手順**:

1. `packages/shared/src/types/skillCreator.ts` に `SkillCreatorSdkEvent` 型を追加する
2. export を確認する

**期待される成果物**:

- 型定義ファイルの更新

### Task 2: normalizer の実装

**目的**: normalizer を実装し、SDK 生メッセージから正規化イベントへの変換を行う。

**実行手順**:

1. normalizer モジュールを作成する
2. 各 message 種別の変換ロジックを実装する
3. 欠損項目の warning ログを実装する

**期待される成果物**:

- normalizer 実装ファイル

### Task 3: Facade への統合

**目的**: Facade に normalizer を統合し、SDK 生メッセージの変換を一元化する。

**実行手順**:

1. `RuntimeSkillCreatorFacade` に normalizer を注入する
2. 既存のメッセージ処理パスに normalizer を挿入する

**期待される成果物**:

- Facade 統合コード

### Task 4: IPC payload の更新

**目的**: IPC payload を更新し、正規化イベントを renderer に配信する。

**実行手順**:

1. IPC handler の payload 型を更新する
2. renderer 側の受信型を更新する

**期待される成果物**:

- IPC payload 更新コード

## 参照資料

| 資料名  | パス                | 説明     |
| ------- | ------------------- | -------- |
| Phase 2 | `phase-2-design.md` | 実装設計 |

## 成果物

| 成果物                | パス                                       | 説明     |
| --------------------- | ------------------------------------------ | -------- |
| implementation record | `outputs/phase-5/implementation-record.md` | 実装記録 |

## 統合テスト連携

Facade / IPC / renderer 統合の実装とテスト支援コード整備を行う。

---

## TDD検証

### TDD サイクル確認（Green）

```bash
pnpm vitest run --filter "sdk-message-normalizer"
```

**確認項目**:

- [ ] テストが成功することを確認（Green 状態）

## 完了条件

- [ ] 型が追加されている
- [ ] normalizer が実装されている
- [ ] Facade / IPC に統合されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-6-test-expansion.md`
