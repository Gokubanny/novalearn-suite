import os
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
from bson import ObjectId
from typing import Optional, Dict, Any, List
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

_client: Optional[MongoClient] = None
_db: Optional[Database] = None


def get_db() -> Database:
    """Get database connection (singleton pattern)."""
    global _client, _db

    if _db is None:
        uri = os.getenv("MONGODB_URI")
        if not uri:
            raise ValueError("MONGODB_URI not set in environment variables")

        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        _db = _client.get_default_database()
        print("✅ Connected to MongoDB")

    return _db


def close_db():
    """Close the database connection."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None


# ── STUDENT QUERIES ────────────────────────────────────────────────────────────

def get_student_by_id(student_id: str) -> Optional[Dict]:
    """Get a student document by their MongoDB ObjectId."""
    db = get_db()
    try:
        return db.students.find_one({"_id": ObjectId(student_id)})
    except Exception:
        return None


def get_student_by_user(user_id: str) -> Optional[Dict]:
    """Get a student document by their user ObjectId."""
    db = get_db()
    try:
        return db.students.find_one({"user": ObjectId(user_id)})
    except Exception:
        return None


def save_face_encoding(student_id: str, encoding: List[float], image_url: str) -> bool:
    """Save a student's face encoding and image URL to MongoDB."""
    db = get_db()
    try:
        result = db.students.update_one(
            {"_id": ObjectId(student_id)},
            {"$set": {
                "faceEncoding": encoding,
                "faceImageUrl": image_url,
                "updatedAt": datetime.utcnow()
            }}
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Error saving face encoding: {e}")
        return False


def get_all_students_with_encodings(school_id: str) -> List[Dict]:
    """
    Get all students from a school who have registered face encodings.
    Used during class photo recognition to compare against.
    """
    db = get_db()
    try:
        students = db.students.find(
            {
                "school": ObjectId(school_id),
                "faceEncoding": {"$exists": True, "$ne": [], "$ne": None},
                "approvalStatus": "approved"
            },
            {
                "_id": 1,
                "matricNumber": 1,
                "faceEncoding": 1,
                "faceImageUrl": 1,
                "user": 1
            }
        )
        return list(students)
    except Exception as e:
        print(f"Error fetching students with encodings: {e}")
        return []


# ── ATTENDANCE SESSION QUERIES ─────────────────────────────────────────────────

def get_active_session(session_id: str) -> Optional[Dict]:
    """Get an attendance session that is currently open."""
    db = get_db()
    try:
        session = db.attendancesessions.find_one({
            "_id": ObjectId(session_id),
            "status": "open",
            "expiresAt": {"$gt": datetime.utcnow()}
        })
        return session
    except Exception as e:
        print(f"Error fetching session: {e}")
        return None


def mark_student_present(session_id: str, student_id: str) -> bool:
    """
    Record a face-verified student as present (and as submitted) on the session.

    This runs the moment verification succeeds, so the answer is stored even if
    the backend has already stopped waiting for the HTTP reply. It only applies
    while the session is still open; it returns False if the session was
    already saved or closed, so the caller never reports a success that was
    not actually recorded.
    """
    db = get_db()
    try:
        sid = ObjectId(student_id)
        result = db.attendancesessions.update_one(
            {"_id": ObjectId(session_id), "status": "open"},
            {"$addToSet": {"presentStudents": sid, "submittedStudents": sid}}
        )
        return result.matched_count > 0
    except Exception as e:
        print(f"Error recording presence: {e}")
        return False


def get_student_presence(session_id: str, student_id: str) -> Optional[str]:
    """
    Is this student already recorded as present on the session?

    Returns "face" (verified by selfie), "manual" (marked by the lecturer) or
    None (no answer on record yet). The session is looked up by id only: a
    recorded answer stays true after the session expires or is saved.
    """
    db = get_db()
    try:
        sid = ObjectId(student_id)
        session = db.attendancesessions.find_one(
            {"_id": ObjectId(session_id), "presentStudents": sid},
            {"manualStudents": 1}
        )
        if session is None:
            return None
        manual = session.get("manualStudents") or []
        return "manual" if sid in manual else "face"
    except Exception as e:
        print(f"Error checking student presence: {e}")
        return None


# ── SCHOOL QUERIES ─────────────────────────────────────────────────────────────

def get_school_settings(school_id: str) -> Optional[Dict]:
    """
    Get school document including subscription plan and geofence settings.
    Used to determine max allowed distance for attendance.
    """
    db = get_db()
    try:
        return db.schools.find_one(
            {"_id": ObjectId(school_id)},
            {
                "subscription.plan": 1,
                "attendanceSettings.maxDistanceMetres": 1,
                "name": 1
            }
        )
    except Exception as e:
        print(f"Error fetching school settings: {e}")
        return None