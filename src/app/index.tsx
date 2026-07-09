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
import { colors } from "../constants/theme";
import { days, members } from "../data/tripData";

const citrusPattern = require("../../assets/images/citrus-pattern.png");
const santoriniMoodboard = require("../../assets/images/santorini-moodboard.png");

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
    return event.attendees?.includes(currentUser.name);
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

            {members.map((person: any) => (
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
            {["Dashboard", "Itinerary", "Chat", "Announcements", "Map"].map(
              (item) => (
                <Pressable
                  key={item}
                  onPress={() => setTab(item)}
                  style={[styles.tab, tab === item && styles.activeTab]}
                >
                  <Text style={styles.tabText}>{item}</Text>
                </Pressable>
              )
            )}
          </View>

          {tab === "Dashboard" && (
            <>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Trip Overview</Text>
                <Text style={styles.cardTitle}>Euro Summer 2026 ✈️</Text>
                <Text style={styles.muted}>
                  London · Mykonos · Jul 24 - Aug 9
                </Text>
              </View>

              <View style={styles.grid}>
                <MiniCard title="Travelers" value="6" icon="👯‍♀️" />
                <MiniCard title="Owners" value="3" icon="👑" />
                <MiniCard title="Days" value={String(days.length)} icon="📅" />
                <MiniCard title="QR Slots" value="Ready" icon="🎟️" />
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Today’s Look</Text>
                <Text style={styles.cardTitle}>{selectedDay.outfit.title}</Text>
                <Text style={styles.muted}>
                  {selectedDay.outfit.description}
                </Text>
              </View>
            </>
          )}

          {tab === "Itinerary" && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {days.map((day: any, index: number) => (
                  <Pressable
                    key={day.id}
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

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Outfit Planner 👗</Text>
                <Text style={styles.cardTitle}>{selectedDay.outfit.title}</Text>
                <Text style={styles.muted}>
                  {selectedDay.outfit.description}
                </Text>
                <View style={styles.uploadSlot}>
                  <Text style={styles.qrText}>Upload outfit inspiration</Text>
                </View>
              </View>

              {visibleEvents.map((event: any) => (
                <View key={event.id} style={styles.card}>
                  <Text style={styles.date}>
                    {selectedDay.date} {event.time ? `· ${event.time}` : ""}
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
                      : "Private event 💌"}
                  </Text>
                </View>
              ))}
            </>
          )}

          {tab === "Chat" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Group Chat 💬</Text>
              <Text style={styles.muted}>Coming in the next milestone.</Text>
            </View>
          )}

          {tab === "Announcements" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Announcements 📣</Text>
              <Text style={styles.muted}>
                Owner-only announcements and text blasts coming next.
              </Text>
            </View>
          )}

          {tab === "Map" && (
            <View style={styles.mapCard}>
              <Text style={styles.cardTitle}>Daily Route 🗺️</Text>
              <Text style={styles.muted}>Google Maps connects here soon.</Text>
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
    color: colors.terracotta,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.text,
  },
  subtitle: {
    color: colors.muted,
    marginTop: 8,
    marginBottom: 22,
    fontSize: 16,
  },
  memberButton: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
  },
  selected: { backgroundColor: colors.blush },
  memberText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: colors.ocean,
    borderRadius: 999,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  primaryText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 16,
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  tab: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  activeTab: { backgroundColor: colors.blush },
  tabText: {
    fontWeight: "800",
    color: colors.text,
    fontSize: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  cardLabel: {
    color: colors.terracotta,
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: 12,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: colors.text,
  },
  muted: {
    color: colors.muted,
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
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
  },
  icon: { fontSize: 26 },
  miniValue: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    marginTop: 6,
  },
  dayPill: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 14,
    marginRight: 10,
    marginBottom: 18,
    minWidth: 130,
  },
  activeDayPill: {
    backgroundColor: colors.blush,
  },
  dayPillText: {
    fontWeight: "900",
    color: colors.text,
  },
  dayPillSmall: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 12,
  },
  uploadSlot: {
    height: 120,
    borderRadius: 22,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: colors.coral,
    backgroundColor: "#FFF6EF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  date: {
    color: colors.terracotta,
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
    color: colors.text,
  },
  qrSlot: {
    height: 90,
    borderRadius: 22,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: colors.coral,
    backgroundColor: "#FFF6EF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  qrText: {
    color: colors.terracotta,
    fontWeight: "800",
  },
  badge: {
    marginTop: 14,
    backgroundColor: colors.blush,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    fontWeight: "800",
    color: colors.text,
  },
  mapCard: {
    backgroundColor: colors.sky,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
});