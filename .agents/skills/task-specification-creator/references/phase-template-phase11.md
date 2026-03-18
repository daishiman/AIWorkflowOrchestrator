# Phase Template Phase11

## 対象

Phase 11 の manual test。

## タスク種別判定（最初に確認）

| タスク種別 | 判定条件 | 適用セクション |
| --- | --- | --- |
| **設計タスク** | タスク種別が「設計・仕様策定」、UI実装なし | 設計タスク専用セクション（SF-01） |
| **docs-only タスク** | UI変更なし、ドキュメント・設定変更のみ | docs-only task テンプレ |
| **UI タスク** | Renderer コンポーネントの追加・変更あり | docs-only + UI task 追加要件 |

## docs-only task テンプレ

- `SKILL.md` から family file へ辿れるか
- `LOGS.md` から archive へ辿れるか
- `.claude` と `.agents` の file set が一致するか
- validator command を再実行できるか

### ウォークスルーシナリオ発見事項リアルタイム分類欄

各シナリオ実行中に発見した事項を即座に分類するためのテンプレート。
シナリオ完了後にまとめて分類するのではなく、発見時点でリアルタイムに記録する。

| # | シナリオ | 発見事項 | 分類 | 対応方針 |
| - | -------- | -------- | ---- | -------- |
| 1 | A/B/C    | ...      | Blocker / Note / Info | ... |

**分類基準**:
- **Blocker**: Phase 12 完了前に修正必須。仕様整合性・参照リンク切れ・追跡可能性の断絶
- **Note**: 改善推奨だが Phase 12 完了をブロックしない。未タスク化を検討
- **Info**: 記録のみ。今後の参考情報として残す

## UI task 追加要件

- screenshot plan
- screenshot evidence
- Apple UI/UX 視覚レビュー
- coverage matrix

## 必須成果物

| 成果物 | 用途 |
| --- | --- |
| `manual-test-result.md` | walkthrough 結果 |
| `discovered-issues.md` | blocker と note |

## 設計タスク専用セクション（SF-01対応）

**判定基準**: タスク種別が「設計・仕様策定」であり、UI実装が存在しない場合に適用。

### 設計文書ウォークスルー（docs-only Phase 11 の代替テスト方式）

設計タスクでは「手動UIテスト」ではなく「設計文書ウォークスルー」を Phase 11 の主テスト方式とする。

| 確認項目 | 方法 | 必須 |
| --- | --- | --- |
| 仕様書の自己完結性 | 前提条件・受入基準・成果物パスが揃っているか目視確認 | ✅ |
| 型定義・インターフェースの整合 | 定義箇所と参照箇所が一致するか grep 確認 | ✅ |
| スコープ外の未タスク洗い出し | 設計中に「将来実装」とした箇所を列挙 | ✅ |
| Phase 3/10レビュー指摘との照合 | MINOR判定事項が全て記録されているか確認 | ✅ |
| 後続実装タスクへの引き継ぎ情報 | 「型定義→実装」「契約→テスト」の引き継ぎ項目を列挙 | ✅ |

### スクリーンショット対応（P53対策）

設計タスクでは CLI 環境での画面キャプチャは**不要**とする。

| 状況 | 対応方法 |
| --- | --- |
| UIコンポーネントが存在しない | `NON_VISUAL` 判定。スクリーンショット省略可 |
| 型定義・仕様書のみの変更 | `NON_VISUAL` 判定。設計文書ウォークスルーで代替 |
| 関連UIが既存で変更なし | upstream screenshot を current workflow へ集約（必要な場合のみ） |

### UI タスクの CLI 環境でのスクリーンショット取得（P53対応）

UI タスクで Electron を直接起動できない CLI 環境では、**Playwright + Vite dev server パターン**を使用する。

| 手順 | コマンド |
| --- | --- |
| 1. Vite dev server 起動 | `cd apps/desktop && npx vite --config vite.e2e.config.ts &` |
| 2. capture-screenshots.js で撮影 | `node .claude/skills/task-specification-creator/scripts/capture-screenshots.js --workflow <path> --plan <plan.json>` |
| 3. preflight 疎通確認 | `curl -I http://127.0.0.1:4173/` |

詳細は [phase-11-12-guide.md](phase-11-12-guide.md) のセクション A/C を参照。

**記録例**（`manual-test-result.md` 冒頭に明記）:

```markdown
## テスト方式

本タスクは設計タスク（spec_created）のため、UIテストではなく設計文書ウォークスルーを実施。
スクリーンショット: NON_VISUAL（UI実装なし）
```

## 関連ガイド

- [phase-11-screenshot-guide.md](phase-11-screenshot-guide.md)
- [screenshot-verification-procedure.md](screenshot-verification-procedure.md)
