import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Header, Depends # FastAPI components for dependency

# Retrieve the service account key JSON string from the environment variable
service_account_key_json = "nearish-1e849-firebase-adminsdk-fbsvc-edbd10b1b1.json"

# Initialize Firebase Admin SDK
cred = credentials.Certificate(service_account_key_json)
firebase_admin.initialize_app(cred)

async def get_current_firebase_user(authorization: str = Header(...)):
    """
    FastAPI dependency to verify a Firebase ID token.
    It expects the token in the 'Authorization' header as 'Bearer <ID_TOKEN>'.
    Returns the decoded token claims (a dictionary).
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header format. Expected 'Bearer <token>'."
        )
    
    token_string = authorization.split("Bearer ")[1]

    try:
        # Verify the ID token. `check_revoked=True` is recommended for security.
        decoded_token = auth.verify_id_token(token_string, check_revoked=True)
        return decoded_token
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid Firebase ID token.")
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Firebase ID token has expired. Please reauthenticate.")
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Firebase ID token has been revoked. Please reauthenticate.")
    except auth.UserDisabledError:
        raise HTTPException(status_code=401, detail="The user associated with this token is disabled.")
    except Exception as e:
        # Catch any other unexpected errors during verification
        raise HTTPException(status_code=500, detail=f"Authentication error: {e}")

async def get_current_firebase_uid(decoded_token: dict = Depends(get_current_firebase_user)):
    """
    FastAPI dependency that extracts and returns the User ID (UID)
    from a successfully verified Firebase ID token.
    """
    return decoded_token['uid']

# Example of how to  use:
# from fastapi import FastAPI, Depends
# from .your_firebase_utils_file import get_current_firebase_user, get_current_firebase_uid

# app = FastAPI()

# @app.get("/me")
# async def read_users_me(user: dict = Depends(get_current_firebase_user)):
#     return {"message": "You are authenticated!", "user_claims": user}

# @app.get("/my-uid")
# async def get_my_uid(uid: str = Depends(get_current_firebase_uid)):
#     return {"your_uid": uid}