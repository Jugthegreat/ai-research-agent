from anthropic import Anthropic
from config import settings

client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

print("Testing Anthropic API tool capabilities...")
print("=" * 60)

try:
    # Test 1: Simple message
    print("\n1️⃣ Testing basic API call...")
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=100,
        messages=[{"role": "user", "content": "Say 'API works!'"}]
    )
    print(f"✅ Basic API works: {response.content[0].text}")
    
    # Test 2: With tools
    print("\n2️⃣ Testing with web_search tool...")
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Who is the current president of the USA? Please search the web."}],
        tools=[{
            "type": "web_search_20250305",
            "name": "web_search"
        }]
    )
    
    print(f"✅ Tool request sent successfully")
    print(f"📊 Response blocks: {len(response.content)}")
    
    for i, block in enumerate(response.content):
        print(f"\nBlock {i+1}:")
        print(f"  Type: {block.type}")
        if block.type == "tool_use":
            print(f"  ✅ TOOL WAS USED!")
            print(f"  Tool name: {block.name}")
        elif block.type == "text":
            print(f"  Text: {block.text[:200]}...")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print(f"Error type: {type(e).__name__}")
    if "tool" in str(e).lower():
        print("\n⚠️  The web_search tool may not be available on your API tier.")
        print("Check: https://console.anthropic.com/settings/keys")

print("\n" + "=" * 60)