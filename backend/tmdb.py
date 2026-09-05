import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

TMDB_BASE_URL = "https://api.themoviedb.org/3"
POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500"
BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original"


def get_headers():
    """
    Retrieve HTTP headers containing the Bearer token for TMDB API authorization.
    Raises ValueError if the token is missing or remains set to the default placeholder.
    """
    token = os.getenv("TMDB_READ_ACCESS_TOKEN")
    if not token or token == "your_token_here":
        raise ValueError(
            "TMDB_READ_ACCESS_TOKEN is missing or not configured in your .env file."
        )

    return {
        "Authorization": f"Bearer {token}",
        "accept": "application/json"
    }


def format_tmdb_item(item, default_media_type=None):
    """
    Convert a TMDB movie or TV result into the CineMatch standardized format:
    {
        "id": int,
        "title": str,
        "description": str,
        "poster_url": str or None,
        "backdrop_url": str or None,
        "genre": str,
        "rating": float,
        "release_year": int or None,
        "media_type": "movie" or "series"
    }
    """
    if not isinstance(item, dict):
        return None

    # Determine media_type: map "tv" to "series"
    raw_media_type = item.get("media_type") or default_media_type

    if raw_media_type in ["tv", "series"] or "name" in item or "first_air_date" in item:
        media_type = "series"
    else:
        media_type = "movie"

    # Title normalization (movie -> 'title', TV -> 'name')
    if media_type == "series":
        title = item.get("name") or item.get("title") or "Untitled"
    else:
        title = item.get("title") or item.get("name") or "Untitled"

    # Safe handling for missing overview/description
    description = item.get("overview") or ""

    # Safe handling for poster and backdrop image URLs
    poster_path = item.get("poster_path")
    poster_url = f"{POSTER_BASE_URL}{poster_path}" if poster_path else None

    backdrop_path = item.get("backdrop_path")
    backdrop_url = f"{BACKDROP_BASE_URL}{backdrop_path}" if backdrop_path else None

    # Rating normalization (vote_average rounded to 1 decimal place)
    vote_avg = item.get("vote_average")
    rating = round(float(vote_avg), 1) if vote_avg is not None else 0.0

    # Safe handling for release year (movie -> 'release_date', TV -> 'first_air_date')
    date_str = item.get("release_date") if media_type == "movie" else item.get("first_air_date")
    if not date_str:
        date_str = item.get("first_air_date") or item.get("release_date")

    release_year = None
    if date_str and isinstance(date_str, str) and len(date_str) >= 4:
        year_part = date_str[:4]
        if year_part.isdigit():
            release_year = int(year_part)

    # Genre handling (supports detail response with 'genres' list or discover response with 'genre_ids')
    genre = "Unknown"
    if "genres" in item and isinstance(item["genres"], list) and len(item["genres"]) > 0:
        genre = item["genres"][0].get("name", "Unknown")
    elif "genre_ids" in item and isinstance(item["genre_ids"], list) and len(item["genre_ids"]) > 0:
        genre = f"Genre ID {item['genre_ids'][0]}"

    return {
        "id": item.get("id"),
        "title": title,
        "description": description,
        "poster_url": poster_url,
        "backdrop_url": backdrop_url,
        "genre": genre,
        "rating": rating,
        "release_year": release_year,
        "media_type": media_type
    }


def fetch_trending_media():
    """
    Call TMDB /trending/all/day endpoint.
    Returns both movies and TV series formatted for CineMatch.
    Ignores unsupported media types like 'person'.
    """
    headers = get_headers()
    url = f"{TMDB_BASE_URL}/trending/all/day"

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])

        formatted_media = []
        for item in results:
            # Only include movies and TV series
            if item.get("media_type") in ["movie", "tv"]:
                formatted_item = format_tmdb_item(item)
                if formatted_item:
                    formatted_media.append(formatted_item)

        return formatted_media

    except requests.exceptions.RequestException as e:
        print(f"Error fetching trending media from TMDB: {e}")
        return []


def fetch_media_detail(media_id, media_type):
    """
    Fetch details for a specific movie or TV series by ID from TMDB.
    media_type must be either 'movie' or 'tv' (or 'series').
    """
    # Validate and normalize media_type
    if media_type == "series":
        api_media_type = "tv"
    elif media_type in ["movie", "tv"]:
        api_media_type = media_type
    else:
        raise ValueError("Invalid media_type. Must be 'movie' or 'tv' (or 'series').")

    headers = get_headers()
    url = f"{TMDB_BASE_URL}/{api_media_type}/{media_id}"

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        return format_tmdb_item(data, default_media_type=api_media_type)

    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            return None
        print(f"HTTP error fetching detail for ID {media_id} from TMDB: {e}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Request error fetching detail for ID {media_id} from TMDB: {e}")
        return None


def search_media(query):
    """
    Search TMDB using the /search/multi endpoint.
    Returns formatted movies and TV series, ignoring unsupported result types like 'person'.
    """
    if not query or not query.strip():
        return []

    headers = get_headers()
    url = f"{TMDB_BASE_URL}/search/multi"
    params = {"query": query}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])

        formatted_media = []
        for item in results:
            if item.get("media_type") in ["movie", "tv"]:
                formatted_item = format_tmdb_item(item)
                if formatted_item:
                    formatted_media.append(formatted_item)

        return formatted_media

    except requests.exceptions.RequestException as e:
        print(f"Error searching media from TMDB: {e}")
        return []
