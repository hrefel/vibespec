#!/bin/bash

# Test script for VibeSpec CLI with different providers
# Usage: ./test-providers.sh [provider]
# Providers: openrouter, openai, claude, heuristic

PROVIDER=${1:-openrouter}
INPUT_FILE="test-openrouter.txt"
OUTPUT_FILE="test-output-${PROVIDER}.json"

echo "🧪 Testing VibeSpec CLI with provider: $PROVIDER"
echo "================================================"
echo ""

if [ "$PROVIDER" = "heuristic" ]; then
    echo "📝 Running heuristic-only mode (no AI)..."
    node dist/index.js parse "$INPUT_FILE" --output "$OUTPUT_FILE" --no-cache
else
    echo "🤖 Running with AI provider: $PROVIDER"

    # Check if API key is set
    case $PROVIDER in
        openrouter)
            if [ -z "$OPENROUTER_API_KEY" ]; then
                echo "❌ Error: OPENROUTER_API_KEY not set"
                echo "   Sign up at https://openrouter.ai/ and set your key:"
                echo "   export OPENROUTER_API_KEY=your-key-here"
                exit 1
            fi
            ;;
        openai)
            if [ -z "$OPENAI_API_KEY" ]; then
                echo "❌ Error: OPENAI_API_KEY not set"
                exit 1
            fi
            ;;
        claude)
            if [ -z "$ANTHROPIC_API_KEY" ]; then
                echo "❌ Error: ANTHROPIC_API_KEY not set"
                exit 1
            fi
            ;;
    esac

    node dist/index.js parse "$INPUT_FILE" --output "$OUTPUT_FILE" --provider "$PROVIDER" --no-cache
fi

echo ""
echo "================================================"
echo "✅ Test complete!"
echo ""
echo "📄 Output saved to: $OUTPUT_FILE"
echo ""
echo "To view the output:"
echo "  cat $OUTPUT_FILE | jq ."
echo ""
echo "To test other providers:"
echo "  ./test-providers.sh openrouter  # Free tier available"
echo "  ./test-providers.sh openai"
echo "  ./test-providers.sh claude"
echo "  ./test-providers.sh heuristic   # No API key needed"
