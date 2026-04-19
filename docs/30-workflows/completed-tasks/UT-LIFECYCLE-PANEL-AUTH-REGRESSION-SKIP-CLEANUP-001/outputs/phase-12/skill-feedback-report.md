# Phase 12: スキルフィードバックレポート

## フィードバック件数

**改善提案: 2件**

## FB-01: close-out parity を自己申告で閉じない

- 観点: `outputs/artifacts.json` だけ completed でも、root `artifacts.json` と `index.md` が stale なまま残り得る
- 提案: `task-specification-creator` に `index.md` / root `artifacts.json` / `outputs/artifacts.json` の三者比較 guard を追加する

## FB-02: cleanup task の削除境界を follow-up へ昇格する

- 観点: 旧 UI 依存テストを削除した時、rapid click / rerender のような境界条件が silently 消えやすい
- 提案: `describe.skip` cleanup 系テンプレートに「削除で失う保証点を follow-up として formalize する」手順を追加する
