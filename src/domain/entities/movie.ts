export interface Movie {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  video_url: string;
}

export interface MovieListResponse {
  data: Movie[];
  total: number;
}
