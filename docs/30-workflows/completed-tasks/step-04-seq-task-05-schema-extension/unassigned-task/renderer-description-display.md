# 未タスク: Renderer での description 表示

## メタ情報

| 項目         | 値                                    |
| ------------ | ------------------------------------- |
| タスクID候補 | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY |
| 発見元       | TASK-LLM-MOD-05 Phase 2 設計          |
| 優先度       | 低                                    |
| 種別         | UI機能追加                            |

## 概要

`PROVIDER_CONFIGS` の各モデルに設定された `description` フィールドを、
Renderer 側のモデル選択 UI（`InlineModelSelector` 等）に表示する。

## 対象ファイル（推定）

- `apps/desktop/src/renderer/components/` 配下のモデル選択コンポーネント
- `InlineModelSelector` またはそれに相当するコンポーネント

## 実装候補

- ツールチップとして表示
- モデル名の下にサブテキストとして表示
- ドロップダウンメニュー内の補足説明として表示

## 前提条件

- TASK-LLM-MOD-05 完了済み（全19モデルに description 設定済み）
- IPC 経由で `model.description` が Renderer に到達済み
