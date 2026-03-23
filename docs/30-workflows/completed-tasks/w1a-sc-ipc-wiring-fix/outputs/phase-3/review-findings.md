# レビュー指摘事項

> タスクID: TASK-SC-01-IPC-WIRING-FIX
> 作成日: 2026-03-23
> Phase: 3 - 設計レビュー

## MINOR 指摘一覧

### MINOR-1: IpcResult<T> 型の二重定義

- **指摘内容**: `IpcResult<T>` 型が creatorHandlers.ts と skillCreatorHandlers.ts の両方でローカル定義されている。DRY 原則違反。
- **影響**: 片方の型定義を変更した際にもう片方が追従しないリスク（P23パターン）。
- **推奨対応**: 共通の型定義ファイルに統合する。
- **未タスクID**: UT-SC-01-IPCRESULT-DEDUP
- **優先度**: Low
- **機能影響**: なし（現時点では両方同一定義）

### MINOR-2: DIP 部分違反（creatorHandlers.ts）

- **指摘内容**: `registerCreatorHandlers` の引数型が `RuntimeSkillCreatorFacade`（具象クラス）になっている。P61 教訓に基づき、`RuntimeSkillCreatorPort` インターフェースに変更すべき。
- **影響**: テスト時のモック差し替えが困難になる可能性。
- **推奨対応**: `RuntimeSkillCreatorPort` インターフェースを抽出し、引数型を変更する。
- **未タスクID**: UT-SC-01-DIP-INTERFACE
- **優先度**: Medium
- **機能影響**: なし（動作に変更なし）
