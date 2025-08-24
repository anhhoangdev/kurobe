"""
Basic usage example for Kurobe BI Platform
"""
import asyncio
from kurobe import KurobeClient
from kurobe.bi import ConnectionPool, ConnectionConfig


async def main():
    # Initialize the Kurobe client
    client = KurobeClient(
        api_key="your-api-key-here",
        api_url="http://localhost:8000/api"
    )
    
    # Example 1: Create a simple question
    print("=== Creating a Question ===")
    question = await client.Question.create(
        text="What are the top 10 products by revenue in Q4 2024?",
        connection_ids=["sales-db"],
        tags=["revenue", "products", "quarterly"]
    )
    print(f"Question created: {question._question_id}")
    
    # Wait for processing
    await asyncio.sleep(2)
    
    # Get the generated panels
    panels = await question.get_panels()
    print(f"Generated {len(panels)} panels")
    
    for panel in panels:
        print(f"- {panel.title} ({panel.type})")
    
    # Example 2: Continue the conversation
    print("\n=== Continuing the Conversation ===")
    chat_response = await question.chat(
        "Can you break this down by category?"
    )
    print(f"Assistant: {chat_response.message.content}")
    
    # Example 3: Create a dashboard from panels
    if panels:
        print("\n=== Creating a Dashboard ===")
        dashboard = await client.Dashboard.create(
            name="Q4 2024 Revenue Analysis",
            description="Top products and category breakdown",
            panel_ids=[panel.id for panel in panels[:2]],  # Add first 2 panels
            tags=["revenue", "Q4-2024"]
        )
        print(f"Dashboard created: {dashboard.name}")
    
    # Example 4: Working with connections (local example)
    print("\n=== Managing Connections ===")
    
    # Create a connection pool
    pool = ConnectionPool()
    
    # Add a PostgreSQL connection
    pg_config = ConnectionConfig(
        name="analytics-pg",
        type="postgres",
        host="localhost",
        port=5432,
        database="analytics",
        username="user",
        password="password"
    )
    
    try:
        pg_conn = await pool.add_connection(pg_config)
        print(f"Connected to {pg_config.name}")
        
        # Test the connection
        if await pg_conn.test_connection():
            print("Connection test successful!")
            
            # Execute a simple query
            result = await pg_conn.execute_query(
                "SELECT COUNT(*) as total_products FROM products"
            )
            print(f"Total products: {result.rows[0][0]}")
    except Exception as e:
        print(f"Connection error: {e}")
    finally:
        await pool.close_all()
    
    # Example 5: List recent questions
    print("\n=== Recent Questions ===")
    recent_questions = await client.Question.list(
        limit=5,
        status="completed"
    )
    
    for q in recent_questions:
        data = await q.get_data()
        print(f"- {data.text} (Status: {data.status})")


if __name__ == "__main__":
    asyncio.run(main())
