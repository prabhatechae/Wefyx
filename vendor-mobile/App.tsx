import React, { useEffect, useRef, useState } from "react";
import Registration from './src/Registration';
import {
  ActivityIndicator,
  Animated,
  Alert,
  FlatList,
  Image,
  LogBox,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetInfo } from "@react-native-community/netinfo";
import DeviceInfo from "react-native-device-info";
import { launchImageLibrary } from "react-native-image-picker";
import {
  Bell,
  Box,
  Camera,
  ChevronRight,
  ClipboardList,
  Home,
  LogOut,
  PackagePlus,
  Search,
  Store,
  Smartphone,
  UserRound,
  Wifi,
  WifiOff,
  X,
} from "lucide-react-native";
import {
  apiGet,
  apiLogin,
  apiSend,
  clearSessionToken,
  getSessionToken,
  saveSessionToken,
  setUnauthorizedHandler,
} from "./src/api";
const purple = "#5B45F5",
  navy = "#071B35";
LogBox.ignoreAllLogs(true);
type Tab = "Home" | "Orders" | "Products" | "Profile";
type User = { name: string; email: string; role: string };

function WefyxLoader({ size = 54 }: { size?: number }) {
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [rotation]);
  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  return (
    <Animated.View
      style={[
        s.wefyxLoader,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ rotate: spin }],
        },
      ]}
    >
      <Text style={[s.wefyxLoaderText, { fontSize: size * 0.42 }]}>W</Text>
    </Animated.View>
  );
}
type Item = {
  id: number;
  name: string;
  owner: string;
  details: string;
  status: string;
  quotationRequested?: boolean;
  estimatedAmount?: number;
  quotationStatus?: string;
  vendorQuoteStatus?: string;
};
const money = (n: number) => `AED ${n.toLocaleString()}`;
function Header({ title, onBell }: { title: string; onBell: () => void }) {
  return (
    <View style={s.header}>
      <View style={s.headBrand}>
        <View style={s.logo}>
          <Text style={s.logoT}>W</Text>
        </View>
        <View>
          <Text style={s.headTitle}>{title}</Text>
          <Text style={s.headSub}>TechSolutions LLC</Text>
        </View>
      </View>
      <Pressable style={s.iconBtn} onPress={onBell}>
        <Bell color="white" size={21} />
        <View style={s.badge}>
          <Text style={s.badgeT}>3</Text>
        </View>
      </Pressable>
    </View>
  );
}
function Status({ value }: { value: string }) {
  let k = value.toLowerCase(),
    c =
      k.includes("deliver") || k.includes("active")
        ? "#059669"
        : k.includes("ship")
        ? "#2563EB"
        : k.includes("cancel")
        ? "#DC2626"
        : "#D97706";
  return (
    <View style={[s.pill, { backgroundColor: `${c}18` }]}>
      <Text style={[s.pillT, { color: c }]}>{value || "Pending"}</Text>
    </View>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <View style={s.empty}>
      <Box color="#9AA6B7" size={36} />
      <Text style={s.emptyTitle}>{text}</Text>
      <Text style={s.muted}>New records will appear here automatically.</Text>
    </View>
  );
}
function Order({ item, onPress }: { item: Item; onPress?: () => void }) {
  return (
    <Pressable style={s.card} onPress={onPress}>
      <View style={s.row}>
        <View>
          <Text style={s.ref}>#{item.name}</Text>
          <Text style={s.cardTitle}>{item.owner || "Wefyx customer"}</Text>
        </View>
        <Status value={item.status} />
      </View>
      <Text style={s.muted} numberOfLines={2}>
        {item.details || "Order information"}
      </Text>
      <View style={s.cardFoot}>
        <Text style={s.amount}>{money(5200)}</Text>
        <ChevronRight size={20} color="#99A4B4" />
      </View>
    </Pressable>
  );
}
function HomePage({
  orders,
  products,
  toOrders,
}: {
  orders: Item[];
  products: Item[];
  toOrders: () => void;
}) {
  let delivered = orders.filter((x) =>
    x.status?.toLowerCase().includes("deliver")
  ).length;
  return (
    <ScrollView contentContainerStyle={s.content}>
      <Text style={s.eyebrow}>VENDOR DASHBOARD</Text>
      <Text style={s.hero}>Good morning, TechSolutions</Text>
      <Text style={s.muted}>
        Here is how your business is performing today.
      </Text>
      <View style={s.grid}>
        {[
          ["Total orders", orders.length, purple],
          ["Pending", orders.length - delivered, "#F59E0B"],
          ["Delivered", delivered, "#10B981"],
          ["Products", products.length, "#3B82F6"],
        ].map(([a, b, c]) => (
          <View
            style={[s.stat, { borderTopColor: c as string }]}
            key={a as string}
          >
            <Text style={s.muted}>{a}</Text>
            <Text style={s.statV}>{b}</Text>
          </View>
        ))}
      </View>
      <View style={s.revenue}>
        <Text style={s.revenueL}>THIS MONTH'S REVENUE</Text>
        <Text style={s.revenueV}>{money(45200)}</Text>
        <Text style={s.revenueUp}>↑ 12.4% from last month</Text>
      </View>
      <View style={s.sectionHead}>
        <Text style={s.section}>Recent orders</Text>
        <Pressable onPress={toOrders}>
          <Text style={s.link}>View all</Text>
        </Pressable>
      </View>
      {orders.slice(0, 3).map((x) => (
        <Order item={x} key={x.id} />
      ))}
      {!orders.length && <Empty text="No orders yet" />}
      <Text style={[s.section, { marginTop: 20 }]}>Business snapshot</Text>
      <View style={s.snapshot}>
        {[
          ["96%", "On-time"],
          ["4.8", "Rating"],
          ["18h", "Response"],
        ].map(([a, b]) => (
          <View style={s.snap} key={b}>
            <Text style={s.snapV}>{a}</Text>
            <Text style={s.muted}>{b}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
function OrdersPage({
  items,
  reload,
}: {
  items: Item[];
  reload: () => Promise<void>;
}) {
  let [q, setQ] = useState(""),
    [view,setView]=useState<"ACTIVE"|"HISTORY">("ACTIVE"),
    [selected, setSelected] = useState<Item>(),
    [quoteAmount, setQuoteAmount] = useState(""),
    [leadTimeDays, setLeadTimeDays] = useState(""),
    [messages,setMessages]=useState<any[]>([]),
    [message,setMessage]=useState(""),
    [resolution, setResolution] = useState("");
  let list = items.filter(x=>{const history=["RESOLVED","CLOSED","REJECTED"].includes(x.status)||x.vendorQuoteStatus==="NOT_SELECTED";return (view==="HISTORY"?history:!history)&&`${x.name}${x.owner}${x.status}`.toLowerCase().includes(q.toLowerCase())});
  async function openOrder(item:Item){setSelected(item);setMessages(await apiGet<any[]>(`/requirements/${item.id}/messages`).catch(()=>[]))}
  async function sendChat(){if(!selected||!message.trim())return;await apiSend(`/requirements/${selected.id}/messages`,"POST",{message:message.trim(),senderName:"Vendor Team",senderRole:"VENDOR"});setMessage("");setMessages(await apiGet<any[]>(`/requirements/${selected.id}/messages`))}
  async function update(action: "quote" | "start" | "resolve") {
    if (!selected) return;
    if (action === "quote") {
      if (!Number(quoteAmount) || !Number(leadTimeDays)) { Alert.alert("Quotation details required", "Enter the amount and delivery time in days."); return; }
      await apiSend(`/requirements/${selected.id}/quotations/submit`, "PATCH", { amount: quoteAmount, leadTimeDays, notes: resolution });
    }
    if (action === "start") await apiSend(`/requirements/${selected.id}/start`, "PATCH");
    if (action === "resolve") {
      if (!resolution.trim()) { Alert.alert("Resolution required", "Describe how the customer requirement was resolved."); return; }
      await apiSend(`/requirements/${selected.id}/resolve`, "PATCH", { resolution });
    }
    setSelected(undefined);
    setResolution(""); setQuoteAmount(""); setLeadTimeDays("");
    await reload();
  }
  return (
    <View style={{ flex: 1 }}>
      <View style={[s.actions,{paddingHorizontal:16,paddingTop:12}]}><Pressable style={view==="ACTIVE"?s.primary:s.outline} onPress={()=>setView("ACTIVE")}><Text style={view==="ACTIVE"?s.primaryT:s.outlineT}>ACTIVE ORDERS</Text></Pressable><Pressable style={view==="HISTORY"?s.primary:s.outline} onPress={()=>setView("HISTORY")}><Text style={view==="HISTORY"?s.primaryT:s.outlineT}>ORDER HISTORY</Text></Pressable></View>
      <View style={s.search}>
        <Search size={19} color="#8290A5" />
        <TextInput
          style={s.searchInput}
          placeholder="Search orders..."
          value={q}
          onChangeText={setQ}
        />
      </View>
      <FlatList
        contentContainerStyle={s.list}
        data={list}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => (
          <Order item={item} onPress={() => openOrder(item)} />
        )}
        ListEmptyComponent={<Empty text="No matching orders" />}
        onRefresh={reload}
        refreshing={false}
      />
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={s.shade}>
          <View style={s.sheet}>
            <View style={s.sectionHead}>
            <Text style={s.sheetTitle}>Customer requirement</Text>
              <Pressable onPress={() => setSelected(undefined)}>
                <X color={navy} />
              </Pressable>
            </View>
            <Text style={s.ref}>#{selected?.name}</Text>
            <Text style={s.heroSmall}>{selected?.owner}</Text>
            <Text style={s.detail}>{selected?.details}</Text>
            {selected?.quotationRequested && <><TextInput style={s.input} value={quoteAmount} onChangeText={setQuoteAmount} placeholder="Your quotation amount (AED)" keyboardType="numeric" /><TextInput style={s.input} value={leadTimeDays} onChangeText={setLeadTimeDays} placeholder="Delivery / completion time (days)" keyboardType="numeric" /></>}
            <TextInput style={s.input} value={resolution} onChangeText={setResolution} placeholder="Offer terms, scope or resolution notes" multiline />
            <Text style={s.label}>Requirement chat</Text><ScrollView style={{maxHeight:140}}>{messages.map(m=><View key={m.id} style={s.card}><Text style={s.ref}>{m.senderName} · {m.senderRole}</Text><Text style={s.detail}>{m.message}</Text></View>)}</ScrollView><TextInput style={s.input} value={message} onChangeText={setMessage} placeholder="Reply to Wefyx employee"/><Pressable style={s.outline} onPress={sendChat}><Text style={s.outlineT}>SEND MESSAGE</Text></Pressable>
            <Text style={s.label}>Workflow action</Text>
            <View style={s.actions}>
              {selected?.status === "SENT_TO_VENDOR" && selected?.quotationRequested && <Pressable style={s.outline} onPress={() => update("quote")}><Text style={s.outlineT}>SUBMIT QUOTATION</Text></Pressable>}
              {selected?.status === "VENDOR_ACCEPTED" && selected?.vendorQuoteStatus === "SELECTED" && <Pressable style={s.outline} onPress={() => update("start")}><Text style={s.outlineT}>START WORK</Text></Pressable>}
              {selected?.status === "IN_PROGRESS" && <Pressable style={s.outline} onPress={() => update("resolve")}><Text style={s.outlineT}>RESOLVE</Text></Pressable>}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
function ProductsPage({
  items,
  reload,
}: {
  items: Item[];
  reload: () => Promise<void>;
}) {
  let [show, setShow] = useState(false),
    [name, setName] = useState(""),
    [price, setPrice] = useState("");
  async function add() {
    if (!name.trim()) return;
    await apiSend("/resources/vendor-products", "POST", {
      name,
      owner: "TechSolutions LLC",
      details: `AED ${price || 0} · Stock available`,
      status: "Active",
    });
    setShow(false);
    setName("");
    setPrice("");
    await reload();
  }
  return (
    <View style={{ flex: 1 }}>
      <View style={s.actionBar}>
        <View>
          <Text style={s.section}>Product catalogue</Text>
          <Text style={s.muted}>{items.length} products listed</Text>
        </View>
        <Pressable style={s.add} onPress={() => setShow(true)}>
          <PackagePlus color="white" size={17} />
          <Text style={s.addT}>Add product</Text>
        </Pressable>
      </View>
      <FlatList
        contentContainerStyle={s.list}
        data={items}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => (
          <View style={s.product}>
            <View style={s.productIcon}>
              <Box color={purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{item.name}</Text>
              <Text style={s.muted}>{item.details}</Text>
              <View style={[s.row, { marginTop: 9 }]}>
                <Status value={item.status} />
                <Text style={s.sku}>
                  SKU-{String(item.id).padStart(4, "0")}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Empty text="No products listed" />}
        onRefresh={reload}
        refreshing={false}
      />
      <Modal visible={show} transparent animationType="slide">
        <View style={s.shade}>
          <View style={s.sheet}>
            <View style={s.sectionHead}>
              <Text style={s.sheetTitle}>Add product</Text>
              <Pressable onPress={() => setShow(false)}>
                <X color={navy} />
              </Pressable>
            </View>
            <Text style={s.label}>Product name</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Dell Latitude 5530"
            />
            <Text style={s.label}>Price (AED)</Text>
            <TextInput
              style={s.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="0"
            />
            <Pressable style={s.primary} onPress={add}>
              <Text style={s.primaryT}>Add product</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
function ProfilePage({ user, logout }: { user: User; logout: () => void }) {
  const [photoUri, setPhotoUri] = useState<string>();
  const network = useNetInfo();
  useEffect(() => {
    AsyncStorage.getItem("wefyx-vendor-profile-photo").then((uri) => {
      if (uri) setPhotoUri(uri);
    });
  }, []);
  async function chooseProfilePhoto() {
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 1,
      quality: 0.8,
    });
    const uri = result.assets?.[0]?.uri;
    if (!uri) return;
    await AsyncStorage.setItem("wefyx-vendor-profile-photo", uri);
    setPhotoUri(uri);
  }
  const online =
    network.isConnected !== false && network.isInternetReachable !== false;
  return (
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.profile}>
        <Pressable
          style={s.avatarWrap}
          onPress={chooseProfilePhoto}
          accessibilityRole="button"
          accessibilityLabel="Choose profile photo"
        >
          <View style={s.avatar}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={s.avatarImage} />
            ) : (
              <Text style={s.avatarT}>
                {user.name
                  .split(" ")
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join("")}
              </Text>
            )}
          </View>
          <View style={s.cameraBadge}>
            <Camera size={14} color="white" />
          </View>
        </Pressable>
        <Text style={s.profileName}>{user.name}</Text>
        <Text style={s.link}>Verified Vendor Partner</Text>
      </View>
      <View style={s.info}>
        <Text style={s.section}>Connection & device</Text>
        <View style={s.connectionRow}>
          <View
            style={[
              s.connectionIcon,
              { backgroundColor: online ? "#E8F8F0" : "#FDECEC" },
            ]}
          >
            {online ? (
              <Wifi size={18} color="#059669" />
            ) : (
              <WifiOff size={18} color="#DC2626" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{online ? "Online" : "Offline"}</Text>
            <Text style={s.muted}>
              {network.type === "unknown"
                ? "Checking connection"
                : `${network.type.toUpperCase()} connection`}
            </Text>
          </View>
        </View>
        <View style={s.connectionRow}>
          <View style={s.connectionIcon}>
            <Smartphone size={18} color={purple} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{DeviceInfo.getModel()}</Text>
            <Text style={s.muted}>
              {DeviceInfo.getSystemName()} {DeviceInfo.getSystemVersion()} · App{" "}
              {DeviceInfo.getVersion()}
            </Text>
          </View>
        </View>
      </View>
      <View style={s.info}>
        <Text style={s.section}>Business information</Text>
        {[
          ["Company", "TechSolutions LLC"],
          ["Email", user.email],
          ["Vendor ID", "VND-2026-0015"],
          ["Location", "Dubai, UAE"],
          ["Rating", "4.8 / 5.0"],
        ].map(([a, b]) => (
          <View style={s.infoRow} key={a}>
            <Text style={s.infoL}>{a}</Text>
            <Text style={s.infoV}>{b}</Text>
          </View>
        ))}
      </View>
      <View style={s.info}>
        <Text style={s.section}>Account & support</Text>
        {[
          "Payments & settlements",
          "Team members",
          "Help & support",
          "Privacy policy",
        ].map((x) => (
          <Pressable style={s.menu} key={x}>
            <Text style={s.cardTitle}>{x}</Text>
            <ChevronRight size={19} color="#9AA5B5" />
          </Pressable>
        ))}
      </View>
      <Pressable style={s.logout} onPress={logout}>
        <LogOut size={19} color="#DC2626" />
        <Text style={s.logoutT}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
function Notices({ close, open }: { close: () => void; open:(requirementId?:number)=>void }) {
  const [items,setItems]=useState<any[]>([]);
  useEffect(()=>{apiGet<any[]>('/notifications').then(setItems).catch(()=>setItems([]))},[]);
  async function select(item:any){await apiSend(`/notifications/${item.id}/read`,'PATCH').catch(()=>{});open(item.requirementId)}
  return (
    <Modal animationType="slide">
      <SafeAreaView style={s.page}>
        <View style={s.modalHead}>
          <Pressable onPress={close}>
            <X color={navy} />
          </Pressable>
          <Text style={s.section}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={s.content}>
          {items.map(item => (
              <Pressable style={s.notice} key={item.id} onPress={()=>select(item)}>
                <View style={s.noticeIcon}>
                  <Bell color={purple} size={18} />
                </View>
                <View>
                  <Text style={s.cardTitle}>{item.title}</Text>
                  <Text style={s.muted}>{item.message}</Text>
                </View>
              </Pressable>
          ))}
          {!items.length&&<Text style={s.muted}>No new notifications.</Text>}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
function Login({ done }: { done: (u: User) => void }) {
  let [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [registering,setRegistering]=useState(false),
    [error, setError] = useState("");
  async function submit() {
    setBusy(true);
    setError("");
    try {
      let d = await apiLogin(email.trim(), password);
      if (d.user.role !== "VENDOR") {
        throw new Error("This account is not authorized for the Vendor app");
      }
      await saveSessionToken(d.token);
      await AsyncStorage.setItem("wefyx-vendor-user", JSON.stringify(d.user));
      done(d.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }
  if(registering)return <Registration role="VENDOR" onBack={()=>setRegistering(false)} onRegistered={value=>{setEmail(value);setPassword('');setRegistering(false)}}/>;
  return (
    <SafeAreaView style={s.login}>
      <StatusBar backgroundColor={navy} barStyle="light-content" />
      <View style={s.loginBrand}>
        <View style={s.loginLogo}>
          <Text style={s.loginLogoT}>W</Text>
        </View>
        <Text style={s.loginName}>Wefyx.pro</Text>
        <Text style={s.loginTag}>Vendor Partner App</Text>
      </View>
      <View style={s.loginCard}>
        <Text style={s.loginTitle}>Welcome back</Text>
        <Text style={s.loginSub}>
          Sign in to manage orders, products and settlements.
        </Text>
        <Text style={s.label}>Vendor email</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="vendor@company.com"
        />
        <Text style={s.label}>Password</Text>
        <TextInput
          style={s.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter password"
        />
        {!!error && <Text style={s.error}>{error}</Text>}
        <Pressable style={s.primary} disabled={busy} onPress={submit}>
          {busy ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={s.primaryT}>Sign in as Vendor</Text>
          )}
        </Pressable>
        <Pressable onPress={()=>setRegistering(true)} style={{alignItems:'center',marginTop:18}}><Text style={{color:'#0443A4',fontWeight:'600'}}>New vendor? Create account</Text></Pressable>
        <Text style={s.secure}>
          Secure access for approved Wefyx vendor partners
        </Text>
      </View>
    </SafeAreaView>
  );
}
function VendorApp() {
  let [user, setUser] = useState<User>(),
    [loading, setLoading] = useState(true),
    [tab, setTab] = useState<Tab>("Home"),
    [orders, setOrders] = useState<Item[]>([]),
    [products, setProducts] = useState<Item[]>([]),
    [notice, setNotice] = useState(false),
    [fetching, setFetching] = useState(false);
  async function logout() {
    await Promise.all([
      clearSessionToken(),
      AsyncStorage.removeItem("wefyx-vendor-user"),
    ]);
    setUser(undefined);
  }
  async function reload() {
    setFetching(true);
    try {
      let [requirements, p] = await Promise.all([
        apiGet<any[]>("/requirements?view=vendor"),
        apiGet<Item[]>("/resources/vendor-products"),
      ]);
      const enriched=await Promise.all(requirements.map(async r=>{const quotes=await apiGet<any[]>(`/requirements/${r.id}/quotations?view=vendor`).catch(()=>[]);return {id:r.id,name:r.reference,owner:r.organization||r.customerName,details:`${r.title} · ${r.category}${r.agreedAmount?` · AED ${r.agreedAmount}`:""}`,status:r.status,quotationRequested:r.quotationRequested,estimatedAmount:r.estimatedAmount,quotationStatus:r.quotationStatus,vendorQuoteStatus:quotes[0]?.status}}));
      setOrders(enriched);
      setProducts(p);
    } catch (e) {
      if (user)
        Alert.alert(
          "Unable to refresh",
          e instanceof Error ? e.message : "Try again"
        );
    } finally {
      setFetching(false);
    }
  }
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(undefined));
    let active = true;
    (async () => {
      const tokenRequest = getSessionToken().catch(() => null);
      try {
        const cachedUser = await AsyncStorage.getItem("wefyx-vendor-user");
        if (!active) return;

        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
        setLoading(false);

        // Secure storage can be slower than AsyncStorage on some Android
        // devices. Validate it after rendering the cached session so startup
        // is not held on the splash/loading screen.
        const token = await tokenRequest;
        if (active && cachedUser && !token) {
          await AsyncStorage.removeItem("wefyx-vendor-user");
          setUser(undefined);
        }
      } catch {
        if (active) {
          setUser(undefined);
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
      setUnauthorizedHandler();
    };
  }, []);
  useEffect(() => {
    if (user) reload();
  }, [user]);
  if (loading)
    return (
      <View style={s.center}>
        <WefyxLoader size={62} />
        <Text style={s.loadingText}>Loading your workspace</Text>
      </View>
    );
  if (!user) return <Login done={setUser} />;
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: navy }}>
      <View style={s.page}>
        <StatusBar backgroundColor={navy} barStyle="light-content" />
        <Header
          title={tab === "Home" ? "Vendor Dashboard" : tab}
          onBell={() => setNotice(true)}
        />
        <View style={{ flex: 1 }}>
          {tab === "Home" ? (
            <HomePage
              orders={orders}
              products={products}
              toOrders={() => setTab("Orders")}
            />
          ) : tab === "Orders" ? (
            <OrdersPage items={orders} reload={reload} />
          ) : tab === "Products" ? (
            <ProductsPage items={products} reload={reload} />
          ) : (
            <ProfilePage
              user={user}
              logout={() =>
                Alert.alert("Sign out", "Are you sure?", [
                  { text: "Cancel" },
                  { text: "Sign out", style: "destructive", onPress: logout },
                ])
              }
            />
          )}
        </View>
        {fetching && (
          <View style={s.loadingOverlay}>
            <WefyxLoader size={58} />
            <Text style={s.loadingText}>Loading your workspace</Text>
          </View>
        )}
        <View style={s.tabs}>
          {(
            [
              { name: "Home", I: Home },
              { name: "Orders", I: ClipboardList },
              { name: "Products", I: Store },
              { name: "Profile", I: UserRound },
            ] as const
          ).map(({ name, I }) => (
            <Pressable style={s.tab} key={name} onPress={() => setTab(name)}>
              <I
                size={23}
                color={tab === name ? purple : "#7A8799"}
                strokeWidth={tab === name ? 2.6 : 2}
              />
              <Text style={[s.tabT, tab === name && { color: purple }]}>
                {name}
              </Text>
            </Pressable>
          ))}
        </View>
      {notice && <Notices close={() => setNotice(false)} open={()=>{setNotice(false);setTab("Orders")}} />}
      </View>
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <VendorApp />
    </SafeAreaProvider>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F5F7FB" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F8FC" },
  wefyxLoader: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#DDD8FF",
    borderTopColor: purple,
    backgroundColor: "white",
    shadowColor: purple,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  wefyxLoaderText: { fontFamily: "Poppins-Bold", color: purple },
  loadingText: { marginTop: 16, fontFamily: "Poppins-Medium", fontSize: 12, color: "#64748B" },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(246,248,252,0.88)",
  },
  header: {
    height: 94,
    backgroundColor: navy,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headBrand: { flexDirection: "row", alignItems: "center", gap: 11 },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: purple,
    alignItems: "center",
    justifyContent: "center",
  },
  logoT: { fontFamily: "Poppins-ExtraBold", fontSize: 24, color: "white" },
  headTitle: { fontFamily: "Poppins-SemiBold", fontSize: 18, color: "white" },
  headSub: { fontFamily: "Poppins-Regular", fontSize: 11, color: "#B8C6D8" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#17304E",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: 4,
    top: 4,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#F04455",
    alignItems: "center",
  },
  badgeT: { fontSize: 9, color: "white" },
  loadBar: { height: 2, backgroundColor: purple },
  content: { padding: 18, paddingBottom: 32 },
  eyebrow: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    letterSpacing: 1,
    color: purple,
  },
  hero: { fontFamily: "Poppins-Bold", fontSize: 22, color: navy, marginTop: 4 },
  heroSmall: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: navy,
    marginTop: 4,
  },
  muted: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#718096",
    marginTop: 3,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  stat: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    borderTopWidth: 3,
    elevation: 2,
  },
  statV: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: navy,
    marginTop: 4,
  },
  revenue: {
    backgroundColor: purple,
    borderRadius: 16,
    padding: 18,
    marginTop: 14,
  },
  revenueL: { fontFamily: "Poppins-Medium", fontSize: 10, color: "#E4E0FF" },
  revenueV: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "white",
    marginVertical: 3,
  },
  revenueUp: { fontFamily: "Poppins-Medium", fontSize: 10, color: "#C8F8DD" },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  section: { fontFamily: "Poppins-SemiBold", fontSize: 16, color: navy },
  link: { fontFamily: "Poppins-Medium", fontSize: 11, color: purple },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E6EBF1",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ref: { fontFamily: "Poppins-SemiBold", fontSize: 11, color: purple },
  cardTitle: { fontFamily: "Poppins-SemiBold", fontSize: 13, color: navy },
  cardFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EDF1F5",
  },
  amount: { fontFamily: "Poppins-SemiBold", fontSize: 14, color: navy },
  pill: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4 },
  pillT: { fontFamily: "Poppins-Medium", fontSize: 9 },
  snapshot: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 16,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  snap: { alignItems: "center" },
  snapV: { fontFamily: "Poppins-Bold", fontSize: 18, color: navy },
  empty: { alignItems: "center", paddingVertical: 44 },
  emptyTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: navy,
    marginTop: 8,
  },
  search: {
    height: 48,
    margin: 16,
    marginBottom: 2,
    backgroundColor: "white",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: navy,
  },
  list: { padding: 16, paddingBottom: 26 },
  shade: { flex: 1, backgroundColor: "#071B3570", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "white",
    padding: 22,
    paddingBottom: 34,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetTitle: { fontFamily: "Poppins-Bold", fontSize: 19, color: navy },
  detail: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    lineHeight: 20,
    color: "#66758A",
    marginVertical: 14,
  },
  label: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: navy,
    marginTop: 14,
    marginBottom: 6,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 7 },
  outline: {
    borderWidth: 1,
    borderColor: "#D9DFE7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  outlineT: { fontFamily: "Poppins-Medium", fontSize: 11, color: purple },
  actionBar: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  add: {
    backgroundColor: purple,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    gap: 6,
  },
  addT: { fontFamily: "Poppins-SemiBold", fontSize: 11, color: "white" },
  product: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E6EBF1",
  },
  productIcon: {
    width: 54,
    height: 54,
    borderRadius: 13,
    backgroundColor: "#EEEBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sku: { fontFamily: "Poppins-Regular", fontSize: 9, color: "#9AA4B4" },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DCE2EA",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: navy,
  },
  primary: {
    height: 52,
    borderRadius: 12,
    backgroundColor: purple,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  primaryT: { fontFamily: "Poppins-SemiBold", fontSize: 14, color: "white" },
  profile: {
    backgroundColor: "white",
    borderRadius: 17,
    padding: 22,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EAE6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrap: { position: "relative" },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: purple,
    borderWidth: 3,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarT: { fontFamily: "Poppins-Bold", fontSize: 24, color: purple },
  profileName: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: navy,
    marginTop: 9,
  },
  info: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F5",
  },
  connectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EEEBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F5",
  },
  infoL: { fontFamily: "Poppins-Regular", fontSize: 11, color: "#7B8798" },
  infoV: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: navy,
    maxWidth: "62%",
  },
  menu: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F5",
  },
  logout: {
    height: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#F2C7CA",
    marginTop: 15,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutT: { fontFamily: "Poppins-SemiBold", fontSize: 13, color: "#DC2626" },
  modalHead: {
    height: 62,
    backgroundColor: "white",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notice: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
  },
  noticeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EEEBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: {
    height: 82,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5EAF0",
    flexDirection: "row",
    paddingTop: 5,
    paddingBottom: 9,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  tabT: { fontFamily: "Poppins-Medium", fontSize: 10, color: "#7A8799" },
  login: {
    flex: 1,
    backgroundColor: navy,
    justifyContent: "center",
    padding: 22,
  },
  loginBrand: { alignItems: "center", marginBottom: 25 },
  loginLogo: {
    width: 66,
    height: 66,
    borderRadius: 19,
    backgroundColor: purple,
    alignItems: "center",
    justifyContent: "center",
  },
  loginLogoT: { fontFamily: "Poppins-ExtraBold", fontSize: 41, color: "white" },
  loginName: {
    fontFamily: "Poppins-Bold",
    fontSize: 25,
    color: "white",
    marginTop: 9,
  },
  loginTag: { fontFamily: "Poppins-Regular", fontSize: 12, color: "#B8C7D9" },
  loginCard: { backgroundColor: "white", borderRadius: 23, padding: 22 },
  loginTitle: { fontFamily: "Poppins-Bold", fontSize: 23, color: navy },
  loginSub: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    lineHeight: 19,
    color: "#728096",
    marginTop: 3,
  },
  error: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#DC2626",
    backgroundColor: "#FEF0F0",
    padding: 10,
    borderRadius: 9,
    marginTop: 10,
  },
  secure: {
    fontFamily: "Poppins-Regular",
    fontSize: 10,
    color: "#8793A5",
    textAlign: "center",
    marginTop: 15,
  },
});
