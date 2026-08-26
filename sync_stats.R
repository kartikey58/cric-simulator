# ─── CRICINFO STATS SYNC SCRIPT ──────────────────────────────────────────────
# This script uses the R package 'cricketdata' to fetch live career statistics 
# from ESPNCricinfo and writes them to a JSON file for the React simulator.

# ─── DEPENDENCY CHECK ────────────────────────────────────────────────────────
required_packages <- c("cricketdata", "jsonlite", "dplyr")
new_packages <- required_packages[!(required_packages %in% installed.packages()[, "Package"])]
if (length(new_packages) > 0) {
  message("Installing missing packages: ", paste(new_packages, collapse = ", "))
  install.packages(new_packages, repos = "https://cloud.r-project.org")
}

library(cricketdata)
library(jsonlite)
library(dplyr)

message("⚡ Loaded packages successfully.")

# ─── DEFINE ROSTERS ──────────────────────────────────────────────────────────
teams_players <- list(
  "India" = c("Rohit Sharma", "Shubman Gill", "Virat Kohli", "Suryakumar Yadav", "KL Rahul", "Hardik Pandya", "Ravindra Jadeja", "Jasprit Bumrah", "Kuldeep Yadav", "Mohammed Siraj", "Arshdeep Singh"),
  "Australia" = c("Pat Cummins", "Travis Head", "Steve Smith", "Marnus Labuschagne", "Alex Carey", "Glenn Maxwell", "Mitchell Marsh", "Mitchell Starc", "Josh Hazlewood", "Adam Zampa", "Nathan Lyon"),
  "England" = c("Jos Buttler", "Phil Salt", "Joe Root", "Harry Brook", "Ben Stokes", "Liam Livingstone", "Moeen Ali", "Jofra Archer", "Mark Wood", "Adil Rashid", "Chris Woakes"),
  "South Africa" = c("Aiden Markram", "Quinton de Kock", "Rassie van der Dussen", "Heinrich Klaasen", "David Miller", "Marco Jansen", "Keshav Maharaj", "Kagiso Rabada", "Anrich Nortje", "Lungi Ngidi", "Tabraiz Shamsi"),
  "Pakistan" = c("Babar Azam", "Mohammad Rizwan", "Fakhar Zaman", "Iftikhar Ahmed", "Shadab Khan", "Imam-ul-Haq", "Mohammad Nawaz", "Shaheen Afridi", "Haris Rauf", "Naseem Shah", "Mohammad Wasim Jr"),
  "New Zealand" = c("Kane Williamson", "Devon Conway", "Daryl Mitchell", "Tom Latham", "Glenn Phillips", "Rachin Ravindra", "Mitchell Santner", "Trent Boult", "Tim Southee", "Matt Henry", "Lockie Ferguson")
)

# Cricinfo country name mappings
country_mapping <- list(
  "India" = "india",
  "Australia" = "australia",
  "England" = "england",
  "South Africa" = "south africa",
  "Pakistan" = "pakistan",
  "New Zealand" = "new zealand"
)

# ─── UTILITY MATCHING FUNCTION ────────────────────────────────────────────────
match_player <- function(name, dataset) {
  if (is.null(dataset) || nrow(dataset) == 0) return(NULL)
  
  # Remove trailing symbols like † (wicketkeeper) or * (not out / captain)
  dataset$CleanPlayer <- gsub("[†*+]", "", dataset$Player)
  dataset$CleanPlayer <- trimws(dataset$CleanPlayer)
  
  # 1. Exact match (case-insensitive)
  exact <- dataset[tolower(dataset$CleanPlayer) == tolower(name), ]
  if (nrow(exact) > 0) return(exact[1, ])
  
  # 2. Last name + first initial match
  parts <- strsplit(name, " ")[[1]]
  if (length(parts) < 2) return(NULL)
  
  last_name <- tolower(tail(parts, 1))
  first_initial <- tolower(substr(parts[1], 1, 1))
  
  # Filter by last name
  matches <- dataset[grepl(last_name, dataset$CleanPlayer, ignore.case = TRUE), ]
  if (nrow(matches) == 0) return(NULL)
  
  # Filter by first initial
  matched <- matches[grepl(paste0("^", first_initial), matches$CleanPlayer, ignore.case = TRUE) |
                     grepl(paste0(" ", first_initial), matches$CleanPlayer, ignore.case = TRUE), ]
  
  if (nrow(matched) > 0) {
    return(matched[1, ])
  }
  
  # Fallback to first last name match
  return(matches[1, ])
}

# ─── DATA COMPILATION ────────────────────────────────────────────────────────
results <- list()

formats <- c("test", "odi", "t20")

for (team_name in names(teams_players)) {
  message("\n🏟️ Fetching data for: ", team_name)
  country_api_name <- country_mapping[[team_name]]
  
  # Pre-fetch all formats for this country to save time and API hits
  batting_data <- list()
  bowling_data <- list()
  
  for (fmt in formats) {
    message("  -> Downloading format: ", toupper(fmt))
    
    batting_data[[fmt]] <- tryCatch({
      fetch_cricinfo(matchtype = fmt, sex = "men", activity = "batting", country = country_api_name)
    }, error = function(e) {
      warning("Failed to fetch batting for ", team_name, " in ", fmt, ": ", e$message)
      return(NULL)
    })
    
    bowling_data[[fmt]] <- tryCatch({
      fetch_cricinfo(matchtype = fmt, sex = "men", activity = "bowling", country = country_api_name)
    }, error = function(e) {
      warning("Failed to fetch bowling for ", team_name, " in ", fmt, ": ", e$message)
      return(NULL)
    })
  }
  
  results[[team_name]] <- list()
  
  for (player in teams_players[[team_name]]) {
    results[[team_name]][[player]] <- list()
    
    for (fmt in formats) {
      fmt_upper <- toupper(fmt)
      results[[team_name]][[player]][[fmt_upper]] <- list()
      
      # ── BATTING STATS ──
      bat_match <- match_player(player, batting_data[[fmt]])
      if (!is.null(bat_match)) {
        # Convert values, handle NA / missing
        avg <- as.numeric(bat_match$Average)
        sr <- as.numeric(bat_match$StrikeRate)
        
        results[[team_name]][[player]][[fmt_upper]][["batting"]] <- list(
          average = if(is.na(avg)) NULL else avg,
          strikeRate = if(is.na(sr)) NULL else sr
        )
      } else {
        results[[team_name]][[player]][[fmt_upper]][["batting"]] <- NULL
      }
      
      # ── BOWLING STATS ──
      bowl_match <- match_player(player, bowling_data[[fmt]])
      if (!is.null(bowl_match)) {
        avg <- as.numeric(bowl_match$Average)
        eco <- as.numeric(bowl_match$Economy)
        sr <- as.numeric(bowl_match$StrikeRate)
        
        results[[team_name]][[player]][[fmt_upper]][["bowling"]] <- list(
          average = if(is.na(avg)) NULL else avg,
          economy = if(is.na(eco)) NULL else eco,
          strikeRate = if(is.na(sr)) NULL else sr
        )
      } else {
        results[[team_name]][[player]][[fmt_upper]][["bowling"]] <- NULL
      }
    }
  }
}

# ─── WRITE OUTPUT ────────────────────────────────────────────────────────────
output_path <- "src/engine/teams_stats.json"
message("\n💾 Saving stats to: ", output_path)

# Create directory if it doesn't exist
dir.create(dirname(output_path), showWarnings = FALSE, recursive = TRUE)

json_data <- toJSON(results, auto_unbox = TRUE, pretty = TRUE)
write(json_data, output_path)

message("✅ Stats successfully synced!")
