# Phase 1 要件定義サマリー

## 概要

`RuntimeSkillCreatorFacade` の 3 操作を、
public `skill-creator:*` IPC / preload / shared types に統合するための要件を定義した。

## 機能要件

- FR-1: public channel として `skill-creator:plan` / `skill-creator:execute-plan` / `skill-creator:improve-skill` を公開する
- FR-2: Renderer から `planSkill` / `executePlan` / `improveSkillWithFeedback` を呼べるようにする
- FR-3: shared types に request / response / terminal handoff contract を追加する
- FR-4: `skillCreatorHandlers.ts` を public entrypoint とし、runtime helper を内部統合する
- FR-5: runtime service 不在時も固定 failure message を返す degraded path を維持する

## 非機能要件

- NFR-1: runtime public 3 ハンドラ全てに `validateIpcSender` を適用する
- NFR-2: エラー文言は `sanitizeErrorMessage` を通し内部情報を露出しない
- NFR-3: 文字列入力は P42 準拠の 3 段バリデーションを行う
- NFR-4: internal role 名を public payload に含めない
- NFR-5: 既存 `skill-creator:*` 12 invoke + 1 progress との後方互換性を守る

## スコープ外

- `SkillCreatorService` と `RuntimeSkillCreatorFacade` のクラス統合
- Renderer UI の追加実装
- PR 作成や push
