import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "../constants/theme";
import { days, members } from "../data/tripData";
import { db } from "../services/firebase";

const citrusPattern = require("../../assets/images/citrus-pattern.png");
const santoriniMoodboard = require("../../assets/images/santorini-moodboard.png");

const travelerPhoneLast4: any = {
  blossom: "6249",
  simone: "6224",
  kacper: "4754",
  sam: "3963",
  liz: "3661",
  devvora: "2122",
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function getLastFour(value: string) {
  const digits = normalizePhone(value);
  return digits.slice(-4);
}

export default function Index() {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tab, setTab] = useState("Dashboard");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const tripMembers =
    Array.isArray(members) && members.length > 0
      ? members
      : [
          { id: "blossom", name: "Blossom", role: "OWNER" },
          { id: "simone", name: "Simone", role: "OWNER" },
          { id: "kacper", name: "Kacper", role: "OWNER" },
          { id: "sam", name: "Sam", role: "VIEWER" },
          { id: "liz", name: "Elizabeth/Liz", role: "VIEWER" },
          { id: "devvora", name: "Devvora", role: "VIEWER" },
        ];

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

  const [uploads, setUploads] = useState<any>({});
  const [uploadLabels, setUploadLabels] = useState<any>({});
  const [customEvents, setCustomEvents] = useState<any[]>([]);
  const [deletedEventIds, setDeletedEventIds] = useState<any>({});
  const [selectedClosetMemberId, setSelectedClosetMemberId] = useState(
    tripMembers[0]?.id || "blossom"
  );

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventConfirmation, setNewEventConfirmation] = useState("");
  const [newEventType, setNewEventType] = useState("activity");
  const [newEventGroup, setNewEventGroup] = useState("EVERYONE");

  useEffect(() => {
    const uploadsQuery = query(collection(db, "tripmuse-uploads"));

    const unsubscribeUploads = onSnapshot(
      uploadsQuery,
      (snapshot) => {
        const uploadMap: any = {};

        snapshot.docs.forEach((docSnapshot: any) => {
          const data = docSnapshot.data();
          uploadMap[docSnapshot.id] = {
            id: docSnapshot.id,
            ...data,
          };
        });

        setUploads(uploadMap);
      },
      (error) => {
        console.log("Upload listener error:", error);
      }
    );

    return () => unsubscribeUploads();
  }, []);

  useEffect(() => {
    const uploadLabelsQuery = query(collection(db, "tripmuse-upload-labels"));

    const unsubscribeUploadLabels = onSnapshot(
      uploadLabelsQuery,
      (snapshot) => {
        const labelMap: any = {};

        snapshot.docs.forEach((docSnapshot: any) => {
          const data = docSnapshot.data();
          labelMap[docSnapshot.id] = {
            id: docSnapshot.id,
            label: data.label || "",
          };
        });

        setUploadLabels(labelMap);
      },
      (error) => {
        console.log("Upload labels listener error:", error);
      }
    );

    return () => unsubscribeUploadLabels();
  }, []);

  useEffect(() => {
    const chatQuery = query(
      collection(db, "tripmuse-chat"),
      orderBy("createdAt", "asc")
    );

    const unsubscribeChat = onSnapshot(
      chatQuery,
      (snapshot) => {
        const firebaseMessages = snapshot.docs.map((docSnapshot: any) => {
          const data = docSnapshot.data();

          return {
            id: docSnapshot.id,
            sender: data.sender,
            text: data.text,
            time: data.createdAt?.toDate
              ? data.createdAt.toDate().toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Now",
          };
        });

        setChatMessages(firebaseMessages);
      },
      (error) => {
        console.log("Chat listener error:", error);
      }
    );

    const announcementQuery = query(
      collection(db, "tripmuse-announcements"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeAnnouncements = onSnapshot(
      announcementQuery,
      (snapshot) => {
        const firebaseAnnouncements = snapshot.docs.map((docSnapshot: any) => {
          const data = docSnapshot.data();

          return {
            id: docSnapshot.id,
            sender: data.sender,
            title: data.title,
            body: data.body,
            audience: data.audience,
          };
        });

        setAnnouncements(firebaseAnnouncements);
      },
      (error) => {
        console.log("Announcement listener error:", error);
      }
    );

    const eventsQuery = query(
      collection(db, "tripmuse-events"),
      orderBy("createdAt", "asc")
    );

    const unsubscribeEvents = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const firebaseEvents = snapshot.docs.map((docSnapshot: any) => {
          const data = docSnapshot.data();

          return {
            id: docSnapshot.id,
            source: "custom",
            dayId: data.dayId,
            title: data.title || "Untitled Event",
            time: data.time || "",
            location: data.location || "",
            confirmation: data.confirmation || "",
            group: data.group || "EVERYONE",
            attendees: data.attendees || tripMembers.map((person: any) => person.name),
            type: data.type || "activity",
            notes: data.notes || "",
            images: [],
            createdBy: data.createdBy || "",
          };
        });

        setCustomEvents(firebaseEvents);
      },
      (error) => {
        console.log("Events listener error:", error);
      }
    );

    const deletedEventsQuery = query(
      collection(db, "tripmuse-deleted-events"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeDeletedEvents = onSnapshot(
      deletedEventsQuery,
      (snapshot) => {
        const deletedMap: any = {};

        snapshot.docs.forEach((docSnapshot: any) => {
          deletedMap[docSnapshot.id] = true;
        });

        setDeletedEventIds(deletedMap);
      },
      (error) => {
        console.log("Deleted events listener error:", error);
      }
    );

    return () => {
      unsubscribeChat();
      unsubscribeAnnouncements();
      unsubscribeEvents();
      unsubscribeDeletedEvents();
    };
  }, []);

  function signIn() {
    if (!selectedMember) {
      Alert.alert("Choose your name");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Enter your phone number");
      return;
    }

    const expectedLast4 = travelerPhoneLast4[selectedMember.id];
    const enteredLast4 = getLastFour(phone);

    if (!expectedLast4) {
      Alert.alert(
        "Verification unavailable",
        "This traveler does not have a verification number set up yet."
      );
      return;
    }

    if (enteredLast4 !== expectedLast4) {
      Alert.alert(
        "Phone not verified",
        "That phone number does not match the selected traveler."
      );
      return;
    }

    setCurrentUser({
      ...selectedMember,
      phoneLast4: enteredLast4,
      phoneVerified: true,
    });

    setPhone("");
  }

  function signOut() {
    setCurrentUser(null);
    setSelectedMember(null);
    setPhone("");
    setTab("Dashboard");
    setSelectedDayIndex(0);
  }

  function canSeeEvent(event: any, user: any) {
    if (!user) return false;
    if (user.role === "OWNER") return true;
    if (event.group === "EVERYONE") return true;
    return event.attendees?.includes(user.name);
  }

  async function sendChatMessage() {
    if (!currentUser || !currentUser.name) return;
    if (!chatInput.trim()) return;

    const messageText = chatInput;
    setChatInput("");

    try {
      await addDoc(collection(db, "tripmuse-chat"), {
        sender: currentUser.name,
        senderRole: currentUser.role,
        text: messageText,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      Alert.alert("Message not sent", "Please try again.");
      console.log(error);
    }
  }

  function openLocationInMaps(location: string) {
    if (!location) {
      Alert.alert("No location", "This event does not have a location yet.");
      return;
    }

    const encodedLocation = encodeURIComponent(location);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;

    Linking.openURL(url);
  }

  function getEventsForDay(day: any) {
    const sharedEvents = customEvents.filter((event: any) => event.dayId === day.id);

    return [...day.events, ...sharedEvents].filter(
      (event: any) => !deletedEventIds[event.id]
    );
  }

  function getAttendeesForGroup(group: string) {
    if (group === "OWNERS") {
      return tripMembers
        .filter((person: any) => person.role === "OWNER")
        .map((person: any) => person.name);
    }

    if (group === "PRIVATE") {
      return currentUser?.name ? [currentUser.name] : [];
    }

    return tripMembers.map((person: any) => person.name);
  }

  function openDailyRouteInMaps() {
    const selectedDay = days[selectedDayIndex];
    const visibleEvents = getEventsForDay(selectedDay).filter((event: any) =>
      canSeeEvent(event, currentUser)
    );

    const routeLocations = visibleEvents
      .map((event: any) => event.location)
      .filter(Boolean);

    if (routeLocations.length === 0) {
      Alert.alert("No route", "This day does not have locations yet.");
      return;
    }

    const routePath = routeLocations
      .map((location: string) => encodeURIComponent(location))
      .join("/");

    const url = `https://www.google.com/maps/dir/${routePath}`;

    Linking.openURL(url);
  }

  async function addCustomEvent() {
    if (!currentUser || currentUser.role !== "OWNER") {
      Alert.alert("Owner only", "Only trip owners can add events.");
      return;
    }

    if (!newEventTitle.trim()) {
      Alert.alert("Add a title", "Please enter an event title.");
      return;
    }

    const selectedDay = days[selectedDayIndex];

    try {
      await addDoc(collection(db, "tripmuse-events"), {
        dayId: selectedDay.id,
        dayLabel: selectedDay.day,
        date: selectedDay.date,
        title: newEventTitle.trim(),
        time: newEventTime.trim(),
        location: newEventLocation.trim(),
        confirmation: newEventConfirmation.trim(),
        group: newEventGroup,
        attendees: getAttendeesForGroup(newEventGroup),
        type: newEventType.trim() || "activity",
        notes: "",
        createdBy: currentUser.name,
        createdAt: serverTimestamp(),
      });

      setNewEventTitle("");
      setNewEventTime("");
      setNewEventLocation("");
      setNewEventConfirmation("");
      setNewEventType("activity");
      setNewEventGroup("EVERYONE");

      Alert.alert("Event Added ✨", "The event is now shared.");
    } catch (error) {
      console.log("Add event error:", error);
      Alert.alert("Event not added", "Please try again.");
    }
  }

  async function deleteEvent(event: any) {
    if (!currentUser || currentUser.role !== "OWNER") {
      Alert.alert("Owner only", "Only trip owners can delete events.");
      return;
    }

    try {
      if (event.source === "custom") {
        await deleteDoc(doc(db, "tripmuse-events", event.id));
      } else {
        await setDoc(doc(db, "tripmuse-deleted-events", event.id), {
          eventId: event.id,
          title: event.title,
          deletedBy: currentUser.name,
          createdAt: serverTimestamp(),
        });
      }

      Alert.alert("Event Deleted", "The event was removed from the shared itinerary.");
    } catch (error) {
      console.log("Delete event error:", error);
      Alert.alert("Event not deleted", "Please try again.");
    }
  }

  function updateUploadLabelDraft(slotKey: string, label: string) {
    setUploadLabels((currentLabels: any) => ({
      ...currentLabels,
      [slotKey]: {
        ...(currentLabels[slotKey] || {}),
        label,
      },
    }));
  }

  async function saveUploadLabel(slotKey: string, fallbackLabel: string) {
    if (!currentUser || !currentUser.name) return;

    const label = (uploadLabels[slotKey]?.label || fallbackLabel || "").trim();
    if (!label) return;

    try {
      await setDoc(doc(db, "tripmuse-upload-labels", slotKey), {
        label,
        updatedBy: currentUser.name,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.log("Tile label save error:", error);
    }
  }

  async function pickUploadImage(slotKey: string, label: string) {
    if (!currentUser || !currentUser.name) return;

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo access so you can upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsEditing: true,
      quality: 0.08,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    if (!asset.base64) {
      Alert.alert("Image issue", "Please choose a smaller image.");
      return;
    }

    if (asset.base64.length > 700000) {
      Alert.alert(
        "Image too large",
        "Please choose a screenshot or smaller image so it can sync for everyone."
      );
      return;
    }

    const imageUri = `data:image/jpeg;base64,${asset.base64}`;

    const savedUpload = {
      slotKey,
      label,
      uploadedBy: currentUser.name,
      uploadedByRole: currentUser.role,
      status: "Uploaded",
      time: new Date().toLocaleString(),
      uri: imageUri,
      fileName: asset.fileName || `${slotKey}.jpg`,
      type: "image",
      createdAt: serverTimestamp(),
    };

    setUploads((currentUploads: any) => ({
      ...currentUploads,
      [slotKey]: {
        ...savedUpload,
        createdAt: new Date().toISOString(),
      },
    }));

    try {
      await setDoc(doc(db, "tripmuse-uploads", slotKey), savedUpload);
      Alert.alert("Image Saved ✨", `${label} image is now shared.`);
    } catch (error) {
      console.log("Cloud save error:", error);
      Alert.alert(
        "Image not saved",
        "Please choose a smaller image or screenshot."
      );
    }
  }

  async function deleteUpload(slotKey: string) {
    const updatedUploads = { ...uploads };
    delete updatedUploads[slotKey];

    setUploads(updatedUploads);

    try {
      await deleteDoc(doc(db, "tripmuse-uploads", slotKey));
      Alert.alert("Upload Removed", "The shared image was removed.");
    } catch (error) {
      console.log("Delete upload error:", error);
      Alert.alert("Upload not deleted", "Please try again.");
    }
  }

  function renderUploadSlot(
    slotKey: string,
    label: string,
    icon: string,
    canEdit = true
  ) {
    const upload = uploads[slotKey];
    const displayLabel = uploadLabels[slotKey]?.label || upload?.label || label;

    return (
      <View style={styles.uploadSlotCard}>
        <View style={styles.uploadSlotTopRow}>
          <Text style={styles.uploadIcon}>{icon}</Text>

          <View style={{ flex: 1 }}>
            {canEdit ? (
              <TextInput
                value={displayLabel}
                onChangeText={(value) => updateUploadLabelDraft(slotKey, value)}
                onBlur={() => saveUploadLabel(slotKey, displayLabel)}
                placeholder="Tile name"
                style={styles.tileLabelInput}
              />
            ) : (
              <Text style={styles.uploadTitle}>{displayLabel}</Text>
            )}

            <Text style={styles.uploadStatus}>
              {upload
                ? `Uploaded by ${upload.uploadedBy} · ${upload.time}`
                : "No image uploaded yet"}
            </Text>
          </View>
        </View>

        {upload?.uri && (
          <Image
            source={{ uri: upload.uri }}
            style={styles.uploadPreview}
            resizeMode="contain"
          />
        )}

        {canEdit ? (
          <>
            <Pressable
              onPress={() => pickUploadImage(slotKey, displayLabel)}
              style={[
                styles.uploadActionButton,
                upload && styles.uploadActionButtonDone,
              ]}
            >
              <Text style={styles.uploadActionText}>
                {upload ? "Replace Saved Image" : "Choose Image"}
              </Text>
            </Pressable>

            {upload && (
              <Pressable
                onPress={() => deleteUpload(slotKey)}
                style={styles.deleteUploadButton}
              >
                <Text style={styles.deleteUploadText}>Delete Upload</Text>
              </Pressable>
            )}
          </>
        ) : (
          <Text style={styles.readOnlyText}>Viewing only</Text>
        )}
      </View>
    );
  }

  async function sendAnnouncement() {
    if (!currentUser || !currentUser.name) return;

    if (currentUser.role !== "OWNER") {
      Alert.alert(
        "Owner Only",
        "Only Blossom, Simone, and Kacper can send announcements."
      );
      return;
    }

    if (!announcementInput.trim()) return;

    const announcementText = announcementInput;
    setAnnouncementInput("");

    try {
      await addDoc(collection(db, "tripmuse-announcements"), {
        sender: currentUser.name,
        senderRole: currentUser.role,
        title: "Trip Update",
        body: announcementText,
        audience: announcementAudience,
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        "Blast Sent ✨",
        `Announcement sent to ${announcementAudience}.`
      );
    } catch (error) {
      Alert.alert("Announcement not sent", "Please try again.");
      console.log(error);
    }
  }

  if (!currentUser || !currentUser.name) {
    return (
      <ImageBackground
  source={citrusPattern}
  style={styles.bg}
  imageStyle={styles.bgImage}
  resizeMode="repeat"
>
        <LinearGradient colors={["#FFF8F2EE", "#FFF8F2DD"]} style={styles.wrap}>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <Text style={styles.logo}>🍋 EuroSummer2026</Text>
            <Text style={styles.title}>Euro Summer 2026</Text>
            <Text style={styles.subtitle}>
              Select your name and enter your phone number to verify your trip
              access.
            </Text>

            {tripMembers.map((person: any) => (
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

            {selectedMember && (
              <View style={styles.verifyCard}>
                <Text style={styles.cardLabel}>Phone Verification</Text>
                <Text style={styles.verifyText}>
                  Enter the phone number linked to {selectedMember.name}.
                </Text>
              </View>
            )}

            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone number"
              style={styles.input}
            />

            <Pressable onPress={signIn} style={styles.primaryButton}>
              <Text style={styles.primaryText}>Verify & Enter Trip ✈️</Text>
            </Pressable>

            <Text style={styles.loginNote}>
              Your phone number is used to confirm your traveler access.
            </Text>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    );
  }

  const selectedDay = days[selectedDayIndex];
  const selectedDayEvents = getEventsForDay(selectedDay);
  const visibleEvents = selectedDayEvents.filter((event: any) =>
    canSeeEvent(event, currentUser)
  );

  const selectedClosetMember =
    tripMembers.find((person: any) => person.id === selectedClosetMemberId) ||
    tripMembers[0];

  const canEditSelectedCloset =
    currentUser?.role === "OWNER" ||
    selectedClosetMember?.id === currentUser?.id;

  return (
    <ImageBackground
  source={citrusPattern}
  style={styles.bg}
  imageStyle={styles.bgImage}
  resizeMode="repeat"
>
      <LinearGradient colors={["#FFF8F2F5", "#FFF8F2E8"]} style={styles.wrap}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.app}>
          <Image source={santoriniMoodboard} style={styles.heroImage} />

          <Text style={styles.logo}>🍋 EuroSummer2026</Text>
          <Text style={styles.title}>Euro Summer 2026</Text>
          <Text style={styles.subtitle}>
            Signed in as {currentUser.name} · {currentUser.role}
          </Text>

          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>
              Verified phone ending in {currentUser.phoneLast4} ✅
            </Text>
          </View>

          <Pressable onPress={signOut} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>

          <View style={styles.tabs}>
            {["Dashboard", "Itinerary", "Closets", "Chat", "Announcements", "Map"].map(
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
              <View style={styles.tripReadyCard}>
                <Text style={styles.cardLabel}>Trip Ready</Text>
                <Text style={styles.cardTitle}>Welcome, {currentUser.name} 🍋</Text>
                <Text style={styles.muted}>
                  Your access is verified. Everything you need for London and Mykonos is one tap away.
                </Text>

                <View style={styles.quickActions}>
                  <Pressable
                    onPress={() => setTab("Itinerary")}
                    style={styles.quickButton}
                  >
                    <Text style={styles.quickButtonText}>View Itinerary</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setTab("Chat")}
                    style={styles.quickButtonLight}
                  >
                    <Text style={styles.quickButtonLightText}>Open Chat</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setTab("Closets")}
                    style={styles.quickButtonLight}
                  >
                    <Text style={styles.quickButtonLightText}>View Closets</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Trip Overview</Text>
                <Text style={styles.cardTitle}>Euro Summer 2026 ✈️</Text>
                <Text style={styles.muted}>
                  London · Mykonos · Jul 24 - Aug 9
                </Text>
              </View>

<View style={styles.statusCard}>
  <Text style={styles.cardLabel}>Trip Status</Text>
  <Text style={styles.cardTitle}>Planning Mode: Active ✨</Text>
  <Text style={styles.muted}>
    Itinerary, group chat, announcements, maps, outfits, and travel uploads are ready.
  </Text>
</View>

              <View style={styles.grid}>
                <MiniCard title="Travelers" value="6" icon="👯‍♀️" />
                <MiniCard title="Owners" value="3" icon="👑" />
                <MiniCard title="Days" value={String(days.length)} icon="📅" />
                <MiniCard title="Closets" value="Shared" icon="👗" />
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Today’s Look</Text>
                <Text style={styles.cardTitle}>{selectedDay.outfit.title}</Text>
                <Text style={styles.muted}>
                  {selectedDay.outfit.description}
                </Text>
              </View>

              {currentUser.role === "OWNER" && (
                <View style={styles.ownerCard}>
                  <Text style={styles.cardLabel}>Owner Controls</Text>
                  <Text style={styles.cardTitle}>Trip Admin 👑</Text>
                  <Text style={styles.muted}>
                    You can send announcements, manage uploads, and view private
                    events.
                  </Text>

                  <View style={styles.ownerActions}>
                    <Pressable
                      onPress={() => setTab("Announcements")}
                      style={styles.ownerButton}
                    >
                      <Text style={styles.ownerButtonText}>
                        Send Announcement
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setTab("Itinerary")}
                      style={styles.ownerButtonLight}
                    >
                      <Text style={styles.ownerButtonLightText}>
                        Manage Uploads
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
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

                {renderUploadSlot(
                  `outfit-${selectedDay.id}`,
                  "Outfit Inspiration",
                  "👗"
                )}
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

                    <View style={styles.uploadGrid}>
                      {renderUploadSlot(`qr-${event.id}`, "QR / Ticket", "🎟️")}
                      {renderUploadSlot(
                        `confirmation-${event.id}`,
                        "Confirmation Screenshot",
                        "🧾"
                      )}
                      {renderUploadSlot(
                        `photos-${event.id}`,
                        "Event Photos",
                        "📸"
                      )}
                    </View>

                    <Text style={styles.badge}>
                      {event.group === "EVERYONE"
                        ? "Visible to everyone 🌍"
                        : event.group === "OWNERS"
                        ? "Owners only 👑"
                        : "Private event 💌"}
                    </Text>

                    {currentUser.role === "OWNER" && (
                      <Pressable
                        onPress={() => deleteEvent(event)}
                        style={styles.dangerButton}
                      >
                        <Text style={styles.dangerButtonText}>Delete Event</Text>
                      </Pressable>
                    )}
                  </View>
                ))
              )}

              {currentUser.role === "OWNER" && (
                <View style={styles.ownerCard}>
                  <Text style={styles.cardLabel}>Owner Event Controls</Text>
                  <Text style={styles.cardTitle}>Add an Event ➕</Text>
                  <Text style={styles.muted}>
                    Adds to {selectedDay.date} · {selectedDay.day}
                  </Text>

                  <TextInput
                    value={newEventTitle}
                    onChangeText={setNewEventTitle}
                    placeholder="Event title"
                    style={styles.eventInput}
                  />

                  <TextInput
                    value={newEventTime}
                    onChangeText={setNewEventTime}
                    placeholder="Time, ex: 8:00 PM"
                    style={styles.eventInput}
                  />

                  <TextInput
                    value={newEventLocation}
                    onChangeText={setNewEventLocation}
                    placeholder="Location"
                    style={styles.eventInput}
                  />

                  <TextInput
                    value={newEventConfirmation}
                    onChangeText={setNewEventConfirmation}
                    placeholder="Confirmation / notes"
                    style={styles.eventInput}
                  />

                  <TextInput
                    value={newEventType}
                    onChangeText={setNewEventType}
                    placeholder="Type, ex: dinner, flight, activity"
                    style={styles.eventInput}
                  />

                  <View style={styles.audienceRow}>
                    {["EVERYONE", "OWNERS", "PRIVATE"].map((group) => (
                      <Pressable
                        key={group}
                        onPress={() => setNewEventGroup(group)}
                        style={[
                          styles.audiencePill,
                          newEventGroup === group && styles.activeAudiencePill,
                        ]}
                      >
                        <Text style={styles.audienceText}>{group}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Pressable onPress={addCustomEvent} style={styles.primaryButton}>
                    <Text style={styles.primaryText}>Add Event</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}

          {tab === "Closets" && (
            <View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Shared Closets</Text>
                <Text style={styles.cardTitle}>Traveler Outfit Boards 👗</Text>
                <Text style={styles.muted}>
                  Pick a traveler to view their closet. Everyone can view; owners can help manage.
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tripMembers.map((person: any) => (
                  <Pressable
                    key={person.id}
                    onPress={() => setSelectedClosetMemberId(person.id)}
                    style={[
                      styles.closetPill,
                      selectedClosetMemberId === person.id && styles.activeClosetPill,
                    ]}
                  >
                    <Text style={styles.closetPillText}>{person.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>
                  {selectedClosetMember?.name || "Traveler"}'s Closet
                </Text>
                <Text style={styles.cardTitle}>Outfit Inspiration</Text>
                <Text style={styles.muted}>
                  {canEditSelectedCloset
                    ? "Upload and manage looks for this closet."
                    : "You are viewing this traveler's closet."}
                </Text>

                <View style={styles.uploadGrid}>
                  {[
                    "Travel Look",
                    "Dinner Look",
                    "Beach Club Look",
                    "Night Out",
                    "Festival Fit",
                    "Extra Inspiration",
                  ].map((label, index) =>
                    renderUploadSlot(
                      `closet-${selectedClosetMember?.id || "traveler"}-${index + 1}`,
                      label,
                      "👗",
                      canEditSelectedCloset
                    )
                  )}
                </View>
              </View>
            </View>
          )}

          {tab === "Chat" && (
            <View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Group Chat</Text>
                <Text style={styles.cardTitle}>Euro Summer Chat 💬</Text>
                <Text style={styles.muted}>
                  Messages now save to Firebase Firestore.
                </Text>
              </View>

              {chatMessages.map((message: any) => (
                <View
                  key={message.id}
                  style={[
                    styles.chatBubble,
                    message.sender === currentUser?.name && styles.myChatBubble,
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

                {currentUser?.role !== "OWNER" ? (
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
            <View>
              <View style={styles.mapHero}>
                <Text style={styles.cardLabel}>Map Preview</Text>
                <Text style={styles.cardTitle}>Daily Route 🗺️</Text>
                <Text style={styles.muted}>
                  Showing visible locations for {selectedDay.day}.
                </Text>

                <Pressable
                  onPress={openDailyRouteInMaps}
                  style={styles.routeButton}
                >
                  <Text style={styles.primaryText}>
                    Open Daily Route in Google Maps
                  </Text>
                </Pressable>
              </View>

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

              {visibleEvents.length === 0 ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>No map locations</Text>
                  <Text style={styles.muted}>
                    This day has no visible events with locations.
                  </Text>
                </View>
              ) : (
                visibleEvents.map((event: any) => (
                  <View key={event.id} style={styles.locationCard}>
                    <View style={styles.locationTopRow}>
                      <Text style={styles.locationIcon}>
                        {event.type === "flight"
                          ? "✈️"
                          : event.type === "dinner"
                          ? "🍽️"
                          : event.type === "nightlife"
                          ? "🍸"
                          : event.type === "festival"
                          ? "🎶"
                          : "📍"}
                      </Text>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{event.title}</Text>
                        <Text style={styles.locationMeta}>
                          {selectedDay.date}{" "}
                          {event.time ? `· ${event.time}` : ""}
                        </Text>
                        <Text style={styles.muted}>{event.location}</Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => openLocationInMaps(event.location)}
                      style={styles.outlineButton}
                    >
                      <Text style={styles.outlineButtonText}>
                        Open Location
                      </Text>
                    </Pressable>
                  </View>
                ))
              )}
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
  bg: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFF8F2",
  },

  bgImage: {
    opacity: 0.14,
  },

  wrap: {
    flex: 1,
    width: "100%",
  },

  scroll: {
    flex: 1,
    width: "100%",
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 86,
    paddingBottom: 120,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  app: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 86,
    paddingBottom: 150,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  heroImage: {
    width: "100%",
    height: 150,
    borderRadius: 26,
    marginBottom: 16,
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
    marginBottom: 14,
    fontSize: 16,
  },

  loginNote: {
    color: colors.muted,
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
  },

  verifyCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    marginTop: 8,
    marginBottom: 6,
    borderLeftWidth: 5,
    borderLeftColor: colors.ocean,
  },

  verifyText: {
    color: colors.text,
    fontWeight: "700",
    lineHeight: 20,
  },

  verifiedBadge: {
    backgroundColor: colors.sky,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginBottom: 12,
  },

  verifiedText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 12,
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

  signOutButton: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
    marginBottom: 18,
  },

  signOutText: {
    color: colors.terracotta,
    fontWeight: "900",
  },

  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 18,
    width: "100%",
    justifyContent: "center",
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

  tripReadyCard: {
    backgroundColor: colors.sky,
    borderRadius: 30,
    padding: 22,
    marginBottom: 16,
  },

  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },

  quickButton: {
    backgroundColor: colors.ocean,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  quickButtonText: {
    color: colors.white,
    fontWeight: "900",
  },

  quickButtonLight: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  quickButtonLightText: {
    color: colors.ocean,
    fontWeight: "900",
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
  },

  cardLabel: {
    color: colors.terracotta,
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: 12,
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 20,
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

  ownerCard: {
    backgroundColor: "#FFF6EF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: colors.terracotta,
  },

  ownerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },

  ownerButton: {
    backgroundColor: colors.terracotta,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  ownerButtonText: {
    color: colors.white,
    fontWeight: "900",
  },

  ownerButtonLight: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  ownerButtonLightText: {
    color: colors.terracotta,
    fontWeight: "900",
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

  mapHero: {
    backgroundColor: colors.sky,
    borderRadius: 30,
    padding: 22,
    marginBottom: 16,
  },

  routeButton: {
    backgroundColor: colors.ocean,
    borderRadius: 999,
    padding: 16,
    alignItems: "center",
    marginTop: 18,
  },

  locationCard: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: colors.ocean,
  },

  locationTopRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },

  locationIcon: {
    fontSize: 30,
    marginTop: 2,
  },

  locationMeta: {
    color: colors.terracotta,
    fontWeight: "800",
    marginTop: 4,
  },

  outlineButton: {
    marginTop: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.ocean,
    paddingVertical: 12,
    alignItems: "center",
  },

  outlineButtonText: {
    color: colors.ocean,
    fontWeight: "900",
  },

  eventInput: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginTop: 10,
  },

  dangerButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#B94B4B",
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
  },

  dangerButtonText: {
    color: "#B94B4B",
    fontWeight: "900",
  },

  closetPill: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 18,
  },

  activeClosetPill: {
    backgroundColor: colors.blush,
  },

  closetPillText: {
    color: colors.text,
    fontWeight: "900",
  },

  readOnlyText: {
    color: colors.muted,
    fontWeight: "800",
    marginTop: 12,
  },

  uploadGrid: {
    gap: 12,
    marginTop: 16,
  },

  uploadSlotCard: {
    backgroundColor: "#FFF6EF",
    borderRadius: 20,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: colors.coral,
    padding: 12,
    marginTop: 10,
  },

  uploadSlotTopRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },

  uploadIcon: {
    fontSize: 28,
  },

  uploadTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 15,
  },

  tileLabelInput: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 15,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  uploadStatus: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },

  uploadActionButton: {
    backgroundColor: colors.coral,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
  },

  uploadActionButtonDone: {
    backgroundColor: colors.ocean,
  },

  uploadActionText: {
    color: colors.white,
    fontWeight: "900",
  },

  deleteUploadButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.terracotta,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },

  deleteUploadText: {
    color: colors.terracotta,
    fontWeight: "900",
  },

  uploadPreview: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    marginTop: 12,
    backgroundColor: "#FFF8F2",
  },

  statusCard: {
  backgroundColor: "#FFF6EF",
  borderRadius: 28,
  padding: 20,
  marginBottom: 16,
  borderLeftWidth: 5,
  borderLeftColor: colors.coral,
},
});