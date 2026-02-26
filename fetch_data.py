#!/usr/bin/env python3
"""
Tennis Match Visualizer - Data Fetcher
Fetches and processes point-by-point tennis data from Jeff Sackmann's Match Charting Project.
"""

import os
import json
import csv
import io
import urllib.request
from collections import defaultdict

# GitHub raw file URLs
MATCHES_URL = "https://raw.githubusercontent.com/JeffSackmann/tennis_MatchChartingProject/master/charting-m-matches.csv"
POINTS_2020S_URL = "https://raw.githubusercontent.com/JeffSackmann/tennis_MatchChartingProject/master/charting-m-points-2020s.csv"

# Grand Slam tournament identifiers (partial match on tourney name)
GRAND_SLAMS = ["Australian Open", "Roland Garros", "Wimbledon", "US Open"]

# Output directories
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")
POINTS_DIR = os.path.join(OUTPUT_DIR, "points")


def download_csv(url: str) -> list[dict]:
    """Download a CSV file and parse it into a list of dicts."""
    print(f"Downloading {url}...")
    with urllib.request.urlopen(url) as response:
        content = response.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))
    return list(reader)


def is_grand_slam(tourney_name: str) -> bool:
    """Check if a tournament is a Grand Slam."""
    if not tourney_name:
        return False
    return any(gs.lower() in tourney_name.lower() for gs in GRAND_SLAMS)


def get_slam_name(tourney_name: str) -> str:
    """Extract standardized Grand Slam name."""
    for gs in GRAND_SLAMS:
        if gs.lower() in tourney_name.lower():
            return gs
    return tourney_name


def process_point(point: dict) -> dict:
    """Process a single point record into simplified format."""
    def to_bool(val):
        return val.upper() == "TRUE" if val else False
    
    def to_int(val):
        try:
            return int(val)
        except (ValueError, TypeError):
            return 0
    
    return {
        "pt": to_int(point.get("Pt", 0)),
        "set1": to_int(point.get("Set1", 0)),
        "set2": to_int(point.get("Set2", 0)),
        "gm1": to_int(point.get("Gm1", 0)),
        "gm2": to_int(point.get("Gm2", 0)),
        "pts": point.get("Pts", ""),
        "svr": to_int(point.get("Svr", 1)),
        "ptWinner": to_int(point.get("PtWinner", 1)),
        "isAce": to_bool(point.get("isAce", "")),
        "isUnret": to_bool(point.get("isUnret", "")),
        "isRallyWinner": to_bool(point.get("isRallyWinner", "")),
        "isForced": to_bool(point.get("isForced", "")),
        "isUnforced": to_bool(point.get("isUnforced", "")),
        "isDouble": to_bool(point.get("isDouble", "")),
        "rallyCount": to_int(point.get("rallyCount", 0)),
        "isSvrWinner": point.get("isSvrWinner", "1") == "1",
        "tb": point.get("TB?", "0") == "1",
    }


def calculate_break_point(point: dict, prev_score: str = None) -> bool:
    """Determine if a point is a break point situation."""
    pts = point.get("pts", "")
    svr = point.get("svr", 1)
    
    # Break point scenarios for returner (when server is behind)
    # AD-out, 30-40, 15-40, 0-40, or 40-AD when serving
    break_point_scores = [
        ("AD", "40"),  # Ad out for server
        ("30", "40"),
        ("15", "40"),
        ("0", "40"),
        ("40", "AD"),  # Actually this is game point for server
    ]
    
    if "-" in pts:
        parts = pts.split("-")
        if len(parts) == 2:
            svr_pts, ret_pts = parts
            # Break point = returner has chance to win game
            if (svr_pts, ret_pts) in [("30", "40"), ("15", "40"), ("0", "40")] or ret_pts == "AD":
                return True
    return False


def main():
    os.makedirs(POINTS_DIR, exist_ok=True)
    
    # Download matches metadata
    matches_raw = download_csv(MATCHES_URL)
    print(f"Downloaded {len(matches_raw)} matches")
    
    # Filter for Grand Slam matches from 2020+
    grand_slam_matches = []
    match_ids = set()
    
    for match in matches_raw:
        match_id = match.get("match_id", "")
        tourney = match.get("Tournament", "")
        date = match.get("Date", "")
        
        # Filter: Grand Slam + year >= 2020
        if is_grand_slam(tourney) and date and date[:4] >= "2020":
            grand_slam_matches.append({
                "id": match_id,
                "tournament": get_slam_name(tourney),
                "date": date,
                "round": match.get("Round", ""),
                "player1": match.get("Player 1", ""),
                "player2": match.get("Player 2", ""),
                "surface": match.get("Surface", ""),
            })
            match_ids.add(match_id)
    
    print(f"Found {len(grand_slam_matches)} Grand Slam matches from 2020+")
    
    # Download points data
    points_raw = download_csv(POINTS_2020S_URL)
    print(f"Downloaded {len(points_raw)} points")
    
    # Group points by match
    points_by_match = defaultdict(list)
    for point in points_raw:
        match_id = point.get("match_id", "")
        if match_id in match_ids:
            points_by_match[match_id].append(point)
    
    # Process and save each match
    processed_matches = []
    for match in grand_slam_matches:
        match_id = match["id"]
        if match_id not in points_by_match:
            continue
        
        raw_points = points_by_match[match_id]
        processed_points = []
        
        for raw_point in raw_points:
            processed = process_point(raw_point)
            processed["isBreakPt"] = calculate_break_point(processed)
            processed_points.append(processed)
        
        if len(processed_points) > 0:
            # Save individual match points file
            match_file = os.path.join(POINTS_DIR, f"{match_id}.json")
            with open(match_file, "w") as f:
                json.dump(processed_points, f, separators=(",", ":"))
            
            match["pointCount"] = len(processed_points)
            processed_matches.append(match)
            print(f"  Saved {len(processed_points)} points for {match['player1']} vs {match['player2']}")
    
    # Save matches index
    matches_file = os.path.join(OUTPUT_DIR, "matches.json")
    with open(matches_file, "w") as f:
        json.dump(processed_matches, f, indent=2)
    
    print(f"\n✓ Saved {len(processed_matches)} matches to {matches_file}")
    print(f"✓ Saved point files to {POINTS_DIR}/")


if __name__ == "__main__":
    main()
