from anthropic import Anthropic
from config import settings
from typing import AsyncGenerator, Dict, List, Optional
import json
import re

class ResearchAgent:
    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = "claude-opus-4-20250514"
        print(f"✅ Agent initialized with model: {self.model}")
        
    def should_search(self, query: str) -> bool:
        """Determine if we need to search the web."""
        search_keywords = [
            'current', 'latest', 'recent', 'today', 'now', 'this year', '2025', '2026',
            'who is', 'what is the current', 'president', 'ceo', 'news', 'weather',
            'stock price', 'score', 'winner', 'election', 'update', 'right now'
        ]
        
        query_lower = query.lower()
        should_search = any(keyword in query_lower for keyword in search_keywords)
        print(f"🔍 Should search: {should_search} for query: '{query}'")
        return should_search
        
    async def research_and_respond(
        self, 
        query: str, 
        chat_history: List[Dict[str, str]] = None
    ) -> AsyncGenerator[Dict, None]:
        """Process query with web search."""
        
        print(f"\n{'='*60}")
        print(f"📝 Query: {query}")
        print(f"{'='*60}")
        
        # Build messages
        messages = []
        if chat_history:
            for msg in chat_history:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        messages.append({
            "role": "user",
            "content": query
        })
        
        # Check if search needed
        use_search = self.should_search(query)
        
        if use_search:
            print("🌐 WEB SEARCH ENABLED")
            yield {
                "type": "thinking",
                "content": "🔍 Searching the web..."
            }
            
            system_prompt = """You are a research assistant with web search capabilities.

When asked about current events or recent information, use the web_search tool to find accurate, up-to-date information. Then synthesize the results and cite sources as [Title](URL)."""

            request_params = {
                "model": self.model,
                "max_tokens": 4096,
                "messages": messages,
                "system": system_prompt,
                "tools": [{
                    "type": "web_search_20250305",
                    "name": "web_search"
                }]
            }
        else:
            print("💡 Using knowledge base")
            system_prompt = "You are a helpful assistant."
            request_params = {
                "model": self.model,
                "max_tokens": 4096,
                "messages": messages,
                "system": system_prompt,
            }

        try:
            current_text = ""
            tool_used = False
            search_executed = False
            sources = []
            
            with self.client.messages.stream(**request_params) as stream:
                for event in stream:
                    event_type = getattr(event, 'type', None)
                    
                    if not event_type:
                        continue
                    
                    # Check for tool usage events
                    if event_type == "content_block_start":
                        content_block = getattr(event, 'content_block', None)
                        if content_block:
                            block_type = getattr(content_block, 'type', None)
                            
                            # Look for server_tool_use (the correct type!)
                            if block_type in ["tool_use", "server_tool_use"]:
                                tool_used = True
                                print(f"🔧 Tool detected: {block_type}")
                                yield {
                                    "type": "thinking",
                                    "content": "🌐 Executing web search..."
                                }
                            
                            # Look for search results
                            elif block_type == "web_search_tool_result":
                                search_executed = True
                                print(f"✅ Web search completed!")
                                yield {
                                    "type": "thinking",
                                    "content": "📊 Analyzing search results..."
                                }
                    
                    # Stream text content
                    elif event_type == "content_block_delta":
                        delta = getattr(event, 'delta', None)
                        if delta:
                            delta_type = getattr(delta, 'type', None)
                            if delta_type == "text_delta":
                                text = getattr(delta, 'text', '')
                                if text:
                                    current_text += text
                                    yield {
                                        "type": "text",
                                        "content": text
                                    }
            
            print(f"\n✅ Complete - Tool used: {tool_used}, Search executed: {search_executed}")
            print(f"📝 Response: {len(current_text)} chars")
            
            # Extract sources from markdown links
            source_pattern = r'\[([^\]]+)\]\(([^\)]+)\)'
            found_sources = re.findall(source_pattern, current_text)
            
            if found_sources:
                sources = [{"title": title, "url": url} for title, url in found_sources]
                print(f"🔗 Found {len(sources)} sources")
            
            # Build thinking summary
            if search_executed:
                thinking = "✅ Web search executed successfully\n"
                thinking += f"📊 Found {len(sources)} sources\n"
                thinking += "🤖 Synthesized current information"
            elif tool_used:
                thinking = "🔧 Tool was called\n"
                thinking += "💡 Processed response"
            elif use_search:
                thinking = "⚠️ Search requested but not executed\n"
                thinking += "💡 Using available knowledge"
            else:
                thinking = "💡 Answered from knowledge base"
            
            yield {
                "type": "done",
                "sources": sources,
                "thinking": thinking
            }
            
            yield {
                "type": "complete"
            }
                
        except Exception as e:
            print(f"❌ Error: {e}")
            yield {
                "type": "error",
                "content": f"Error: {str(e)}"
            }