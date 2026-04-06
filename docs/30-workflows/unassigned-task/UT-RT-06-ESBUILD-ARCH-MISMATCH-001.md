# UT-RT-06-ESBUILD-ARCH-MISMATCH-001

## 概要

Playwright / Vite / Electron 環境で発生する esbuild の arch mismatch を吸収する follow-up。

## 背景

- `darwin-arm64` と `darwin-x64` の optional dependency が不整合だと、Vite の dep-scan や Playwright の browser 起動が失敗する。
- 現在のワークツリーでは `pnpm rebuild esbuild` や Playwright browser install が必要になるケースがある。

## 実行タスク

1. install / rebuild / screenshot capture の前提を整理する。
2. esbuild の native binary mismatch を自動検出するガードを検討する。
3. エラー時の案内を docs に明記し、手順を再現可能にする。
4. 失敗時に代替の evidence 収集方法を定義する。

## 完了条件

- screenshot / Vite / test 実行のための前提が明文化されている。
- arch mismatch に遭遇したときの再実行手順が一本化されている。
- 同種の blocker が次回以降の close-out で再発しにくい。
