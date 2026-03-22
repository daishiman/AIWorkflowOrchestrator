# アーキテクチャ総論 / history bundle

> 親仕様書: [architecture-overview.md](architecture-overview.md)
> 役割: history bundle

## テンプレート

新規仕様書作成時は以下のテンプレートを使用してください。

| テンプレート | 用途 | パス |
|------------|-----|-----|
| spec-template.md | 汎用仕様書 | templates/ |
| architecture-template.md | アーキテクチャ | templates/ |
| interfaces-template.md | 型定義 | templates/ |
| ipc-channel-template.md | IPC仕様 | templates/ |
| service-template.md | サービス仕様 | templates/ |
| ui-ux-template.md | UI/UX仕様 | templates/ |
| api-template.md | API仕様 | templates/ |
| react-hook-template.md | Hook仕様 | templates/ |
| database-template.md | DB仕様 | templates/ |
| security-template.md | セキュリティ | templates/ |
| testing-template.md | テスト仕様 | templates/ |

---

## 関連ドキュメント

### アーキテクチャ詳細

| ドキュメント | 内容 |
|------------|-----|
| [architecture-patterns.md](./architecture-patterns.md) | パターンインデックス |
| [architecture-monorepo.md](./architecture-monorepo.md) | モノレポ構成 |
| [arch-state-management.md](./arch-state-management.md) | 状態管理 |
| [arch-electron-services.md](./arch-electron-services.md) | Electronサービス |
| [arch-ipc-persistence.md](./arch-ipc-persistence.md) | IPC・永続化 |
| [arch-ui-components.md](./arch-ui-components.md) | UIコンポーネント |
| [arch-claude-cli.md](./arch-claude-cli.md) | Claude CLI連携 |

### セキュリティ

| ドキュメント | 内容 |
|------------|-----|
| [security-principles.md](./security-principles.md) | セキュリティ原則・認証 |
| [security-electron-ipc.md](./security-electron-ipc.md) | Electron IPC |
| [security-api.md](./security-api.md) | APIセキュリティ |
| [security-skill-execution.md](./security-skill-execution.md) | スキル実行 |

### UI/UX

| ドキュメント | 内容 |
|------------|-----|
| [ui-ux-design-principles.md](./ui-ux-design-principles.md) | デザイン原則・UX法則 |
| [ui-ux-components.md](./ui-ux-components.md) | コンポーネント概要 |

### 開発ガイドライン

| ドキュメント | 内容 |
|------------|-----|
| [development-guidelines.md](./development-guidelines.md) | ロギング・キャッシング・マイグレーション・コードレビュー・命名規則・デバッグ・リリース |
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | フロントエンド/バックエンド/デスクトップ/パフォーマンス/セキュリティ実装パターン |
| [quality-requirements.md](./quality-requirements.md) | 非機能要件・テスト戦略 |
| [error-handling.md](./error-handling.md) | エラーハンドリング仕様 |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| v2.18.5 | 2026-03-21 | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 反映: `registerSkillCreatorHandlers` を `mainWindow + SkillCreatorService + optional RuntimeSkillCreatorFacade` の 3 引数構成へ更新し、チャンネル数を 16（15 invoke + 1 progress）へ同期。runtime public 3 チャンネルと graceful degradation 前提を Architecture Overview に反映 |
| v2.18.4 | 2026-03-11 | TASK-SKILL-LIFECYCLE-01 完了同期: `SkillCenterView` を lifecycle primary entry surface として追記し、`App.tsx` の `normalizeSkillLifecycleView()` による `skill-center` alias canonicalization を Desktop Renderer レイアウト構成へ反映 |
| v2.18.3 | 2026-03-06 | TASK-UI-02 反映: Desktop Renderer の標準レイアウトを `AppLayout + GlobalNavStrip + MobileNavBar` へ更新し、`uiSlice` の nav状態、feature flag rollback path、`useNavShortcuts` の戻る導線を追記 |
| v2.18.2 | 2026-03-02 | TASK-10A-C反映: `registerSkillHandlers` の対応チャネルへ `skill:create` を追加し、Pattern 3 の関連タスクに TASK-10A-C を追記 |
| v2.18.1 | 2026-03-02 | TASK-UI-05B 実装完了同期: Skill Advanced Views の状態を `spec_created` から `実装完了` へ更新し、4ビューの実装導線（App navigation + direct routing）を反映 |
| v2.18.0 | 2026-03-01 | TASK-UI-05B spec_created を反映: UI/UXアーキテクチャにSkill Advanced Views（4ビュー/33コンポーネント）を追加。ディレクトリ構造にビューディレクトリを追記 |
| 1.9.0 | 2026-02-28 | TASK-9E反映: `registerSkillHandlers` を実装準拠で Pattern 3（`mainWindow + service`）へ修正。`skill:fork` を含むチャネル責務、`SkillForker` への委譲、sender検証/P42/サニタイズの統合境界を追記 |
| 1.8.0 | 2026-02-27 | TASK-9H反映: `registerSkillDebugHandlers` を IPC ハンドラー登録一覧へ追加。Pattern 3 詳細に 7チャネル（6 invoke + 1 event）、`SkillDebugger` 配線、vm サンドボックス方針を追記 |
| 1.9.0 | 2026-02-28 | TASK-9I反映: IPC ハンドラー登録一覧に `registerSkillDocsHandlers` を追加（Pattern 3: mainWindow + service）。4チャネル（skill:docs:generate/preview/export/templates）と Pattern 3 詳細を追記 |
| 1.9.0 | 2026-02-28 | TASK-9J: スキル分析・統計機能追加（SkillAnalytics, AnalyticsStore, 5 IPCチャネル, 8型定義） |
| 1.8.0 | 2026-02-27 | TASK-9G反映: IPC ハンドラー登録一覧に `registerSkillScheduleHandlers` を追加（Pattern 4: mainWindow + service + store）。5チャネル（skill:schedule:list/add/update/delete/toggle）と DI 構成（SkillScheduler + ScheduleStore）を追記 |
| 1.7.0 | 2026-02-26 | TASK-9B反映: `registerSkillCreatorHandlers` のチャンネル数を 13（12 invoke + 1 progress）へ更新。Pattern 3 詳細に拡張7チャンネルを追記し、Main Process構造の `services/skill-creator/` 誤記を `services/skill/` に修正 |
| 1.6.0 | 2026-02-12 | TASK-9B-H: SkillCreatorService追加。IPCハンドラー登録一覧セクション新設、Facadeパターン・ディレクトリ構造にskill-creator追加 |
| 1.5.0 | 2026-01-26 | 仕様ガイドライン完全準拠: ASCII図（依存方向図、IPC通信図）を表形式に変換 |
| 1.4.0 | 2026-01-26 | 仕様ガイドライン準拠: ディレクトリ構造を表形式に変換、参照名修正 |
| 1.3.0 | 2026-01-26 | 実装パターン総合ガイド参照追加 |
| 1.2.0 | 2026-01-26 | 開発ガイドライン参照追加 |
| 1.1.0 | 2026-01-26 | ディレクトリ構造、データ構造、機能追加パターン、テンプレート追加 |
| 1.0.0 | 2026-01-26 | 初版作成 - アーキテクチャ総論 |
