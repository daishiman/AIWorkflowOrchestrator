# Electron Main Process サービス / history bundle

> 親仕様書: [arch-electron-services.md](arch-electron-services.md)
> 役割: history bundle

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                    |
| ---------- | ---------- | ------------------------------------------------------------------------------------------- |
| 6.38.0     | 2026-03-15 | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 反映: `RuntimeResolver` / `TerminalHandoffBuilder` の DI 配線、`registerSkillHandlers` / `registerAgentExecutionHandlers` の注入シグネチャ、`skill:execute` / `agent:start` の integrated/handoff 分岐契約を追記 |
| 6.37.1     | 2026-03-05 | SkillService/SkillExecutor 統合フローのDI記述を現行実装へ同期。`registerSkillHandlers(mainWindow, skillService, authKeyService)` と `new SkillExecutor(mainWindow, undefined, authKeyService)` を正本化 |
| 6.37.0     | 2026-02-28 | TASK-9E反映: `SkillForker` サービスをスキル管理コンポーネントへ追加。`skill:fork` IPC契約、`SkillForkOptions/Result/Metadata` 型、Path境界検証（prefix一致すり抜け防止）を仕様化 |
| 6.36.0     | 2026-02-27 | TASK-9G反映: SkillScheduler / ScheduleStore セクション追加。Main IPC 初期化配線（`ipc/index.ts`）と SchedulerSkillExecutor アダプタ構成、5チャネルの責務分離を追記 |
| 6.35.0     | 2026-02-26 | TASK-9B反映: SkillCreatorService（Facade）APIを12メソッドで明文化し、サブコンポーネント（HearingFacilitator / TaskGenerator / CodeGenerator / ApiIntegrator / SkillValidator）の責務を追加 |
| 6.34.0     | 2026-02-21 | UT-FIX-SKILL-IMPORT-INTERFACE-001反映: `skill:import` IPC引数を `skillName: string` に更新（ハンドラー内で `[skillName]` 配列化）。UT-FIX-SKILL-IMPORT-RETURN-TYPE-001反映: 戻り値を `ImportedSkill` に更新 |
| 6.33.0     | 2026-02-20 | UT-FIX-SKILL-REMOVE-INTERFACE-001反映: `skill:remove` IPC引数を `skillName: string` に更新 |
| 6.32.0     | 2026-02-07 | TASK-FIX-4-2完了: SkillImportManager永続化実装詳細セクション追加（型バリデーション・SkillStoreインターフェース・デバッグフラグ・テストファイル構成） |
| 6.31.0     | 2026-02-01 | TASK-8C-E完了: E2Eテストフィクスチャセクション追加（3フィクスチャ仕様・検証テスト29ケース） |
| 6.30.0     | 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換                                          |

---

## 関連ドキュメント

- [アーキテクチャパターン概要](./architecture-patterns.md)
- [IPC・永続化パターン](./arch-ipc-persistence.md)
- [インターフェース定義（Agent SDK）](./interfaces-agent-sdk.md)
