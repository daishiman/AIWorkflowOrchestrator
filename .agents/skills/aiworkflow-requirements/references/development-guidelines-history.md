# 開発ガイドライン / history bundle

> 親仕様書: [development-guidelines.md](development-guidelines.md)
> 役割: history bundle

## 関連ドキュメント

| ドキュメント                                           | 内容                                |
| ------------------------------------------------------ | ----------------------------------- |
| [quality-requirements.md](./quality-requirements.md)   | 非機能要件・テスト戦略              |
| [quality-e2e-testing.md](./quality-e2e-testing.md)     | E2Eテスト仕様（スキル選択フロー等） |
| [error-handling.md](./error-handling.md)               | エラーハンドリング仕様              |
| [security-principles.md](./security-principles.md)     | セキュリティ原則                    |
| [architecture-overview.md](./architecture-overview.md) | アーキテクチャ全体像                |
| [glossary.md](./glossary.md)                           | 用語集                              |

---

## 完了タスク

### TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001（2026-02-20完了）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| 概要 | `@repo/shared` サブパス追加時の同期手順（`exports` / `paths` / `alias` / `tsup entry`）を標準化 |
| 成果物 | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/documentation-changelog.md` |

---

## 変更履歴

| Version | Date       | Changes                                                                                   |
| ------- | ---------- | ----------------------------------------------------------------------------------------- |
| 1.9.0   | 2026-03-06 | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001: AuthMode の現行P31対策を更新。`useEffect([initializeAuthMode])` を標準とし、`useAuthModeStore()` は互換用 deprecated hook として扱う運用へ改訂 |
| 1.8.0   | 2026-02-20 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: `@repo/shared` サブパス追加時の同期手順を追加（`exports`/`paths`/`alias`/`tsup entry` 同時更新、補助型宣言取り込みルール） |
| 1.7.0   | 2026-02-14 | TASK-FIX-14-1: Skill系Main Processログ規約を追加（electron-log必須、プレフィックス、テスト方針、TASK-FIX-14-2継続管理） |
| 1.6.0   | 2026-02-12 | UT-STORE-HOOKS-TEST-REFACTOR-001: Zustand Hook テスト戦略（renderHookパターン）セクション追加 |
| 1.5.0   | 2026-02-12 | UT-STORE-HOOKS-REFACTOR-001: Zustand Store Hooks無限ループ防止（P31対策）セクション追加  |
| 1.4.0   | 2026-02-03 | TASK-9A-A: Vitestテスト固有の問題と解決策セクション追加（ESModuleモッキング回避パターン） |
| 1.3.0   | 2026-02-02 | E2Eテスト仕様（quality-e2e-testing.md）への参照リンク追加                                 |
| 1.2.0   | 2026-01-26 | 仕様ガイドライン準拠: コード例削除、文章・表形式に変更                                    |
| 1.1.0   | 2026-01-26 | 命名規則、デバッグガイド、リリースプロセス、バックアップ・リカバリ、環境構築ガイド追加    |
| 1.0.0   | 2026-01-26 | 初版作成                                                                                  |

