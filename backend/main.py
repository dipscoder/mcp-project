import os

import httpx
from database import MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH, MemoryRepository, init_db
from dotenv import load_dotenv
from fastmcp import FastMCP
from fastmcp.server.auth import BearerAuthProvider
from fastmcp.server.dependencies import AccessToken, get_access_token
from jose import jwt
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import JSONResponse

load_dotenv()

# Stytch configuration for session validation
STYTCH_PROJECT_ID = os.getenv("STYTCH_PROJECT_ID")
STYTCH_SECRET = os.getenv("STYTCH_SECRET")
STYTCH_API_URL = "https://test.stytch.com/v1"


async def get_user_from_session(request: StarletteRequest) -> str | None:
    """Extract user_id from Stytch session token."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    session_token = auth_header[7:]
    if not session_token:
        return None

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{STYTCH_API_URL}/sessions/authenticate",
                auth=(STYTCH_PROJECT_ID, STYTCH_SECRET),
                json={"session_token": session_token},
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("user", {}).get("user_id")
    except Exception:
        pass
    return None


auth = BearerAuthProvider(
    jwks_uri=f"{os.getenv('STYTCH_DOMAIN')}/.well-known/jwks.json",
    issuer=os.getenv("STYTCH_DOMAIN"),
    algorithm="RS256",
    audience=os.getenv("STYTCH_PROJECT_ID"),
)
mcp = FastMCP(name="AI Memory Hub", auth=auth)


def serialize_memory(memory):
    """Convert memory to JSON-serializable dict with timestamps."""
    return {
        "id": memory.id,
        "short_id": memory.short_id,
        "title": memory.title,
        "content": memory.content,
        "created_at": f"{memory.created_at.isoformat()}Z" if memory.created_at else None,
        "updated_at": f"{memory.updated_at.isoformat()}Z" if memory.updated_at else None,
    }


@mcp.tool()
def get_my_memories() -> str:
    """
    Retrieve all stored memories for the authenticated user.

    Use this tool to access the user's personal context, preferences, and notes
    that they have saved for AI assistants. This helps you understand the user's
    background, preferences, and ongoing projects.

    Returns a formatted list of all memories with their unique IDs and titles.
    """
    access_token: AccessToken = get_access_token()
    user_id = jwt.get_unverified_claims(access_token.token)["sub"]

    memories = MemoryRepository.get_memories_by_user(user_id=user_id)
    if not memories:
        return "No memories stored yet. The user hasn't saved any context or preferences."

    result = "User's Stored Memories:\n\n"
    for memory in memories:
        result += f"[{memory.short_id}] {memory.title}\n{memory.content}\n\n"

    return result


@mcp.tool()
def get_memory_by_id(memory_id: str) -> str:
    """
    Fetch a specific memory by its unique short ID.

    Use this tool when the user references a specific memory ID (e.g., "refer to memory abc123")
    or when you need to retrieve detailed information about a particular stored context.

    Args:
        memory_id: The 6-character unique ID of the memory (e.g., "x7k2m9")

    Returns the memory title and content if found, or an error message if not found.
    """
    access_token: AccessToken = get_access_token()
    user_id = jwt.get_unverified_claims(access_token.token)["sub"]

    memory = MemoryRepository.get_memory_by_short_id(short_id=memory_id, user_id=user_id)
    if not memory:
        return f"Memory with ID '{memory_id}' not found. Please check the ID and try again."

    return f"[{memory.short_id}] {memory.title}\n{memory.content}"


@mcp.tool()
def add_memory(title: str, content: str) -> str:
    """
    Store a new memory for the user for future reference by AI assistants.

    Use this tool to save important context about the user, such as:
    - Personal preferences (coding style, preferred tools, languages)
    - Project details (tech stack, architecture decisions)
    - Work context (current tasks, team info)
    - Any information the user wants AI assistants to remember

    Args:
        title: A short, descriptive title for the memory (max 100 chars).
        content: The detailed memory content. Supports markdown formatting.

    Returns confirmation with the assigned memory ID for future reference.
    """
    access_token: AccessToken = get_access_token()
    user_id = jwt.get_unverified_claims(access_token.token)["sub"]

    memory = MemoryRepository.create_memory(user_id=user_id, title=title, content=content)
    return f"Memory saved with ID [{memory.short_id}]: {memory.title}"


@mcp.custom_route("/.well-known/oauth-protected-resource", methods=["GET", "OPTIONS"])
def oauth_metadata(request: StarletteRequest) -> JSONResponse:
    base_url = str(request.base_url).rstrip("/")

    return JSONResponse(
        {
            "resource": base_url,
            "authorization_servers": [os.getenv("STYTCH_DOMAIN")],
            "scopes_supported": ["openid", "profile", "email"],
            "bearer_methods_supported": ["header", "body"],
        }
    )


# REST API endpoints for Memories CRUD
@mcp.custom_route("/api/memories", methods=["GET", "OPTIONS"])
async def list_memories(request: StarletteRequest) -> JSONResponse:
    """Get all memories for the authenticated user."""
    if request.method == "OPTIONS":
        return JSONResponse({"status": "ok"})

    user_id = await get_user_from_session(request)
    if not user_id:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)

    memories = MemoryRepository.get_memories_by_user(user_id=user_id)
    return JSONResponse({"memories": [serialize_memory(m) for m in memories]})


@mcp.custom_route("/api/memories", methods=["POST"])
async def create_memory(request: StarletteRequest) -> JSONResponse:
    """Create a new memory."""
    user_id = await get_user_from_session(request)
    if not user_id:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)

    try:
        body = await request.json()
        title = body.get("title", "").strip()
        content = body.get("content", "").strip()

        if not title:
            return JSONResponse({"error": "Title is required"}, status_code=400)

        if not content:
            return JSONResponse({"error": "Content is required"}, status_code=400)

        if len(title) > MAX_TITLE_LENGTH:
            return JSONResponse(
                {"error": f"Title too long (max {MAX_TITLE_LENGTH} characters)"},
                status_code=400,
            )

        if len(content) > MAX_CONTENT_LENGTH:
            return JSONResponse(
                {"error": f"Content too long (max {MAX_CONTENT_LENGTH} characters)"},
                status_code=400,
            )

        memory = MemoryRepository.create_memory(
            user_id=user_id, title=title, content=content
        )
        return JSONResponse({"memory": serialize_memory(memory)}, status_code=201)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@mcp.custom_route("/api/memories/{memory_id}", methods=["PUT", "OPTIONS"])
async def update_memory(request: StarletteRequest) -> JSONResponse:
    """Update an existing memory."""
    if request.method == "OPTIONS":
        return JSONResponse({"status": "ok"})

    user_id = await get_user_from_session(request)
    if not user_id:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)

    try:
        memory_id = int(request.path_params.get("memory_id"))
        body = await request.json()
        title = body.get("title", "").strip()
        content = body.get("content", "").strip()

        if not title:
            return JSONResponse({"error": "Title is required"}, status_code=400)

        if not content:
            return JSONResponse({"error": "Content is required"}, status_code=400)

        if len(title) > MAX_TITLE_LENGTH:
            return JSONResponse(
                {"error": f"Title too long (max {MAX_TITLE_LENGTH} characters)"},
                status_code=400,
            )

        if len(content) > MAX_CONTENT_LENGTH:
            return JSONResponse(
                {"error": f"Content too long (max {MAX_CONTENT_LENGTH} characters)"},
                status_code=400,
            )

        memory = MemoryRepository.update_memory(
            memory_id=memory_id, user_id=user_id, title=title, content=content
        )
        if not memory:
            return JSONResponse({"error": "Memory not found"}, status_code=404)

        return JSONResponse({"memory": serialize_memory(memory)})
    except ValueError:
        return JSONResponse({"error": "Invalid memory ID"}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@mcp.custom_route("/api/memories/{memory_id}", methods=["DELETE"])
async def delete_memory(request: StarletteRequest) -> JSONResponse:
    """Delete a memory."""
    user_id = await get_user_from_session(request)
    if not user_id:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)

    try:
        memory_id = int(request.path_params.get("memory_id"))
        deleted = MemoryRepository.delete_memory(memory_id=memory_id, user_id=user_id)

        if not deleted:
            return JSONResponse({"error": "Memory not found"}, status_code=404)

        return JSONResponse({"message": "Memory deleted"})
    except ValueError:
        return JSONResponse({"error": "Invalid memory ID"}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


if __name__ == "__main__":
    # Initialize database tables
    init_db()

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
