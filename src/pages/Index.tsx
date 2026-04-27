import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Message = {
  id: number;
  from: "me" | "other";
  text: string;
  time: string;
  read?: boolean;
};

type Chat = {
  id: number;
  name: string;
  avatar: string;
  color: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
};

const CHATS: Chat[] = [
  {
    id: 1,
    name: "Аня Морозова",
    avatar: "А",
    color: "#6b8f71",
    lastMsg: "Как прошёл твой день? 🌿",
    time: "14:32",
    unread: 2,
    online: true,
    messages: [
      { id: 1, from: "other", text: "Привет! Как ты? 🌸", time: "14:20" },
      { id: 2, from: "me", text: "Привет! Всё хорошо, спасибо. Читаю книгу на балконе", time: "14:22", read: true },
      { id: 3, from: "other", text: "Звучит уютно 😊 Что за книга?", time: "14:25" },
      { id: 4, from: "me", text: "«Норвежский лес» Мураками. Читал когда-нибудь?", time: "14:27", read: true },
      { id: 5, from: "other", text: "Как прошёл твой день? 🌿", time: "14:32" },
    ],
  },
  {
    id: 2,
    name: "Миша Волков",
    avatar: "М",
    color: "#8a7d72",
    lastMsg: "Встретимся в кафе в 18:00?",
    time: "13:15",
    unread: 0,
    online: true,
    messages: [
      { id: 1, from: "other", text: "Слушай, ты свободен сегодня вечером?", time: "12:50" },
      { id: 2, from: "me", text: "Да, вроде бы. А что?", time: "12:55", read: true },
      { id: 3, from: "other", text: "Встретимся в кафе в 18:00?", time: "13:15" },
    ],
  },
  {
    id: 3,
    name: "Семья 🏡",
    avatar: "С",
    color: "#c9956e",
    lastMsg: "Мама: Приедете на выходных?",
    time: "11:40",
    unread: 1,
    online: false,
    messages: [
      { id: 1, from: "other", text: "Всем привет! Как дела у всех? ❤️", time: "10:00" },
      { id: 2, from: "me", text: "Всё отлично! Работы много, но справляюсь 😊", time: "10:30", read: true },
      { id: 3, from: "other", text: "Мама: Приедете на выходных?", time: "11:40" },
    ],
  },
  {
    id: 4,
    name: "Дима Серов",
    avatar: "Д",
    color: "#7a8ea8",
    lastMsg: "Проект готов, отправил на почту",
    time: "Вчера",
    unread: 0,
    online: false,
    messages: [
      { id: 1, from: "other", text: "Как там дела с дизайном?", time: "Вчера" },
      { id: 2, from: "me", text: "Почти готово, доделываю мобильную версию", time: "Вчера", read: true },
      { id: 3, from: "other", text: "Проект готов, отправил на почту", time: "Вчера" },
    ],
  },
  {
    id: 5,
    name: "Катя Лесная",
    avatar: "К",
    color: "#9b7eb8",
    lastMsg: "Спасибо за рецепт! Попробую 🫶",
    time: "Вчера",
    unread: 0,
    online: false,
    messages: [
      { id: 1, from: "me", text: "Держи рецепт овсяного печенья, о котором говорили", time: "Вчера", read: true },
      { id: 2, from: "other", text: "Ооо, спасибо! Выглядит вкусно", time: "Вчера" },
      { id: 3, from: "other", text: "Спасибо за рецепт! Попробую 🫶", time: "Вчера" },
    ],
  },
];

function Avatar({ char, color, size = 40, online }: { char: string; color: string; size?: number; online?: boolean }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="rounded-full flex items-center justify-center text-white font-medium select-none"
        style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
      >
        {char}
      </div>
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-emerald-400"
          style={{ width: 11, height: 11 }}
        />
      )}
    </div>
  );
}

export default function Index() {
  const [chats, setChats] = useState<Chat[]>(CHATS);
  const [activeChatId, setActiveChatId] = useState<number>(1);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId)!;
  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatId, activeChat?.messages.length]);

  function selectChat(id: number) {
    setActiveChatId(id);
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
    setSidebarOpen(false);
  }

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newMsg: Message = { id: Date.now(), from: "me", text, time, read: false };
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, messages: [...c.messages, newMsg], lastMsg: text, time }
          : c
      )
    );
    setInput("");
    inputRef.current?.focus();

    setTimeout(() => {
      const replies = [
        "Понял, спасибо! 😊",
        "Хорошо, договорились",
        "Окей, буду иметь в виду",
        "Звучит отлично! 🌿",
        "Да, именно так 👍",
        "Хорошая идея!",
        "Ладно, увидимся 😊",
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const replyTime = `${now.getHours()}:${String(now.getMinutes() + 1).padStart(2, "0")}`;
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { id: Date.now() + 1, from: "other", text: reply, time: replyTime },
                ],
                lastMsg: reply,
                time: replyTime,
              }
            : c
        )
      );
    }, 1200);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const totalUnread = chats.reduce((acc, c) => acc + c.unread, 0);

  return (
    <div className="h-screen flex bg-[#f0ebe0] overflow-hidden" style={{ fontFamily: "'Rubik', sans-serif" }}>

      {/* Sidebar */}
      <aside
        className={`
          flex-shrink-0 flex flex-col bg-[#f8f4ed] border-r border-[#e2d9cc]
          transition-all duration-300 ease-in-out overflow-hidden
          absolute md:relative z-20 h-full
          ${sidebarOpen ? "w-[300px] shadow-xl md:shadow-none" : "w-0 md:w-[300px]"}
        `}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#6b8f71] flex items-center justify-center shadow-sm">
                <span className="text-sm">🌿</span>
              </div>
              <div>
                <h1 className="text-[#3d3530] font-semibold text-base leading-none">Relax</h1>
                <p className="text-[#a09387] text-[10px] mt-0.5 tracking-widest uppercase">Мессенджер</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {totalUnread > 0 && (
                <span className="bg-[#6b8f71] text-white text-[10px] font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {totalUnread}
                </span>
              )}
              <button className="w-8 h-8 rounded-xl hover:bg-[#ede7dc] flex items-center justify-center transition-colors">
                <Icon name="PenSquare" size={15} className="text-[#8a7d72]" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09387]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#ede7dc] text-[#3d3530] placeholder-[#b0a498] text-sm outline-none focus:ring-2 focus:ring-[#6b8f71]/25 transition-all"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-150 text-left
                ${activeChatId === chat.id ? "bg-[#6b8f71]/10" : "hover:bg-[#ede7dc]/80"}`}
            >
              <Avatar char={chat.avatar} color={chat.color} size={46} online={chat.online} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium text-[#3d3530] truncate">{chat.name}</span>
                  <span className="text-[10px] text-[#b0a498] ml-2 flex-shrink-0">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#a09387] truncate pr-2">{chat.lastMsg}</span>
                  {chat.unread > 0 && (
                    <span className="bg-[#6b8f71] text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* My profile */}
        <div className="px-5 py-4 border-t border-[#e2d9cc] flex items-center gap-3 flex-shrink-0">
          <Avatar char="Я" color="#7a8ea8" size={36} online />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#3d3530] leading-none mb-0.5">Мой профиль</p>
            <p className="text-[11px] text-[#6b8f71]">В сети</p>
          </div>
          <button className="w-8 h-8 rounded-xl hover:bg-[#ede7dc] flex items-center justify-center transition-colors">
            <Icon name="Settings" size={15} className="text-[#a09387]" />
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden absolute inset-0 z-10 bg-black/20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <header className="flex-shrink-0 bg-[#f8f4ed] border-b border-[#e2d9cc] px-5 py-3.5 flex items-center gap-3">
          <button
            className="md:hidden w-9 h-9 rounded-xl hover:bg-[#ede7dc] flex items-center justify-center transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="Menu" size={18} className="text-[#6b8f71]" />
          </button>

          <Avatar char={activeChat.avatar} color={activeChat.color} size={40} online={activeChat.online} />

          <div className="flex-1 min-w-0">
            <h2 className="text-[#3d3530] font-semibold text-sm leading-none mb-1">{activeChat.name}</h2>
            <p className="text-[11px] text-[#6b8f71]">
              {activeChat.online ? "в сети" : "был(а) недавно"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button className="w-9 h-9 rounded-xl hover:bg-[#ede7dc] flex items-center justify-center transition-colors">
              <Icon name="Phone" size={16} className="text-[#8a7d72]" />
            </button>
            <button className="w-9 h-9 rounded-xl hover:bg-[#ede7dc] flex items-center justify-center transition-colors">
              <Icon name="Video" size={16} className="text-[#8a7d72]" />
            </button>
            <button className="w-9 h-9 rounded-xl hover:bg-[#ede7dc] flex items-center justify-center transition-colors">
              <Icon name="MoreHorizontal" size={16} className="text-[#8a7d72]" />
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto px-4 md:px-10 py-6 space-y-1.5"
          style={{ background: "linear-gradient(180deg, #ede8de 0%, #f0ebe0 100%)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#d8d0c4]" />
            <span className="text-[11px] text-[#b0a498] px-2 bg-[#e8e1d4] rounded-full py-0.5">Сегодня</span>
            <div className="flex-1 h-px bg-[#d8d0c4]" />
          </div>

          {activeChat.messages.map((msg, i) => {
            const isMe = msg.from === "me";
            const prevMsg = activeChat.messages[i - 1];
            const showAvatar = !isMe && (!prevMsg || prevMsg.from !== "other");

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <div className="w-7 flex-shrink-0 self-end mb-5">
                    {showAvatar && (
                      <Avatar char={activeChat.avatar} color={activeChat.color} size={28} />
                    )}
                  </div>
                )}

                <div className="max-w-[70%] md:max-w-[55%]">
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${isMe
                        ? "bg-[#6b8f71] text-white rounded-br-md"
                        : "bg-white text-[#3d3530] rounded-bl-md"
                      }`}
                    style={{ wordBreak: "break-word" }}
                  >
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px] text-[#b0a498]">{msg.time}</span>
                    {isMe && (
                      <Icon
                        name={msg.read ? "CheckCheck" : "Check"}
                        size={11}
                        className={msg.read ? "text-[#6b8f71]" : "text-[#b0a498]"}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 bg-[#f8f4ed] border-t border-[#e2d9cc] px-4 md:px-6 py-4">
          <div className="flex items-end gap-3 bg-white rounded-2xl px-4 py-3 border border-[#e8e0d4] shadow-sm">
            <button className="flex-shrink-0 mb-0.5">
              <Icon name="Paperclip" size={17} className="text-[#a09387] hover:text-[#6b8f71] transition-colors" />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Напишите сообщение..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-[#3d3530] placeholder-[#b0a498] outline-none leading-relaxed max-h-28"
              style={{ scrollbarWidth: "none" }}
            />

            <button className="flex-shrink-0 mb-0.5">
              <Icon name="Smile" size={17} className="text-[#a09387] hover:text-[#6b8f71] transition-colors" />
            </button>

            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 mb-0.5
                ${input.trim()
                  ? "bg-[#6b8f71] hover:bg-[#5a7a60] shadow-md shadow-[#6b8f71]/30"
                  : "bg-[#e8e0d4]"
                }`}
            >
              <Icon name="Send" size={15} className={input.trim() ? "text-white" : "text-[#b0a498]"} />
            </button>
          </div>
          <p className="text-center text-[10px] text-[#c9bdb2] mt-2">
            Enter — отправить · Shift+Enter — новая строка
          </p>
        </div>
      </main>
    </div>
  );
}
