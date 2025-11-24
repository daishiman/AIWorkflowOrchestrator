#!/bin/bash

# ステータスレポート自動生成スクリプト
# Usage: ./generate-status-report.sh [project-name] [sprint-number]

PROJECT_NAME=${1:-"Project"}
SPRINT_NUMBER=${2:-"1"}
DATE=$(date +%Y-%m-%d)
REPORT_DIR="reports"
REPORT_FILE="${REPORT_DIR}/status-report-sprint-${SPRINT_NUMBER}-${DATE}.md"

# レポートディレクトリ作成
mkdir -p ${REPORT_DIR}

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Generating Status Report for ${PROJECT_NAME} - Sprint ${SPRINT_NUMBER}${NC}"

# メトリクス収集（プレースホルダー - 実際のプロジェクトでは適切なツールから取得）
VELOCITY="21"
COMPLETED_STORIES="5"
IN_PROGRESS="3"
BLOCKED="1"
COMPLETION_RATE="85"

# レポート生成
cat > ${REPORT_FILE} << EOF
# ${PROJECT_NAME} - Sprint ${SPRINT_NUMBER} Status Report

**Date**: ${DATE}
**Report Type**: Sprint Status Update

## Executive Summary

Sprint ${SPRINT_NUMBER} is currently ${COMPLETION_RATE}% complete with ${COMPLETED_STORIES} stories delivered and ${IN_PROGRESS} in progress. We have ${BLOCKED} blocked item requiring attention.

## Key Metrics

### Sprint Progress
- **Velocity**: ${VELOCITY} points
- **Completed Stories**: ${COMPLETED_STORIES}
- **In Progress**: ${IN_PROGRESS}
- **Blocked**: ${BLOCKED}
- **Completion Rate**: ${COMPLETION_RATE}%

### Burndown Status
\`\`\`
Ideal Remaining: $((VELOCITY * (100 - COMPLETION_RATE) / 100))
Actual Remaining: $((VELOCITY * (100 - COMPLETION_RATE) / 100 + 2))
Trend: Slightly Behind
\`\`\`

## Completed This Sprint

1. **User Authentication Module**
   - OAuth2 integration completed
   - 2FA implementation finished
   - Security audit passed

2. **Dashboard Redesign**
   - New UI components deployed
   - Performance improved by 40%
   - Mobile responsiveness added

3. **API Rate Limiting**
   - Implementation complete
   - Documentation updated
   - Client libraries updated

## In Progress

1. **Payment Integration** (60% complete)
   - Stripe SDK integrated
   - Testing in progress
   - Expected completion: 2 days

2. **Search Functionality** (40% complete)
   - Elasticsearch setup done
   - Indexing in progress
   - UI development started

3. **Notification System** (30% complete)
   - Architecture designed
   - Email service configured
   - Push notification pending

## Blockers & Risks

### 🔴 Critical
- **Third-party API Dependency**: Waiting for vendor to fix authentication issue
  - Impact: Payment integration delayed
  - Mitigation: Escalated to vendor management

### 🟡 Medium
- **Resource Availability**: Key developer on sick leave
  - Impact: Search functionality may slip
  - Mitigation: Knowledge transfer to backup developer

### 🟢 Low
- **Environment Issue**: Staging server needs upgrade
  - Impact: Testing efficiency reduced
  - Mitigation: Upgrade scheduled for next sprint

## Upcoming Milestones

| Milestone | Target Date | Status | Confidence |
|-----------|------------|---------|------------|
| Beta Release | ${DATE} | On Track | High |
| Security Audit | $(date -d "+7 days" +%Y-%m-%d 2>/dev/null || date +%Y-%m-%d) | Scheduled | Medium |
| Production Deploy | $(date -d "+14 days" +%Y-%m-%d 2>/dev/null || date +%Y-%m-%d) | Planning | Medium |

## Resource Utilization

- **Development Team**: 85% utilized
- **QA Team**: 90% utilized
- **DevOps**: 70% utilized
- **Product/Design**: 60% utilized

## Action Items

1. **Immediate Actions**
   - [ ] Follow up with vendor on API issue (Owner: Tech Lead)
   - [ ] Complete knowledge transfer for search module (Owner: Senior Dev)
   - [ ] Review and approve payment flow (Owner: Product Owner)

2. **Next Sprint Planning**
   - [ ] Prioritize backlog items for Sprint ${SPRINT_NUMBER + 1}
   - [ ] Address technical debt items
   - [ ] Plan for security audit preparation

## Stakeholder Feedback

Recent feedback from stakeholders:
- "Dashboard improvements are impressive" - CEO
- "Need more visibility on payment timeline" - CFO
- "User experience is significantly better" - Customer Success

## Recommendations

1. **Increase QA capacity** for next sprint to handle increased testing load
2. **Schedule architecture review** for notification system
3. **Plan buffer time** for third-party integration challenges

## Appendix

### Velocity Trend
\`\`\`
Sprint 1: 18 points
Sprint 2: 20 points
Sprint 3: 21 points (current)
Average: 19.7 points
\`\`\`

### Team Health Metrics
- Morale: 8/10
- Collaboration: 9/10
- Innovation: 7/10
- Work-Life Balance: 7/10

---

*Report generated on ${DATE}*
*Next report due: $(date -d "+7 days" +%Y-%m-%d 2>/dev/null || date +%Y-%m-%d)*
*Questions? Contact: product-owner@company.com*
EOF

echo -e "${GREEN}✓ Report generated successfully: ${REPORT_FILE}${NC}"

# オプション: HTMLバージョンの生成（pandocが必要）
if command -v pandoc &> /dev/null; then
    HTML_FILE="${REPORT_DIR}/status-report-sprint-${SPRINT_NUMBER}-${DATE}.html"
    pandoc ${REPORT_FILE} -o ${HTML_FILE} --standalone --metadata title="${PROJECT_NAME} Status Report"
    echo -e "${GREEN}✓ HTML version generated: ${HTML_FILE}${NC}"
fi

# オプション: PDFバージョンの生成（wkhtmltopdfが必要）
if command -v wkhtmltopdf &> /dev/null; then
    PDF_FILE="${REPORT_DIR}/status-report-sprint-${SPRINT_NUMBER}-${DATE}.pdf"
    wkhtmltopdf ${HTML_FILE} ${PDF_FILE} 2>/dev/null
    echo -e "${GREEN}✓ PDF version generated: ${PDF_FILE}${NC}"
fi

# サマリーを表示
echo ""
echo -e "${YELLOW}Report Summary:${NC}"
echo "- Sprint Number: ${SPRINT_NUMBER}"
echo "- Completion Rate: ${COMPLETION_RATE}%"
echo "- Velocity: ${VELOCITY} points"
echo "- Blocked Items: ${BLOCKED}"
echo ""
echo -e "${GREEN}Report generation complete!${NC}"