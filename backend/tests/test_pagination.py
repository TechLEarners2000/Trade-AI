import pytest
from app.core.pagination import encode_cursor, decode_cursor, CursorPage


class TestCursorCodec:
    def test_encode_decode(self):
        original = "some_cursor_value_123"
        encoded = encode_cursor(original)
        decoded = decode_cursor(encoded)
        assert decoded == original

    def test_encode_decode_with_special_chars(self):
        original = "ABC-123_date:2024-01-01T00:00:00"
        encoded = encode_cursor(original)
        decoded = decode_cursor(encoded)
        assert decoded == original

    def test_decode_invalid(self):
        assert decode_cursor("!!!invalid-base64!!!") is None

    def test_decode_empty(self):
        assert decode_cursor("") is None

    def test_encode_is_url_safe(self):
        encoded = encode_cursor("test/data+more")
        assert "+" not in encoded
        assert "/" not in encoded


class TestCursorPage:
    def test_empty_page(self):
        page = CursorPage(items=[], has_more=False)
        assert page.items == []
        assert page.next_cursor is None
        assert page.has_more is False
        assert page.total is None

    def test_page_with_items(self):
        page = CursorPage(items=[1, 2, 3], next_cursor="abc", has_more=True, total=10)
        assert page.items == [1, 2, 3]
        assert page.next_cursor == "abc"
        assert page.has_more is True
        assert page.total == 10

    def test_page_model_dump(self):
        page = CursorPage(items=[{"id": 1}], next_cursor="xyz", has_more=True)
        dumped = page.model_dump()
        assert dumped == {
            "items": [{"id": 1}],
            "next_cursor": "xyz",
            "has_more": True,
            "total": None,
        }
