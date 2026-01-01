#!/bin/bash

# Add table of contents to markdown files exceeding 100 lines

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REFERENCES_DIR="$SCRIPT_DIR/../references"

# Function to generate TOC for a file
generate_toc() {
    local file="$1"
    local temp_file="${file}.tmp"

    # Check if file already has TOC
    if grep -q "^## 目次" "$file" || grep -q "^## Table of Contents" "$file"; then
        echo "Skipping $file (already has TOC)"
        return
    fi

    # Extract headings (## and ###)
    local toc="## 目次\n\n"

    while IFS= read -r line; do
        if [[ "$line" =~ ^###[[:space:]](.+)$ ]]; then
            # Level 3 heading
            local heading="${BASH_REMATCH[1]}"
            local anchor=$(echo "$heading" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9ぁ-んァ-ヶー一-龠]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
            toc+="  - [$heading](#$anchor)\n"
        elif [[ "$line" =~ ^##[[:space:]](.+)$ ]]; then
            # Level 2 heading (skip "目次" itself)
            local heading="${BASH_REMATCH[1]}"
            if [[ "$heading" != "目次" && "$heading" != "Table of Contents" ]]; then
                local anchor=$(echo "$heading" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9ぁ-んァ-ヶー一-龠]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
                toc+="- [$heading](#$anchor)\n"
            fi
        fi
    done < "$file"

    # Create temp file with TOC
    {
        # Get first line (should be # Title)
        head -n 1 "$file"
        echo ""
        echo -e "$toc"
        echo "---"
        echo ""
        # Get rest of file (skip first line)
        tail -n +2 "$file"
    } > "$temp_file"

    # Replace original file
    mv "$temp_file" "$file"
    echo "Added TOC to $file"
}

# Process all markdown files exceeding 100 lines
for file in "$REFERENCES_DIR"/*.md; do
    if [ -f "$file" ]; then
        line_count=$(wc -l < "$file")
        if [ "$line_count" -gt 100 ]; then
            generate_toc "$file"
        fi
    fi
done

echo "TOC generation completed"
