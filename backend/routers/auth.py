import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from backend.database import get_db
from backend.models.user import User
from backend.schemas.user import UserCreate, UserResponse, Token, TokenData, RefreshTokenRequest, PasswordResetRequest, PasswordResetConfirm
from backend.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, create_reset_token, SECRET_KEY, ALGORITHM
from backend.core.limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == uuid.UUID(token_data.user_id)).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
@limiter.limit("5/minute")
def refresh_token_route(request: Request, body: RefreshTokenRequest, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(body.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if user is None:
        raise credentials_exception
        
    new_access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)
    return {"access_token": new_access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/request-reset")
@limiter.limit("3/minute")
def request_password_reset(request: Request, body: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if user:
        reset_token = create_reset_token(email=user.email)
        # In a real app, send email here. Mocking for now:
        print(f"--- MOCK EMAIL --- \nTo: {user.email}\nSubject: Password Reset\nLink: http://localhost:5173/reset-password?token={reset_token}\n------------------")
    return {"message": "If that email exists in our system, we have sent a reset link."}

@router.post("/confirm-reset")
@limiter.limit("3/minute")
def confirm_password_reset(request: Request, body: PasswordResetConfirm, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(body.token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        if email is None or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
        
    user.password_hash = get_password_hash(body.new_password)
    db.commit()
    return {"message": "Password successfully reset."}

@router.get("/google")
def google_auth_mock(db: Session = Depends(get_db)):
    # Mock OAuth flow
    email = "google-user@mock.com"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, password_hash=get_password_hash("MockOauth123!"))
        db.add(user)
        db.commit()
        db.refresh(user)
    
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    # Typically this would redirect to the frontend with the token
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"http://localhost:5173/dashboard?token={access_token}&refresh={refresh_token}")

@router.get("/github")
def github_auth_mock(db: Session = Depends(get_db)):
    # Mock OAuth flow
    email = "github-user@mock.com"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, password_hash=get_password_hash("MockOauth123!"))
        db.add(user)
        db.commit()
        db.refresh(user)
    
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"http://localhost:5173/dashboard?token={access_token}&refresh={refresh_token}")
