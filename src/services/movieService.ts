import axios from "axios";
import type { Movie } from "../types/movie";

export const tmdbApiKey = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
  },
});
interface FetchMovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
export const fetchMovies = async (query: string): Promise<Movie[]> => {
  const response = await tmdbApiKey.get<FetchMovieResponse>("search/movie", {
    params: { query },
  });
  return response.data.results;
};
