interface SavedMovie {
  $id: string;
  userId: string;
  movie_id: number;
  title: string;
  poster_url: string;
  note?: string;
  rating?: number;
  $createdAt: string;
}

interface UserProfile {
  $id?: string;
  userId: string;
  name: string;
  bio?: string;
}

interface TrendingMovie {
  $id: string;
  movie_id: number;
  title: string;
  poster_url: string;
}
