#!/bin/bash

# Knowledge Validation Script
# Purpose: Validate knowledge documents against quality standards

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to check metadata
check_metadata() {
    local file=$1
    local errors=0

    echo "Checking metadata in $file..."

    # Check for required metadata fields
    if ! grep -q "^## メタデータ" "$file"; then
        print_error "Missing metadata section"
        ((errors++))
    fi

    if ! grep -q "作成日:" "$file"; then
        print_error "Missing creation date"
        ((errors++))
    fi

    if ! grep -q "最終更新:" "$file"; then
        print_error "Missing last updated date"
        ((errors++))
    fi

    if ! grep -q "バージョン:" "$file"; then
        print_error "Missing version"
        ((errors++))
    fi

    if [ $errors -eq 0 ]; then
        print_success "Metadata complete"
    fi

    return $errors
}

# Function to check required sections
check_required_sections() {
    local file=$1
    local errors=0

    echo "Checking required sections in $file..."

    required_sections=(
        "概要"
        "いつ使うか"
        "前提条件"
        "核心概念"
        "ワークフロー"
        "ベストプラクティス"
        "トラブルシューティング"
        "例"
        "変更履歴"
    )

    for section in "${required_sections[@]}"; do
        if ! grep -q "^## $section" "$file"; then
            print_error "Missing required section: $section"
            ((errors++))
        fi
    done

    if [ $errors -eq 0 ]; then
        print_success "All required sections present"
    fi

    return $errors
}

# Function to check file size
check_file_size() {
    local file=$1
    local max_lines=500
    local line_count=$(wc -l < "$file")

    echo "Checking file size of $file..."

    if [ $line_count -gt $max_lines ]; then
        print_error "File exceeds $max_lines lines (current: $line_count lines)"
        print_warning "Consider splitting into resources"
        return 1
    else
        print_success "File size OK ($line_count lines)"
        return 0
    fi
}

# Function to check for placeholder content
check_placeholders() {
    local file=$1
    local errors=0

    echo "Checking for placeholder content in $file..."

    placeholders=(
        "\[.*\]"
        "YYYY-MM-DD"
        "TODO"
        "TBD"
    )

    for placeholder in "${placeholders[@]}"; do
        if grep -q "$placeholder" "$file"; then
            print_warning "Found placeholder: $placeholder"
            ((errors++))
        fi
    done

    if [ $errors -eq 0 ]; then
        print_success "No placeholders found"
    else
        print_warning "$errors placeholder(s) found - please review"
    fi

    return 0  # Warnings, not errors
}

# Function to check for stale content
check_staleness() {
    local file=$1
    local max_age_days=180  # 6 months

    echo "Checking staleness of $file..."

    # Extract last updated date
    local last_updated=$(grep "最終更新:" "$file" | sed 's/.*: //')

    if [ -z "$last_updated" ] || [ "$last_updated" = "YYYY-MM-DD" ]; then
        print_warning "Last updated date not set or is placeholder"
        return 0
    fi

    # Calculate age (simplified - assumes date format YYYY-MM-DD)
    local current_date=$(date +%s)
    local updated_date=$(date -j -f "%Y-%m-%d" "$last_updated" +%s 2>/dev/null || echo 0)

    if [ $updated_date -eq 0 ]; then
        print_warning "Could not parse date: $last_updated"
        return 0
    fi

    local age_days=$(( (current_date - updated_date) / 86400 ))

    if [ $age_days -gt $max_age_days ]; then
        print_warning "Content is $age_days days old (> $max_age_days days) - consider reviewing"
    else
        print_success "Content is fresh ($age_days days old)"
    fi

    return 0
}

# Main validation function
validate_knowledge_file() {
    local file=$1
    local total_errors=0

    echo "==========================================="
    echo "Validating: $file"
    echo "==========================================="

    check_metadata "$file" || ((total_errors += $?))
    check_required_sections "$file" || ((total_errors += $?))
    check_file_size "$file" || ((total_errors += $?))
    check_placeholders "$file" || ((total_errors += $?))
    check_staleness "$file" || ((total_errors += $?))

    echo ""
    if [ $total_errors -eq 0 ]; then
        print_success "Validation passed for $file"
        return 0
    else
        print_error "Validation failed with $total_errors error(s) for $file"
        return 1
    fi
}

# Main script
main() {
    if [ $# -eq 0 ]; then
        echo "Usage: $0 <knowledge-file.md> [<knowledge-file2.md> ...]"
        exit 1
    fi

    local failed=0

    for file in "$@"; do
        if [ ! -f "$file" ]; then
            print_error "File not found: $file"
            ((failed++))
            continue
        fi

        validate_knowledge_file "$file" || ((failed++))
        echo ""
    done

    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}All validations passed!${NC}"
        exit 0
    else
        echo -e "${RED}$failed file(s) failed validation${NC}"
        exit 1
    fi
}

main "$@"
