# Phase 1 要件サマリー

## 目的

インポート済みスキルの `SKILL.md` とサブリソースを GUI で編集する機能を、Renderer/Preload/Main の責務分離を維持して実現する。

## 確定要件（実装反映）

- FR-1/2: ファイルツリー表示とファイル選択読み込みを実装（`skill.readFile`）。
- FR-3/4: 編集・未保存判定・保存を実装（`skill.writeFile`、`Cmd/Ctrl+S`）。
- FR-5/6: 新規作成・削除（SKILL.md 削除禁止）を実装（`skill.createFile` / `skill.deleteFile`）。
- FR-7/8: バックアップ一覧と復元を実装（`skill.listBackups` / `skill.restoreBackup`）。
- FR-9: 未保存変更時の遷移警告（保存/破棄/キャンセル）を実装。
- NFR-1: Renderer 直接FSアクセス禁止、IPC経由のみ。
- NFR-3: `role="tree"/"treeitem"` と矢印キー移動を実装。

## エレガント化判断

- 旧案の `skillSlice` 追加は採用せず、`agentSlice` 統合方針と競合しないよう `SkillEditor` ローカル状態に集約。
- これにより関心ごとの分離（編集UI状態 vs グローバル実行状態）を維持し、P31（Store無限ループ）を回避。

## SubAgent分担

- A: UI機能要件
- B: IPC/セキュリティ要件
- C: テスト可能性要件
- D: ドキュメント要件

## 判定

PASS
