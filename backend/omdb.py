import os
import re
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

OMDB_BASE_URL = "https://www.omdbapi.com/"


def get_api_key():
    """
    Retrieve OMDB_API_KEY from environment variables.
    Raises ValueError if key is missing or unconfigured.
    Never prints or logs the API key.
    """
    key = os.getenv("OMDB_API_KEY")
    invalid_placeholders = [
        None,
        "",
        "your_actual_key_here",
        "your_omdb_api_key_here",
        "your_api_key_here"
    ]
    if not key or key.strip() in invalid_placeholders:
        raise ValueError(
            "OMDB_API_KEY is missing or unconfigured in the .env file."
        )
    return key.strip()


def format_omdb_item(item):
    """
    Convert an OMDb response dictionary into CineMatch's standard format:
    {
        "id": str (imdbID),
        "title": str,
        "description": str,
        "poster_url": str or None,
        "backdrop_url": None,
        "genre": str,
        "rating": float or None,
        "release_year": int or None,
        "media_type": "movie" or "series"
    }
    Returns None if item is invalid or represents an unsupported type (e.g., episode).
    """
    if not isinstance(item, dict):
        return None

    # Map and filter media_type
    raw_type = str(item.get("Type", "")).lower()
    if raw_type == "movie":
        media_type = "movie"
    elif raw_type == "series":
        media_type = "series"
    elif raw_type == "episode":
        return None
    else:
        # Fallback detection if Type field is omitted or unusual
        media_type = "movie"

    # ID & Title
    media_id = item.get("imdbID")
    title = item.get("Title") or "Untitled"

    # Description (Plot)
    plot = item.get("Plot")
    description = plot if plot and plot != "N/A" else ""

    # Poster URL
    poster = item.get("Poster")
    poster_url = poster if poster and poster != "N/A" and poster.startswith("http") else None

    # Backdrop URL (OMDb free API does not supply backdrops)
    backdrop_url = None

    # Genre
    genre_str = item.get("Genre")
    genre = genre_str if genre_str and genre_str != "N/A" else "Unknown"

    # Rating
    rating_str = item.get("imdbRating")
    rating = None
    if rating_str and rating_str != "N/A":
        try:
            rating = float(rating_str)
        except ValueError:
            rating = None

    # Release Year (safely extract first 4-digit year from string, e.g. "2016–2022")
    year_str = str(item.get("Year", ""))
    release_year = None
    match = re.search(r'\d{4}', year_str)
    if match:
        release_year = int(match.group(0))

    return {
        "id": media_id,
        "title": title,
        "description": description,
        "poster_url": poster_url,
        "backdrop_url": backdrop_url,
        "genre": genre,
        "rating": rating,
        "release_year": release_year,
        "media_type": media_type
    }


def search_media(query):
    """
    Search OMDb using the /?s=QUERY search endpoint.
    Returns a list of normalized movie and series items.
    """
    if not query or not query.strip():
        return []

    try:
        api_key = get_api_key()
    except ValueError as e:
        print(f"OMDb configuration error: {e}")
        return []

    params = {
        "apikey": api_key,
        "s": query.strip()
    }

    try:
        response = requests.get(OMDB_BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data.get("Response") == "False":
            return []

        search_results = data.get("Search", [])
        formatted_list = []
        for item in search_results:
            formatted_item = format_omdb_item(item)
            if formatted_item:
                formatted_list.append(formatted_item)

        return formatted_list

    except requests.exceptions.RequestException:
        print("Network or HTTP error occurred while searching OMDb API.")
        return []
    except Exception as e:
        print(f"Unexpected error during OMDb search: {type(e).__name__}")
        return []


def fetch_media_detail(media_id):
    """
    Fetch full detail for an IMDb ID (e.g. 'tt0816692') from OMDb.
    Returns a normalized CineMatch item or None if not found/error.
    """
    if not media_id or not media_id.strip():
        return None

    try:
        api_key = get_api_key()
    except ValueError as e:
        print(f"OMDb configuration error: {e}")
        return None

    params = {
        "apikey": api_key,
        "i": media_id.strip(),
        "plot": "full"
    }

    try:
        response = requests.get(OMDB_BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data.get("Response") == "False":
            return None

        return format_omdb_item(data)

    except requests.exceptions.RequestException:
        print("Network or HTTP error occurred while fetching OMDb media detail.")
        return None
    except Exception as e:
        print(f"Unexpected error fetching OMDb media detail: {type(e).__name__}")
        return None


def fetch_media_by_title(title, media_type=None):
    """
    Fetch single media item by title from OMDb.
    Optionally filters by media_type ('movie' or 'series').
    Returns a normalized CineMatch item or None if not found/error.
    """
    if not title or not title.strip():
        return None

    try:
        api_key = get_api_key()
    except ValueError as e:
        print(f"OMDb configuration error: {e}")
        return None

    params = {
        "apikey": api_key,
        "t": title.strip()
    }

    if media_type:
        type_lower = media_type.lower()
        if type_lower in ["movie", "series"]:
            params["type"] = type_lower

    try:
        response = requests.get(OMDB_BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data.get("Response") == "False":
            return None

        return format_omdb_item(data)

    except requests.exceptions.RequestException:
        print("Network or HTTP error occurred while fetching OMDb media by title.")
        return None
    except Exception as e:
        print(f"Unexpected error fetching OMDb media by title: {type(e).__name__}")
        return None
