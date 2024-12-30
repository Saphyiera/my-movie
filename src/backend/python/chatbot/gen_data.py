import json

with open("./src/backend/python/movies.json", "r", encoding="utf-8") as file1:
    movies = json.load(file1)
    with open(
        "./src/backend/python/related-movies.json", "r", encoding="utf-8"
    ) as file2:
        related_movies = json.load(file2)

        combined_data = []
        for movie in movies:
            movieid = movie["movieid"]
            similar = next(
                (item for item in related_movies if item["movieid"] == movieid), None
            )
            if similar:
                movie["similar_movieids"] = similar["similar_movieids"]
            combined_data.append(movie)

        formatted_lines = []
        for movie in combined_data:
            formatted_lines.append(
                f"Name: {movie['title']}. Genres: {', '.join(movie['genres'])}. "
                f"Actors: {', '.join(movie['actors'])}. Synopsis: {movie['synopsis']}."
            )

        with open("./src/backend/python/chatbot/data.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(formatted_lines))
