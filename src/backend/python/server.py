import mysql.connector
import joblib
import datetime
import json
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, jsonify
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MultiLabelBinarizer
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

spoiler_model = joblib.load(
    "D:/HUST/20241/Project 1/Code/my-movie/src/backend/python/spoiler_model/model.joblib"
)
spoiler_vectorizer = joblib.load(
    "D:/HUST/20241/Project 1/Code/my-movie/src/backend/python/spoiler_model/tfidf_vectorizer.joblib"
)

spam_model = joblib.load(
    "D:/HUST/20241/Project 1/Code/my-movie/src/backend/python/spam_model/model.joblib"
)
spam_vectorizer = joblib.load(
    "D:/HUST/20241/Project 1/Code/my-movie/src/backend/python/spam_model/tfidf_vectorizer.joblib"
)

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "ROOT",
    "database": "movie",
}


def predict_spam(text):
    input_tfidf = spam_vectorizer.transform([text])
    prediction = spam_model.predict(input_tfidf)
    return "Spam" if prediction[0] == 1 else "Not Spam"


def predict_spoiler(text):
    input_tfidf = spoiler_vectorizer.transform([text])
    prediction = spoiler_model.predict(input_tfidf)
    return "Spoiler" if prediction[0] == 1 else "Not Spoiler"


def process_and_update_comments():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        today = datetime.date.today()
        last_monday = today - datetime.timedelta(days=today.weekday() + 7)

        query = """
            SELECT * FROM comment 
            WHERE hidden = 0 
            AND postdate >= %s 
            AND postdate < %s
        """
        cursor.execute(query, (last_monday, today))
        comments = cursor.fetchall()

        for comment in comments:
            comment_text = comment["comment"]
            is_spam = predict_spam(comment_text)
            is_spoiler = predict_spoiler(comment_text)

            if is_spam == "Spam" or is_spoiler == "Spoiler":
                update_query = "UPDATE comment SET hidden = 1 WHERE commentid = %s"
                cursor.execute(update_query, (comment["commentid"],))

                reasons = []
                if is_spam == "Spam":
                    reasons.append("Spam")
                if is_spoiler == "Spoiler":
                    reasons.append("Spoiler")

                for reason in reasons:
                    insert_query = """
                        INSERT INTO hidden_comment (commentid, reason)
                        VALUES (%s, %s)
                    """
                    cursor.execute(insert_query, (comment["commentid"], reason))

        connection.commit()

    except Exception as e:
        print(f"Error update comments: {str(e)}")
    finally:
        print("Done update comments")
        if connection.is_connected():
            cursor.close()
            connection.close()


def export_movies_to_json():
    connection = mysql.connector.connect(**db_config)

    try:
        cursor = connection.cursor(dictionary=True)

        movie_query = """
        SELECT 
            m.id AS movieid, 
            m.title,
            m.synopsis, 
            m.rating,
            m.count
        FROM movie m
        WHERE Lower(m.type) IN ('show', 'movie')
        """
        cursor.execute(movie_query)
        movies = cursor.fetchall()

        genre_query = """
        SELECT g.name
        FROM genre g
        INNER JOIN movie_genre mg ON g.id = mg.genre_id
        WHERE mg.movie_id = %s
        """

        actor_query = """
        SELECT a.name
        FROM actor a
        INNER JOIN movie_actor ma ON a.id = ma.actor_id
        WHERE ma.movie_id = %s
        """

        movies_list = []
        for movie in movies:
            cursor.execute(genre_query, (movie["movieid"],))
            genres = [genre["name"] for genre in cursor.fetchall()]

            cursor.execute(actor_query, (movie["movieid"],))
            actors = [actor["name"] for actor in cursor.fetchall()]

            movies_list.append(
                {
                    "movieid": movie["movieid"],
                    "title": movie["title"],
                    "genres": genres,
                    "actors": actors,
                    "synopsis": movie["synopsis"],
                    "rating": movie["rating"] / movie["count"],
                }
            )

        with open("./src/backend/python/movies.json", "w", encoding="utf-8") as file:
            json.dump(movies_list, file, ensure_ascii=False, indent=4)

        print(f"Data successfully written to movies.json at {datetime.datetime.now()}!")

    except mysql.connector.Error as e:
        print(f"Error export movies: {e}")

    finally:
        print("Done export movies")
        if connection.is_connected():
            cursor.close()
            connection.close()

    with open("./src/backend/python/movies.json", "r", encoding="utf-8") as file:
        movies = json.load(file)

    movie_ids = [movie["movieid"] for movie in movies]
    genres_list = [set(movie["genres"]) for movie in movies]
    actors_list = [set(movie["actors"]) for movie in movies]

    combined_features = [
        genres | actors for genres, actors in zip(genres_list, actors_list)
    ]

    mlb = MultiLabelBinarizer()
    binary_features = mlb.fit_transform(combined_features)

    knn = NearestNeighbors(n_neighbors=6, metric="cosine")
    knn.fit(binary_features)

    distances, indices = knn.kneighbors(binary_features)

    related_movies = []
    for i, movie_id in enumerate(movie_ids):
        similar_movie_ids = [movie_ids[idx] for idx in indices[i][1:]]
        related_movies.append(
            {"movieid": movie_id, "similar_movieids": similar_movie_ids}
        )

    with open(
        "./src/backend/python/related-movies.json", "w", encoding="utf-8"
    ) as file:
        json.dump(related_movies, file, indent=4)

    print("Related movies has been updated successfully!")


scheduler = BackgroundScheduler()
scheduler.add_job(
    process_and_update_comments, "cron", day_of_week="mon", hour=0, minute=0
)
scheduler.add_job(export_movies_to_json, "cron", day_of_week="tue", hour=0, minute=0)
scheduler.start()


@app.route("/", methods=["GET"])
def analyze_comments():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        query = "SELECT * FROM comment"
        cursor.execute(query)
        comments = cursor.fetchall()

        results = []
        for comment in comments:
            comment_text = comment["comment"]
            is_spam = predict_spam(comment_text)
            is_spoiler = predict_spoiler(comment_text)
            results.append(
                {
                    "commentid": comment["commentid"],
                    "userid": comment["userid"],
                    "movieid": comment["movieid"],
                    "comment": comment_text,
                    "hidden": comment["hidden"],
                    "postdate": comment["postdate"],
                    "is_spam": is_spam,
                    "is_spoiler": is_spoiler,
                }
            )

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)})

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@app.route("/related-movies/<int:movie_id>", methods=["GET"])
def get_related_movies(movie_id):
    try:
        with open(
            "./src/backend/python/related-movies.json", "r", encoding="utf-8"
        ) as file:
            related_movies_data = json.load(file)

        similar_movie_ids = None
        for entry in related_movies_data:
            if entry["movieid"] == movie_id:
                similar_movie_ids = entry["similar_movieids"]
                break

        if not similar_movie_ids:
            return (
                jsonify(
                    {"error": f"Movie with id {movie_id} not found in related movies."}
                ),
                404,
            )

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT 
                id, title,
                poster_url, 
                CASE 
                    WHEN count > 0 THEN rating / count 
                    ELSE 0 
                END AS avg_rating 
            FROM movie 
            WHERE id = %s
        """

        related_movies = []
        for related_id in similar_movie_ids:
            cursor.execute(query, (related_id,))
            movie_details = cursor.fetchone()
            if movie_details:
                related_movies.append(movie_details)

        return jsonify(related_movies)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if "connection" in locals() and connection.is_connected():
            cursor.close()
            connection.close()


@app.route("/suggest-movies/<int:user_id>", methods=["GET"])
def suggest_movies(user_id):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        with open(
            "./src/backend/python/related-movies.json", "r", encoding="utf-8"
        ) as file:
            related_movies_data = json.load(file)

            query = """
            SELECT m.id AS movieid, m.type
            FROM watched_movie wm
            INNER JOIN movie m ON wm.movieid = m.id
            WHERE wm.userid = %s
            """
            cursor.execute(query, (user_id,))
            watched_movies = cursor.fetchall()

            related_movie_ids = set()

            for movie in watched_movies:
                movie_id = movie["movieid"]
                movie_type = movie["type"]

                if movie_type.lower() in ["movie", "show"]:

                    for entry in related_movies_data:
                        if entry["movieid"] == movie_id:
                            related_movie_ids.update(entry["similar_movieids"])

                else:
                    query_episode = """
                    SELECT m.id AS movieid
                    FROM movie m
                    INNER JOIN serie s ON m.id = s.serieid
                    INNER JOIN season se ON s.seasonid = se.seasonid
                    WHERE se.episodeid = %s
                    """
                    cursor.execute(query_episode, (movie_id,))
                    episode_movie = cursor.fetchone()
                    if episode_movie:
                        for entry in related_movies_data:
                            if entry["movieid"] == episode_movie["movieid"]:
                                related_movie_ids.update(entry["similar_movieids"])
            related_movies = []
            for movie_id in related_movie_ids:
                query_movie = """
                    SELECT id, poster_url, title,
                        CASE 
                            WHEN count > 0 THEN rating / count 
                            ELSE 0 
                        END AS avg_rating 
                    FROM movie 
                    WHERE id = %s
                """
                cursor.execute(query_movie, (movie_id,))
                movie_details = cursor.fetchone()
                if movie_details:
                    related_movies.append(movie_details)

            sorted_related_movies = sorted(
                related_movies, key=lambda x: x["avg_rating"], reverse=True
            )

        return jsonify(sorted_related_movies[:6])

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


if __name__ == "__main__":
    app.run(port=2812)
