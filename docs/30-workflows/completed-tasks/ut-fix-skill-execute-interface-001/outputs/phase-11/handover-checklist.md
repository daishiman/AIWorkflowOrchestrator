# Phase 11 引き継ぎチェックリスト

## 実装担当への引き継ぎ項目（Task 11-2）

### 1. 契約正本と変換境界

- [ ] `SkillExecutionRequest { skillName: string; prompt: string; workingDirectory?: string }` を正式外部契約として採用
- [ ] `{ skillId: string; params?: Record<string, unknown> }` を後方互換契約として維持
- [ ] `skillName → skillId` 変換点を Main ハンドラ内の1箇所（`scanAvailableSkills()` → `skills.find()`）に固定
- [ ] 型ガード `isSkillNameRequest` で `"skillName" in payload` によりルート分岐

### 2. セキュリティ

- [ ] `validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, { getAllowedWindows: () => [mainWindow] })` を維持
- [ ] P42準拠 3段バリデーション: skillName/skillId の両パスで実装
  - typeof check → 空文字列 check → trim 空文字列 check
- [ ] エラーサニタイズ: 内部情報を漏洩せず `error.message` のみ返却

### 3. テスト

- [ ] 3テストファイルを確認・更新（実装変更がある場合）
  - `skillHandlers.execute.test.ts`: 23テスト
  - `skillHandlers.validation.test.ts`: 55テスト
  - `skillHandlers.delegate.test.ts`: 12テスト
- [ ] 合計90テスト全PASS を維持
- [ ] High優先度ケース（バリデーション不正、スキル不存在、サービス例外）を優先的に確認

### 4. 品質

- [ ] カバレッジゲート: Line 90%以上 / Branch 85%以上 / High優先度ケース100%
- [ ] Open Items 処理状況の確認

### 5. 文書

- [ ] Phase 12 の Step 1-A（完了タスク記録: LOGS.md 2ファイル + SKILL.md 2ファイル）
- [ ] Phase 12 の Step 1-B（実装状況テーブル更新）
- [ ] Phase 12 の Step 1-C（関連タスクテーブル同期）
- [ ] Phase 12 の Step 2（仕様本文更新: interfaces-agent-sdk-skill.md / security-skill-ipc.md）

### 6. 既知の落とし穴（参照必須）

| Pitfall | 内容                       | 確認ポイント                                             |
| ------- | -------------------------- | -------------------------------------------------------- |
| P42     | .trim() バリデーション漏れ | 全文字列引数に3段バリデーションが適用されているか        |
| P44     | IPC契約不整合              | Preload側の引数形式とMain側の期待が一致しているか        |
| P45     | 引数命名ドリフト           | skillName/skillId のセマンティクスが実態と一致しているか |

## 抜け漏れ確認

- [x] 要件: Phase 1 の受入基準と照合済み
- [x] 設計: Phase 2 のアーキテクチャと照合済み
- [x] テスト: Phase 4/6/7 のテスト設計・カバレッジと照合済み
- [x] 品質: Phase 9/10 の品質検証結果と照合済み
- [x] 文書更新: Phase 12 の必須5タスクを引き継ぎ項目に含めている

## 完了記録

- [x] Task 11-2 完了
- [x] 引き継ぎ項目6カテゴリ整理完了
- [x] 既知の落とし穴（P42/P44/P45）を明示
- [x] Phase 11タスク実行率: 100%
