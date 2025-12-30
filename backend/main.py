import os

import httpx
from database import NoteRepository
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
mcp = FastMCP(name="Personal Notes MCP", auth=auth)


@mcp.tool()
def get_my_notes() -> str:
    """
    Get All the notes for a user
    """
    access_token: AccessToken = get_access_token()
    user_id = jwt.get_unverified_claims(access_token.token)["sub"]

    notes = NoteRepository.get_notes_by_user(user_id=user_id)
    if not notes:
        return "No Notes"

    result = "Your Notes:\n"
    for note in notes:
        result += f"{note.id}: {note.content}\n"

    return result


@mcp.tool()
def add_notes(content: str) -> str:
    """
    Add a note for a user
    """
    access_token: AccessToken = get_access_token()
    user_id = jwt.get_unverified_claims(access_token.token)["sub"]

    note = NoteRepository.create_note(user_id=user_id, content=content)
    return f"added note: {note.content}"


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


# REST API endpoints for Notes CRUD
@mcp.custom_route("/api/notes", methods=["GET", "OPTIONS"])
async def list_notes(request: StarletteRequest) -> JSONResponse:
    """Get all notes for the authenticated user."""
    if request.method == "OPTIONS":
        return JSONResponse({"status": "ok"})

    user_id = await get_user_from_session(request)
    if not user_id:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)

    notes = NoteRepository.get_notes_by_user(user_id=user_id)
    return JSONResponse({"notes": [{"id": n.id, "content": n.content} for n in notes]})


@mcp.custom_route("/api/notes", methods=["POST"])
async def create_note(request: StarletteRequest) -> JSONResponse:
    """Create a new note."""
    user_id = await get_user_from_session(request)
    if not user_id:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)

    try:
        body = await request.json()
        content = body.get("content", "").strip()

        if not content:
            return JSONResponse({"error": "Content is required"}, status_code=400)

        if len(content) > 10000:
            return JSONResponse(
                {"error": "Content too long (max 10000 characters)"}, status_code=400
            )

        note = NoteRepository.create_note(user_id=user_id, content=content)
        return JSONResponse(
            {"note": {"id": note.id, "content": note.content}}, status_code=201
        )
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@mcp.custom_route("/api/notes/{note_id}", methods=["PUT", "OPTIONS"])
async def update_note(request: StarletteRequest) -> JSONResponse:
    """Update an existing note."""
    if request.method == "OPTIONS":
        return JSONResponse({"status": "ok"})

    user_id = await get_user_from_session(request)
    if not user_id:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)

    try:
        note_id = int(request.path_params.get("note_id"))
        body = await request.json()
        content = body.get("content", "").strip()

        if not content:
            return JSONResponse({"error": "Content is required"}, status_code=400)

        if len(content) > 10000:
            return JSONResponse(
                {"error": "Content too long (max 10000 characters)"}, status_code=400
            )

        note = NoteRepository.update_note(
            note_id=note_id, user_id=user_id, content=content
        )
        if not note:
            return JSONResponse({"error": "Note not found"}, status_code=404)

        return JSONResponse({"note": {"id": note.id, "content": note.content}})
    except ValueError:
        return JSONResponse({"error": "Invalid note ID"}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@mcp.custom_route("/api/notes/{note_id}", methods=["DELETE"])
async def delete_note(request: StarletteRequest) -> JSONResponse:
    """Delete a note."""
    user_id = await get_user_from_session(request)
    if not user_id:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)

    try:
        note_id = int(request.path_params.get("note_id"))
        deleted = NoteRepository.delete_note(note_id=note_id, user_id=user_id)

        if not deleted:
            return JSONResponse({"error": "Note not found"}, status_code=404)

        return JSONResponse({"message": "Note deleted"})
    except ValueError:
        return JSONResponse({"error": "Invalid note ID"}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


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
