import re
import math
import socket
import requests
import whois
from urllib.parse import urlparse
from datetime import datetime
from functools import lru_cache

FAST_MODE = True

SUSPICIOUS_WORDS = [
    "verify", "update", "free", "secure", "confirm",
    "account", "login", "bank", "payment"
]
SUSPICIOUS_PATTERN = re.compile("|".join(SUSPICIOUS_WORDS), re.IGNORECASE)

def entropy(s: str) -> float:
    """Compute Shannon entropy of a string (optimized)."""
    if not s:
        return 0.0

    length = len(s)
    freq = {c: 0 for c in set(s)}

    for c in s:
        freq[c] += 1

    return -sum((count / length) * math.log(count / length, 2)
                for count in freq.values())


@lru_cache(maxsize=2000)
def domain_age(domain: str) -> int:
    """Return domain age in days. Cached to avoid repeated WHOIS calls."""
    if FAST_MODE:
        return 0

    try:
        info = whois.whois(domain)

        created = info.creation_date
        if isinstance(created, list):
            created = created[0]
        if not isinstance(created, datetime):
            return 0

        return (datetime.now() - created).days
    except:
        return 0


@lru_cache(maxsize=2000)
def dns_valid(domain: str) -> int:
    """Check DNS validity. Cached."""
    if FAST_MODE:
        return 1

    try:
        socket.gethostbyname(domain)
        return 1
    except:
        return 0


@lru_cache(maxsize=2000)
def blacklist_check(url: str) -> int:
    """Check if URL exists in phishing blacklist."""
    if FAST_MODE:
        return 0

    try:
        resp = requests.get(
            f"https://phishstats.info:2096/api/phishing?_where=(url,eq,%22{url}%22)",
            timeout=4
        )
        return 1 if resp.ok and len(resp.json()) > 0 else 0
    except:
        return 0

def extract_features(url: str) -> dict:
    """Extract ML features from URL."""


    if "://" not in url:
        url = "http://" + url

    parsed = urlparse(url)
    domain = parsed.netloc or ""
    path = parsed.path or ""
    domain = domain.split(":")[0]

    url_lower = url.lower()
    url_len = len(url)

    dot_count = url.count(".")
    slash_count = url.count("/")
    digit_count = sum(c.isdigit() for c in url)
    special_count = sum(not c.isalnum() for c in url)

    return {
        "url_length": url_len,
        "num_dots": dot_count,
        "num_slashes": slash_count,
        "entropy": entropy(url),
        "digit_ratio": digit_count / url_len,
        "special_char_count": special_count,
        "subdomain_count": domain.count("."),
        "domain_length": len(domain),
        "path_length": len(path),

        "has_https": 1 if url_lower.startswith("https://") else 0,
        "has_suspicious": 1 if SUSPICIOUS_PATTERN.search(url_lower) else 0,

        "domain_age": domain_age(domain),
        "dns_valid": dns_valid(domain),
        "blacklisted": blacklist_check(url),
    }
