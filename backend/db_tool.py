"""
db_tool.py — Dev CLI for direct database operations (skip auth / onboarding flows).

Usage (inside Docker):
  docker compose -f compose.mobile.yaml exec backend python db_tool.py --help

Examples:
  python db_tool.py status
  python db_tool.py clear --all
  python db_tool.py clear users couples visits
  python db_tool.py user add --uid my_firebase_uid --name Fernando
  python db_tool.py user list
  python db_tool.py couple create --partner1 uid_a --partner2 uid_b
  python db_tool.py setup-couple --my-uid my_firebase_uid --my-name Me --partner-name Alex
  python db_tool.py seed
"""

from __future__ import annotations

import argparse
import sys
import uuid
from datetime import date, datetime, timedelta

from sqlalchemy import func, select, text

from db.db import Session, engine

# Register all models on Base.metadata
import schemas.activities  # noqa: F401
import schemas.codes  # noqa: F401
import schemas.memories  # noqa: F401
import schemas.user  # noqa: F401
import schemas.visits  # noqa: F401
import schemas.wishes  # noqa: F401

from schemas.activities import Activity, ActivitySnapshot
from schemas.codes import invite_code
from schemas.memories import Memory, MemoryMedia
from schemas.user import Couple, User
from schemas.visits import Visit
from schemas.wishes import Wish

TABLES = [
    "memory_media",
    "memories",
    "activity_snapshots",
    "invite_codes",
    "wishes",
    "visits",
    "activities",
    "couples",
    "users",
]

TABLE_MODELS = {
    "users": User,
    "couples": Couple,
    "visits": Visit,
    "activities": Activity,
    "activity_snapshots": ActivitySnapshot,
    "wishes": Wish,
    "invite_codes": invite_code,
    "memories": Memory,
    "memory_media": MemoryMedia,
}


def require_db() -> None:
    if engine is None or Session is None:
        print("DATABASE_URL is not set. Configure backend/.env or use Docker Compose.", file=sys.stderr)
        sys.exit(1)


def get_session():
    require_db()
    return Session()


def truncate_tables(table_names: list[str]) -> None:
    unknown = set(table_names) - set(TABLES)
    if unknown:
        print(f"Unknown table(s): {', '.join(sorted(unknown))}", file=sys.stderr)
        print(f"Valid tables: {', '.join(TABLES)}", file=sys.stderr)
        sys.exit(1)

    quoted = ", ".join(table_names)
    with engine.begin() as conn:
        if engine.dialect.name == "postgresql":
            conn.execute(text(f"TRUNCATE {quoted} RESTART IDENTITY CASCADE"))
        else:
            for name in table_names:
                conn.execute(text(f"DELETE FROM {name}"))
    print(f"Cleared: {', '.join(table_names)}")


def cmd_status(_: argparse.Namespace) -> None:
    db = get_session()
    try:
        print("Table counts:")
        for name in TABLES:
            model = TABLE_MODELS[name]
            count = db.execute(select(func.count()).select_from(model)).scalar_one()
            print(f"  {name:22} {count}")

        users = db.execute(select(User).order_by(User.created_at)).scalars().all()
        if users:
            print("\nUsers:")
            for user in users:
                print(f"  {user.id:30} {user.name!r}")

        couples = db.execute(select(Couple).order_by(Couple.id)).scalars().all()
        if couples:
            print("\nCouples:")
            for couple in couples:
                print(
                    f"  id={couple.id}  "
                    f"partner1={couple.partner1_uid}  partner2={couple.partner2_uid}"
                )
    finally:
        db.close()


def cmd_clear(args: argparse.Namespace) -> None:
    if args.all:
        targets = TABLES.copy()
    elif args.tables:
        targets = args.tables
    else:
        print("Specify table names or --all.", file=sys.stderr)
        sys.exit(1)

    if not args.yes:
        print(f"This will delete all rows from: {', '.join(targets)}")
        answer = input("Continue? [y/N] ").strip().lower()
        if answer not in ("y", "yes"):
            print("Aborted.")
            return

    truncate_tables(targets)


def cmd_user_add(args: argparse.Namespace) -> None:
    db = get_session()
    try:
        existing = db.execute(select(User).where(User.id == args.uid)).scalar_one_or_none()
        if existing:
            print(f"User already exists: {existing.id} ({existing.name!r})")
            return
        user = User(id=args.uid, name=args.name)
        db.add(user)
        db.commit()
        print(f"Created user {user.id} ({user.name!r})")
    finally:
        db.close()


def cmd_user_list(_: argparse.Namespace) -> None:
    db = get_session()
    try:
        users = db.execute(select(User).order_by(User.created_at)).scalars().all()
        if not users:
            print("No users.")
            return
        for user in users:
            print(f"{user.id}\t{user.name}")
    finally:
        db.close()


def cmd_user_set_name(args: argparse.Namespace) -> None:
    db = get_session()
    try:
        user = db.execute(select(User).where(User.id == args.uid)).scalar_one_or_none()
        if user is None:
            print(f"User not found: {args.uid}", file=sys.stderr)
            sys.exit(1)
        user.name = args.name
        db.commit()
        print(f"Updated {user.id} -> {user.name!r}")
    finally:
        db.close()


def cmd_user_delete(args: argparse.Namespace) -> None:
    db = get_session()
    try:
        user = db.execute(select(User).where(User.id == args.uid)).scalar_one_or_none()
        if user is None:
            print(f"User not found: {args.uid}", file=sys.stderr)
            sys.exit(1)
        db.delete(user)
        db.commit()
        print(f"Deleted user {args.uid}")
    finally:
        db.close()


def cmd_couple_create(args: argparse.Namespace) -> None:
    db = get_session()
    try:
        for uid in (args.partner1, args.partner2):
            if uid is None:
                continue
            user = db.execute(select(User).where(User.id == uid)).scalar_one_or_none()
            if user is None:
                print(f"User not found: {uid}. Create with: user add --uid {uid} --name ...", file=sys.stderr)
                sys.exit(1)

        existing = db.execute(
            select(Couple).where(
                (Couple.partner1_uid == args.partner1) | (Couple.partner2_uid == args.partner1)
            )
        ).scalar_one_or_none()
        if existing:
            print(f"Partner1 already in couple id={existing.id}", file=sys.stderr)
            sys.exit(1)

        if args.partner2:
            existing_p2 = db.execute(
                select(Couple).where(
                    (Couple.partner1_uid == args.partner2) | (Couple.partner2_uid == args.partner2)
                )
            ).scalar_one_or_none()
            if existing_p2:
                print(f"Partner2 already in couple id={existing_p2.id}", file=sys.stderr)
                sys.exit(1)

        couple = Couple(partner1_uid=args.partner1, partner2_uid=args.partner2)
        db.add(couple)
        db.commit()
        db.refresh(couple)
        print(f"Created couple id={couple.id}  partner1={couple.partner1_uid}  partner2={couple.partner2_uid}")
    finally:
        db.close()


def cmd_couple_join(args: argparse.Namespace) -> None:
    db = get_session()
    try:
        user = db.execute(select(User).where(User.id == args.partner2)).scalar_one_or_none()
        if user is None:
            print(f"User not found: {args.partner2}. Create with user add first.", file=sys.stderr)
            sys.exit(1)

        couple = db.execute(select(Couple).where(Couple.id == args.couple_id)).scalar_one_or_none()
        if couple is None:
            print(f"Couple not found: id={args.couple_id}", file=sys.stderr)
            sys.exit(1)
        if couple.partner2_uid is not None:
            print(f"Couple already has partner2={couple.partner2_uid}", file=sys.stderr)
            sys.exit(1)

        couple.partner2_uid = args.partner2
        db.commit()
        print(f"Joined couple id={couple.id}  partner2={couple.partner2_uid}")
    finally:
        db.close()


def cmd_setup_couple(args: argparse.Namespace) -> None:
    """One-shot: create you + partner users and link them (skip onboarding)."""
    partner_uid = args.partner_uid or f"mock_partner_{uuid.uuid4().hex[:8]}"
    db = get_session()
    try:
        me = db.execute(select(User).where(User.id == args.my_uid)).scalar_one_or_none()
        if me is None:
            me = User(id=args.my_uid, name=args.my_name)
            db.add(me)
        else:
            me.name = args.my_name

        partner = db.execute(select(User).where(User.id == partner_uid)).scalar_one_or_none()
        if partner is None:
            partner = User(id=partner_uid, name=args.partner_name)
            db.add(partner)
        else:
            partner.name = args.partner_name

        db.flush()

        existing = db.execute(
            select(Couple).where(
                (Couple.partner1_uid == args.my_uid) | (Couple.partner2_uid == args.my_uid)
            )
        ).scalar_one_or_none()
        if existing:
            existing.partner1_uid = args.my_uid
            existing.partner2_uid = partner_uid
            couple = existing
        else:
            couple = Couple(partner1_uid=args.my_uid, partner2_uid=partner_uid)
            db.add(couple)

        db.commit()
        db.refresh(couple)
        print("Ready to test — sign in with your Firebase account:")
        print(f"  your uid:     {args.my_uid} ({args.my_name!r})")
        print(f"  partner uid:  {partner_uid} ({args.partner_name!r})")
        print(f"  couple id:    {couple.id}")
    finally:
        db.close()


def cmd_code_create(args: argparse.Namespace) -> None:
    """Create a couple (if needed) and invite code for partner1 — skips the app UI."""
    import random

    db = get_session()
    try:
        user = db.execute(select(User).where(User.id == args.uid)).scalar_one_or_none()
        if user is None:
            print(f"User not found: {args.uid}", file=sys.stderr)
            sys.exit(1)

        couple = db.execute(
            select(Couple).where(
                (Couple.partner1_uid == args.uid) | (Couple.partner2_uid == args.uid)
            )
        ).scalar_one_or_none()
        if couple is None:
            couple = Couple(partner1_uid=args.uid, partner2_uid=None)
            db.add(couple)
            db.flush()
        elif couple.partner2_uid is not None:
            print("User is already in a complete couple.", file=sys.stderr)
            sys.exit(1)

        existing = db.execute(
            select(invite_code).where(invite_code.couple_id == couple.id)
        ).scalar_one_or_none()
        if existing:
            db.delete(existing)

        new_code = random.randint(100000, 999999)
        while db.execute(select(invite_code).where(invite_code.code == new_code)).scalar_one_or_none():
            new_code = random.randint(100000, 999999)

        code = invite_code(
            code=new_code,
            couple_id=couple.id,
            expires_at=datetime.now() + timedelta(minutes=30),
        )
        db.add(code)
        db.commit()
        print(f"Invite code: {new_code}  (couple id={couple.id}, expires in 30 min)")
    finally:
        db.close()


def cmd_seed(_: argparse.Namespace) -> None:
    from seed_db import seed

    seed()


def cmd_visit_add(args: argparse.Namespace) -> None:
    db = get_session()
    try:
        couple = db.execute(select(Couple).where(Couple.id == args.couple_id)).scalar_one_or_none()
        if couple is None:
            print(f"Couple not found: id={args.couple_id}", file=sys.stderr)
            sys.exit(1)

        start = date.fromisoformat(args.start)
        end = date.fromisoformat(args.end)
        visit = Visit(couple_id=couple.id, description=args.description, start=start, end=end)
        db.add(visit)
        db.commit()
        db.refresh(visit)
        print(f"Created visit id={visit.id}  {visit.description}  {start} -> {end}")
    finally:
        db.close()


def cmd_wish_add(args: argparse.Namespace) -> None:
    db = get_session()
    try:
        user = db.execute(select(User).where(User.id == args.uid)).scalar_one_or_none()
        if user is None:
            print(f"User not found: {args.uid}", file=sys.stderr)
            sys.exit(1)

        wish = Wish(
            uid=args.uid,
            description=args.description,
            category=args.category,
            fulfilled=args.fulfilled,
        )
        db.add(wish)
        db.commit()
        db.refresh(wish)
        print(f"Created wish id={wish.id} for {args.uid}: {wish.description!r}")
    finally:
        db.close()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Dev database tool — manipulate data without going through auth flows.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("status", help="Show row counts and users/couples")

    clear = sub.add_parser("clear", help="Delete rows from tables")
    clear.add_argument("tables", nargs="*", help="Table names (see status). Omit when using --all.")
    clear.add_argument("--all", action="store_true", help="Clear every table")
    clear.add_argument("-y", "--yes", action="store_true", help="Skip confirmation")

    user = sub.add_parser("user", help="Manage users")
    user_sub = user.add_subparsers(dest="user_command", required=True)

    user_add = user_sub.add_parser("add", help="Create a user")
    user_add.add_argument("--uid", required=True, help="Firebase UID or any test id")
    user_add.add_argument("--name", required=True)

    user_sub.add_parser("list", help="List all users")

    user_set = user_sub.add_parser("set-name", help="Update a user's name")
    user_set.add_argument("--uid", required=True)
    user_set.add_argument("--name", required=True)

    user_del = user_sub.add_parser("delete", help="Delete a user")
    user_del.add_argument("--uid", required=True)

    couple = sub.add_parser("couple", help="Manage couples")
    couple_sub = couple.add_subparsers(dest="couple_command", required=True)

    couple_create = couple_sub.add_parser("create", help="Create a couple")
    couple_create.add_argument("--partner1", required=True)
    couple_create.add_argument("--partner2", help="Optional — omit for invite-code flow")

    couple_join = couple_sub.add_parser("join", help="Add partner2 to an existing couple")
    couple_join.add_argument("--couple-id", type=int, required=True)
    couple_join.add_argument("--partner2", required=True)

    setup = sub.add_parser(
        "setup-couple",
        help="Create you + partner and link them (skip onboarding)",
    )
    setup.add_argument("--my-uid", required=True, help="Your Firebase UID")
    setup.add_argument("--my-name", required=True)
    setup.add_argument("--partner-name", required=True)
    setup.add_argument("--partner-uid", help="Partner UID (default: random mock id)")

    code = sub.add_parser("code", help="Invite codes")
    code_sub = code.add_subparsers(dest="code_command", required=True)
    code_create = code_sub.add_parser("create", help="Create couple + invite code for a user")
    code_create.add_argument("--uid", required=True)

    sub.add_parser("seed", help="Insert full mock dataset (users, visits, activities, wishes)")

    visit = sub.add_parser("visit", help="Manage visits")
    visit_sub = visit.add_subparsers(dest="visit_command", required=True)
    visit_add = visit_sub.add_parser("add", help="Add a visit to a couple")
    visit_add.add_argument("--couple-id", type=int, required=True)
    visit_add.add_argument("--description", required=True)
    visit_add.add_argument("--start", required=True, help="YYYY-MM-DD")
    visit_add.add_argument("--end", required=True, help="YYYY-MM-DD")

    wish = sub.add_parser("wish", help="Manage wishes")
    wish_sub = wish.add_subparsers(dest="wish_command", required=True)
    wish_add = wish_sub.add_parser("add", help="Add a wish for a user")
    wish_add.add_argument("--uid", required=True)
    wish_add.add_argument("--description", required=True)
    wish_add.add_argument("--category", default="General")
    wish_add.add_argument("--fulfilled", action="store_true")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    handlers = {
        "status": cmd_status,
        "clear": cmd_clear,
        "seed": cmd_seed,
        "setup-couple": cmd_setup_couple,
    }

    if args.command == "user":
        handlers = {
            "add": cmd_user_add,
            "list": cmd_user_list,
            "set-name": cmd_user_set_name,
            "delete": cmd_user_delete,
        }
        handlers[args.user_command](args)
    elif args.command == "couple":
        handlers = {
            "create": cmd_couple_create,
            "join": cmd_couple_join,
        }
        handlers[args.couple_command](args)
    elif args.command == "code":
        handlers = {"create": cmd_code_create}
        handlers[args.code_command](args)
    elif args.command == "visit":
        handlers = {"add": cmd_visit_add}
        handlers[args.visit_command](args)
    elif args.command == "wish":
        handlers = {"add": cmd_wish_add}
        handlers[args.wish_command](args)
    else:
        handlers[args.command](args)

    return 0


if __name__ == "__main__":
    sys.exit(main())
