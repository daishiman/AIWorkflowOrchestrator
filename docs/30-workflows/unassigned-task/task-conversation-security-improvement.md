# 会話履歴UIセキュリティ改善 - タスク指示書

## メタ情報

```yaml
issue_number: 498
```

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | SEC-CONV-UI-001                          |
| タスク名     | conversation-security-improvement        |
| 分類         | セキュリティ                             |
| 対象機能     | 会話履歴UI - MessageBubbleコンポーネント |
| 優先度       | 低                                       |
| 見積もり規模 | 小規模                                   |
| ステータス   | 未実施                                   |
| 発見元       | Phase 11（手動テスト）                   |
| 発見日       | 2026-01-25                               |
| 依存タスク   | UI-CONV-HISTORY-001（完了）              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UI-CONV-HISTORY-001で会話履歴UIコンポーネントを実装した際、MessageBubbleコンポーネントでマークダウンコンテンツをHTML表示するために`dangerouslySetInnerHTML`を使用している。現状では信頼されたLLM出力のみを表示するため、即時リスクは低いが、将来的なセキュリティ強化のためにサニタイズ処理の追加が推奨される。

### 1.2 問題点・課題

| 課題                     | 説明                                                      |
| ------------------------ | --------------------------------------------------------- |
| XSS脆弱性の可能性        | `dangerouslySetInnerHTML`で未サニタイズHTMLを出力している |
| 防御的プログラミング不足 | DOMPurifyによるサニタイズが未実装                         |
| コードレビュー指摘対象   | セキュリティ監査でフラグされる可能性                      |

### 1.3 放置した場合の影響

- 将来的に外部データソースからのコンテンツを表示する場合、XSS攻撃のリスク
- セキュリティ監査での指摘事項となる可能性
- 防御的プログラミングの原則に反する状態の継続

---

## 2. 何を達成するか（What）

### 2.1 目的

MessageBubbleコンポーネントのHTML出力にDOMPurifyサニタイズ処理を追加し、XSS攻撃に対する防御層を確立する。

### 2.2 最終ゴール

- `dangerouslySetInnerHTML`に渡すHTMLがすべてDOMPurifyでサニタイズされている
- マークダウン表示機能が既存通り動作する
- テストカバレッジが維持されている

### 2.3 スコープ

#### 含むもの

| 項目               | 説明                           |
| ------------------ | ------------------------------ |
| DOMPurify導入      | パッケージインストール、型定義 |
| MessageBubble修正  | サニタイズ処理追加             |
| ユニットテスト追加 | サニタイズ処理のテスト         |

#### 含まないもの

| 項目                     | 説明                         |
| ------------------------ | ---------------------------- |
| 他コンポーネントの修正   | MessageBubble以外は対象外    |
| マークダウンパーサー変更 | 既存のmarked設定は変更しない |
| E2Eテスト                | 別タスクとして管理           |

### 2.4 成果物

| 成果物            | パス                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------ |
| DOMPurify依存関係 | `package.json`                                                                       |
| MessageBubble修正 | `apps/desktop/src/renderer/components/conversation/MessageBubble.tsx`                |
| ユニットテスト    | `apps/desktop/src/renderer/components/conversation/__tests__/MessageBubble.test.tsx` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [x] UI-CONV-HISTORY-001完了（会話履歴UI実装）
- [x] MessageBubbleコンポーネント動作確認済み

### 3.2 依存タスク

| タスクID            | 状態 | 説明           |
| ------------------- | ---- | -------------- |
| UI-CONV-HISTORY-001 | 完了 | 会話履歴UI実装 |

### 3.3 必要な知識

- React + TypeScript
- DOMPurify API
- XSS攻撃の基本知識

### 3.4 推奨アプローチ

1. DOMPurifyパッケージをインストール
2. MessageBubbleコンポーネントにサニタイズ処理を追加
3. 既存テストが通ることを確認
4. XSSペイロードを含むテストケースを追加

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 説明                  |
| ----- | ------------ | --------------------- |
| 1     | 依存関係追加 | DOMPurifyインストール |
| 2     | 実装         | サニタイズ処理追加    |
| 3     | テスト       | テスト追加・確認      |

### Phase 1: 依存関係追加

#### 目的

DOMPurifyパッケージをプロジェクトに追加する。

#### 手順

1. パッケージインストール

   ```bash
   pnpm --filter @repo/desktop add dompurify
   pnpm --filter @repo/desktop add -D @types/dompurify
   ```

2. 型定義確認

#### 完了条件

- [ ] dompurifyパッケージがインストールされている
- [ ] @types/dompurifyがインストールされている

### Phase 2: 実装

#### 目的

MessageBubbleコンポーネントにDOMPurifyサニタイズ処理を追加する。

#### 手順

1. DOMPurifyをインポート
2. `dangerouslySetInnerHTML`に渡すHTMLをサニタイズ
3. コード例：

```typescript
import DOMPurify from 'dompurify';

// 変更前
<span dangerouslySetInnerHTML={{ __html: part }} />

// 変更後
<span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(part) }} />
```

#### 完了条件

- [ ] DOMPurify.sanitize()が適用されている
- [ ] 既存の表示機能が正常動作する

### Phase 3: テスト

#### 目的

サニタイズ処理の動作確認とXSSペイロードのテスト。

#### 手順

1. 既存テストの実行確認
2. XSSペイロードテストケース追加

```typescript
it('should sanitize XSS payloads', () => {
  const xssPayload = '<script>alert("xss")</script>';
  render(<MessageBubble message={{ ...mockMessage, content: xssPayload }} />);
  expect(screen.queryByText('alert')).not.toBeInTheDocument();
});
```

#### 完了条件

- [ ] 既存テストが全てPASS
- [ ] XSSサニタイズテストがPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] DOMPurifyによるサニタイズが実装されている
- [ ] マークダウン表示機能が正常動作する
- [ ] コードブロックのシンタックスハイライトが正常動作する

### 品質要件

- [ ] 既存テストが全てPASS
- [ ] XSSサニタイズテストが追加されている
- [ ] TypeScript型エラーゼロ
- [ ] ESLintエラーゼロ

### ドキュメント要件

- [ ] 変更内容がコメントで説明されている

---

## 6. 検証方法

### テストケース

| カテゴリ      | テスト内容                    | 件数 |
| ------------- | ----------------------------- | ---- |
| 既存テスト    | MessageBubble既存テスト全PASS | 28   |
| XSSサニタイズ | script/img/onloadタグの無効化 | 3+   |

### 検証手順

1. `pnpm --filter @repo/desktop test MessageBubble` 全件PASS確認
2. 手動確認: マークダウンコンテンツの表示確認
3. 手動確認: XSSペイロードが実行されないことを確認

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                       |
| ------------------ | ------ | -------- | -------------------------- |
| 表示崩れ           | 中     | 低       | 既存テストで表示機能を確認 |
| パフォーマンス低下 | 低     | 低       | DOMPurifyは高速、問題なし  |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                           | 内容                                         |
| -------------------- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| チャット履歴仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | UI型定義、コンポーネント構成、完了タスク記録 |
| セキュリティ実装仕様 | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | セキュリティ要件・実装パターン               |

### 関連ドキュメント

| ドキュメント        | パス                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| 発見課題リスト      | `docs/30-workflows/conversation-history-ui-implementation/outputs/phase-11/discovered-issues.md`    |
| 実装ガイド          | `docs/30-workflows/conversation-history-ui-implementation/outputs/phase-12/implementation-guide.md` |
| MessageBubble実装   | `apps/desktop/src/renderer/components/conversation/MessageBubble.tsx`                               |
| MessageBubbleテスト | `apps/desktop/src/renderer/components/conversation/__tests__/MessageBubble.test.tsx`                |

### 参考資料

- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

## 9. 備考

### Phase 11 発見課題の原文

```
#### MINOR-001: MessageBubbleのマークダウン処理セキュリティ

| 項目     | 内容                                                                  |
| -------- | --------------------------------------------------------------------- |
| 対象     | `apps/desktop/src/renderer/components/conversation/MessageBubble.tsx` |
| 現状     | `dangerouslySetInnerHTML`で未サニタイズHTML出力                       |
| リスク   | XSS攻撃の可能性（低：信頼されたLLM出力のみ表示）                      |
| 推奨対応 | DOMPurify.sanitize()でサニタイズ後に出力                              |
| 影響度   | 低                                                                    |
| 対応方針 | 別タスクとして管理（セキュリティ改善タスク）                          |
```

### 補足事項

- 本タスクは低優先度であり、セキュリティ監査やコードレビューに備えた防御的対策
- 現状では信頼されたLLM出力のみを表示するため、即時リスクは低い
