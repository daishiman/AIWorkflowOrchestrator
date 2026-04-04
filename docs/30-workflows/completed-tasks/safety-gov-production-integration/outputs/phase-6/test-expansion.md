# Phase 6: Test Expansion

## 概要

Phase 6 では fail-path / edge case を追加し、Safety Governance production 統合の境界条件を補強した。

## 追加した主な観点

- `registerAllIpcHandlers()` の複数回呼び出し安全性
- `DefaultApprovalGate` のインスタンス独立性
- `pushApprovalRequest()` の破棄済み window / webContents ガード
- `revokeAll()` の冪等性、並行セッション分離、レース条件
- preload `safeInvoke` / `safeOn` の不正チャネル拒否と listener cleanup

## 参照

詳細な件数とテスト一覧は `../phase-6-7/test-coverage-report.md` を参照。
