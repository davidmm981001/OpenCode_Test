from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response as StarletteResponse
from fastapi.responses import JSONResponse
import traceback

class CORSErrorCatchMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            response = await call_next(request)
        except Exception as exc:
            # fallback: error as JSON and with CORS
            tb = traceback.format_exc(limit=3)
            body = {"detail": str(exc), "trace": tb}
            response = JSONResponse(body, status_code=500)
        # apply CORS headers if missing
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
