# Skill Feedback Report

## 所見

- `task-specification-creator` の validator 期待値と task spec 本文の命名規約がずれると、structure は通っても phase-output で落ちやすい。
- Phase 11 は UI task か docs-only task かの判定を本文と artifact 名で一致させる必要がある。

## 改善提案

- artifact 命名の canonical 一覧を task root 生成時に先に埋める。
- Phase 12 で `outputs/artifacts.json` の同期を初手チェックへ昇格する。

## 新規 pitfall 候補

- empty `screenshots/` ディレクトリだけが残り、PNG 0 件で validator error になるパターン。
- `esbuild` host/binary version drift により Vitest が起動前に停止し、Phase 12 の close-out 再検証が詰まるパターン。
