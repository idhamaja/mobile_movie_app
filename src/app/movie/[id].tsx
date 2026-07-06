import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { icons } from "../../../constants/icons";
import { fetchMovieDetails } from "../../../services/api";
import { isMovieSaved, saveMovie, unsaveMovie } from "../../../services/auth";
import useFetch from "../../../services/useFetch";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "Loading..."}
    </Text>
  </View>
);

const MovieDetails = () => {
  const { id } = useLocalSearchParams();

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string),
  );

  const [savedDocId, setSavedDocId] = useState<string | null>(null);
  const [checkingSaved, setCheckingSaved] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const checkSaved = async () => {
      if (!movie?.id) return;
      try {
        const existing = await isMovieSaved(movie.id);
        if (active) setSavedDocId(existing?.$id ?? null);
      } catch (error) {
        console.log(error);
      } finally {
        if (active) setCheckingSaved(false);
      }
    };

    checkSaved();

    return () => {
      active = false;
    };
  }, [movie?.id]);

  const handleToggleSave = async () => {
    if (!movie) return;
    setSaving(true);

    try {
      if (savedDocId) {
        // sudah tersimpan -> hapus
        await unsaveMovie(savedDocId);
        setSavedDocId(null);
        Alert.alert(
          "Dihapus",
          `"${movie.title}" dihapus dari daftar tersimpan.`,
        );
      } else {
        // belum tersimpan -> simpan
        // map detailed movie to expected Movie shape (include genre_ids)
        const payload = {
          ...movie,
          // some APIs return genres as objects; saveMovie expects genre_ids: number[]
          genre_ids: movie?.genres?.map((g: any) => g.id) ?? [],
        } as any;

        const doc = await saveMovie(payload);
        setSavedDocId(doc.$id);
        Alert.alert("Tersimpan", `${movie?.title} berhasil disimpan!`);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Gagal", "Terjadi kesalahan, coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />
        </View>
        <View className="flex-col items-start justify-center mt-5 px-5">
          <View className="flex-row items-center justify-between w-full">
            <Text className="text-white font-bold text-xl flex-1 pr-3">
              {movie?.title}
            </Text>
            <TouchableOpacity
              onPress={handleToggleSave}
              disabled={saving || checkingSaved || loading}
              className="size-11 rounded-full bg-dark-100 items-center justify-center"
            >
              {saving || checkingSaved ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Image
                  source={icons.save}
                  className="size-5"
                  tintColor={savedDocId ? "#FFD700" : "#FFF"}
                />
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]}
            </Text>
            <Text className="text-light-200 text-sm">
              {movie?.runtime} Minutes
            </Text>
          </View>
          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />
            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>
            <Text className="text-light-200 text-sm">
              ({movie?.vote_count} Votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genre Movie"
            value={
              movie?.genres?.map((g) => g.name).join(" - ") || "Loading..."
            }
          />
          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo
              label="Budget Movie"
              value={
                movie?.budget
                  ? `$${(movie.budget / 1_000_000).toFixed(1)} Million`
                  : undefined
              }
            />
            <MovieInfo
              label="Revenue Movie"
              value={
                movie?.revenue
                  ? `$${(movie.revenue / 1_000_000).toFixed(1)} Million`
                  : undefined
              }
            />
          </View>
          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies?.map((c) => c.name).join(" - ") ||
              "Loading..."
            }
          />
        </View>
      </ScrollView>

      <View className="absolute bottom-5 left-0 right-0 mx-5 flex-row gap-3 z-50">
        <TouchableOpacity
          className="flex-1 bg-dark-100 rounded-lg py-3.5 flex flex-row items-center justify-center"
          onPress={router.back}
        >
          <Image
            source={icons.arrow}
            className="size-5 mr-1 mt-0.5 rotate-180"
            tintColor="#FFF"
          />
          <Text className="text-white font-semibold text-base">Kembali</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center"
          onPress={handleToggleSave}
          disabled={saving || checkingSaved || loading}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Image
                source={icons.save}
                className="size-5 mr-1"
                tintColor={savedDocId ? "#FFD700" : "#FFF"}
              />
              <Text className="text-white font-semibold text-base">
                {savedDocId ? "Tersimpan" : "Simpan"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MovieDetails;

const styles = StyleSheet.create({});
