from backend.core.matcher import _fields_match

def test_fields_match_exact():
    assert _fields_match("Computer Science", "Computer Science") is True
    assert _fields_match("computer science", "COMPUTER SCIENCE") is True

def test_fields_match_substring():
    assert _fields_match("Computer Science", "Computer Science and Engineering") is True
    assert _fields_match("Biology", "Marine Biology") is True

def test_fields_match_synonyms():
    assert _fields_match("Software Engineering", "Computer Science") is True
    assert _fields_match("CS", "Information Technology") is True
    assert _fields_match("Pre-Med", "Medicine") is False # not in our synonyms currently, but let's check others
    assert _fields_match("Business", "MBA") is True
    assert _fields_match("Accounting", "Finance") is True

def test_fields_match_no_match():
    assert _fields_match("Computer Science", "Art History") is False
    assert _fields_match("Biology", "Mechanical Engineering") is False
