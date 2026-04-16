# ILogger インターフェース定義 - タスク指示書

```yaml
issue_number: 2204
```

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | TASK-SC-LOGGER-IFACE-001                                                 |
| タスク名     | SkillCreatorService 用 ILogger インターフェース定義                      |
| 分類         | 改善                                                                     |
| 対象機能     | SkillCreator / テスタビリティ                                            |
| 優先度       | 低                                                                       |
| 見積もり規模 | 小規模                                                                   |
| ステータス   | 未実施                                                                   |
| 発見元       | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 Phase 12 スキルフィードバック |
| 発見日       | 2026-04-16                                                               |
| Issue番号    | #2204                                                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillCreatorService` に `logger` プライベートフィールドが追加されたが、
ILogger インターフェースが未定義のため、テスト時にロガーをモック化できない。
現状は `vi.spyOn(console, 'warn')` のような粗い方法でしかログ出力を検証できない。

### 1.2 問題点・課題

- `SkillCreatorService` のコンストラクタでloggerの型が `typeof console` 相当になっており、テスト容易性が低い
- ILogger インターフェースを定義すれば、テストで `jest.fn()` / `vi.fn()` を使ったモックが可能になる
- 将来的に複数サービスが同じloggerパターンを使う場合に統一インターフェースがない

### 1.3 発見時の状況（苦戦箇所）

TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 の実装で `generateSkillMd` の
エラーログを検証しようとした際、`vi.spyOn(console, 'warn')` しか手段がなかった。
ILogger インターフェースがあれば `const mockLogger = { warn: vi.fn(), info: vi.fn(), error: vi.fn() }`
を DI できるため、ログ出力の精密な検証が可能になる。

---

## 2. 何を達成するか（What）

### 2.1 目的

`ILogger` インターフェースを定義し、`SkillCreatorService` へのコンストラクタインジェクションを可能にすることで、
ユニットテストでのモック化を実現する。

### 2.2 スコープ

#### 含むもの

- `ILogger` インターフェース定義（`packages/shared` または `apps/desktop/src/main/types/` に配置）
- `SkillCreatorService` の logger 型を `ILogger` に変更
- テストコードの `vi.spyOn(console,...)` を `mockLogger` パターンに更新

#### 含まないもの

- 実際のログ実装の変更（Winston や Pino への移行等）
- SkillService 以外のサービスへの適用

---

## 3. 実行手順

| Phase | 内容                               | 目安 |
| ----- | ---------------------------------- | ---- |
| 1     | ILogger インターフェース設計・配置 | 0.5h |
| 2     | SkillCreatorService への適用       | 0.5h |
| 3     | テストコード更新                   | 0.5h |

---

## 4. 完了条件チェックリスト

- [ ] `ILogger` インターフェースが定義されている
- [ ] `SkillCreatorService` のコンストラクタで `ILogger` を受け取れる
- [ ] テストでモックロガーを使ったログ出力検証ができる
- [ ] `pnpm --filter @repo/desktop test` がすべて PASS する

---

## 5. 参照情報

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（logger フィールド）
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（現在の spyOn パターン）

---

## 6. 備考

TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 の Phase 12 スキルフィードバックレポートにて
改善提案として記録された。優先度は低いが、テスタビリティ向上として効果的。
