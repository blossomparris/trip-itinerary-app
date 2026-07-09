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
  const [pushStatus, setPushStatus] = useState("OFF");
  const [pushToken, setPushToken] = useState("");
  const [openedEventIds, setOpenedEventIds] = useState<any>({});
  const [moreEventIds, setMoreEventIds] = useState<any>({});
  const [seenAnnouncementIds, setSeenAnnouncementIds] = useState<any>({});
  const [lastAnnouncementAlertId, setLastAnnouncementAlertId] = useState("");
  const [weatherForecasts, setWeatherForecasts] = useState<any>({});
  const [weatherLoading, setWeatherLoading] = useState<any>({});
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCurrency, setExpenseCurrency] = useState("USD");
  const [expensePaidBy, setExpensePaidBy] = useState("");
  const [expenseCovered, setExpenseCovered] = useState<any>({});
  const [expenseSplitMode, setExpenseSplitMode] = useState("EVEN");
  const [expenseItemizedAmounts, setExpenseItemizedAmounts] = useState<any>({});
  const [expensePaymentStatus, setExpensePaymentStatus] = useState("PAID");
  const [expensePaymentApp, setExpensePaymentApp] = useState("Venmo");
  const [expensePaymentLink, setExpensePaymentLink] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [selectedClosetDayIndex, setSelectedClosetDayIndex] = useState(0);

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
  const [uploadVisibility, setUploadVisibility] = useState<any>({});
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
          const slotKey = data.slotKey || docSnapshot.id;

          const uploadRecord = {
            id: docSnapshot.id,
            docId: docSnapshot.id,
            ...data,
          };

          if (!uploadMap[slotKey]) {
            uploadMap[slotKey] = [];
          }

          uploadMap[slotKey].push(uploadRecord);
        });

        Object.keys(uploadMap).forEach((slotKey) => {
          uploadMap[slotKey].sort((a: any, b: any) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return aTime - bTime;
          });
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

  useEffect(() => {
    const expenseQuery = query(
      collection(db, "tripmuse-expenses"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeExpenses = onSnapshot(
      expenseQuery,
      (snapshot) => {
        const firebaseExpenses = snapshot.docs.map((docSnapshot: any) => {
          const data = docSnapshot.data();

          return {
            id: docSnapshot.id,
            title: data.title || "Expense",
            amount: Number(data.amount || 0),
            currency: data.currency || "USD",
            paidById: data.paidById,
            paidByName: data.paidByName,
            coveredIds: Array.isArray(data.coveredIds) ? data.coveredIds : [],
            coveredNames: Array.isArray(data.coveredNames) ? data.coveredNames : [],
            splitMode: data.splitMode || "EVEN",
            itemizedAmounts: data.itemizedAmounts || {},
            paymentStatus: data.paymentStatus || "PAID",
            paymentApp: data.paymentApp || "",
            paymentLink: data.paymentLink || "",
            notes: data.notes || "",
            createdById: data.createdById,
            createdByName: data.createdByName,
            createdAtLabel: data.createdAt?.toDate
              ? data.createdAt.toDate().toLocaleString()
              : data.createdAtLabel || "Now",
          };
        });

        setExpenses(firebaseExpenses);
      },
      (error) => {
        console.log("Expense listener error:", error);
      }
    );

    return () => {
      unsubscribeExpenses();
    };
  }, []);


  function getTravelerNameById(id: string) {
    const traveler = tripMembers.find((person: any) => person.id === id);
    return traveler?.name || id;
  }

  function formatMoney(value: any, currency = "USD") {
    const amount = Number(value || 0);
    const symbol = currency === "EUR" ? "€" : "$";
    return `${symbol}${amount.toFixed(2)}`;
  }

  function toggleExpenseCovered(travelerId: string) {
    setExpenseCovered((previous: any) => ({
      ...previous,
      [travelerId]: !previous?.[travelerId],
    }));
  }

  function updateItemizedAmount(travelerId: string, value: string) {
    setExpenseItemizedAmounts((previous: any) => ({
      ...previous,
      [travelerId]: value,
    }));
  }

  function selectedExpenseCoveredIds() {
    const selectedCoveredIds = Object.keys(expenseCovered || {}).filter(
      (travelerId) => expenseCovered[travelerId]
    );

    return selectedCoveredIds.length > 0
      ? selectedCoveredIds
      : [expensePaidBy || currentUser?.id].filter(Boolean);
  }

  function getExpenseShares(expense: any) {
    const amount = Number(expense.amount || 0);
    const coveredIds = Array.isArray(expense.coveredIds) ? expense.coveredIds : [];
    const itemizedAmounts = expense.itemizedAmounts || {};
    const shares: any = {};

    if (!amount || coveredIds.length === 0) return shares;

    if (expense.splitMode === "ITEMIZED") {
      coveredIds.forEach((travelerId: string) => {
        shares[travelerId] = Number(itemizedAmounts[travelerId] || 0);
      });
    } else {
      const share = amount / coveredIds.length;
      coveredIds.forEach((travelerId: string) => {
        shares[travelerId] = share;
      });
    }

    return shares;
  }

  async function addExpense() {
    if (!currentUser || !currentUser.name) return;

    const amount = Number(String(expenseAmount).replace(/[^0-9.]/g, ""));
    const paidById = expensePaidBy || currentUser.id;
    const paidByName = getTravelerNameById(paidById);
    const coveredIds = selectedExpenseCoveredIds();
    const coveredNames = coveredIds.map(getTravelerNameById);

    const cleanItemizedAmounts: any = {};
    coveredIds.forEach((travelerId: string) => {
      cleanItemizedAmounts[travelerId] = Number(
        String(expenseItemizedAmounts?.[travelerId] || "0").replace(/[^0-9.]/g, "")
      );
    });

    const itemizedTotal = Object.values(cleanItemizedAmounts).reduce(
      (sum: any, value: any) => Number(sum) + Number(value || 0),
      0
    );

    if (!expenseTitle.trim()) {
      Alert.alert("Add a description", "Example: Zuma dinner, taxi, groceries, tickets.");
      return;
    }

    if (!amount || amount <= 0) {
      Alert.alert("Add an amount", "Enter the total amount paid.");
      return;
    }

    if (coveredIds.length === 0) {
      Alert.alert("Choose travelers", "Select who was covered by this expense.");
      return;
    }

    if (expenseSplitMode === "ITEMIZED" && Math.abs(Number(itemizedTotal) - amount) > 0.01) {
      Alert.alert(
        "Itemized amounts do not match",
        `Your itemized total is ${formatMoney(itemizedTotal, expenseCurrency)}, but the bill total is ${formatMoney(amount, expenseCurrency)}.`
      );
      return;
    }

    try {
      await addDoc(collection(db, "tripmuse-expenses"), {
        title: expenseTitle.trim(),
        amount,
        currency: expenseCurrency,
        paidById,
        paidByName,
        coveredIds,
        coveredNames,
        splitMode: expenseSplitMode,
        itemizedAmounts: expenseSplitMode === "ITEMIZED" ? cleanItemizedAmounts : {},
        paymentStatus: expensePaymentStatus,
        paymentApp: expensePaymentApp,
        paymentLink: expensePaymentLink.trim(),
        notes: expenseNotes.trim(),
        createdById: currentUser.id,
        createdByName: currentUser.name,
        createdAtLabel: new Date().toLocaleString(),
        createdAt: serverTimestamp(),
      });

      setExpenseTitle("");
      setExpenseAmount("");
      setExpenseCurrency("USD");
      setExpensePaidBy("");
      setExpenseCovered({});
      setExpenseSplitMode("EVEN");
      setExpenseItemizedAmounts({});
      setExpensePaymentStatus("PAID");
      setExpensePaymentApp("Venmo");
      setExpensePaymentLink("");
      setExpenseNotes("");

      Alert.alert("Expense Added", `${paidByName} logged ${formatMoney(amount, expenseCurrency)}.`);
    } catch (error) {
      console.log("Add expense error:", error);
      Alert.alert("Expense not saved", "Please try again.");
    }
  }

  function confirmDeleteExpense(expense: any) {
    const canDelete =
      currentUser?.role === "OWNER" ||
      expense.createdById === currentUser?.id ||
      expense.paidById === currentUser?.id;

    if (!canDelete) {
      Alert.alert("Owner Only", "Only owners or the person who logged this expense can delete it.");
      return;
    }

    Alert.alert(
      "Delete expense?",
      `Remove ${expense.title}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "tripmuse-expenses", expense.id));
            } catch (error) {
              console.log("Delete expense error:", error);
              Alert.alert("Expense not deleted", "Please try again.");
            }
          },
        },
      ]
    );
  }

  function calculateExpenseSummary() {
    const balancesByCurrency: any = {
      USD: {},
      EUR: {},
    };
    const owedLines: any[] = [];

    ["USD", "EUR"].forEach((currency) => {
      tripMembers.forEach((person: any) => {
        balancesByCurrency[currency][person.id] = {
          id: person.id,
          name: person.name,
          currency,
          net: 0,
        };
      });
    });

    expenses.forEach((expense: any) => {
      const currency = expense.currency || "USD";
      const paidById = expense.paidById;
      const shares = getExpenseShares(expense);

      if (!paidById || !balancesByCurrency[currency]) return;

      Object.entries(shares).forEach(([coveredId, rawShare]: any) => {
        const share = Number(rawShare || 0);
        if (!share || coveredId === paidById) return;

        if (!balancesByCurrency[currency][paidById]) {
          balancesByCurrency[currency][paidById] = {
            id: paidById,
            name: getTravelerNameById(paidById),
            currency,
            net: 0,
          };
        }

        if (!balancesByCurrency[currency][coveredId]) {
          balancesByCurrency[currency][coveredId] = {
            id: coveredId,
            name: getTravelerNameById(coveredId),
            currency,
            net: 0,
          };
        }

        balancesByCurrency[currency][paidById].net += share;
        balancesByCurrency[currency][coveredId].net -= share;

        owedLines.push({
          fromId: coveredId,
          fromName: getTravelerNameById(coveredId),
          toId: paidById,
          toName: getTravelerNameById(paidById),
          amount: share,
          currency,
          title: expense.title,
          paymentApp: expense.paymentApp,
          paymentLink: expense.paymentLink,
          paymentStatus: expense.paymentStatus,
        });
      });
    });

    return {
      balancesByCurrency,
      owedLines,
      myPaidExpenses: expenses.filter((expense: any) => expense.paidById === currentUser?.id),
      myOwedLines: owedLines.filter((line: any) => line.fromId === currentUser?.id),
      myReceivableLines: owedLines.filter((line: any) => line.toId === currentUser?.id),
    };
  }

  function openExpensePaymentLink(link: string) {
    if (!link) {
      Alert.alert("No payment link", "Ask the submitter to add a Venmo or Revolut request link.");
      return;
    }

    Linking.openURL(link);
  }


  const weatherCityCoordinates: any = {
    "new york": {
      latitude: 40.7128,
      longitude: -74.006,
      label: "New York",
    },
    london: {
      latitude: 51.5072,
      longitude: -0.1276,
      label: "London",
    },
    mykonos: {
      latitude: 37.4467,
      longitude: 25.3289,
      label: "Mykonos",
    },
    athens: {
      latitude: 37.9838,
      longitude: 23.7275,
      label: "Athens",
    },
  };

  const weatherCodeLabels: any = {
    0: { label: "Clear sky", icon: "☀️" },
    1: { label: "Mainly clear", icon: "🌤️" },
    2: { label: "Partly cloudy", icon: "⛅" },
    3: { label: "Overcast", icon: "☁️" },
    45: { label: "Fog", icon: "🌫️" },
    48: { label: "Rime fog", icon: "🌫️" },
    51: { label: "Light drizzle", icon: "🌦️" },
    53: { label: "Drizzle", icon: "🌦️" },
    55: { label: "Heavy drizzle", icon: "🌧️" },
    56: { label: "Freezing drizzle", icon: "🌧️" },
    57: { label: "Freezing drizzle", icon: "🌧️" },
    61: { label: "Light rain", icon: "🌧️" },
    63: { label: "Rain", icon: "🌧️" },
    65: { label: "Heavy rain", icon: "🌧️" },
    66: { label: "Freezing rain", icon: "🌧️" },
    67: { label: "Freezing rain", icon: "🌧️" },
    71: { label: "Light snow", icon: "🌨️" },
    73: { label: "Snow", icon: "🌨️" },
    75: { label: "Heavy snow", icon: "🌨️" },
    77: { label: "Snow grains", icon: "🌨️" },
    80: { label: "Light showers", icon: "🌦️" },
    81: { label: "Showers", icon: "🌧️" },
    82: { label: "Heavy showers", icon: "🌧️" },
    85: { label: "Snow showers", icon: "🌨️" },
    86: { label: "Snow showers", icon: "🌨️" },
    95: { label: "Thunderstorm", icon: "⛈️" },
    96: { label: "Thunderstorm + hail", icon: "⛈️" },
    99: { label: "Thunderstorm + hail", icon: "⛈️" },
  };

  function getTripWeatherCity(day: any) {
    const city = String(day?.city || "").trim();

    if (city) return city;

    const dayText = `${day?.day || ""} ${day?.date || ""}`.toLowerCase();

    if (dayText.includes("london")) return "London";
    if (dayText.includes("mykonos")) return "Mykonos";
    if (dayText.includes("athens")) return "Athens";
    if (dayText.includes("new york") || dayText.includes("nyc")) return "New York";

    return "London";
  }

  function getTripWeatherDate(day: any) {
    const idMatch = String(day?.id || "").match(/(\d{4}-\d{2}-\d{2})/);
    if (idMatch?.[1]) return idMatch[1];

    const months: any = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };

    const dateText = String(day?.date || "").trim().toLowerCase();
    const dateMatch = dateText.match(/([a-z]{3})\s+(\d{1,2})/);

    if (!dateMatch) return "";

    const month = months[dateMatch[1]];
    const dayNumber = String(dateMatch[2]).padStart(2, "0");

    return `2026-${month}-${dayNumber}`;
  }

  async function getCoordinatesForWeatherCity(city: string) {
    const cityKey = city.toLowerCase().trim();

    if (weatherCityCoordinates[cityKey]) {
      return weatherCityCoordinates[cityKey];
    }

    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1&language=en&format=json`;

    const response = await fetch(geocodeUrl);
    const data = await response.json();
    const firstResult = data?.results?.[0];

    if (!firstResult) return null;

    return {
      latitude: firstResult.latitude,
      longitude: firstResult.longitude,
      label: firstResult.name || city,
    };
  }

  async function fetchWeatherForDay(day: any, force = false) {
    if (!day?.id) return;

    if (weatherForecasts[day.id] && !force) return;

    const city = getTripWeatherCity(day);
    const dateIso = getTripWeatherDate(day);

    if (!city || !dateIso) {
      setWeatherForecasts((current: any) => ({
        ...current,
        [day.id]: {
          status: "missing",
          city,
          dateIso,
          message: "Weather unavailable for this day.",
        },
      }));
      return;
    }

    setWeatherLoading((current: any) => ({
      ...current,
      [day.id]: true,
    }));

    try {
      const coordinates = await getCoordinatesForWeatherCity(city);

      if (!coordinates) {
        throw new Error(`No coordinates found for ${city}`);
      }

      const forecastUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}` +
        `&longitude=${coordinates.longitude}` +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max" +
        "&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=16";

      const response = await fetch(forecastUrl);
      const data = await response.json();

      const dateIndex = data?.daily?.time?.indexOf(dateIso);

      if (dateIndex === -1 || dateIndex === undefined) {
        setWeatherForecasts((current: any) => ({
          ...current,
          [day.id]: {
            status: "future",
            city: coordinates.label || city,
            dateIso,
            message:
              "Forecast will appear when this date is inside the 16-day weather window.",
          },
        }));
        return;
      }

      const code = data.daily.weather_code?.[dateIndex];
      const codeInfo = weatherCodeLabels[code] || {
        label: "Forecast available",
        icon: "🌤️",
      };

      setWeatherForecasts((current: any) => ({
        ...current,
        [day.id]: {
          status: "ready",
          city: coordinates.label || city,
          dateIso,
          code,
          summary: codeInfo.label,
          icon: codeInfo.icon,
          tempHigh: data.daily.temperature_2m_max?.[dateIndex],
          tempLow: data.daily.temperature_2m_min?.[dateIndex],
          precipProbability: data.daily.precipitation_probability_max?.[dateIndex],
          windMax: data.daily.wind_speed_10m_max?.[dateIndex],
          updatedAt: new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      }));
    } catch (error) {
      console.log("Weather forecast error:", error);

      setWeatherForecasts((current: any) => ({
        ...current,
        [day.id]: {
          status: "error",
          city,
          dateIso,
          message: "Weather could not load right now.",
        },
      }));
    } finally {
      setWeatherLoading((current: any) => ({
        ...current,
        [day.id]: false,
      }));
    }
  }

  function renderWeatherCard(day: any) {
    const forecast = weatherForecasts[day.id];
    const isLoading = weatherLoading[day.id];
    const city = getTripWeatherCity(day);

    return (
      <View style={styles.weatherCard}>
        <View style={styles.weatherTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>Weather Forecast</Text>
            <Text style={styles.cardTitle}>
              {forecast?.icon || "🌤️"} {city}
            </Text>
            <Text style={styles.muted}>
              {getTripWeatherDate(day)} · updates from live weather API
            </Text>
          </View>

          <Pressable
            onPress={() => fetchWeatherForDay(day, true)}
            style={styles.weatherRefreshButton}
          >
            <Text style={styles.weatherRefreshText}>Refresh</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <Text style={styles.muted}>Loading forecast...</Text>
        ) : forecast?.status === "ready" ? (
          <>
            <Text style={styles.weatherSummary}>
              {forecast.summary} · High {Math.round(Number(forecast.tempHigh))}°F / Low{" "}
              {Math.round(Number(forecast.tempLow))}°F
            </Text>

            <View style={styles.weatherGrid}>
              <View style={styles.weatherStat}>
                <Text style={styles.weatherStatLabel}>Rain chance</Text>
                <Text style={styles.weatherStatValue}>
                  {forecast.precipProbability ?? 0}%
                </Text>
              </View>

              <View style={styles.weatherStat}>
                <Text style={styles.weatherStatLabel}>Wind</Text>
                <Text style={styles.weatherStatValue}>
                  {Math.round(Number(forecast.windMax || 0))} mph
                </Text>
              </View>

              <View style={styles.weatherStat}>
                <Text style={styles.weatherStatLabel}>Updated</Text>
                <Text style={styles.weatherStatValue}>{forecast.updatedAt}</Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.muted}>
            {forecast?.message ||
              "Tap Refresh to load the weather forecast for this city."}
          </Text>
        )}
      </View>
    );
  }

  useEffect(() => {
    if (!currentUser || !days[selectedDayIndex]) return;

    fetchWeatherForDay(days[selectedDayIndex]);
  }, [selectedDayIndex, currentUser?.id]);


  function getNotificationStorageKey() {
    return `eurosummer-seen-announcements-${currentUser?.id || "guest"}`;
  }

  function getAnnouncementId(announcement: any) {
    return (
      announcement?.id ||
      `${announcement?.sender || "trip"}-${announcement?.title || ""}-${announcement?.body || ""}`
    );
  }

  function saveSeenAnnouncementIds(nextSeen: any) {
    setSeenAnnouncementIds(nextSeen);

    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          getNotificationStorageKey(),
          JSON.stringify(nextSeen)
        );
      }
    } catch (error) {
      console.log("Could not save seen announcements:", error);
    }
  }

  function markAnnouncementRead(announcement: any) {
    const announcementId = getAnnouncementId(announcement);

    saveSeenAnnouncementIds({
      ...seenAnnouncementIds,
      [announcementId]: true,
    });
  }

  function markAllAnnouncementsRead() {
    const nextSeen = { ...seenAnnouncementIds };

    announcements.forEach((announcement: any) => {
      nextSeen[getAnnouncementId(announcement)] = true;
    });

    saveSeenAnnouncementIds(nextSeen);
  }

  function getUnreadAnnouncements() {
    if (!currentUser?.id) return [];

    return announcements.filter((announcement: any) => {
      const announcementId = getAnnouncementId(announcement);
      const sentByMe = announcement?.sender === currentUser?.name;

      return !sentByMe && !seenAnnouncementIds[announcementId];
    });
  }

  function parseTripEventDateTime(day: any, event: any) {
    const dateMatch = String(day?.id || "").match(/(\d{4})-(\d{2})-(\d{2})/);

    if (!dateMatch) return null;

    const year = Number(dateMatch[1]);
    const monthIndex = Number(dateMatch[2]) - 1;
    const dayNumber = Number(dateMatch[3]);
    const rawTime = String(event?.time || "").trim();

    let hours = 9;
    let minutes = 0;

    const timeMatch = rawTime.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);

    if (timeMatch) {
      hours = Number(timeMatch[1]);
      minutes = Number(timeMatch[2] || 0);

      const meridian = String(timeMatch[3] || "").toUpperCase();

      if (meridian === "PM" && hours < 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;
    }

    return new Date(year, monthIndex, dayNumber, hours, minutes, 0);
  }

  function formatEventCountdown(eventDate: Date) {
    const diffMs = eventDate.getTime() - Date.now();
    const totalMinutes = Math.max(0, Math.round(diffMs / 60000));
    const daysAway = Math.floor(totalMinutes / 1440);
    const hoursAway = Math.floor((totalMinutes % 1440) / 60);
    const minutesAway = totalMinutes % 60;

    if (daysAway > 0) return `${daysAway}d ${hoursAway}h`;
    if (hoursAway > 0) return `${hoursAway}h ${minutesAway}m`;
    return `${minutesAway}m`;
  }

  function getUpcomingEventAlerts() {
    const now = new Date();
    const endWindow = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    const upcoming: any[] = [];

    days.forEach((day: any) => {
      (day.events || []).forEach((event: any) => {
        const eventDate = parseTripEventDateTime(day, event);

        if (!eventDate) return;
        if (eventDate < now || eventDate > endWindow) return;

        upcoming.push({
          id: `${day.id}-${event.id}`,
          day,
          event,
          eventDate,
        });
      });
    });

    return upcoming.sort(
      (a: any, b: any) => a.eventDate.getTime() - b.eventDate.getTime()
    );
  }

  function renderNotificationCenter() {
    const unreadAnnouncements = getUnreadAnnouncements();
    const upcomingEvents = getUpcomingEventAlerts();

    return (
      <View style={styles.notificationCard}>
        <View style={styles.notificationHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>Alerts</Text>
            <Text style={styles.cardTitle}>Trip Notifications 🔔</Text>
            <Text style={styles.muted}>
              Announcements and upcoming itinerary reminders in one place.
            </Text>
          </View>

          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {unreadAnnouncements.length + upcomingEvents.length}
            </Text>
          </View>
        </View>

        <View style={styles.pushPermissionBox}>
          <Text style={styles.notificationSectionTitle}>
            Free App Notifications
          </Text>
          <Text style={styles.notificationEmptyText}>{getPushStatusMessage()}</Text>

          <Pressable
            onPress={enablePushNotifications}
            style={[
              styles.pushPermissionButton,
              pushStatus === "ON" && styles.pushPermissionButtonOn,
            ]}
          >
            <Text style={styles.pushPermissionButtonText}>
              {pushStatus === "ON" ? "Free Notifications On" : "Turn On Free Notifications"}
            </Text>
          </Pressable>
        </View>

        {unreadAnnouncements.length > 0 ? (
          <View style={styles.notificationSection}>
            <View style={styles.notificationSectionHeader}>
              <Text style={styles.notificationSectionTitle}>
                New Announcements
              </Text>

              <Pressable onPress={markAllAnnouncementsRead}>
                <Text style={styles.notificationActionText}>Mark read</Text>
              </Pressable>
            </View>

            {unreadAnnouncements.slice(0, 3).map((announcement: any) => (
              <Pressable
                key={getAnnouncementId(announcement)}
                onPress={() => {
                  markAnnouncementRead(announcement);
                  setTab("Announcements");
                }}
                style={styles.notificationItem}
              >
                <Text style={styles.notificationItemTitle}>
                  {announcement.title || "Trip Update"}
                </Text>
                <Text style={styles.notificationItemBody}>
                  {announcement.body || ""}
                </Text>
                <Text style={styles.notificationItemMeta}>
                  From {announcement.sender || "Trip Team"}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={styles.notificationEmptyText}>
            No unread announcements right now.
          </Text>
        )}

        {upcomingEvents.length > 0 ? (
          <View style={styles.notificationSection}>
            <Text style={styles.notificationSectionTitle}>
              Coming Up In The Next 72 Hours
            </Text>

            {upcomingEvents.slice(0, 4).map((item: any) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  const matchingIndex = days.findIndex(
                    (day: any) => day.id === item.day.id
                  );

                  if (matchingIndex >= 0) {
                    setSelectedDayIndex(matchingIndex);
                    setTab("Itinerary");
                  }
                }}
                style={styles.notificationItem}
              >
                <Text style={styles.notificationItemTitle}>
                  {item.event.title}
                </Text>
                <Text style={styles.notificationItemBody}>
                  {item.day.date} · {item.event.time || "Time TBD"} ·{" "}
                  {item.event.location || "Location TBD"}
                </Text>
                <Text style={styles.notificationItemMeta}>
                  Starts in {formatEventCountdown(item.eventDate)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={styles.notificationEmptyText}>
            No events in the next 72 hours.
          </Text>
        )}
      </View>
    );
  }

  useEffect(() => {
    if (!currentUser?.id) return;

    try {
      if (typeof localStorage === "undefined") return;

      const savedSeen = localStorage.getItem(getNotificationStorageKey());

      if (savedSeen) {
        setSeenAnnouncementIds(JSON.parse(savedSeen));
      }
    } catch (error) {
      console.log("Could not load seen announcements:", error);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id || announcements.length === 0) return;

    const newestAnnouncement = announcements[0];
    const newestAnnouncementId = getAnnouncementId(newestAnnouncement);
    const sentByMe = newestAnnouncement?.sender === currentUser?.name;

    if (
      !sentByMe &&
      !seenAnnouncementIds[newestAnnouncementId] &&
      lastAnnouncementAlertId !== newestAnnouncementId
    ) {
      setLastAnnouncementAlertId(newestAnnouncementId);
    }
  }, [announcements, currentUser?.id, seenAnnouncementIds]);



  function getFreeNotificationKey() {
    return currentUser?.id ? `eurosummer-free-notifications-${currentUser.id}` : "";
  }

  function getFreeNotificationSentKey(notificationId: string) {
    return currentUser?.id
      ? `eurosummer-free-notification-sent-${currentUser.id}-${notificationId}`
      : "";
  }

  function getPushStatusMessage() {
    if (pushStatus === "ON") {
      return "Free notifications are on while this app is open.";
    }

    if (pushStatus === "REQUESTING") {
      return "Asking this browser for notification access...";
    }

    if (pushStatus === "DENIED") {
      return "Notifications are blocked in this browser.";
    }

    if (pushStatus === "UNSUPPORTED") {
      return "Free browser notifications are not supported in this browser.";
    }

    return "Turn on free notifications for alerts while this app is open.";
  }

  function showFreeBrowserNotification(notificationId: string, title: string, body: string) {
    if (pushStatus !== "ON") return;

    if (
      typeof window === "undefined" ||
      typeof localStorage === "undefined" ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    const sentKey = getFreeNotificationSentKey(notificationId);

    if (!sentKey || localStorage.getItem(sentKey) === "YES") return;

    localStorage.setItem(sentKey, "YES");

    try {
      new Notification(title, {
        body,
        icon: "/icon.png",
      });
    } catch (error) {
      console.log("Free notification error:", error);
    }
  }

  async function enablePushNotifications() {
    if (!currentUser?.id) return;

    try {
      if (typeof window === "undefined" || !("Notification" in window)) {
        setPushStatus("UNSUPPORTED");
        Alert.alert(
          "Not supported",
          "This browser does not support free app notifications."
        );
        return;
      }

      setPushStatus("REQUESTING");

      let permission = Notification.permission;

      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        setPushStatus("DENIED");
        Alert.alert(
          "Notifications blocked",
          "Open browser settings for this site and allow notifications."
        );
        return;
      }

      const preferenceKey = getFreeNotificationKey();

      if (preferenceKey && typeof localStorage !== "undefined") {
        localStorage.setItem(preferenceKey, "ON");
      }

      setPushStatus("ON");

      try {
        new Notification("EuroSummer2026 🔔", {
          body: "Free notifications are on while the app is open.",
          icon: "/icon.png",
        });
      } catch (error) {
        console.log("Welcome notification error:", error);
      }

      Alert.alert(
        "Free Notifications On 🔔",
        "You will get free announcement and event reminders while this app is open."
      );
    } catch (error) {
      console.log("Free notification setup error:", error);
      setPushStatus("OFF");
      Alert.alert(
        "Notification setup issue",
        "Notifications could not be enabled. Try again after refreshing."
      );
    }
  }

  function checkFreeEventReminders() {
    if (!currentUser?.id || pushStatus !== "ON") return;

    const now = Date.now();

    days.forEach((day: any) => {
      const dayEvents = getEventsForDay(day).filter((event: any) =>
        canSeeEvent(event, currentUser)
      );

      dayEvents.forEach((event: any) => {
        const eventDate = parseTripEventDateTime(day, event);

        if (!eventDate) return;

        const msUntil = eventDate.getTime() - now;

        if (msUntil <= 0) return;

        const eventTitle = event.title || "Trip event";
        const eventTime = event.time ? ` at ${event.time}` : "";
        const eventLocation = event.location ? ` · ${event.location}` : "";
        const eventBody = `${eventTitle}${eventTime}${eventLocation}`;

        if (msUntil <= 24 * 60 * 60 * 1000) {
          showFreeBrowserNotification(
            `event-24-${day.id}-${event.id}`,
            "Event Reminder ✨",
            eventBody
          );
        }

        if (msUntil <= 2 * 60 * 60 * 1000) {
          showFreeBrowserNotification(
            `event-2-${day.id}-${event.id}`,
            "Event Coming Up Soon ⏰",
            eventBody
          );
        }
      });
    });
  }

  useEffect(() => {
    if (!currentUser?.id) return;

    if (typeof window === "undefined" || !("Notification" in window)) {
      setPushStatus("UNSUPPORTED");
      return;
    }

    const preferenceKey = getFreeNotificationKey();
    const savedPreference =
      typeof localStorage !== "undefined"
        ? localStorage.getItem(preferenceKey)
        : "";

    if (savedPreference === "ON" && Notification.permission === "granted") {
      setPushStatus("ON");
    } else if (Notification.permission === "denied") {
      setPushStatus("DENIED");
    } else {
      setPushStatus("OFF");
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id || pushStatus !== "ON") return;

    const unreadAnnouncements = getUnreadAnnouncements();
    const latestAnnouncement = unreadAnnouncements[0];

    if (!latestAnnouncement) return;

    showFreeBrowserNotification(
      `announcement-${getAnnouncementId(latestAnnouncement)}`,
      latestAnnouncement.title || "Trip Announcement",
      latestAnnouncement.body || "You have a new EuroSummer2026 announcement."
    );
  }, [currentUser?.id, pushStatus, announcements.length]);

  useEffect(() => {
    if (!currentUser?.id || pushStatus !== "ON") return;

    checkFreeEventReminders();

    const intervalId = setInterval(checkFreeEventReminders, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [
    currentUser?.id,
    pushStatus,
    selectedDayIndex,
    customEvents.length,
    Object.keys(deletedEventIds || {}).join("|"),
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


  function getUploadVisibilityForSlot(slotKey: string) {
    return uploadVisibility?.[slotKey] || "TRIP";
  }

  function setUploadVisibilityForSlot(slotKey: string, visibility: string) {
    setUploadVisibility((currentVisibility: any) => ({
      ...currentVisibility,
      [slotKey]: visibility,
    }));
  }

  function getOutfitOwnerForSlot(slotKey: string) {
    const owner = tripMembers.find((person: any) =>
      slotKey.startsWith(`outfit-${person.id}-`)
    );

    return {
      ownerId: owner?.id || currentUser?.id || "trip",
      ownerName: owner?.name || currentUser?.name || "Trip",
    };
  }

  function getUploadOwnerForSlot(slotKey: string) {
    if (slotKey.startsWith("outfit-")) {
      return getOutfitOwnerForSlot(slotKey);
    }

    if (slotKey.startsWith("qr-")) {
      const matchingTraveler = tripMembers.find((person: any) =>
        slotKey.endsWith(`-${person.id}`)
      );

      return {
        ownerId: matchingTraveler?.id || currentUser?.id || "trip",
        ownerName: matchingTraveler?.name || currentUser?.name || "Trip",
      };
    }

    return {
      ownerId: "trip",
      ownerName: "Trip",
    };
  }

  function canCurrentUserSeeUpload(upload: any, canEdit = false) {
    if (!upload) return false;

    const slotKey = upload.slotKey || "";
    const isOutfitUpload = slotKey.startsWith("outfit-");

    if (!isOutfitUpload) return true;

    const ownerIdFromSlot = slotKey.split("-")[1];
    const ownerId = upload.ownerId || ownerIdFromSlot;

    if (ownerId === currentUser?.id) return true;

    return upload.visibility === "TRIP";
  }


  async function setExistingUploadVisibility(upload: any, visibility: string) {
    if (!upload?.id) return;

    try {
      await setDoc(
        doc(db, "tripmuse-uploads", upload.id),
        {
          visibility,
          updatedBy: currentUser?.name || "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.log("Visibility update error:", error);
      Alert.alert("Visibility not updated", "Please try again.");
    }
  }


  async function compressUploadImageToDataUri(asset: any) {
    const rawUri = asset?.base64
      ? `data:image/jpeg;base64,${asset.base64}`
      : asset?.uri;

    if (!rawUri) return "";

    const canUseCanvas =
      typeof document !== "undefined" &&
      typeof (globalThis as any).Image !== "undefined";

    if (!canUseCanvas) {
      return rawUri;
    }

    return await new Promise((resolve) => {
      const image = new (globalThis as any).Image();

      image.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            resolve(rawUri);
            return;
          }

          const originalWidth = image.width || 900;
          const originalHeight = image.height || 900;

          const attempts = [
            { maxSide: 900, quality: 0.55 },
            { maxSide: 800, quality: 0.45 },
            { maxSide: 700, quality: 0.38 },
            { maxSide: 600, quality: 0.32 },
            { maxSide: 500, quality: 0.26 },
            { maxSide: 420, quality: 0.22 },
          ];

          let bestDataUri = rawUri;

          for (const attempt of attempts) {
            const scale = Math.min(
              1,
              attempt.maxSide / Math.max(originalWidth, originalHeight)
            );

            canvas.width = Math.max(1, Math.round(originalWidth * scale));
            canvas.height = Math.max(1, Math.round(originalHeight * scale));

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            const dataUri = canvas.toDataURL("image/jpeg", attempt.quality);
            bestDataUri = dataUri;

            if (dataUri.length < 650000) {
              resolve(dataUri);
              return;
            }
          }

          resolve(bestDataUri);
        } catch (error) {
          console.log("Compression error:", error);
          resolve(rawUri);
        }
      };

      image.onerror = () => resolve(rawUri);
      image.src = rawUri;
    });
  }

  async function pickUploadImage(
    slotKey: string,
    label: string,
    forcedVisibility?: string
  ) {
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
      allowsEditing: false,
      quality: 0.04,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];

    if (!asset) {
      Alert.alert("Image issue", "Please choose a different image.");
      return;
    }

    const imageUri = await compressUploadImageToDataUri(asset);

    if (!imageUri) {
      Alert.alert("Image issue", "Please choose a smaller image or screenshot.");
      return;
    }

    if (String(imageUri).length > 850000) {
      Alert.alert(
        "Image still too large",
        "Please choose a screenshot or crop the image smaller before uploading."
      );
      return;
    }

    const isOutfitUpload = slotKey.startsWith("outfit-");
    const selectedVisibility = isOutfitUpload
      ? forcedVisibility || getUploadVisibilityForSlot(slotKey)
      : "TRIP";
    const uploadOwner = getUploadOwnerForSlot(slotKey);

    const savedUpload = {
      slotKey,
      label,
      uploadedBy: currentUser.name,
      uploadedByRole: currentUser.role,
      ownerId: uploadOwner.ownerId,
      ownerName: uploadOwner.ownerName,
      visibility: selectedVisibility,
      status: "Uploaded",
      time: new Date().toLocaleString(),
      uri: imageUri,
      fileName: asset.fileName || `${slotKey}-${Date.now()}.jpg`,
      type: "image",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "tripmuse-uploads"), savedUpload);

      Alert.alert(
        "Image Saved",
        isOutfitUpload
          ? `${label} image saved. Visibility: ${selectedVisibility === "TRIP" ? "Visible to trip" : "Private to me"}.`
          : `${label} image is now shared.`
      );
    } catch (error) {
      console.log("Cloud save error:", error);
      Alert.alert(
        "Image not saved",
        "Please choose a smaller screenshot or image."
      );
    }
  }


  async function deleteUpload(uploadDocId: string) {
    try {
      await deleteDoc(doc(db, "tripmuse-uploads", uploadDocId));
      Alert.alert("Upload Removed", "The shared image was removed.");
    } catch (error) {
      console.log("Delete upload error:", error);
      Alert.alert("Upload not deleted", "Please try again.");
    }
  }



  function isEventOpened(eventId: string) {
    return !!openedEventIds[eventId];
  }

  function isEventMoreOpen(eventId: string) {
    return !!moreEventIds[eventId];
  }

  function toggleEventOpen(eventId: string) {
    setOpenedEventIds((current: any) => {
      const willOpen = !current[eventId];

      if (!willOpen) {
        setMoreEventIds((currentMore: any) => ({
          ...currentMore,
          [eventId]: false,
        }));
      }

      return {
        ...current,
        [eventId]: willOpen,
      };
    });
  }

  function toggleEventMore(eventId: string) {
    setMoreEventIds((current: any) => ({
      ...current,
      [eventId]: !current[eventId],
    }));
  }

  function canManageEventQrForPerson(person: any) {
    return currentUser?.role === "OWNER" || currentUser?.id === person?.id;
  }

  function renderEventMoreUploads(event: any) {
    return (
      <View style={styles.eventMorePanel}>
        <View style={styles.eventUploadSection}>
          <Text style={styles.eventUploadSectionTitle}>
            QR Codes / Tickets by Traveler 🎟️
          </Text>
          <Text style={styles.muted}>
            Each traveler has their own QR / ticket slot. Owners can manage every traveler; travelers can manage their own.
          </Text>

          {tripMembers.map((person: any) => (
            <View key={`event-qr-${event.id}-${person.id}`} style={styles.eventQrPersonCard}>
              <Text style={styles.eventPersonLabel}>{person.name}</Text>
              {renderUploadSlot(
                `qr-${event.id}-${person.id}`,
                `${person.name} QR / Ticket`,
                "🎟️",
                canManageEventQrForPerson(person)
              )}
            </View>
          ))}
        </View>

        <View style={styles.eventUploadSection}>
          <Text style={styles.eventUploadSectionTitle}>
            Confirmation Screenshot 🧾
          </Text>
          {renderUploadSlot(
            `confirmation-${event.id}`,
            "Confirmation Screenshot",
            "🧾",
            true
          )}
        </View>

        <View style={styles.eventUploadSection}>
          <Text style={styles.eventUploadSectionTitle}>Event Photos 📸</Text>
          {renderUploadSlot(`photos-${event.id}`, "Event Photos", "📸", true)}
        </View>
      </View>
    );
  }

  function renderItineraryEventCard(event: any) {
    const opened = isEventOpened(event.id);
    const showMore = isEventMoreOpen(event.id);

    return (
      <View key={event.id} style={styles.card}>
        <Pressable
          onPress={() => toggleEventOpen(event.id)}
          style={styles.eventClickableHeader}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.date}>
              {selectedDay.date} {event.time ? `· ${event.time}` : ""}
            </Text>
            <Text style={styles.cardTitle}>{event.title}</Text>
            <Text style={styles.muted}>📍 {event.location}</Text>
          </View>

          <Text style={styles.eventOpenText}>{opened ? "Close" : "Open"}</Text>
        </Pressable>

        {opened && (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.cardLabel}>Confirmation</Text>
              <Text style={styles.infoText}>
                {event.confirmation || "Not added yet"}
              </Text>
            </View>

            <Text style={styles.badge}>
              {event.group === "EVERYONE"
                ? "Visible to everyone 🌍"
                : event.group === "OWNERS"
                ? "Owners only 👑"
                : "Private event 💌"}
            </Text>

            <Pressable
              onPress={() => toggleEventMore(event.id)}
              style={styles.eventMoreButton}
            >
              <Text style={styles.eventMoreButtonText}>
                {showMore ? "Hide More" : "More: QR Codes, Confirmations & Photos"}
              </Text>
            </Pressable>

            {showMore && renderEventMoreUploads(event)}

            {currentUser.role === "OWNER" && (
              <Pressable
                onPress={() => deleteEvent(event)}
                style={styles.dangerButton}
              >
                <Text style={styles.dangerButtonText}>Delete Event</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    );
  }

  function renderUploadSlot(
    slotKey: string,
    label: string,
    icon: string,
    canEdit = true
  ) {
    const rawUploads = uploads[slotKey];
    const uploadsForSlot = Array.isArray(rawUploads)
      ? rawUploads
      : rawUploads
      ? [rawUploads]
      : [];

    const visibleUploads = uploadsForSlot
      .filter((upload: any) => canCurrentUserSeeUpload(upload, canEdit))
      .filter((upload: any, index: number, allUploads: any[]) => {
        const uniqueId = upload.id || upload.docId || upload.uri || `${slotKey}-${index}`;
        return (
          allUploads.findIndex((otherUpload: any) => {
            const otherId =
              otherUpload.id ||
              otherUpload.docId ||
              otherUpload.uri ||
              `${slotKey}-${index}`;
            return otherId === uniqueId;
          }) === index
        );
      });

    const displayLabel =
      uploadLabels[slotKey]?.label || visibleUploads[0]?.label || label;
    const isOutfitSlot = slotKey.startsWith("outfit-");
    const isQrSlot = slotKey.startsWith("qr-");

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
              {visibleUploads.length > 0
                ? `${visibleUploads.length} visible image${visibleUploads.length === 1 ? "" : "s"}`
                : isOutfitSlot && !canEdit
                ? "No shared outfit images yet"
                : "No image uploaded yet"}
            </Text>
          </View>
        </View>

        {visibleUploads.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {visibleUploads.map((upload: any, uploadIndex: number) => {
              const uploadSlotKey = upload.slotKey || slotKey;
              const fallbackOwner = getUploadOwnerForSlot(uploadSlotKey);
              const uploadOwnerId = upload.ownerId || fallbackOwner.ownerId || "";
              const canManageThisImage =
                currentUser?.role === "OWNER" ||
                uploadOwnerId === currentUser?.id ||
                (canEdit && uploadOwnerId === "trip");

              return (
                <View
                  key={`${upload.id || upload.docId || "upload"}-${uploadIndex}`}
                  style={styles.multiImageWrap}
                >
                  <Image
                    source={{ uri: upload.uri }}
                    style={styles.multiUploadPreview}
                    resizeMode="cover"
                  />

                  <View style={styles.imageMetaRow}>
                    <Text style={styles.imageVisibilityText}>
                      {upload.visibility === "TRIP" ? "Visible to trip" : "Private to owner"}
                    </Text>
                  </View>

                  <Text style={styles.uploadStatus}>
                    {upload.uploadedBy} · {upload.time}
                  </Text>

                  {canManageThisImage && isOutfitSlot && (
                    <View style={styles.visibilityRow}>
                      <Pressable
                        onPress={() => setExistingUploadVisibility(upload, "PRIVATE")}
                        style={[
                          styles.visibilityPill,
                          upload.visibility !== "TRIP" && styles.visibilityPillActive,
                        ]}
                      >
                        <Text style={styles.visibilityText}>Private</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setExistingUploadVisibility(upload, "TRIP")}
                        style={[
                          styles.visibilityPill,
                          upload.visibility === "TRIP" && styles.visibilityPillActive,
                        ]}
                      >
                        <Text style={styles.visibilityText}>Share</Text>
                      </Pressable>
                    </View>
                  )}

                  {canManageThisImage && (
                    <Pressable
                      onPress={() => deleteUpload(upload.id)}
                      style={styles.deleteUploadButton}
                    >
                      <Text style={styles.deleteUploadText}>Delete</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}

        {canEdit ? (
          isOutfitSlot ? (
            <View style={styles.outfitUploadButtonGrid}>
              <Pressable
                onPress={() => pickUploadImage(slotKey, displayLabel, "PRIVATE")}
                style={styles.uploadActionButton}
              >
                <Text style={styles.uploadActionText}>Add Private Image</Text>
              </Pressable>

              <Pressable
                onPress={() => pickUploadImage(slotKey, displayLabel, "TRIP")}
                style={[styles.uploadActionButton, styles.uploadActionButtonDone]}
              >
                <Text style={styles.uploadActionText}>Add Shared Image</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => pickUploadImage(slotKey, displayLabel)}
              style={[
                styles.uploadActionButton,
                visibleUploads.length > 0 && styles.uploadActionButtonDone,
              ]}
            >
              <Text style={styles.uploadActionText}>
                {isQrSlot
                  ? visibleUploads.length > 0
                    ? "Add Another QR / Ticket"
                    : "Add QR / Ticket"
                  : visibleUploads.length > 0
                  ? "Add Another Image"
                  : "Choose Image"}
              </Text>
            </Pressable>
          )
        ) : (
          <Text style={styles.readOnlyText}>Viewing shared images only</Text>
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

  const expenseSummary = calculateExpenseSummary();
  const selectedClosetDay = days[selectedClosetDayIndex] || selectedDay;

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
            {["Dashboard", "Itinerary", "Closets", "Expenses", "Chat", "Announcements", "Map"].map(
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
              {renderNotificationCenter()}

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

              {renderWeatherCard(selectedDay)}

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Outfit Planner 👗</Text>
                <Text style={styles.cardTitle}>{selectedDay.outfit.title}</Text>
                <Text style={styles.muted}>
                  {selectedDay.outfit.description}
                </Text>

                {renderUploadSlot(
                  `outfit-${currentUser.id}-${selectedDay.id}`,
                  "My Outfit Inspiration",
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
                visibleEvents.map((event: any) => renderItineraryEventCard(event))
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
                <Text style={styles.cardLabel}>Closet</Text>
                <Text style={styles.cardTitle}>Daily Outfit Boards 👗</Text>
                <Text style={styles.muted}>
                  Choose a day to see every traveler on one page. Private images only show to the person who uploaded them. Shared images show to the trip.
                </Text>
              </View>

              <Text style={styles.formLabel}>Day</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {days.map((day: any, index: number) => (
                  <Pressable
                    key={day.id}
                    onPress={() => setSelectedClosetDayIndex(index)}
                    style={[
                      styles.dayPill,
                      selectedClosetDayIndex === index && styles.activeDayPill,
                    ]}
                  >
                    <Text style={styles.dayPillText}>{day.date}</Text>
                    <Text style={styles.dayPillSmall}>{day.day}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>{selectedClosetDay.date}</Text>
                <Text style={styles.cardTitle}>{selectedClosetDay.outfit.title}</Text>
                <Text style={styles.muted}>
                  {selectedClosetDay.outfit.description}
                </Text>
              </View>

              {tripMembers.map((person: any) => {
                const canEditTravelerOutfit = person.id === currentUser?.id;

                return (
                  <View key={`closet-day-${person.id}`} style={styles.card}>
                    <Text style={styles.cardLabel}>{person.name}</Text>
                    <Text style={styles.cardTitle}>
                      {canEditTravelerOutfit ? "My Outfit Inspo" : `${person.name}'s Shared Inspo`}
                    </Text>
                    <Text style={styles.muted}>
                      {canEditTravelerOutfit
                        ? "Add private images for yourself or shared images for the trip."
                        : "Only images this traveler marked shared will appear here."}
                    </Text>

                    {renderUploadSlot(
                      `outfit-${person.id}-${selectedClosetDay.id}`,
                      `${person.name} Outfit Inspiration`,
                      "👗",
                      canEditTravelerOutfit
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {tab === "Expenses" && (
            <View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Expense Splitter</Text>
                <Text style={styles.cardTitle}>Shared Trip Expenses</Text>
                <Text style={styles.muted}>
                  Add USD or EUR expenses, choose who was covered, split evenly or itemize by traveler, and track what you owe.
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>My Summary</Text>
                <Text style={styles.cardTitle}>What I owe / what I am owed</Text>

                {expenseSummary.myOwedLines.length === 0 && expenseSummary.myReceivableLines.length === 0 ? (
                  <Text style={styles.muted}>You are settled based on submitted expenses.</Text>
                ) : (
                  <>
                    {expenseSummary.myOwedLines.map((line: any, index: number) => (
                      <View key={`my-owe-${index}`} style={styles.balanceRow}>
                        <Text style={styles.balanceName}>
                          You owe {line.toName}
                        </Text>
                        <Text style={styles.balanceAmount}>
                          {formatMoney(line.amount, line.currency)}
                        </Text>
                      </View>
                    ))}

                    {expenseSummary.myReceivableLines.map((line: any, index: number) => (
                      <View key={`my-owed-${index}`} style={styles.balanceRow}>
                        <Text style={styles.balanceName}>
                          {line.fromName} owes you
                        </Text>
                        <Text style={styles.balanceAmount}>
                          {formatMoney(line.amount, line.currency)}
                        </Text>
                      </View>
                    ))}
                  </>
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>All Balances</Text>
                <Text style={styles.cardTitle}>Group summary</Text>

                {["USD", "EUR"].map((currency) => (
                  <View key={currency} style={styles.currencySection}>
                    <Text style={styles.formLabel}>{currency}</Text>
                    {Object.values(expenseSummary.balancesByCurrency[currency] || {}).map(
                      (balance: any) => (
                        <View key={`${currency}-${balance.id}`} style={styles.balanceRow}>
                          <Text style={styles.balanceName}>{balance.name}</Text>
                          <Text
                            style={[
                              styles.balanceAmount,
                              balance.net > 0
                                ? styles.balancePositive
                                : balance.net < 0
                                ? styles.balanceNegative
                                : styles.balanceEven,
                            ]}
                          >
                            {balance.net > 0
                              ? `Is owed ${formatMoney(balance.net, currency)}`
                              : balance.net < 0
                              ? `Owes ${formatMoney(Math.abs(balance.net), currency)}`
                              : "Settled"}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Add Expense</Text>
                <Text style={styles.cardTitle}>Log what you paid or requested</Text>

                <TextInput
                  value={expenseTitle}
                  onChangeText={setExpenseTitle}
                  placeholder="What was it for? Example: Zuma dinner"
                  style={styles.input}
                />

                <TextInput
                  value={expenseAmount}
                  onChangeText={setExpenseAmount}
                  keyboardType="decimal-pad"
                  placeholder="Total amount"
                  style={styles.input}
                />

                <Text style={styles.formLabel}>Currency</Text>
                <View style={styles.expenseTravelerGrid}>
                  {["USD", "EUR"].map((currency) => (
                    <Pressable
                      key={currency}
                      onPress={() => setExpenseCurrency(currency)}
                      style={[
                        styles.expenseTravelerPill,
                        expenseCurrency === currency && styles.activeExpenseTravelerPill,
                      ]}
                    >
                      <Text style={styles.expenseTravelerText}>
                        {currency === "EUR" ? "€ EUR" : "$ USD"}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.formLabel}>Who paid / submitted?</Text>
                <View style={styles.expenseTravelerGrid}>
                  {tripMembers.map((person: any) => (
                    <Pressable
                      key={`payer-${person.id}`}
                      onPress={() => setExpensePaidBy(person.id)}
                      style={[
                        styles.expenseTravelerPill,
                        (expensePaidBy || currentUser.id) === person.id &&
                          styles.activeExpenseTravelerPill,
                      ]}
                    >
                      <Text style={styles.expenseTravelerText}>{person.name}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.formLabel}>Paid yet?</Text>
                <View style={styles.expenseTravelerGrid}>
                  {[
                    { id: "PAID", label: "Paid already" },
                    { id: "REQUESTED", label: "Requested / not paid yet" },
                  ].map((status: any) => (
                    <Pressable
                      key={status.id}
                      onPress={() => setExpensePaymentStatus(status.id)}
                      style={[
                        styles.expenseTravelerPill,
                        expensePaymentStatus === status.id &&
                          styles.activeExpenseTravelerPill,
                      ]}
                    >
                      <Text style={styles.expenseTravelerText}>{status.label}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.formLabel}>Who was covered?</Text>
                <View style={styles.expenseTravelerGrid}>
                  {tripMembers.map((person: any) => (
                    <Pressable
                      key={`covered-${person.id}`}
                      onPress={() => toggleExpenseCovered(person.id)}
                      style={[
                        styles.expenseTravelerPill,
                        expenseCovered?.[person.id] &&
                          styles.activeExpenseTravelerPill,
                      ]}
                    >
                      <Text style={styles.expenseTravelerText}>
                        {expenseCovered?.[person.id] ? "✓ " : ""}
                        {person.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.formLabel}>Split method</Text>
                <View style={styles.expenseTravelerGrid}>
                  {[
                    { id: "EVEN", label: "Split evenly" },
                    { id: "ITEMIZED", label: "Itemized bills" },
                  ].map((mode: any) => (
                    <Pressable
                      key={mode.id}
                      onPress={() => setExpenseSplitMode(mode.id)}
                      style={[
                        styles.expenseTravelerPill,
                        expenseSplitMode === mode.id &&
                          styles.activeExpenseTravelerPill,
                      ]}
                    >
                      <Text style={styles.expenseTravelerText}>{mode.label}</Text>
                    </Pressable>
                  ))}
                </View>

                {expenseSplitMode === "ITEMIZED" && (
                  <View style={styles.itemizedBox}>
                    {selectedExpenseCoveredIds().map((travelerId: string) => (
                      <View key={`itemized-${travelerId}`}>
                        <Text style={styles.formLabel}>{getTravelerNameById(travelerId)}</Text>
                        <TextInput
                          value={expenseItemizedAmounts?.[travelerId] || ""}
                          onChangeText={(value) => updateItemizedAmount(travelerId, value)}
                          keyboardType="decimal-pad"
                          placeholder={`Amount for ${getTravelerNameById(travelerId)}`}
                          style={styles.input}
                        />
                      </View>
                    ))}
                  </View>
                )}

                <Text style={styles.formLabel}>Payment request app</Text>
                <View style={styles.expenseTravelerGrid}>
                  {["Venmo", "Revolut", "Other"].map((app) => (
                    <Pressable
                      key={app}
                      onPress={() => setExpensePaymentApp(app)}
                      style={[
                        styles.expenseTravelerPill,
                        expensePaymentApp === app && styles.activeExpenseTravelerPill,
                      ]}
                    >
                      <Text style={styles.expenseTravelerText}>{app}</Text>
                    </Pressable>
                  ))}
                </View>

                <TextInput
                  value={expensePaymentLink}
                  onChangeText={setExpensePaymentLink}
                  placeholder="Optional Venmo/Revolut request link"
                  style={styles.input}
                />

                <TextInput
                  value={expenseNotes}
                  onChangeText={setExpenseNotes}
                  placeholder="Notes"
                  multiline
                  style={styles.announcementBox}
                />

                <Pressable onPress={addExpense} style={styles.primaryButton}>
                  <Text style={styles.primaryText}>Add Expense</Text>
                </Pressable>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>What I paid for</Text>
                <Text style={styles.cardTitle}>My submitted expenses</Text>

                {expenseSummary.myPaidExpenses.length === 0 ? (
                  <Text style={styles.muted}>You have not submitted any expenses yet.</Text>
                ) : (
                  expenseSummary.myPaidExpenses.map((expense: any) => (
                    <View key={`mine-${expense.id}`} style={styles.expenseLogCard}>
                      <Text style={styles.cardTitle}>{expense.title}</Text>
                      <Text style={styles.muted}>
                        {formatMoney(expense.amount, expense.currency)} · {expense.paymentStatus === "PAID" ? "Paid" : "Requested / pending"}
                      </Text>
                      <Text style={styles.muted}>
                        Covered: {expense.coveredNames?.join(", ") || "Not listed"}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Expense Log</Text>
                <Text style={styles.cardTitle}>All submitted expenses</Text>

                {expenses.length === 0 ? (
                  <Text style={styles.muted}>No expenses yet.</Text>
                ) : (
                  expenses.map((expense: any) => (
                    <View key={expense.id} style={styles.expenseLogCard}>
                      <Text style={styles.date}>{expense.createdAtLabel}</Text>
                      <Text style={styles.cardTitle}>{expense.title}</Text>
                      <Text style={styles.muted}>
                        {expense.paidByName} submitted {formatMoney(expense.amount, expense.currency)}
                      </Text>
                      <Text style={styles.muted}>
                        Split: {expense.splitMode === "ITEMIZED" ? "Itemized" : "Even"} · Status: {expense.paymentStatus === "PAID" ? "Paid" : "Requested / pending"}
                      </Text>
                      <Text style={styles.muted}>
                        Covered: {expense.coveredNames?.join(", ") || "Not listed"}
                      </Text>

                      {expense.paymentLink ? (
                        <Pressable
                          onPress={() => openExpensePaymentLink(expense.paymentLink)}
                          style={styles.outlineButton}
                        >
                          <Text style={styles.outlineButtonText}>
                            Open {expense.paymentApp || "Payment"} Request
                          </Text>
                        </Pressable>
                      ) : null}

                      <Pressable
                        onPress={() => confirmDeleteExpense(expense)}
                        style={styles.deleteUploadButton}
                      >
                        <Text style={styles.deleteUploadText}>Delete Expense</Text>
                      </Pressable>
                    </View>
                  ))
                )}
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
              {getUnreadAnnouncements().length > 0 && (
                <View style={styles.inlineAlertCard}>
                  <Text style={styles.notificationItemTitle}>
                    {getUnreadAnnouncements().length} unread announcement
                    {getUnreadAnnouncements().length === 1 ? "" : "s"}
                  </Text>
                  <Pressable onPress={markAllAnnouncementsRead}>
                    <Text style={styles.notificationActionText}>
                      Mark all announcements read
                    </Text>
                  </Pressable>
                </View>
              )}

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
  balanceRow: {
    backgroundColor: "#FFF8F2",
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  balanceName: {
    color: colors.text,
    fontWeight: "900",
    flex: 1,
  },

  balanceAmount: {
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
  },

  balancePositive: {
    color: colors.ocean,
  },

  balanceNegative: {
    color: colors.terracotta,
  },

  balanceEven: {
    color: colors.muted,
  },

  currencySection: {
    marginTop: 12,
  },

  formLabel: {
    color: colors.terracotta,
    fontWeight: "900",
    marginTop: 16,
    marginBottom: 8,
  },

  expenseTravelerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },

  expenseTravelerPill: {
    backgroundColor: "#FFF8F2",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  activeExpenseTravelerPill: {
    backgroundColor: colors.blush,
  },

  expenseTravelerText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 12,
  },

  itemizedBox: {
    backgroundColor: "#FFF8F2",
    borderRadius: 18,
    padding: 12,
    marginTop: 10,
  },

  expenseLogCard: {
    backgroundColor: "#FFF8F2",
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
  },

  multiImageWrap: {
    width: 170,
    marginRight: 12,
    marginTop: 12,
  },

  multiUploadPreview: {
    width: 170,
    height: 210,
    borderRadius: 18,
    backgroundColor: "#FFF8F2",
  },

  visibilityBox: {
    backgroundColor: "#FFF8F2",
    borderRadius: 18,
    padding: 12,
    marginTop: 12,
  },

  visibilityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },

  visibilityPill: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.blush,
  },

  visibilityPillActive: {
    backgroundColor: colors.blush,
  },

  visibilityText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 12,
  },

  imageVisibilityText: {
    color: colors.terracotta,
    fontWeight: "900",
    fontSize: 12,
    marginTop: 8,
  },

  outfitUploadButtonGrid: {
    gap: 10,
    marginTop: 12,
  },

  weatherCard: {
    backgroundColor: colors.sky,
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
  },

  weatherTopRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  weatherRefreshButton: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },

  weatherRefreshText: {
    color: colors.ocean,
    fontWeight: "900",
    fontSize: 12,
  },

  weatherSummary: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16,
    lineHeight: 22,
    marginTop: 14,
  },

  weatherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },

  weatherStat: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 12,
    minWidth: "30%",
    flex: 1,
  },

  weatherStatLabel: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 11,
    marginBottom: 4,
  },

  weatherStatValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 14,
  },

  imageMetaRow: {
    marginTop: 8,
  },

  notificationCard: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.blush,
  },

  notificationHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  notificationBadge: {
    backgroundColor: colors.terracotta,
    borderRadius: 999,
    minWidth: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  notificationBadgeText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 14,
  },

  notificationSection: {
    marginTop: 14,
    gap: 10,
  },

  notificationSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  notificationSectionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 15,
  },

  notificationActionText: {
    color: colors.ocean,
    fontWeight: "900",
    fontSize: 12,
  },

  notificationItem: {
    backgroundColor: "#FFF8F2",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.blush,
  },

  notificationItemTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 4,
  },

  notificationItemBody: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
    lineHeight: 18,
  },

  notificationItemMeta: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 12,
    marginTop: 6,
  },

  notificationEmptyText: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 13,
    marginTop: 12,
  },

  inlineAlertCard: {
    backgroundColor: "#FFF8F2",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.blush,
  },

  eventClickableHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  eventOpenText: {
    color: colors.ocean,
    fontWeight: "900",
    fontSize: 12,
    backgroundColor: "#FFF8F2",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    overflow: "hidden",
  },

  eventMoreButton: {
    backgroundColor: colors.ocean,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    marginTop: 12,
  },

  eventMoreButtonText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 13,
  },

  eventMorePanel: {
    marginTop: 14,
    gap: 14,
  },

  eventUploadSection: {
    backgroundColor: "#FFF8F2",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.blush,
  },

  eventUploadSectionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 15,
    marginBottom: 8,
  },

  eventQrPersonCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.blush,
  },

  eventPersonLabel: {
    color: colors.terracotta,
    fontWeight: "900",
    fontSize: 13,
    marginBottom: 8,
  },

  pushPermissionBox: {
    backgroundColor: "#FFF8F2",
    borderRadius: 20,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.blush,
  },

  pushPermissionButton: {
    backgroundColor: colors.terracotta,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: "center",
    marginTop: 10,
  },

  pushPermissionButtonOn: {
    backgroundColor: colors.ocean,
  },

  pushPermissionButtonText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 13,
  },

});