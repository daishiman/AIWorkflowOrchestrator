# Phase 8 パストラバーサル対策

## Main層

- `SkillFileManager.validatePath` で最終防御。

## Renderer層

- 新規作成時に `..` を拒否（早期失敗）。

## 判断

- 防御責務は Main に一元化し、Renderer はUX向上の軽量チェックに限定。

## 結論

設計整合（PASS）。
