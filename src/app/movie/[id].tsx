import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const MovieDetails = () => {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Details for Movie ID: {id}</Text>
    </View>
  );
};

export default MovieDetails;

const styles = StyleSheet.create({});
