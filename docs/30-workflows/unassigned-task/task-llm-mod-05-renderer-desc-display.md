# 未タスク: TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY

## メタ情報

| 項目       | 値                                                                |
| ---------- | ----------------------------------------------------------------- |
| タスクID   | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY                             |
| 発見元     | TASK-LLM-MOD-05 Phase 2 設計・Phase 12 未タスク検出（2026-03-30） |
| 優先度     | 低                                                                |
| 種別       | UI機能追加                                                        |
| ステータス | 未着手                                                            |

## 概要

`PROVIDER_CONFIGS` の各モデルに設定された `description` フィールドを、
Renderer 側のモデル選択 UI（`InlineModelSelector` 等）に表示する。

TASK-LLM-MOD-05 により全 19 モデルに `description` が設定され、
IPC 経由で `model.description` が Renderer に到達している。
現時点では UI への表示未実装のため、ユーザーに補足説明が届いていない。

## 前提条件

- TASK-LLM-MOD-05 完了済み（`packages/shared/src/types/llm/schemas/provider-registry.ts`）
- `ProviderModelEntry.description?: string` フィールド定義済み
- `LLMModelSchema` に `description` optional フィールド追加済み
- `handleGetProviders()` → IPC → Renderer への透過は実装済み

## 対象ファイル（推定）

- `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`
- `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`（フルパネル版）
- 関連 CSS / Tailwind クラス

## 実装候補

| 表示方式         | 優先度 | 備考                                     |
| ---------------- | ------ | ---------------------------------------- |
| ツールチップ     | 高     | モデル名にホバーで description を表示    |
| サブテキスト     | 中     | ドロップダウン内のモデル名下に小さく表示 |
| アクセシビリティ | 必須   | `aria-describedby` / `title` 属性を追加  |

## 受け入れ条件

- [ ] `InlineModelSelector` の各モデル選択肢で description が参照可能
- [ ] description が空の場合は表示なし（`description?.length > 0` ガード）
- [ ] 既存テストが PASS を維持
- [ ] 新規テストケースを追加（description 表示・非表示の両ケース）

## 関連

- 完了タスク: `docs/30-workflows/step-04-seq-task-05-schema-extension/`
- 仕様書: `packages/shared/src/types/llm/schemas/provider-registry.ts`
- backlog: `references/task-workflow-backlog.md` (TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY)
