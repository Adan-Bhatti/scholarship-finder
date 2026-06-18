class BaseAPIException(Exception):
    """Base class for all API exceptions."""
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(self.detail)

class NotFoundError(BaseAPIException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail)

class AuthError(BaseAPIException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(status_code=401, detail=detail)

class ValidationError(BaseAPIException):
    def __init__(self, detail: str = "Validation error"):
        super().__init__(status_code=400, detail=detail)

class DatabaseError(BaseAPIException):
    def __init__(self, detail: str = "Database error occurred"):
        super().__init__(status_code=500, detail=detail)
