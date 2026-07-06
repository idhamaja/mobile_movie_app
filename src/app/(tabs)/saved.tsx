import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { icons } from "../../../constants/icons";
import {
  getSavedMovies,
  unsaveMovie,
  updateSavedMovie,
} from "../../../services/auth";
import useFetch from "../../../services/useFetch";

const StarRow = ({
  rating,
  onChange,
}: {
  rating: number;
  onChange?: (n: number) => void;
}) => (
  <View className="flex-row gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <TouchableOpacity
        key={n}
        disabled={!onChange}
        onPress={() => onChange?.(n)}
      >
        <Text className={n <= rating ? "text-yellow-400" : "text-gray-600"}>
          ★
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const Saved = () => {
  const {
    data: movies,
    loading,
    refetch,
  } = useFetch<SavedMovie[]>(getSavedMovies);
  const [editing, setEditing] = useState<SavedMovie | null>(null);
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  const openEdit = (item: SavedMovie) => {
    setEditing(item);
    setNote(item.note ?? "");
    setRating(item.rating ?? 0);
  };

  const saveEdit = async () => {
    if (!editing) return;
    await updateSavedMovie(editing.$id, { note, rating });
    setEditing(null);
    refetch();
  };

  const handleDelete = (item: SavedMovie) => {
    Alert.alert("Hapus film?", `Hapus "${item.title}" dari daftar tersimpan?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await unsaveMovie(item.$id);
          refetch();
        },
      },
    ]);
  };

  return (
    <View className="bg-primary flex-1 px-5 pt-16">
      <Text className="text-white text-xl font-bold mb-4">Film Tersimpan</Text>

      {loading ? (
        <ActivityIndicator className="mt-10" color="#fff" />
      ) : !movies || movies.length === 0 ? (
        <View className="flex-1 justify-center items-center gap-3">
          <Image source={icons.save} className="size-10" tintColor="#666" />
          <Text className="text-gray-500">Belum ada film yang disimpan</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View className="flex-row bg-dark-100 rounded-xl mb-3 p-3 gap-3">
              <Image
                source={{ uri: item.poster_url }}
                className="w-16 h-24 rounded-lg"
                resizeMode="cover"
              />
              <View className="flex-1 justify-between">
                <View>
                  <Text className="text-white font-semibold" numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.rating ? <StarRow rating={item.rating} /> : null}
                  {item.note ? (
                    <Text
                      className="text-gray-400 text-xs mt-1"
                      numberOfLines={2}
                    >
                      {item.note}
                    </Text>
                  ) : null}
                </View>
                <View className="flex-row gap-4 mt-2">
                  <TouchableOpacity onPress={() => openEdit(item)}>
                    <Text className="text-blue-400 text-sm font-medium">
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Text className="text-red-400 text-sm font-medium">
                      Hapus
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={!!editing} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center px-6">
          <View className="bg-dark-100 rounded-2xl p-5">
            <Text className="text-white font-bold text-lg mb-3">
              {editing?.title}
            </Text>
            <Text className="text-gray-400 mb-1 text-sm">Rating</Text>
            <StarRow rating={rating} onChange={setRating} />
            <Text className="text-gray-400 mt-4 mb-1 text-sm">Catatan</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Tulis catatan pribadimu..."
              placeholderTextColor="#666"
              multiline
              className="text-white bg-primary rounded-lg p-3 min-h-[80px]"
            />
            <View className="flex-row justify-end gap-4 mt-5">
              <TouchableOpacity onPress={() => setEditing(null)}>
                <Text className="text-gray-400">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit}>
                <Text className="text-blue-400 font-semibold">Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Saved;
