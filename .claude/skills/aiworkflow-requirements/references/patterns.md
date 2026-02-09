# AIWorkflowOrchestrator 実装パターン集

> 本ドキュメントは、プロジェクト開発で蓄積された成功/失敗パターンを記録し、
> 再利用可能なナレッジベースとして機能します。

## クイックナビゲーション

| ドメイン | 成功パターン | 失敗パターン |
|----------|-------------|-------------|
| Preload/IPC | SkillAPI統一, safeInvoke/safeOn | API二重定義, ハードコード文字列 |
| 型定義 | 単一型定義源, Result型 | 型アサーション多用, 二重管理 |
| テスト | モック戦略, カバレッジ基準 | テスト間状態リーク |

---

## 成功パターン

### [Preload] SkillAPI統一パターン（TASK-FIX-5-1）

- **状況**: Preload層で同一APIが2パス（`window.skillAPI` + `window.electronAPI.skill`）で公開
- **アプローチ**: `window.electronAPI.skill` に統一、`contextBridge.exposeInMainWorld("skillAPI", ...)` 削除
- **結果**: 型定義の一元化、テストモック簡素化、保守性向上
- **適用条件**: API公開パスが複数存在し、型定義の二重管理が発生している場合
- **発見日**: 2026-02-06
- **関連タスク**: TASK-FIX-5-1-SKILL-API-UNIFICATION

### [Preload] safeInvoke/safeOnセキュリティパターン

- **状況**: ipcRenderer.invoke/on の直接呼び出しによるセキュリティリスク
- **アプローチ**: ホワイトリスト検証付きラッパー関数を作成
- **結果**: 未承認チャンネルのブロック、クリーンアップ関数によるリスナーリーク防止
- **適用条件**: Electron Preload層でのIPC通信実装時
- **発見日**: 2026-02-06
- **関連ファイル**: architecture-implementation-patterns.md


### mockReturnValue vs mockReturnValueOnce のテスト間リーク防止パターン

- **状況**: IPCハンドラーのセキュリティテストで特殊な戻り値を設定する必要があった
- **問題**: `mockReturnValue` で設定したモック戻り値が後続テストに漏れ、テスト間で状態が共有される
- **解決策**:
  - `mockReturnValueOnce` で1回限りのモック設定にする
  - `beforeEach` でモック関数をデフォルト状態にリセット
- **結果**: テスト間の状態分離が実現し、独立したテスト実行が可能に
- **適用条件**: 同一モック関数に対して複数の異なる戻り値パターンをテストする場合
- **発見日**: 2026-02-09（TASK-FIX-17-1-SKILL-SCAN-HANDLER）
- **関連**: 06-known-pitfalls.md#P23

---

## 失敗パターン（苦戦パターン）

### [P23] API二重定義による型定義の二重管理

- **状況**: `window.skillAPI` と `window.electronAPI.skill` の両方が公開
- **問題**: 型定義を2箇所（types.d.ts, types.ts）で管理、変更忘れリスク
- **原因**: 歴史的経緯でAPIパスが増殖
- **教訓**: API公開パスは1つに統一し、型定義を1箇所に集約
- **発見日**: 2026-02-06
- **詳細**: 06-known-pitfalls.md#P23

### [P24] 呼び出し元コードの参照先分散

- **状況**: hooks/store/components で参照パスが混在
- **問題**: リファクタリング時の漏れ、新規開発者の判断曖昧化
- **原因**: 統一ルールの欠如
- **教訓**: API呼び出しは統一パスを使用、lint ルールで強制
- **発見日**: 2026-02-06
- **詳細**: 06-known-pitfalls.md#P24

### [P25] Store型定義の不統一による型アサーション発生

- **状況**: API統一後もagentSliceが旧Skill型を参照
- **問題**: `as unknown as Skill[]` 型アサーションが残存
- **原因**: 影響範囲調査で状態管理層を見落とし
- **教訓**: API型変更時は逆方向の依存（Renderer→Preload）も確認
- **発見日**: 2026-02-06
- **詳細**: 06-known-pitfalls.md#P25, UT-FIX-5-1-001

### [P26] OperationResult廃止の波及範囲調査不足

- **状況**: 戻り値型をラッパーから直接型に変更
- **問題**: 8ファイルに影響波及、段階的発見
- **原因**: 事前の全使用箇所リストアップ不足
- **教訓**: `grep -rn` で全使用箇所を事前リスト化
- **発見日**: 2026-02-06
- **詳細**: 06-known-pitfalls.md#P26

### [P27] contextIsolation + safeInvoke パターンの実装複雑性

- **状況**: Electronセキュリティモデルとサ IPC通信パターンを同時実装
- **問題**: contextBridge制限、ホワイトリスト検証、クリーンアップ実装漏れ
- **原因**: 複数概念の同時学習負荷
- **教訓**: セキュリティ仕様書（04-electron-security.md）を事前精読
- **発見日**: 2026-02-06
- **詳細**: 06-known-pitfalls.md#P27

### [P28] 削除タイプのリファクタリングにおける手動確認忘れ

- **状況**: `window.skillAPI` 削除後の確認
- **問題**: 自動テストPASSでも実際の削除確認漏れリスク
- **原因**: 手動テストチェックリストの不備
- **教訓**: Phase 11に「削除対象のDevTools確認」を明示追加
- **発見日**: 2026-02-06
- **詳細**: 06-known-pitfalls.md#P28

---

## ガイドライン

### 型定義変更時のチェックリスト

1. [ ] `grep -rn "変更対象型"` で全使用箇所をリスト化
2. [ ] 状態管理層（Store/Slice）の型参照を確認
3. [ ] テストモックの型定義を更新
4. [ ] 段階的置換プラン（Preload層→呼び出し側→古い定義削除）を策定

### API統一時のチェックリスト

1. [ ] 統一先パスを決定（推奨: `window.electronAPI.*`）
2. [ ] 旧パスの全参照箇所を検索
3. [ ] 呼び出し側を統一パスに移行
4. [ ] 旧パスの公開コード（`contextBridge.exposeInMainWorld`）を削除
5. [ ] DevToolsで旧パスが `undefined` であることを確認

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| **1.0.0** | **2026-02-09** | 初版作成。TASK-FIX-5-1の成功/失敗パターン（P23-P28）を記録 |
