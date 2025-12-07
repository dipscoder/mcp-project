from fastmcp import FastMCP
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware import Middleware

load_dotenv()

mcp = FastMCP(name="Personal Notes MCP")


@mcp.tool()
def get_my_notes() -> str:
    """
    Get All the notes for a user
    """
    return "No Notes"


@mcp.tool()
def add_notes(content: str) -> str:
    """
    Add a note for a user
    """
    return f"added note: {content}"


if __name__ == "__main__":
    mcp.run(
        transport="http",
        host="127.0.0.1",
        port=8000,
        middleware=[
            Middleware(
                CORSMiddleware,
                allow_origins=["*"],
                allow_credentials=["*"],
                allow_methods=["*"],
                allow_headers=["*"],
            )
        ],
    )
