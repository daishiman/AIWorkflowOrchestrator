# システム仕様書更新サマリ

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-24             |

## 更新判定

本タスクは `apps/desktop/src/main/ipc/index.ts` の DI 配線修正（1ファイル）のみであり、以下の理由によりシステム仕様書の実更新は不要と判定した:

1. **IPC チャンネル構成に変更なし**: 既存の `skill-creator:*` ハンドラの引数/戻り値の契約は変更されない
2. **アーキテクチャ変更なし**: DI の依存方向（IPC 層 → サービス層）は既存設計と同一
3. **新規インターフェースなし**: `RuntimeSkillCreatorFacadeDeps` の型定義は変更されない（既存 optional フィールドへの値注入のみ）
4. **新規 IPC namespace なし**: P65 準拠で既存 namespace のみ使用

## 更新が必要になるケース

UT-SC-05-UT-1（LLM プロバイダー動的切替）が実装された場合:

- `RuntimeSkillCreatorFacadeDeps` に `llmAdapterFactory` フィールドが追加される
- `architecture-implementation-patterns.md` に Factory Injection パターンの追加が必要
