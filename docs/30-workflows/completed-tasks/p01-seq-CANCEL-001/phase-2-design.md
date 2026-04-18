# Phase 2: 設計

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 2                                     |
| タスクID   | TASK-SW-CANCEL-001                    |
| 機能名     | skill-creator-cancel-channel-constant |
| 前提Phase  | Phase 1                               |
| 後続Phase  | Phase 3                               |
| 作成日     | 2026-04-15                            |
| ステータス | completed                             |

## 目的

`SKILL_CREATOR_CANCEL` チャンネル定数を `channels.ts` に追加するための設計を行う。追加位置・値・命名の3点を確定する。

## 設計内容

### 1. 追加対象ファイル

`packages/shared/src/ipc/channels.ts`

### 2. 追加位置

`SKILL_CREATOR_RUNTIME_CHANNELS` オブジェクト内の `SKILL_CREATOR_PROGRESS` の直後に追加する。

理由: キャンセルと進捗は実行時の状態管理に関連するため、近接した位置に配置するのが可読性上望ましい。

### 3. 追加する定数

```typescript
SKILL_CREATOR_CANCEL: "skill-creator:cancel",
```

### 4. 命名規則の確認

既存パターン:

- `SKILL_CREATOR_PROGRESS: "skill-creator:progress"`
- `SKILL_CREATOR_CREATE: "skill-creator:create"`

`"skill-creator:{action}"` 形式に準拠する。`cancel` は動詞でアクションを明示しており適切。

### 5. 型伝播の確認

`IPC_CHANNELS` は `SKILL_CREATOR_RUNTIME_CHANNELS` をスプレッドして生成される。追加後は自動で `IPC_CHANNELS.SKILL_CREATOR_CANCEL` として参照可能になる。追加設定は不要。

### 6. preload/channels.ts への影響

`apps/desktop/src/preload/channels.ts` は `IPC_CHANNELS` をインポートして `ALLOWED_INVOKE_CHANNELS` を構成する。`SKILL_CREATOR_CANCEL` の `ALLOWED_INVOKE_CHANNELS` 登録は TASK-SW-CANCEL-002 のスコープ。本タスクでは変更しない。

## 設計図

```
packages/shared/src/ipc/channels.ts

SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_CREATE: "skill-creator:create",
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
+ SKILL_CREATOR_CANCEL: "skill-creator:cancel",  // 追加
  ...
}

IPC_CHANNELS = {
  ...SKILL_CREATOR_RUNTIME_CHANNELS,  // スプレッドで自動伝播
  ...
}
```

## 統合テスト連携【必須】

| 判定項目                             | 基準 | 結果    |
| ------------------------------------ | ---- | ------- |
| 追加位置・値・命名が確定している     | 確定 | pending |
| 型伝播が自動で行われることが確認済み | 確認 | pending |

## 多角的チェック観点（AIが判断）

- [ ] 既存チャンネルとの値の重複がないか（`"skill-creator:cancel"` が他で使われていないか）
- [ ] `ALLOWED_INVOKE_CHANNELS` への追加を本タスクに含めないことが正しいか

## サブタスク管理

1. 追加位置の決定
2. 値・命名の確定
3. 型伝播の確認
4. 設計書の成果物作成

## 成果物

| 成果物 | パス                        | 説明         |
| ------ | --------------------------- | ------------ |
| 設計書 | `outputs/phase-2/design.md` | 設計内容一式 |

## 完了条件

- [ ] 追加位置・値・命名が確定している
- [ ] 型伝播の確認が完了している
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビューゲート
