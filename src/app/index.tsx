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

  const [chatMessages, setChatMessages] = useState([
    {
      id: "msg-1",
      sender: "Simone",
      text: "Welcome to Euro Summer 2026 🍋💙",
      time: "Now",
    },
    {
      id: "msg-2",
      sender: "Blossom",
      text: "So excited for London and Mykonos!",
      time: "Now",
    },
  ]);

  const [chatInput, setChatInput] = useState("");
  const [announcementInput, setAnnouncementInput] = useState("");
  const [announcementAudience, setAnnouncementAudience] = useState("EVERYONE");

  const [announcements, setAnnouncements] = useState([
    {
      id: "ann-1",
      sender: "Simone",
      title: "Trip planning started",
      body: "Welcome to the official Euro Summer 2026 itinerary app.",
      audience: "EVERYONE",
    },
  ]);

  function signIn() {
    if (!selectedMember) {
      Alert.alert("Choose your name");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Enter your phone number");
      return;
    }

    setCurrentUser({
      ...selectedMember,
      phone,
    });
  }

  function canSeeEvent(event: any, user: any) {
    if (!user) return false;
    if (user.role === "OWNER") return true;
    if (event.group === "EVERYONE") return true;
    return event.attendees?.includes(user.name);
  }

  function sendChatMessage() {
    if (!currentUser) return;
    if (!chatInput.trim()) return;

    setChatMessages([
      ...chatMessages,
      {
        id: `msg-${Date.now()}`,
        sender: currentUser.name,
        text: chatInput,
        time: "Now",
      },
    ]);

    setChatInput("");
  }

  function sendAnnouncement() {
    if (!currentUser) return;

    if (currentUser.role !== "OWNER") {
      Alert.alert(
        "Owner Only",
        "Only Blossom, Simone, and Kacper can send announcements."
      );
      return;
    }

    if (!announcementInput.trim()) return;

    setAnnouncements([
      {
        id: `ann-${Date.now()}`,
        sender: currentUser.name,
        title: "Trip Update",
        body: announcementInput,
        audience: announcementAudience,
      },
      ...announcements,
    ]);

    Alert.alert("Blast Sent ✨", `Announcement sent to ${announcementAudience}.`);
    setAnnouncementInput("");
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
  const visibleEvents = selectedDay.events.filter((event: any) =>
    canSeeEvent(event, currentUser)
  );

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

              {visibleEvents.length === 0 ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>No visible events</Text>
                  <Text style={styles.muted}>
                    This day has private events you do not have access to.
                  </Text>
                </View>
              ) : (
                visibleEvents.map((event: any) => (
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
                      <Text style={styles.qrText}>
                        QR / Ticket Upload Slot 🎟️
                      </Text>
                    </View>

                    <Text style={styles.badge}>
                      {event.group === "EVERYONE"
                        ? "Visible to everyone 🌍"
                        : "Private event 💌"}
                    </Text>
                  </View>
                ))
              )}
            </>
          )}

          {tab === "Chat" && (
            <View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Group Chat</Text>
                <Text style={styles.cardTitle}>Euro Summer Chat 💬</Text>
                <Text style={styles.muted}>
                  Messages are local for now. Firebase real-time chat comes later.
                </Text>
              </View>

              {chatMessages.map((message: any) => (
                <View
                  key={message.id}
                  style={[
                    styles.chatBubble,
                    message.sender === currentUser.name && styles.myChatBubble,
                  ]}
                >
                  <Text style={styles.chatSender}>{message.sender}</Text>
                  <Text style={styles.chatText}>{message.text}</Text>
                  <Text style={styles.chatTime}>{message.time}</Text>
                </View>
              ))}

              <View style={styles.chatInputRow}>
                <TextInput
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Send a message..."
                  style={styles.chatInput}
                />

                <Pressable onPress={sendChatMessage} style={styles.sendButton}>
                  <Text style={styles.sendButtonText}>Send</Text>
                </Pressable>
              </View>
            </View>
          )}

          {tab === "Announcements" && (
            <View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Announcements</Text>
                <Text style={styles.cardTitle}>Text Blasts 📣</Text>

                {currentUser.role !== "OWNER" ? (
                  <Text style={styles.muted}>
                    Only Blossom, Simone, and Kacper can send announcements.
                  </Text>
                ) : (
                  <>
                    <View style={styles.audienceRow}>
                      {["EVERYONE", "OWNERS", "BLOSSOM_KACPER"].map(
                        (audience) => (
                          <Pressable
                            key={audience}
                            onPress={() => setAnnouncementAudience(audience)}
                            style={[
                              styles.audiencePill,
                              announcementAudience === audience &&
                                styles.activeAudiencePill,
                            ]}
                          >
                            <Text style={styles.audienceText}>{audience}</Text>
                          </Pressable>
                        )
                      )}
                    </View>

                    <TextInput
                      value={announcementInput}
                      onChangeText={setAnnouncementInput}
                      placeholder="Type your announcement..."
                      multiline
                      style={styles.announcementBox}
                    />

                    <Pressable
                      onPress={sendAnnouncement}
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryText}>Send Blast ✨</Text>
                    </Pressable>
                  </>
                )}
              </View>

              {announcements.map((announcement: any) => (
                <View key={announcement.id} style={styles.announcementCard}>
                  <Text style={styles.cardLabel}>
                    Sent to {announcement.audience}
                  </Text>
                  <Text style={styles.cardTitle}>{announcement.title}</Text>
                  <Text style={styles.muted}>{announcement.body}</Text>
                  <Text style={styles.announcementSender}>
                    Sent by {announcement.sender}
                  </Text>
                </View>
              ))}
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

  chatBubble: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    maxWidth: "82%",
  },

  myChatBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.sky,
  },

  chatSender: {
    fontWeight: "900",
    color: colors.terracotta,
    marginBottom: 4,
  },

  chatText: {
    color: colors.text,
    fontSize: 15,
  },

  chatTime: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 6,
  },

  chatInputRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginBottom: 30,
  },

  chatInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  sendButton: {
    backgroundColor: colors.coral,
    borderRadius: 999,
    paddingHorizontal: 18,
    justifyContent: "center",
  },

  sendButtonText: {
    color: colors.white,
    fontWeight: "900",
  },

  audienceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },

  audiencePill: {
    backgroundColor: "#FFF6EF",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  activeAudiencePill: {
    backgroundColor: colors.blush,
  },

  audienceText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 12,
  },

  announcementBox: {
    backgroundColor: "#FFF6EF",
    borderRadius: 22,
    padding: 16,
    minHeight: 140,
    marginTop: 16,
    textAlignVertical: "top",
  },

  announcementCard: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: colors.ocean,
  },

  announcementSender: {
    color: colors.terracotta,
    fontWeight: "800",
    marginTop: 12,
  },

  mapCard: {
    backgroundColor: colors.sky,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
});