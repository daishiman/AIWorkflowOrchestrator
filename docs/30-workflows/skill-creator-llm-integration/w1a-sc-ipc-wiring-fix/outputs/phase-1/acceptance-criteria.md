# 受入基準

> タスクID: TASK-SC-01-IPC-WIRING-FIX
> 作成日: 2026-03-23
> Phase: 1 - 要件定義

## 機能要件

### FR-1: namespace 統一

全 Skill Creator IPC チャネルが `skill-creator:` prefix を使用すること。

### FR-2: channels.ts 定数管理

全16チャネルが `IPC_CHANNELS` 定数で管理され、ハードコード文字列が存在しないこと。

### FR-3: Preload allowlist 網羅

全16チャネルが Preload の invoke/on allowlist に含まれること。

### FR-4: 責務分離

- skillCreatorHandlers.ts: 既存 Skill Creator 操作（13チャネル）
- creatorHandlers.ts: Runtime Skill Creator 操作（3チャネル）

## 受入基準

### AC-1: P65 dead-end namespace が存在しないこと

`grep -rn` で旧 `creator:*` namespace が0件であること。

### AC-2: channels.ts に全16定数が定義されていること

### AC-3: ハードコード文字列が0件であること（P27準拠）

### AC-4: 全テストが PASS すること

### AC-5: カバレッジ基準を充足すること

- Line Coverage >= 80%
- Branch Coverage >= 60%
- Function Coverage >= 80%

### AC-6: Lint / TypeCheck が PASS すること

### AC-7: P65 再発防止テストが追加されていること

- IPC-P65-001: dead-end namespace 不在テスト
- IPC-P65-002: prefix 統一確認テスト
- IPC-AL-001: invoke allowlist 網羅テスト
- IPC-AL-002: on allowlist 網羅テスト

## 充足状況

| 基準 | 状態                        |
| ---- | --------------------------- |
| AC-1 | PASS                        |
| AC-2 | PASS                        |
| AC-3 | PASS                        |
| AC-4 | PASS（183テスト全PASS）     |
| AC-5 | PASS（L94%+, B92%+, F100%） |
| AC-6 | PASS                        |
| AC-7 | PASS（4テスト追加済み）     |
