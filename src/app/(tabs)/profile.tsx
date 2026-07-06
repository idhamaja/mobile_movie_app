import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../context/authContext";
import {
  getProfile,
  getSavedMovies,
  updateProfile,
} from "../../../services/auth";
import useFetch from "../../../services/useFetch";

// ---------- Form Login & Signup ----------
const AuthForm = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (mode === "signup" && !name)) {
      Alert.alert("Lengkapi data", "Semua field wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (error: any) {
      console.log("AUTH ERROR:", error?.code, error?.type, error?.message);

      let message = "Terjadi kesalahan, coba lagi.";
      if (error?.message?.includes("Invalid credentials")) {
        message = "Email atau password salah.";
      } else if (error?.code === 401) {
        message =
          "Akses ditolak oleh server (401). Cek konfigurasi platform Appwrite.";
      } else if (error?.message?.includes("already exists")) {
        message = "Email sudah terdaftar. Coba masuk (login).";
      } else if (error?.message) {
        message = error.message;
      }

      Alert.alert("Gagal", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-primary justify-center px-8"
    >
      <Text className="text-white text-2xl font-bold mb-1 text-center">
        {mode === "login" ? "Masuk" : "Buat Akun"}
      </Text>
      <Text className="text-gray-400 text-center mb-8">
        {mode === "login"
          ? "Masuk untuk menyimpan film favoritmu"
          : "Daftar untuk mulai menyimpan film"}
      </Text>

      {mode === "signup" && (
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nama lengkap"
          placeholderTextColor="#666"
          className="bg-dark-100 text-white rounded-lg px-4 py-3 mb-3"
        />
      )}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
        className="bg-dark-100 text-white rounded-lg px-4 py-3 mb-3"
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        className="bg-dark-100 text-white rounded-lg px-4 py-3 mb-5"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        className="bg-accent rounded-lg py-3.5 items-center mb-4"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">
            {mode === "login" ? "Masuk" : "Daftar"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode(mode === "login" ? "signup" : "login")}
      >
        <Text className="text-gray-400 text-center">
          {mode === "login" ? (
            <>
              Belum punya akun?{" "}
              <Text className="text-blue-400 font-semibold">Daftar</Text>
            </>
          ) : (
            <>
              Sudah punya akun?{" "}
              <Text className="text-blue-400 font-semibold">Masuk</Text>
            </>
          )}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

// ---------- Profile ketika sudah login ----------
const ProfileView = () => {
  const { user, logout } = useAuth();
  const {
    data: profile,
    loading,
    refetch,
  } = useFetch<UserProfile | null>(getProfile);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  useEffect(() => {
    getSavedMovies().then((m) => setSavedCount(m?.length ?? 0));
  }, []);

  const handleSave = async () => {
    if (!profile?.$id) return;
    await updateProfile(profile.$id, { name, bio });
    setEditMode(false);
    refetch();
  };

  const handleLogout = () => {
    Alert.alert("Keluar", "Yakin ingin keluar dari akun?", [
      { text: "Batal", style: "cancel" },
      { text: "Keluar", style: "destructive", onPress: logout },
    ]);
  };

  const initials = (name || user?.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (loading) {
    return (
      <View className="bg-primary flex-1 justify-center items-center">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView
      className="bg-primary flex-1 px-6 pt-20"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="items-center flex-1">
        <View className="size-24 rounded-full bg-indigo-500 justify-center items-center mb-4">
          <Text className="text-white text-3xl font-bold">{initials}</Text>
        </View>

        {editMode ? (
          <TextInput
            value={name}
            onChangeText={setName}
            className="text-white text-xl font-bold text-center border-b border-gray-600 mb-2 w-full"
          />
        ) : (
          <Text className="text-white text-xl font-bold mb-2">{name}</Text>
        )}

        <Text className="text-gray-500 text-xs mb-2">{user?.email}</Text>

        {editMode ? (
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tulis bio singkat..."
            placeholderTextColor="#666"
            multiline
            className="text-gray-300 text-center border-b border-gray-600 mb-4 w-full"
          />
        ) : (
          <Text className="text-gray-400 text-center mb-4">
            {bio || "Belum ada bio"}
          </Text>
        )}

        <Text className="text-gray-500 mb-6">
          🎬 {savedCount} film tersimpan
        </Text>

        {editMode ? (
          <View className="flex-row gap-6 mb-6">
            <TouchableOpacity onPress={() => setEditMode(false)}>
              <Text className="text-gray-400 font-medium">Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave}>
              <Text className="text-blue-400 font-semibold">
                Simpan Perubahan
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setEditMode(true)}
            className="bg-dark-100 px-6 py-2 rounded-full mb-6"
          >
            <Text className="text-white font-medium">Edit Profil</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleLogout} className="mt-auto mb-10">
          <Text className="text-red-400 font-semibold">Keluar dari Akun</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ---------- Router: pilih tampilan berdasarkan status login ----------
const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="bg-primary flex-1 justify-center items-center">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return user ? <ProfileView /> : <AuthForm />;
};

export default Profile;
