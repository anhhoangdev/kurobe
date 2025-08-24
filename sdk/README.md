# Kurobe SDK

Production-ready BI chat platform SDK with pluggable engines.

## Installation

```bash
pip install kurobe
```

## Usage

```python
from kurobe import KurobeClient

client = KurobeClient(api_key="your-api-key")
response = client.ask_question("What are our top sales this month?")
print(response)
```

## Features

- Question-driven BI interface
- Pluggable engine architecture
- Multi-database connector support
- Real-time dashboard generation
- Type-safe API client

## Documentation

For full documentation, visit [docs.kurobe.ai](https://docs.kurobe.ai)
