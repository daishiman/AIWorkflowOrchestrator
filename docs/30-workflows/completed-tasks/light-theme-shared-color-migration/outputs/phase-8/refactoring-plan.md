# Phase 8 Output: Refactoring Plan

## 判定

大きな helper 抽出は実施しない。

## 理由

- 今回の責務は hardcoded color migration であり、style helper 化まで広げると batch 境界を跨ぐ
- semantic token 置換だけで可読性改善と guard 化が達成できた
- manual-test harness は本番 code path に乗せず、`phase11-*` に閉じる方が安全

## 実施した最小整理

- hardcoded color guard を 1 ファイルへ集約
- Phase 11 用 selector が不足する箇所にのみ `data-testid` を追加

## 実施しなかった refactor

- shared status style helper の新設
- `SettingsView` / `ApiKeysSection` の構造分割
- token constant の再定義
