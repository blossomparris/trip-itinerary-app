import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const citrusPattern = require("../../assets/images/citrus-pattern.png");
const santoriniMoodboard = require("../../assets/images/santorini-moodboard.png");

const members = [
  { id: "blossom", name: "Blossom", role: "OWNER" },
  { id: "simone", name: "Simone", role: "OWNER" },
  { id: "kacper", name: "Kacper", role: "OWNER" },
  { id: "sam", name: "Sam", role: "VIEWER" },
  { id: "liz", name: "Elizabeth/Liz", role: "VIEWER" },
  { id: "devvora", name: "Devvora", role: "VIEWER" },
];

const events = [
  {
    title: "NYC Departure",
    date: "Jul 24",
    time: "6:20 PM",
    location: "JFK Airport",
    group: "EVERYONE",
  },
  {
    title: "Scorpios",
    date: "Jul 31",
    time: "10:30 PM",
    location: "Paraga, Mykonos",
    group: "EVERYONE",
  },
  {
    title: "Zuma Mykonos",
    date: "Aug 1",
    time: "8:00 PM",
    location: "Mykonos, Greece",
    group: "EVERYONE",
  },
  {
    title: "Greenwich Observatory",
    date: "Jul 25",
    time: "3:30 PM",
    location: "London",
    group: "BLOSSOM_KACPER",
  },
  {
    title: "Rooftop Cinema Club",
    date: "Jul 28",
    time: "8:55 PM",
    location: "Peckham, London",
    group: "BLOSSOM_KACPER",
  },
];

export default function Index() {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tab, setTab] = useState("Itinerary");
  const [chat, setChat] = useState([
    { sender: "Simone", text: "Welcome to Euro Summer 2026 🍋💙" },
  ]);
  const [message, setMessage] = useState("");
  const [announcement, setAnnouncement] = useState("");

  function signIn() {
    if (!selectedMember) return Alert.alert("Choose your name");
    if (!phone.trim()) return Alert.alert("Enter your phone number");

    setCurrentUser({
      ...selectedMember,
      phone,
    });
  }

  function canSeeEvent(event: any) {
    if (currentUser.role === "OWNER") return true;
    if (event.group === "EVERYONE") return true;
    if (event.group === "BLOSSOM_KACPER") {
      return ["Blossom", "Kacper"].includes(currentUser.name);
    }
    return false;
  }

  function sendChat() {
    if (!message.trim()) return;
    setChat([...chat, { sender: currentUser.name, text: message }]);
    setMessage("");
  }

  if (!currentUser) {
    return (
      <ImageBackground source={citrusPattern} style={styles.bg}>
        <LinearGradient colors={["#FFF8F2EE", "#FFF8F2DD"]} style={styles.wrap}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.logo}>🍋 TripMuse</Text>
            <Text style={styles.title}>Euro Summer 2026</Text>
            <Text style={styles.subtitle}>Choose your name and enter your phone number.</Text>

            {members.map((person) => (
              <Pressable
                key={person.id}
                onPress={() => setSelectedMember(person)}
                style={[
                  styles.memberButton,
                  selectedMember?.id === person.id && styles.selected,
                ]}
              >
                <Text style={styles.memberText}>
                  {person.role === "OWNER" ? "👑 " : "☀️ "}
                  {person.name}
                </Text>
              </Pressable>
            ))}

            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone number"
              style={styles.input}
            />

            <Pressable onPress={signIn} style={styles.primaryButton}>
              <Text style={styles.primaryText}>Enter Trip ✈️</Text>
            </Pressable>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    );
  }

  const visibleEvents = events.filter(canSeeEvent);

  return (
    <ImageBackground source={citrusPattern} style={styles.bg}>
      <LinearGradient colors={["#FFF8F2F5", "#FFF8F2E8"]} style={styles.wrap}>
        <View style={styles.app}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image source={santoriniMoodboard} style={styles.heroImage} />

            <Text style={styles.logo}>🍋 TripMuse</Text>
            <Text style={styles.title}>Euro Summer 2026</Text>
            <Text style={styles.subtitle}>
              Signed in as {currentUser.name} · {currentUser.role}
            </Text>

            <View style={styles.tabs}>
              {["Itinerary", "Chat", "Announcements"].map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setTab(item)}
                  style={[styles.tab, tab === item && styles.activeTab]}
                >
                  <Text style={styles.tabText}>{item}</Text>
                </Pressable>
              ))}
            </View>

            {tab === "Itinerary" &&
              visibleEvents.map((event, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.date}>{event.date} · {event.time}</Text>
                  <Text style={styles.cardTitle}>{event.title}</Text>
                  <Text style={styles.muted}>📍 {event.location}</Text>

                  <View style={styles.qrSlot}>
                    <Text style={styles.qrText}>QR / Ticket Upload Slot 🎟️</Text>
                  </View>

                  <Text style={styles.badge}>
                    {event.group === "EVERYONE"
                      ? "Visible to everyone 🌍"
                      : "Blossom + Kacper + Owners 💌"}
                  </Text>
                </View>
              ))}

            {tab === "Chat" && (
              <View>
                {chat.map((msg, index) => (
                  <View
                    key={index}
                    style={[
                      styles.chatBubble,
                      msg.sender === currentUser.name && styles.myBubble,
                    ]}
                  >
                    <Text style={styles.sender}>{msg.sender}</Text>
                    <Text>{msg.text}</Text>
                  </View>
                ))}

                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Send a message..."
                  style={styles.input}
                />

                <Pressable onPress={sendChat} style={styles.primaryButton}>
                  <Text style={styles.primaryText}>Send Message 💬</Text>
                </Pressable>
              </View>
            )}

            {tab === "Announcements" && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Announcements 📣</Text>

                {currentUser.role !== "OWNER" ? (
                  <Text style={styles.muted}>
                    Only Blossom, Simone, and Kacper can send announcements.
                  </Text>
                ) : (
                  <>
                    <TextInput
                      value={announcement}
                      onChangeText={setAnnouncement}
                      placeholder="Type announcement..."
                      multiline
                      style={styles.announcementBox}
                    />

                    <Pressable
                      onPress={() => {
                        Alert.alert("Blast Sent ✨", announcement || "Announcement sent!");
                        setAnnouncement("");
                      }}
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryText}>Send Blast ✨</Text>
                    </Pressable>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  wrap: { flex: 1 },
  container: {
    padding: 24,
    paddingTop: 70,
  },
  app: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  heroImage: {
    width: "100%",
    height: 210,
    borderRadius: 32,
    marginBottom: 20,
  },
  logo: {
    fontSize: 20,
    fontWeight: "900",
    color: "#C98763",
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#3F3A3A",
  },
  subtitle: {
    color: "#8E7D75",
    marginTop: 8,
    marginBottom: 22,
    fontSize: 16,
  },
  memberButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
  },
  selected: {
    backgroundColor: "#F8D7C4",
  },
  memberText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#3F3A3A",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: "#6EC7DD",
    borderRadius: 999,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#F8D7C4",
  },
  tabText: {
    fontWeight: "800",
    color: "#3F3A3A",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  date: {
    color: "#C98763",
    fontWeight: "900",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#3F3A3A",
    marginTop: 6,
  },
  muted: {
    color: "#8E7D75",
    marginTop: 8,
  },
  qrSlot: {
    height: 90,
    borderRadius: 22,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E9A7A4",
    backgroundColor: "#FFF6EF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  qrText: {
    color: "#C98763",
    fontWeight: "800",
  },
  badge: {
    marginTop: 14,
    backgroundColor: "#F8D7C4",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    fontWeight: "800",
    color: "#3F3A3A",
  },
  chatBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    maxWidth: "82%",
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#D9F4FA",
  },
  sender: {
    fontWeight: "900",
    color: "#C98763",
    marginBottom: 4,
  },
  announcementBox: {
    backgroundColor: "#FFF6EF",
    borderRadius: 22,
    padding: 16,
    minHeight: 150,
    marginTop: 16,
    textAlignVertical: "top",
  },
});