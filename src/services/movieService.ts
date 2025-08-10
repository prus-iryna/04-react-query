import axios from "axios";
import type { FetchMovieResponse } from "../types/movie";

export const tmdbApiKey = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
  },
});

export const fetchMovies = async (
  query: string,
  page: number
): Promise<FetchMovieResponse> => {
  const { data } = await tmdbApiKey.get<FetchMovieResponse>("search/movie", {
    params: { query, page },
  });
  return data;
};
