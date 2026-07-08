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

const days = [
  {
    day: "Travel Day",
    date: "Jul 24",
    outfit: "Airport chic: linen set, gold hoops, sandals",
    events: [
      {
        title: "NYC Departure",
        time: "6:20 PM",
        location: "JFK Airport",
        confirmation: "Norse C8SR3A",
        group: "EVERYONE",
        type: "flight",
      },
    ],
  },
  {
    day: "London Day",
    date: "Jul 25",
    outfit: "Cute walking dress + sneakers",
    events: [
      {
        title: "Greenwich Observatory",
        time: "3:30 PM",
        location: "Blackheath Ave, London",
        confirmation: "",
        group: "BLOSSOM_KACPER",
        type: "activity",
      },
    ],
  },
  {
    day: "Mykonos Day 1",
    date: "Jul 31",
    outfit: "Beach club glam: white set + statement sunglasses",
    events: [
      {
        title: "Scorpios",
        time: "10:30 PM",
        location: "Paraga, Mykonos",
        confirmation: "",
        group: "EVERYONE",
        type: "reservation",
      },
    ],
  },
  {
    day: "Mykonos Day 2",
    date: "Aug 1",
    outfit: "Dinner look: blue dress + gold accessories",
    events: [
      {
        title: "Zuma Mykonos",
        time: "8:00 PM",
        location: "Mykonos, Greece",
        confirmation: "",
        group: "EVERYONE",
        type: "dinner",
      },
    ],
  },
  {
    day: "London 2nd Leg",
    date: "Aug 7",
    outfit: "Concert night: sparkly top + comfy shoes",
    events: [
      {
        title: "ABBA Voyage",
        time: "7:45 PM",
        location: "Pudding Mill Lane, London",
        confirmation: "",
        group: "EVERYONE",
        type: "show",
      },
    ],
  },
];

export default function Index() {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tab, setTab] = useState("Dashboard");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  function signIn() {
    if (!selectedMember) return Alert.alert("Choose your name");
    if (!phone.trim()) return Alert.alert("Enter your phone number");
    setCurrentUser({ ...selectedMember, phone });
  }

  function canSeeEvent(event: any) {
    if (currentUser.role === "OWNER") return true;
    if (event.group === "EVERYONE") return true;
    if (event.group === "BLOSSOM_KACPER") {
      return ["Blossom", "Kacper"].includes(currentUser.name);
    }
    return false;
  }

  if (!currentUser) {
    return (
      <ImageBackground source={citrusPattern} style={styles.bg}>
        <LinearGradient colors={["#FFF8F2EE", "#FFF8F2DD"]} style={styles.wrap}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.logo}>🍋 TripMuse</Text>
            <Text style={styles.title}>Euro Summer 2026</Text>
            <Text style={styles.subtitle}>
              Select your name and enter your phone number.
            </Text>

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

  const selectedDay = days[selectedDayIndex];
  const visibleEvents = selectedDay.events.filter(canSeeEvent);

  return (
    <ImageBackground source={citrusPattern} style={styles.bg}>
      <LinearGradient colors={["#FFF8F2F5", "#FFF8F2E8"]} style={styles.wrap}>
        <ScrollView contentContainerStyle={styles.app}>
          <Image source={santoriniMoodboard} style={styles.heroImage} />

          <Text style={styles.logo}>🍋 TripMuse</Text>
          <Text style={styles.title}>Euro Summer 2026</Text>
          <Text style={styles.subtitle}>
            Signed in as {currentUser.name} · {currentUser.role}
          </Text>

          <View style={styles.tabs}>
            {["Dashboard", "Itinerary", "Chat", "Announcements"].map((item) => (
              <Pressable
                key={item}
                onPress={() => setTab(item)}
                style={[styles.tab, tab === item && styles.activeTab]}
              >
                <Text style={styles.tabText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          {tab === "Dashboard" && (
            <>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Countdown</Text>
                <Text style={styles.cardTitle}>Euro Summer is loading ✈️</Text>
                <Text style={styles.muted}>
                  London · Mykonos · Santorini-inspired planning
                </Text>
              </View>

              <View style={styles.grid}>
                <MiniCard title="Travelers" value="6" icon="👯‍♀️" />
                <MiniCard title="Owners" value="3" icon="👑" />
                <MiniCard title="QR Slots" value="Ready" icon="🎟️" />
                <MiniCard title="Outfits" value="Daily" icon="👗" />
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Today’s Highlight</Text>
                <Text style={styles.cardTitle}>{selectedDay.day}</Text>
                <Text style={styles.muted}>{selectedDay.outfit}</Text>
              </View>
            </>
          )}

          {tab === "Itinerary" && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {days.map((day, index) => (
                  <Pressable
                    key={day.date}
                    onPress={() => setSelectedDayIndex(index)}
                    style={[
                      styles.dayPill,
                      selectedDayIndex === index && styles.activeDayPill,
                    ]}
                  >
                    <Text style={styles.dayPillText}>{day.date}</Text>
                    <Text style={styles.dayPillSmall}>{day.day}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.outfitCard}>
                <Text style={styles.cardLabel}>Outfit Planner 👗</Text>
                <Text style={styles.cardTitle}>{selectedDay.outfit}</Text>
                <View style={styles.uploadSlot}>
                  <Text style={styles.qrText}>Upload outfit inspiration</Text>
                </View>
              </View>

              {visibleEvents.length === 0 ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>No visible events</Text>
                  <Text style={styles.muted}>
                    This day has private events you do not have access to.
                  </Text>
                </View>
              ) : (
                visibleEvents.map((event, index) => (
                  <View key={index} style={styles.timelineRow}>
                    <View style={styles.timelineDot} />
                    <View style={styles.card}>
                      <Text style={styles.date}>
                        {selectedDay.date} · {event.time}
                      </Text>
                      <Text style={styles.cardTitle}>{event.title}</Text>
                      <Text style={styles.muted}>📍 {event.location}</Text>

                      <View style={styles.infoBox}>
                        <Text style={styles.cardLabel}>Confirmation</Text>
                        <Text style={styles.infoText}>
                          {event.confirmation || "Not added yet"}
                        </Text>
                      </View>

                      <View style={styles.qrSlot}>
                        <Text style={styles.qrText}>QR / Ticket Upload Slot 🎟️</Text>
                      </View>

                      <Text style={styles.badge}>
                        {event.group === "EVERYONE"
                          ? "Visible to everyone 🌍"
                          : "Blossom + Kacper + Owners 💌"}
                      </Text>
                    </View>
                  </View>
                ))
              )}

              <View style={styles.mapCard}>
                <Text style={styles.cardLabel}>Daily Route 🗺️</Text>
                <Text style={styles.cardTitle}>Map Preview</Text>
                <Text style={styles.muted}>
                  Google Maps will connect here in Phase 4.
                </Text>
              </View>
            </>
          )}

          {tab === "Chat" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Group Chat 💬</Text>
              <Text style={styles.muted}>
                Real-time chat will connect in Phase 3.
              </Text>
            </View>
          )}

          {tab === "Announcements" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Announcements 📣</Text>
              <Text style={styles.muted}>
                Owner-only blasts will connect in Phase 3.
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}

function MiniCard({ title, value, icon }: any) {
  return (
    <View style={styles.miniCard}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.muted}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  wrap: { flex: 1 },
  container: { padding: 24, paddingTop: 70 },
  app: { padding: 20, paddingTop: 50, paddingBottom: 60 },
  heroImage: {
    width: "100%",
    height: 220,
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
  selected: { backgroundColor: "#F8D7C4" },
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
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTab: { backgroundColor: "#F8D7C4" },
  tabText: {
    fontWeight: "800",
    color: "#3F3A3A",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  cardLabel: {
    color: "#C98763",
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: 12,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: "#3F3A3A",
  },
  muted: {
    color: "#8E7D75",
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  miniCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
  },
  icon: { fontSize: 26 },
  miniValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#3F3A3A",
    marginTop: 6,
  },
  dayPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    marginRight: 10,
    marginBottom: 18,
    minWidth: 130,
  },
  activeDayPill: {
    backgroundColor: "#F8D7C4",
  },
  dayPillText: {
    fontWeight: "900",
    color: "#3F3A3A",
  },
  dayPillSmall: {
    color: "#8E7D75",
    marginTop: 4,
    fontSize: 12,
  },
  outfitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  uploadSlot: {
    height: 120,
    borderRadius: 22,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E9A7A4",
    backgroundColor: "#FFF6EF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  timelineRow: {
    borderLeftWidth: 3,
    borderLeftColor: "#F8D7C4",
    paddingLeft: 16,
    marginLeft: 8,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "#6EC7DD",
    marginLeft: -25,
    marginBottom: -8,
  },
  date: {
    color: "#C98763",
    fontWeight: "900",
  },
  infoBox: {
    backgroundColor: "#FFF6EF",
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
  },
  infoText: {
    fontWeight: "800",
    color: "#3F3A3A",
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
  mapCard: {
    backgroundColor: "#D9F4FA",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
});