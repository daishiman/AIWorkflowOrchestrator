# [#1729] [task-imp-skill-md-encoding-detection-006] SKILL.md エンコーディング自動検出対応

## メタ情報

```yaml
issue_number: 1729
title: [task-imp-skill-md-encoding-detection-006] SKILL.md エンコーディング自動検出対応
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-03-29
updated_date: 2026-03-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1729
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 背景・目的

UTF-8以外のエンコーディングで作成されたSKILL.mdがサイレントに文字化けして処理される問題がある。エンコーディング自動検出により、誤検証を防止する。

## スコープ

- `readFileContent()` private helperのエンコーディング検出対応
- BOM付きUTF-8の適切な処理
- UTF-16, Shift-JIS等の検出とエラーハンドリング
- エンコーディングエラー時の適切なcheck result返却

## 現状

Phase 12 実装では `readFileContent(path)` は graceful ファイル読み込み (null on error) として実装されているが、エンコーディング検出は未対応。

`hasMarkdownSection()` や `hasH1Heading()` が文字化けしたコンテンツを処理する際に false negative が発生しうる。

## 技術的コンテキスト

現在のhelper実装:

```ts
private readFileContent(path): null on error  // graceful読み込み
private hasMarkdownSection(content, heading)  // Markdownセクション検出
private hasH1Heading(content)                 // H1 heading検出
```

## 参照

- Phase 12 implementation guide: `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-12/implementation-guide.md`
- VerificationEngine: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
