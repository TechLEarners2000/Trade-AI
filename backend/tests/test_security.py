import pytest
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, verify_token,
)


class TestPasswordHashing:
    def test_hash_and_verify(self):
        password = "test_password_123"
        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed) is True

    def test_verify_wrong_password(self):
        hashed = hash_password("correct_password")
        assert verify_password("wrong_password", hashed) is False

    def test_hash_is_different_each_time(self):
        password = "same_password"
        h1 = hash_password(password)
        h2 = hash_password(password)
        assert h1 != h2


class TestTokenCreation:
    def test_create_access_token(self):
        token = create_access_token({"sub": "user-123"})
        assert token is not None
        assert isinstance(token, str)

    def test_create_refresh_token(self):
        token = create_refresh_token({"sub": "user-123"})
        assert token is not None
        assert isinstance(token, str)

    def test_access_token_has_correct_type(self):
        token = create_access_token({"sub": "user-123"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["type"] == "access"
        assert payload["sub"] == "user-123"
        assert "jti" in payload
        assert "exp" in payload

    def test_refresh_token_has_correct_type(self):
        token = create_refresh_token({"sub": "user-123"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["type"] == "refresh"

    def test_verify_token_valid(self):
        token = create_access_token({"sub": "user-123"})
        payload = verify_token(token, "access")
        assert payload is not None
        assert payload["sub"] == "user-123"

    def test_verify_token_wrong_type(self):
        token = create_access_token({"sub": "user-123"})
        payload = verify_token(token, "refresh")
        assert payload is None

    def test_verify_invalid_token(self):
        payload = verify_token("invalid.token.here", "access")
        assert payload is None

    def test_decode_expired_token(self):
        import time
        from datetime import timedelta
        token = create_access_token({"sub": "user-123"}, expires_delta=timedelta(seconds=-1))
        payload = decode_token(token)
        assert payload is None

    def test_token_contains_jti(self):
        token = create_access_token({"sub": "user-123"})
        payload = decode_token(token)
        assert "jti" in payload
        assert len(payload["jti"]) > 0

    def test_each_token_has_unique_jti(self):
        t1 = decode_token(create_access_token({"sub": "user-123"}))
        t2 = decode_token(create_access_token({"sub": "user-123"}))
        assert t1["jti"] != t2["jti"]
