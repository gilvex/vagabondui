import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Hash,
  Home,
  Megaphone,
  Menu,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Pin,
  Search,
  Send,
  Settings,
  Smile,
  Users,
  X,
} from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { Input } from 'vagabond-ui/input'
import { Textarea } from 'vagabond-ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from 'vagabond-ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'vagabond-ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from 'vagabond-ui/sheet'
import { Tooltip } from 'vagabond-ui/tooltip'
import { toast } from 'vagabond-ui/sonner'
import { chatPeople, chatRooms, type ChatMessage } from './business/data'
import { useBusiness } from './business/store'
import { EmptyState, Initials } from './business/shared'
import { formatTime } from './format'

const emojis = ['👍', '🎉', '✅', '👀', '❤️']

export default function Chat() {
  const { data, setData } = useBusiness()
  const [room, setRoom] = useState('general')
  const [query, setQuery] = useState('')
  const [pinnedOnly, setPinnedOnly] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [threadId, setThreadId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [channelsOpen, setChannelsOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [showMembers, setShowMembers] = useState(true)
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const reduced = useReducedMotion()
  const directPerson = room.startsWith('dm-')
    ? chatPeople.find((person) => person.id === room.slice(3))
    : undefined
  const channel = chatRooms.find((item) => item.id === room)
  const title = directPerson?.name || channel?.name || 'general'
  const thread = data.messages.find((message) => message.id === threadId)
  const messages = data.messages.filter(
    (message) =>
      message.room === room &&
      !message.replyTo &&
      (!pinnedOnly || message.pinned) &&
      message.text.toLowerCase().includes(query.toLowerCase()),
  )
  const pinned = data.messages.filter(
    (message) => message.room === room && message.pinned && !message.replyTo,
  ).length
  const draft = drafts[room] || ''

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight })
  }, [room])

  function selectRoom(next: string) {
    setRoom(next)
    setQuery('')
    setPinnedOnly(false)
    setChannelsOpen(false)
    setMembersOpen(false)
    setThreadId(null)
    setEditing(null)
  }
  function send(event?: FormEvent, inThread = false) {
    event?.preventDefault()
    const text = (inThread ? reply : draft).trim()
    if (!text) return
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      room,
      author: 'alex',
      text,
      time: new Date().toISOString(),
      pinned: false,
      reactions: [],
      ...(inThread && threadId ? { replyTo: threadId } : {}),
    }
    setData((current) => ({ ...current, messages: [...current.messages, message] }))
    if (inThread) setReply('')
    else {
      setDrafts((current) => ({ ...current, [room]: '' }))
      requestAnimationFrame(() =>
        messagesRef.current?.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: reduced ? 'instant' : 'smooth',
        }),
      )
    }
  }
  function composerKey(event: KeyboardEvent<HTMLTextAreaElement>, inThread = false) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send(undefined, inThread)
    }
  }
  function react(id: string, emoji: string) {
    setData((current) => ({
      ...current,
      messages: current.messages.map((message) => {
        if (message.id !== id) return message
        const existing = message.reactions.find((item) => item.emoji === emoji)
        const reactions = existing
          ? message.reactions
              .map((item) =>
                item.emoji === emoji
                  ? { ...item, count: item.count + (item.mine ? -1 : 1), mine: !item.mine }
                  : item,
              )
              .filter((item) => item.count > 0)
          : [...message.reactions, { emoji, count: 1, mine: true }]
        return { ...message, reactions }
      }),
    }))
  }
  function pin(message: ChatMessage) {
    setData((current) => ({
      ...current,
      messages: current.messages.map((item) =>
        item.id === message.id ? { ...item, pinned: !item.pinned } : item,
      ),
    }))
  }
  function removeMessage(message: ChatMessage) {
    const removed = data.messages.filter(
      (item) => item.id === message.id || item.replyTo === message.id,
    )
    setData((current) => ({
      ...current,
      messages: current.messages.filter((item) => !removed.some((old) => old.id === item.id)),
    }))
    toast('Message deleted', {
      action: {
        label: 'Undo',
        onClick: () =>
          setData((current) => ({
            ...current,
            messages: [
              ...current.messages,
              ...removed.filter((old) => !current.messages.some((item) => item.id === old.id)),
            ].sort((a, b) => a.time.localeCompare(b.time)),
          })),
      },
    })
  }

  const channelList = (
    <>
      <div className="chat-workspace-name">
        <span>Northstar team</span>
        <span>{chatPeople.length} members</span>
      </div>
      <nav aria-label="Chat channels">
        {['WORKSPACE', 'PROJECTS'].map((section) => (
          <div className="chat-channel-group" key={section}>
            <h2>{section === 'WORKSPACE' ? 'Workspace' : 'Projects'}</h2>
            {chatRooms
              .filter((item) => item.section === section)
              .map((item) => (
                <button
                  key={item.id}
                  className={room === item.id ? 'active' : ''}
                  aria-current={room === item.id ? 'page' : undefined}
                  onClick={() => selectRoom(item.id)}
                >
                  {item.id === 'announcements' ? <Megaphone size={17} /> : <Hash size={18} />}
                  <span>{item.name}</span>
                  {item.id === 'general' && (
                    <span className="channel-count">
                      {
                        data.messages.filter(
                          (message) => message.room === item.id && !message.replyTo,
                        ).length
                      }
                    </span>
                  )}
                </button>
              ))}
          </div>
        ))}
      </nav>
      <div className="chat-channel-group">
        <h2>Direct messages</h2>
        {chatPeople
          .filter((person) => person.id !== 'alex')
          .map((person) => (
            <button
              key={person.id}
              className={room === `dm-${person.id}` ? 'active' : ''}
              onClick={() => selectRoom(`dm-${person.id}`)}
            >
              <span className={`presence-dot ${person.online ? 'online' : ''}`} />
              <span>{person.name}</span>
            </button>
          ))}
      </div>
      <div className="chat-self">
        <Initials name="Alex Morgan" color="blue" className="size-9" />
        <div>
          <strong>Alex Morgan</strong>
          <span>Local preview</span>
        </div>
        <Tooltip content="Workspace settings">
          <Button asChild variant="ghost" size="icon">
            <a href="#template/settings" aria-label="Workspace settings">
              <Settings size={17} />
            </a>
          </Button>
        </Tooltip>
      </div>
    </>
  )
  const memberList = (
    <div className="chat-members-list">
      {[true, false].map((online) => (
        <section key={String(online)}>
          <h2>
            {online ? 'Online' : 'Offline'} —{' '}
            {chatPeople.filter((person) => person.online === online).length}
          </h2>
          {chatPeople
            .filter((person) => person.online === online)
            .map((person) => (
              <button
                key={person.id}
                className="chat-member"
                onClick={() => person.id !== 'alex' && selectRoom(`dm-${person.id}`)}
                disabled={person.id === 'alex'}
                aria-label={person.id === 'alex' ? 'Alex Morgan, you' : `Message ${person.name}`}
              >
                <span className="member-avatar">
                  <Initials name={person.name} color={person.color} />
                  <i className={person.online ? 'online' : ''} />
                </span>
                <span>
                  <strong>
                    {person.name}
                    {person.id === 'alex' && ' (you)'}
                  </strong>
                  <small>{person.role}</small>
                </span>
              </button>
            ))}
        </section>
      ))}
    </div>
  )

  function renderMessage(message: ChatMessage, inThread = false) {
    const person = chatPeople.find((item) => item.id === message.author) || chatPeople[0]
    const replyCount = data.messages.filter((item) => item.replyTo === message.id).length
    return (
      <motion.article
        key={message.id}
        data-message-id={message.id}
        className={`chat-message ${message.pinned ? 'is-pinned' : ''}`}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.18 }}
      >
        <Initials name={person.name} color={person.color} />
        <div className="message-body">
          <div className="message-byline">
            <strong>{person.name}</strong>
            <time dateTime={message.time}>{formatTime(message.time)}</time>
            {message.pinned && (
              <span className="message-pin">
                <Pin size={13} /> Pinned
              </span>
            )}
          </div>
          {editing?.id === message.id ? (
            <form
              className="message-edit"
              onSubmit={(event) => {
                event.preventDefault()
                if (!editing.text.trim()) return
                setData((current) => ({
                  ...current,
                  messages: current.messages.map((item) =>
                    item.id === message.id ? { ...item, text: editing.text.trim() } : item,
                  ),
                }))
                setEditing(null)
              }}
            >
              <Textarea
                aria-label="Edit message"
                value={editing.text}
                onChange={(event) => setEditing({ ...editing, text: event.target.value })}
                autoFocus
                maxLength={2000}
              />
              <div className="flex gap-2">
                <Button size="sm" type="submit" disabled={!editing.text.trim()}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <p className="message-text">{message.text}</p>
          )}
          {!!message.reactions.length && (
            <div className="message-reactions">
              {message.reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  aria-pressed={reaction.mine}
                  onClick={() => react(message.id, reaction.emoji)}
                >
                  <span>{reaction.emoji}</span>
                  {reaction.count}
                </button>
              ))}
            </div>
          )}
          {!inThread && replyCount > 0 && (
            <button
              className="message-thread-link"
              onClick={() => {
                setThreadId(message.id)
                setReply('')
              }}
            >
              <MessageSquare size={15} />
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              <span>Open thread</span>
            </button>
          )}
        </div>
        <div className="message-actions">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Add reaction">
                <Smile size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="emoji-picker">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    aria-label={`React ${emoji}`}
                    onClick={() => react(message.id, emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          {!inThread && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Reply in thread"
              onClick={() => {
                setThreadId(message.id)
                setReply('')
              }}
            >
              <MessageSquare size={16} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={message.pinned ? 'Unpin message' : 'Pin message'}
            onClick={() => pin(message)}
          >
            <Pin size={16} />
          </Button>
          {message.author === 'alex' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Message actions">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => setEditing({ id: message.id, text: message.text })}
                >
                  Edit message
                </DropdownMenuItem>
                <DropdownMenuItem className="text-danger" onSelect={() => removeMessage(message)}>
                  Delete message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </motion.article>
    )
  }

  return (
    <div className={`chat-layout ${showMembers ? '' : 'without-members'}`}>
      <aside className="chat-server-rail" aria-label="Workspace shortcuts">
        <Tooltip content="All templates">
          <a href="#templates" className="server-icon" aria-label="All templates">
            <Home size={22} />
          </a>
        </Tooltip>
        <span className="server-separator" />
        <Tooltip content="Northstar workspace">
          <button
            className="server-icon selected"
            aria-label="Northstar workspace"
            onClick={() => selectRoom('general')}
          >
            N
          </button>
        </Tooltip>
        <Tooltip content="Direct messages">
          <button
            className="server-icon"
            aria-label="Open direct messages"
            onClick={() => selectRoom('dm-sam')}
          >
            <MessageCircle size={23} />
          </button>
        </Tooltip>
        <Tooltip content="Search messages">
          <button
            className="server-icon"
            aria-label="Focus message search"
            onClick={() => searchRef.current?.focus()}
          >
            <Search size={21} />
          </button>
        </Tooltip>
      </aside>
      <aside className="chat-channels">{channelList}</aside>
      <section
        className="chat-conversation"
        aria-label={directPerson ? `Conversation with ${title}` : `${title} channel`}
      >
        <header className="chat-conversation-header">
          <Button
            className="chat-mobile-control"
            variant="ghost"
            size="icon"
            aria-label="Open channels"
            onClick={() => setChannelsOpen(true)}
          >
            <Menu size={19} />
          </Button>
          <div className="chat-channel-title">
            {directPerson ? <MessageCircle size={22} /> : <Hash size={23} />}
            <div>
              <h1>{title}</h1>
              <p>{directPerson ? directPerson.role : channel?.topic}</p>
            </div>
          </div>
          <div className="chat-header-actions">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Show pinned messages"
              aria-pressed={pinnedOnly}
              onClick={() => setPinnedOnly(!pinnedOnly)}
            >
              <Pin size={18} />
            </Button>
            <Button
              className="chat-desktop-control"
              variant="ghost"
              size="icon"
              aria-label="Toggle member list"
              aria-pressed={showMembers}
              onClick={() => setShowMembers(!showMembers)}
            >
              <Users size={18} />
            </Button>
            <Button
              className="chat-mobile-control"
              variant="ghost"
              size="icon"
              aria-label="Show members"
              onClick={() => setMembersOpen(true)}
            >
              <Users size={18} />
            </Button>
          </div>
        </header>
        <div className="chat-search-row">
          <Search size={16} />
          <Input
            ref={searchRef}
            aria-label="Search messages"
            placeholder={`Search in ${directPerson ? title : `#${title}`}…`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {pinnedOnly && (
            <button onClick={() => setPinnedOnly(false)}>
              {pinned} pinned <X size={14} />
            </button>
          )}
        </div>
        <div
          className="chat-message-list"
          ref={messagesRef}
          tabIndex={0}
          role="log"
          aria-label="Message history"
        >
          <div className="chat-date-divider">
            <span>Conversation history</span>
          </div>
          <AnimatePresence initial={false}>
            {messages.map((message) => renderMessage(message))}
          </AnimatePresence>
          {!messages.length && (
            <EmptyState
              title={query || pinnedOnly ? 'No matching messages' : 'Start a conversation'}
            >
              {query || pinnedOnly
                ? 'Try another search or clear the pinned filter.'
                : `Send the first message to ${title}.`}
            </EmptyState>
          )}
        </div>
        <form className="chat-composer" onSubmit={(event) => send(event)}>
          <Textarea
            aria-label={`Message ${directPerson ? title : `#${title}`}`}
            placeholder={`Message ${directPerson ? title : `#${title}`}`}
            value={draft}
            maxLength={2000}
            rows={2}
            onChange={(event) =>
              setDrafts((current) => ({ ...current, [room]: event.target.value }))
            }
            onKeyDown={(event) => composerKey(event)}
          />
          <div className="composer-footer">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Insert emoji">
                  <Smile size={20} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="emoji-picker">
                  {emojis.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      aria-label={`Insert ${emoji}`}
                      onClick={() =>
                        setDrafts((current) => ({ ...current, [room]: `${draft}${emoji}` }))
                      }
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <span>Enter to send · Shift + Enter for a new line</span>
            <Button
              type="submit"
              className="chat-send"
              disabled={!draft.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
              <span>Send</span>
            </Button>
          </div>
        </form>
      </section>
      {showMembers && <aside className="chat-members">{memberList}</aside>}
      <Sheet open={channelsOpen} onOpenChange={setChannelsOpen}>
        <SheetContent side="left" className="chat-channel-sheet">
          <SheetHeader>
            <SheetTitle>Channels</SheetTitle>
            <SheetDescription>Choose a channel or direct message.</SheetDescription>
          </SheetHeader>
          {channelList}
        </SheetContent>
      </Sheet>
      <Sheet open={membersOpen} onOpenChange={setMembersOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Members</SheetTitle>
            <SheetDescription>People in the Northstar workspace.</SheetDescription>
          </SheetHeader>
          {memberList}
        </SheetContent>
      </Sheet>
      <Sheet open={!!thread} onOpenChange={(open) => !open && setThreadId(null)}>
        <SheetContent className="chat-thread-sheet">
          <SheetHeader>
            <SheetTitle>Thread</SheetTitle>
            <SheetDescription>Replies to this message in {title}.</SheetDescription>
          </SheetHeader>
          {thread && (
            <>
              <div className="thread-original">{renderMessage(thread, true)}</div>
              <div className="thread-replies" role="log" aria-label="Thread replies">
                {data.messages
                  .filter((message) => message.replyTo === thread.id)
                  .map((message) => renderMessage(message, true))}
              </div>
              <form onSubmit={(event) => send(event, true)} className="thread-composer">
                <Textarea
                  aria-label="Reply in thread"
                  placeholder="Write a reply…"
                  value={reply}
                  maxLength={2000}
                  onChange={(event) => setReply(event.target.value)}
                  onKeyDown={(event) => composerKey(event, true)}
                />
                <Button type="submit" disabled={!reply.trim()}>
                  <Send size={16} /> Send reply
                </Button>
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
