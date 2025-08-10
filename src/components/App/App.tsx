import styles from "./App.module.css";
import { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import type { Movie, FetchMovieResponse } from "../../types/movie";
import { fetchMovies } from "../../services/movieService";
import ReactPaginate from "react-paginate";
import { useQuery } from "@tanstack/react-query";

export default function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const firstLoad = useRef(true);

  const {
    data: movies,
    isLoading,
    isError,
    isSuccess,
    isFetching,
  } = useQuery<FetchMovieResponse, Error>({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: query.trim() !== "",
    placeholderData: (prevData) => prevData,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (firstLoad.current) {
      if (!isLoading) {
        setShowLoader(false);
        firstLoad.current = false;
      } else {
        setShowLoader(true);
      }
      return;
    }
    if (isFetching) {
      setShowLoader(true);
    } else {
      timeoutId = setTimeout(() => setShowLoader(false), 500);
    }
    return () => clearTimeout(timeoutId);
  }, [isLoading, isFetching]);

  useEffect(() => {
    if (!isLoading && !isError && movies?.results.length === 0) {
      toast("No movies found for your request.");
    }
  }, [movies, isLoading, isError]);

  const handleSearch = (newQuery: string): void => {
    const trimmed = newQuery.trim();
    if (!trimmed) {
      toast.error("Please enter your search query.");
      return;
    }
    if (trimmed !== query) {
      setQuery(trimmed);
      setPage(1);
      setSelectedMovie(null);
    }
  };

  const handleSelect = (movie: Movie): void => setSelectedMovie(movie);
  const handleCloseModal = (): void => setSelectedMovie(null);

  const totalPages = movies?.total_pages ?? 1;

  return (
    <div className={styles.app}>
      <Toaster position="top-center" />
      <SearchBar onSubmit={handleSearch} />
      {showLoader && <Loader />}
      {isError && <ErrorMessage />}
      {!showLoader && isSuccess && movies && movies.results.length > 0 && (
        <>
          {totalPages > 1 && (
            <ReactPaginate
              pageCount={totalPages}
              pageRangeDisplayed={5}
              marginPagesDisplayed={1}
              onPageChange={({ selected }) => setPage(selected + 1)}
              forcePage={page - 1}
              containerClassName={styles.pagination}
              activeClassName={styles.active}
              nextLabel="→"
              previousLabel="←"
            />
          )}
          <MovieGrid movies={movies.results} onSelect={handleSelect} />
        </>
      )}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}
    </div>
  );
}
