"""
Create database tables from SQLAlchemy models (development / bootstrap).

Uses DATABASE_URL (e.g. from backend/.env or Docker Compose).

Run locally:

    cd backend
    python init_db.py

Run inside Docker Compose:

    docker compose exec backend python init_db.py
"""

import sys


def main() -> int:
    from db.db import Base, engine

    if engine is None:
        print(
            "DATABASE_URL is not set. Set it in backend/.env or pass it via Docker Compose.",
            file=sys.stderr,
        )
        return 1

    # Import every model module so declarative tables are registered on Base.metadata.
    import schemas.activities  # noqa: F401
    import schemas.codes  # noqa: F401
    import schemas.memories  # noqa: F401
    import schemas.user  # noqa: F401
    import schemas.visits  # noqa: F401
    import schemas.wishes  # noqa: F401

    Base.metadata.create_all(bind=engine)
    print("Database tables ensured (create_all).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
