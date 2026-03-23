# テストケース一覧

> タスクID: TASK-SC-01-IPC-WIRING-FIX
> 作成日: 2026-03-23
> Phase: 4 - テスト作成

## テスト総数: 183テスト（5ファイル）

## テストファイル構成

| ファイル                     | テスト数     | 対象                 |
| ---------------------------- | ------------ | -------------------- |
| skillCreatorHandlers.test.ts | 既存テスト群 | 13チャネルのハンドラ |
| creatorHandlers.test.ts      | 既存テスト群 | 3チャネルのハンドラ  |
| channels.test.ts             | 既存テスト群 | 定数定義             |
| ipc-p65-guard.test.ts        | 2            | P65再発防止          |
| ipc-allowlist-guard.test.ts  | 2            | allowlist網羅性      |

## 追加テスト（4件）

### IPC-P65-001: dead-end namespace 不在テスト

- **目的**: 旧 `creator:*` namespace のハンドラが存在しないことを検証
- **検証方法**: ハンドラ登録後に `creator:` prefix（`skill-creator:` を除く）のチャネルが0件であることを確認

### IPC-P65-002: prefix 統一確認テスト

- **目的**: 全 Skill Creator チャネルが `skill-creator:` prefix を持つことを検証
- **検証方法**: channels.ts の SKILL_CREATOR セクション全定数値が `skill-creator:` で開始することを確認

### IPC-AL-001: invoke allowlist 網羅テスト

- **目的**: 全 invoke チャネル（15件）が Preload allowlist に含まれることを検証
- **検証方法**: channels.ts の invoke 対象定数と INVOKE_ALLOWED_CHANNELS の集合比較

### IPC-AL-002: on allowlist 網羅テスト

- **目的**: 全 on チャネル（1件: progress）が Preload allowlist に含まれることを検証
- **検証方法**: channels.ts の on 対象定数と ON_ALLOWED_CHANNELS の集合比較

## 既存テストカテゴリ

- ハンドラ登録/解除テスト
- バリデーションテスト（P42準拠3段バリデーション）
- 正常系レスポンステスト
- エラー系レスポンステスト
- サービス委譲テスト
- 送信元検証テスト
